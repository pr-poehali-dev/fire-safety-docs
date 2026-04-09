import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime

SCHEMA = 't_p36866218_fire_safety_docs'

TRACKED_TABLES = {
    'journal_entries', 'journal_headers', 'checklist_items', 'drills', 'audits',
    'audit_violations', 'declarations', 'insurance_policies', 'executive_documents',
    'fire_hazard_calculations', 'protection_systems', 'rooms_categories',
    'section_aups', 'section_aupt', 'section_fire_blankets', 'section_fire_dampers',
    'section_fire_extinguishers', 'section_fire_protection', 'section_hose_rolling',
    'section_indoor_hydrants', 'section_ladder_tests', 'section_outdoor_hydrants',
    'section_ppe', 'section_smoke_ventilation', 'section_soue', 'section_valves_pumps',
    'section_ventilation_cleaning',
}


def get_client_ip(event: dict) -> str:
    rc = event.get('requestContext', {})
    identity = rc.get('identity', {})
    if isinstance(identity, dict) and identity.get('sourceIp'):
        return identity['sourceIp']
    headers = event.get('headers', {}) or {}
    return headers.get('X-Forwarded-For', headers.get('x-forwarded-for', 'unknown')).split(',')[0].strip()


def log_security_event(cursor, conn, data: dict):
    cols = ['timestamp', 'user_id', 'user_email', 'user_name', 'action', 'category',
            'resource', 'object_id', 'record_id', 'old_value', 'new_value',
            'ip_address', 'session_id', 'details', 'severity', 'success']
    used_cols = []
    values = []
    for c in cols:
        if c in data and data[c] is not None:
            used_cols.append(c)
            val = data[c]
            if isinstance(val, (dict, list)):
                val = json.dumps(val, default=str, ensure_ascii=False)
            values.append(val)
    if 'timestamp' not in used_cols:
        used_cols.append('timestamp')
        values.append(datetime.utcnow())
    placeholders = ', '.join(['%s'] * len(used_cols))
    cursor.execute(
        f"INSERT INTO {SCHEMA}.security_events ({', '.join(used_cols)}) VALUES ({placeholders})",
        values
    )
    conn.commit()


def response(status: int, body) -> dict:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Универсальный CRUD с аудитом изменений для подсистемы ИБ"""
    method: str = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    headers_req = event.get('headers', {}) or {}
    ip = get_client_ip(event)
    user_id = headers_req.get('X-User-Id', headers_req.get('x-user-id'))
    session_id = headers_req.get('X-Session-Id', headers_req.get('x-session-id', ''))

    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            table = params.get('table', 'object_characteristics')
            object_id = params.get('object_id')

            if object_id:
                cursor.execute(f'SELECT * FROM {SCHEMA}.{table} WHERE object_id = %s ORDER BY id DESC', [object_id])
            else:
                cursor.execute(f'SELECT * FROM {SCHEMA}.{table} ORDER BY id DESC')
            rows = cursor.fetchall()
            return response(200, [dict(row) for row in rows])

        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            table = body_data.pop('table', 'object_characteristics')
            meta_user_id = body_data.pop('_user_id', user_id)
            meta_user_email = body_data.pop('_user_email', '')
            meta_user_name = body_data.pop('_user_name', '')

            fields = ', '.join(body_data.keys())
            placeholders = ', '.join(['%s'] * len(body_data))
            values = list(body_data.values())

            cursor.execute(
                f'INSERT INTO {SCHEMA}.{table} ({fields}) VALUES ({placeholders}) RETURNING id',
                values
            )
            result = cursor.fetchone()
            conn.commit()

            if table in TRACKED_TABLES:
                log_security_event(cursor, conn, {
                    'user_id': int(meta_user_id) if meta_user_id else None,
                    'user_email': meta_user_email,
                    'user_name': meta_user_name,
                    'action': 'create',
                    'category': 'data_change',
                    'resource': table,
                    'object_id': body_data.get('object_id'),
                    'record_id': result['id'],
                    'new_value': json.dumps(body_data, default=str, ensure_ascii=False)[:2000],
                    'ip_address': ip,
                    'session_id': session_id,
                    'details': f'Создана запись в {table}',
                    'severity': 'info',
                    'success': True,
                })

            return response(201, {'success': True, 'id': result['id']})

        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            table = body_data.pop('table', 'object_characteristics')
            record_id = body_data.pop('id')
            meta_user_id = body_data.pop('_user_id', user_id)
            meta_user_email = body_data.pop('_user_email', '')
            meta_user_name = body_data.pop('_user_name', '')

            old_value = None
            if table in TRACKED_TABLES:
                cursor.execute(f'SELECT * FROM {SCHEMA}.{table} WHERE id = %s', [record_id])
                old_row = cursor.fetchone()
                if old_row:
                    old_value = {k: v for k, v in dict(old_row).items() if k in body_data}

            set_clause = ', '.join([f'{k} = %s' for k in body_data.keys()])
            values = list(body_data.values()) + [record_id]
            cursor.execute(
                f'UPDATE {SCHEMA}.{table} SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                values
            )
            conn.commit()

            if table in TRACKED_TABLES:
                log_security_event(cursor, conn, {
                    'user_id': int(meta_user_id) if meta_user_id else None,
                    'user_email': meta_user_email,
                    'user_name': meta_user_name,
                    'action': 'update',
                    'category': 'data_change',
                    'resource': table,
                    'object_id': body_data.get('object_id') or (old_value.get('object_id') if old_value else None),
                    'record_id': record_id,
                    'old_value': json.dumps(old_value, default=str, ensure_ascii=False)[:2000] if old_value else None,
                    'new_value': json.dumps(body_data, default=str, ensure_ascii=False)[:2000],
                    'ip_address': ip,
                    'session_id': session_id,
                    'details': f'Обновлена запись #{record_id} в {table}',
                    'severity': 'info',
                    'success': True,
                })

            return response(200, {'success': True})

        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            table = params.get('table', 'object_characteristics')
            record_id = params.get('id')

            old_value = None
            if table in TRACKED_TABLES and record_id:
                cursor.execute(f'SELECT * FROM {SCHEMA}.{table} WHERE id = %s', [record_id])
                old_row = cursor.fetchone()
                if old_row:
                    old_value = dict(old_row)

            cursor.execute(f'DELETE FROM {SCHEMA}.{table} WHERE id = %s', [record_id])
            conn.commit()

            if table in TRACKED_TABLES:
                log_security_event(cursor, conn, {
                    'user_id': int(user_id) if user_id else None,
                    'action': 'delete',
                    'category': 'data_change',
                    'resource': table,
                    'object_id': old_value.get('object_id') if old_value else None,
                    'record_id': int(record_id) if record_id else None,
                    'old_value': json.dumps(old_value, default=str, ensure_ascii=False)[:2000] if old_value else None,
                    'ip_address': ip,
                    'session_id': session_id,
                    'details': f'Удалена запись #{record_id} из {table}',
                    'severity': 'warning',
                    'success': True,
                })

            return response(200, {'success': True})

        return response(405, {'error': 'Method not allowed'})

    finally:
        cursor.close()
        conn.close()
