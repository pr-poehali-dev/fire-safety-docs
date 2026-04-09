import json
import os
import csv
import io
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta

SCHEMA = 't_p36866218_fire_safety_docs'
RETENTION_DAYS = 180

CATEGORIES = {
    'auth': 'Аутентификация',
    'data_change': 'Изменение данных',
    'access_denied': 'Запрет доступа',
    'export': 'Экспорт данных',
    'settings': 'Настройки системы',
    'user_mgmt': 'Управление пользователями',
    'audit_access': 'Доступ к логам',
}


def get_client_ip(event: dict) -> str:
    rc = event.get('requestContext', {})
    identity = rc.get('identity', {})
    if isinstance(identity, dict):
        ip = identity.get('sourceIp', '')
        if ip:
            return ip
    headers = event.get('headers', {}) or {}
    return headers.get('X-Forwarded-For', headers.get('x-forwarded-for', 'unknown')).split(',')[0].strip()


def response(status: int, body, content_type='application/json') -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': content_type,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
        },
        'body': json.dumps(body, default=str) if content_type == 'application/json' else body,
        'isBase64Encoded': False
    }


def log_event(cursor, conn, data: dict):
    cols = ['timestamp', 'user_id', 'user_email', 'user_name', 'action', 'category',
            'resource', 'object_id', 'record_id', 'old_value', 'new_value',
            'ip_address', 'session_id', 'user_agent', 'details', 'severity', 'success']
    values = []
    used_cols = []
    for c in cols:
        if c in data and data[c] is not None:
            used_cols.append(c)
            val = data[c]
            if isinstance(val, (dict, list)):
                val = json.dumps(val, default=str, ensure_ascii=False)
            values.append(val)

    if 'timestamp' not in [x for x in used_cols]:
        used_cols.append('timestamp')
        values.append(datetime.utcnow())

    placeholders = ', '.join(['%s'] * len(used_cols))
    col_str = ', '.join(used_cols)
    cursor.execute(
        f"INSERT INTO {SCHEMA}.security_events ({col_str}) VALUES ({placeholders}) RETURNING id",
        values
    )
    result = cursor.fetchone()
    conn.commit()
    return result['id']


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Подсистема регистрации событий информационной безопасности"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return response(500, {'error': 'DATABASE_URL not configured'})

    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', '')
        headers_req = event.get('headers', {}) or {}
        ip = get_client_ip(event)

        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            post_action = body.get('action', action)

            if post_action == 'log':
                event_data = body.get('event', body)
                event_data.setdefault('ip_address', ip)
                event_data.setdefault('user_agent', headers_req.get('User-Agent', headers_req.get('user-agent', '')))
                event_data.setdefault('severity', 'info')
                event_data.setdefault('success', True)

                if 'category' not in event_data:
                    event_data['category'] = 'data_change'
                if 'action' not in event_data or event_data['action'] == 'log':
                    event_data['action'] = 'unknown'

                eid = log_event(cursor, conn, event_data)
                return response(201, {'success': True, 'id': eid})

            elif post_action == 'log_batch':
                events = body.get('events', [])
                ids = []
                for ev in events:
                    ev.setdefault('ip_address', ip)
                    ev.setdefault('user_agent', headers_req.get('User-Agent', headers_req.get('user-agent', '')))
                    ev.setdefault('severity', 'info')
                    ev.setdefault('success', True)
                    ev.setdefault('category', 'data_change')
                    ids.append(log_event(cursor, conn, ev))
                return response(201, {'success': True, 'ids': ids})

        elif method == 'GET':
            if action == 'search':
                viewer_id = params.get('viewer_id')
                if viewer_id:
                    log_event(cursor, conn, {
                        'user_id': int(viewer_id),
                        'action': 'view_security_logs',
                        'category': 'audit_access',
                        'ip_address': ip,
                        'details': f"Просмотр журнала ИБ, фильтры: {json.dumps({k: v for k, v in params.items() if k != 'viewer_id'}, ensure_ascii=False)}",
                        'severity': 'info',
                        'success': True,
                    })

                where_parts = []
                query_params = []

                if params.get('category'):
                    where_parts.append('se.category = %s')
                    query_params.append(params['category'])
                if params.get('severity'):
                    where_parts.append('se.severity = %s')
                    query_params.append(params['severity'])
                if params.get('user_id_filter'):
                    where_parts.append('se.user_id = %s')
                    query_params.append(int(params['user_id_filter']))
                if params.get('object_id'):
                    where_parts.append('se.object_id = %s')
                    query_params.append(int(params['object_id']))
                if params.get('success'):
                    where_parts.append('se.success = %s')
                    query_params.append(params['success'].lower() == 'true')
                if params.get('date_from'):
                    where_parts.append('se.timestamp >= %s')
                    query_params.append(params['date_from'])
                if params.get('date_to'):
                    where_parts.append('se.timestamp <= %s')
                    query_params.append(params['date_to'] + ' 23:59:59')
                if params.get('search'):
                    where_parts.append("(se.action ILIKE %s OR se.resource ILIKE %s OR se.details ILIKE %s OR se.user_email ILIKE %s)")
                    s = f"%{params['search']}%"
                    query_params.extend([s, s, s, s])

                where_clause = ''
                if where_parts:
                    where_clause = 'WHERE ' + ' AND '.join(where_parts)

                limit = min(int(params.get('limit', '50')), 500)
                offset = int(params.get('offset', '0'))

                cursor.execute(
                    f"""SELECT se.id, se.timestamp, se.user_id, se.user_email, se.user_name,
                    se.action, se.category, se.resource, se.object_id, se.record_id,
                    se.old_value, se.new_value, se.ip_address, se.session_id,
                    se.details, se.severity, se.success
                    FROM {SCHEMA}.security_events se
                    {where_clause}
                    ORDER BY se.timestamp DESC
                    LIMIT %s OFFSET %s""",
                    query_params + [limit, offset]
                )
                events = [dict(row) for row in cursor.fetchall()]

                cursor.execute(
                    f"SELECT COUNT(*) as total FROM {SCHEMA}.security_events se {where_clause}",
                    query_params
                )
                total = cursor.fetchone()['total']

                return response(200, {'events': events, 'total': total})

            elif action == 'stats':
                cursor.execute(f"""
                    SELECT category, COUNT(*) as count,
                    SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count,
                    SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as fail_count
                    FROM {SCHEMA}.security_events
                    WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '30 days'
                    GROUP BY category ORDER BY count DESC
                """)
                by_category = [dict(r) for r in cursor.fetchall()]

                cursor.execute(f"""
                    SELECT severity, COUNT(*) as count
                    FROM {SCHEMA}.security_events
                    WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '30 days'
                    GROUP BY severity
                """)
                by_severity = {r['severity']: r['count'] for r in cursor.fetchall()}

                cursor.execute(f"""
                    SELECT DATE(timestamp) as day, COUNT(*) as count
                    FROM {SCHEMA}.security_events
                    WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '30 days'
                    GROUP BY DATE(timestamp) ORDER BY day
                """)
                daily = [dict(r) for r in cursor.fetchall()]

                cursor.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.security_events")
                total = cursor.fetchone()['total']

                return response(200, {
                    'total': total,
                    'by_category': by_category,
                    'by_severity': by_severity,
                    'daily': daily,
                    'retention_days': RETENTION_DAYS,
                    'categories': CATEGORIES,
                })

            elif action == 'export_csv':
                viewer_id = params.get('viewer_id')
                if viewer_id:
                    log_event(cursor, conn, {
                        'user_id': int(viewer_id),
                        'action': 'export_security_logs',
                        'category': 'export',
                        'ip_address': ip,
                        'details': f"Экспорт журнала ИБ в CSV",
                        'severity': 'warning',
                        'success': True,
                    })

                where_parts = []
                query_params = []
                if params.get('date_from'):
                    where_parts.append('timestamp >= %s')
                    query_params.append(params['date_from'])
                if params.get('date_to'):
                    where_parts.append('timestamp <= %s')
                    query_params.append(params['date_to'] + ' 23:59:59')
                if params.get('category'):
                    where_parts.append('category = %s')
                    query_params.append(params['category'])

                where_clause = ''
                if where_parts:
                    where_clause = 'WHERE ' + ' AND '.join(where_parts)

                cursor.execute(
                    f"""SELECT id, timestamp, user_id, user_email, user_name,
                    action, category, resource, object_id, record_id,
                    old_value, new_value, ip_address, session_id, details, severity, success
                    FROM {SCHEMA}.security_events
                    {where_clause}
                    ORDER BY timestamp DESC
                    LIMIT 10000""",
                    query_params
                )
                rows = cursor.fetchall()

                output = io.StringIO()
                writer = csv.writer(output, delimiter=';')
                writer.writerow([
                    'ID', 'Timestamp', 'User_ID', 'Email', 'User_Name',
                    'Action', 'Category', 'Resource', 'Object_ID', 'Record_ID',
                    'Old_Value', 'New_Value', 'IP', 'Session_ID', 'Details', 'Severity', 'Success'
                ])
                for r in rows:
                    row = dict(r)
                    writer.writerow([
                        row['id'], str(row['timestamp']), row['user_id'] or '',
                        row['user_email'] or '', row['user_name'] or '',
                        row['action'], row['category'], row['resource'] or '',
                        row['object_id'] or '', row['record_id'] or '',
                        (row['old_value'] or '')[:500], (row['new_value'] or '')[:500],
                        row['ip_address'] or '', row['session_id'] or '',
                        (row['details'] or '')[:500], row['severity'], row['success']
                    ])

                csv_content = output.getvalue()
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'text/csv; charset=utf-8',
                        'Content-Disposition': f'attachment; filename=security_events_{datetime.utcnow().strftime("%Y%m%d")}.csv',
                        'Access-Control-Allow-Origin': '*',
                    },
                    'body': csv_content,
                    'isBase64Encoded': False
                }

            elif action == 'cleanup':
                cursor.execute(
                    f"SELECT COUNT(*) as cnt FROM {SCHEMA}.security_events WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '{RETENTION_DAYS} days'"
                )
                old_count = cursor.fetchone()['cnt']
                return response(200, {
                    'retention_days': RETENTION_DAYS,
                    'records_older_than_retention': old_count,
                    'message': f'Записи старше {RETENTION_DAYS} дней подлежат ротации'
                })

        return response(405, {'error': 'Method not allowed'})

    finally:
        cursor.close()
        conn.close()
