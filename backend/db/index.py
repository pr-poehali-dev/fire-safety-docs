"""
Универсальный CRUD API с защитой от IDOR и SQL-инъекций.

Безопасность:
1. JWT-аутентификация: токен в X-Auth-Token обязателен (кроме объектных таблиц с белым списком)
2. Проверка владения object_id: пользователь видит только свои объекты (object_users)
3. Whitelist таблиц: имя таблицы валидируется по списку
4. Whitelist колонок: имена полей валидируются регулярным выражением
5. Параметризованные запросы (psycopg2 %s)
6. Аудит-лог всех изменений
"""
import json
import os
import re
import hmac
import hashlib
import base64
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional, Set
from datetime import datetime

SCHEMA = 't_p36866218_fire_safety_docs'

JWT_SECRET = os.environ.get('JWT_SECRET', 'fire-safety-jwt-secret-2025')

ALLOWED_TABLES = {
    'object_characteristics', 'journal_entries', 'journal_headers',
    'checklist_items', 'checklist_files', 'drills', 'drill_documents',
    'audits', 'audit_violations', 'declarations', 'insurance_policies',
    'executive_documents', 'fire_hazard_calculations', 'protection_systems',
    'rooms_categories', 'documentation_files', 'certificates', 'user_profile',
    'section_aups', 'section_aupt', 'section_fire_blankets', 'section_fire_dampers',
    'section_fire_extinguishers', 'section_fire_protection', 'section_hose_rolling',
    'section_indoor_hydrants', 'section_ladder_tests', 'section_outdoor_hydrants',
    'section_ppe', 'section_smoke_ventilation', 'section_soue', 'section_valves_pumps',
    'section_ventilation_cleaning', 'sp12_calculations',
}

OBJECT_SCOPED_TABLES: Set[str] = {
    'object_characteristics', 'journal_entries', 'journal_headers',
    'checklist_items', 'checklist_files', 'drills', 'drill_documents',
    'audits', 'audit_violations', 'declarations', 'insurance_policies',
    'executive_documents', 'fire_hazard_calculations', 'protection_systems',
    'rooms_categories', 'documentation_files', 'certificates',
    'section_aups', 'section_aupt', 'section_fire_blankets', 'section_fire_dampers',
    'section_fire_extinguishers', 'section_fire_protection', 'section_hose_rolling',
    'section_indoor_hydrants', 'section_ladder_tests', 'section_outdoor_hydrants',
    'section_ppe', 'section_smoke_ventilation', 'section_soue', 'section_valves_pumps',
    'section_ventilation_cleaning', 'sp12_calculations',
}

PERSONAL_TABLES: Set[str] = {'user_profile'}

TRACKED_TABLES = OBJECT_SCOPED_TABLES

FIELD_NAME_RE = re.compile(r'^[a-z_][a-z0-9_]{0,62}$')

SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store',
}


def decode_jwt(token: str) -> Optional[dict]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header, payload_b64, sig_b64 = parts
        signing_input = f"{header}.{payload_b64}"
        expected_sig = hmac.new(JWT_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
        actual_sig = base64.urlsafe_b64decode(sig_b64 + '==')
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        padding = 4 - len(payload_b64) % 4
        if padding != 4:
            payload_b64 += '=' * padding
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def extract_token(event: dict) -> Optional[str]:
    headers = event.get('headers', {}) or {}
    for key in ('X-Auth-Token', 'x-auth-token', 'Authorization', 'authorization', 'X-Authorization', 'x-authorization'):
        v = headers.get(key)
        if v:
            if v.lower().startswith('bearer '):
                return v[7:].strip()
            return v.strip()
    return None


def authenticate(event: dict) -> Optional[dict]:
    token = extract_token(event)
    if not token:
        return None
    return decode_jwt(token)


def validate_table(name: str) -> bool:
    return name in ALLOWED_TABLES


def validate_field_name(name: str) -> bool:
    return bool(FIELD_NAME_RE.match(name))


def sanitize_string(val: Any) -> Any:
    if isinstance(val, str):
        val = val.replace('\x00', '')
        if len(val) > 10000:
            val = val[:10000]
    return val


def sanitize_fields(data: dict) -> dict:
    return {k: sanitize_string(v) for k, v in data.items() if validate_field_name(k)}


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
    try:
        cursor.execute(
            f"INSERT INTO {SCHEMA}.security_events ({', '.join(used_cols)}) VALUES ({placeholders})",
            values
        )
        conn.commit()
    except Exception:
        conn.rollback()


def user_has_object_access(cursor, user_id: int, object_id: int, role: str) -> bool:
    """
    Проверяет, что пользователь имеет доступ к объекту.
    admin — доступ ко всем объектам.
    Остальные — только к объектам из object_users.
    """
    if role == 'admin':
        return True
    cursor.execute(
        f'SELECT 1 FROM {SCHEMA}.object_users WHERE user_id = %s AND object_id = %s LIMIT 1',
        [user_id, object_id]
    )
    return cursor.fetchone() is not None


def user_object_ids(cursor, user_id: int, role: str) -> Optional[list]:
    """
    Возвращает список object_id, доступных пользователю.
    Для admin возвращает None (фильтрация не нужна).
    """
    if role == 'admin':
        return None
    cursor.execute(
        f'SELECT object_id FROM {SCHEMA}.object_users WHERE user_id = %s',
        [user_id]
    )
    return [row['object_id'] for row in cursor.fetchall()]


def response(status: int, body) -> dict:
    return {
        'statusCode': status,
        'headers': dict(SECURITY_HEADERS),
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }


def forbidden(reason: str = 'Доступ запрещён') -> dict:
    return response(403, {'error': reason})


def unauthorized(reason: str = 'Требуется авторизация') -> dict:
    return response(401, {'error': reason})


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Универсальный CRUD с проверкой JWT, RBAC и принадлежности объекта"""
    method: str = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Authorization, Authorization, X-Session-Id, X-CSRF-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return response(500, {'error': 'DATABASE_URL not configured'})

    auth_payload = authenticate(event)
    if not auth_payload:
        return unauthorized()

    auth_user_id = int(auth_payload.get('sub') or 0)
    auth_role = str(auth_payload.get('role') or 'manager')
    auth_email = str(auth_payload.get('email') or '')
    if auth_user_id <= 0:
        return unauthorized('Некорректный токен')

    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    headers_req = event.get('headers', {}) or {}
    ip = get_client_ip(event)
    session_id = headers_req.get('X-Session-Id', headers_req.get('x-session-id', ''))

    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            table = params.get('table', 'object_characteristics')

            if not validate_table(table):
                log_security_event(cursor, conn, {
                    'user_id': auth_user_id, 'user_email': auth_email,
                    'action': 'access_denied_table', 'category': 'access_denied',
                    'resource': table, 'ip_address': ip,
                    'details': f'Попытка доступа к запрещённой таблице: {table}',
                    'severity': 'warning', 'success': False,
                })
                return forbidden('Доступ к указанному ресурсу запрещён')

            object_id_raw = params.get('object_id')
            object_id = None
            if object_id_raw:
                try:
                    object_id = int(object_id_raw)
                except (TypeError, ValueError):
                    return response(400, {'error': 'object_id должен быть числом'})

            if table in PERSONAL_TABLES:
                cursor.execute(
                    f'SELECT * FROM {SCHEMA}.{table} WHERE user_id = %s ORDER BY id DESC',
                    [auth_user_id]
                )
                rows = cursor.fetchall()
                return response(200, [dict(row) for row in rows])

            if table in OBJECT_SCOPED_TABLES:
                if object_id is not None:
                    if not user_has_object_access(cursor, auth_user_id, object_id, auth_role):
                        log_security_event(cursor, conn, {
                            'user_id': auth_user_id, 'user_email': auth_email,
                            'action': 'idor_attempt', 'category': 'access_denied',
                            'resource': table, 'object_id': object_id, 'ip_address': ip,
                            'details': f'Попытка доступа к чужому объекту #{object_id} в {table}',
                            'severity': 'critical', 'success': False,
                        })
                        return forbidden('Нет доступа к указанному объекту')
                    cursor.execute(
                        f'SELECT * FROM {SCHEMA}.{table} WHERE object_id = %s ORDER BY id DESC',
                        [object_id]
                    )
                    rows = cursor.fetchall()
                    return response(200, [dict(row) for row in rows])
                allowed_ids = user_object_ids(cursor, auth_user_id, auth_role)
                if allowed_ids is None:
                    cursor.execute(f'SELECT * FROM {SCHEMA}.{table} ORDER BY id DESC')
                else:
                    if not allowed_ids:
                        return response(200, [])
                    placeholders = ','.join(['%s'] * len(allowed_ids))
                    cursor.execute(
                        f'SELECT * FROM {SCHEMA}.{table} WHERE object_id IN ({placeholders}) ORDER BY id DESC',
                        allowed_ids
                    )
                rows = cursor.fetchall()
                return response(200, [dict(row) for row in rows])

            cursor.execute(f'SELECT * FROM {SCHEMA}.{table} ORDER BY id DESC')
            rows = cursor.fetchall()
            return response(200, [dict(row) for row in rows])

        elif method == 'POST':
            body_raw = json.loads(event.get('body', '{}'))
            table = body_raw.pop('table', 'object_characteristics')
            body_raw.pop('_user_id', None)
            body_raw.pop('_user_email', None)
            body_raw.pop('_user_name', None)

            if not validate_table(table):
                log_security_event(cursor, conn, {
                    'user_id': auth_user_id, 'user_email': auth_email,
                    'action': 'access_denied_table', 'category': 'access_denied',
                    'resource': table, 'ip_address': ip,
                    'details': f'Попытка записи в запрещённую таблицу: {table}',
                    'severity': 'warning', 'success': False,
                })
                return forbidden('Доступ к указанному ресурсу запрещён')

            body_data = sanitize_fields(body_raw)
            if not body_data:
                return response(400, {'error': 'Нет допустимых полей для записи'})

            if table in PERSONAL_TABLES:
                body_data['user_id'] = auth_user_id

            if table in OBJECT_SCOPED_TABLES:
                obj_id = body_data.get('object_id')
                if obj_id is None:
                    return response(400, {'error': 'object_id обязателен для этой таблицы'})
                try:
                    obj_id_int = int(obj_id)
                except (TypeError, ValueError):
                    return response(400, {'error': 'object_id должен быть числом'})
                if not user_has_object_access(cursor, auth_user_id, obj_id_int, auth_role):
                    log_security_event(cursor, conn, {
                        'user_id': auth_user_id, 'user_email': auth_email,
                        'action': 'idor_attempt', 'category': 'access_denied',
                        'resource': table, 'object_id': obj_id_int, 'ip_address': ip,
                        'details': f'Попытка записи в чужой объект #{obj_id_int} в {table}',
                        'severity': 'critical', 'success': False,
                    })
                    return forbidden('Нет доступа к указанному объекту')

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
                    'user_id': auth_user_id, 'user_email': auth_email,
                    'action': 'create', 'category': 'data_change',
                    'resource': table,
                    'object_id': body_data.get('object_id'),
                    'record_id': result['id'],
                    'new_value': json.dumps(body_data, default=str, ensure_ascii=False)[:2000],
                    'ip_address': ip, 'session_id': session_id,
                    'details': f'Создана запись в {table}',
                    'severity': 'info', 'success': True,
                })

            return response(201, {'success': True, 'id': result['id']})

        elif method == 'PUT':
            body_raw = json.loads(event.get('body', '{}'))
            table = body_raw.pop('table', 'object_characteristics')
            record_id = body_raw.pop('id', None)
            body_raw.pop('_user_id', None)
            body_raw.pop('_user_email', None)
            body_raw.pop('_user_name', None)

            if not validate_table(table):
                return forbidden('Доступ к указанному ресурсу запрещён')
            if record_id is None:
                return response(400, {'error': 'Не указан id записи'})
            try:
                record_id = int(record_id)
            except (TypeError, ValueError):
                return response(400, {'error': 'id должен быть числом'})

            body_data = sanitize_fields(body_raw)
            if not body_data:
                return response(400, {'error': 'Нет допустимых полей для обновления'})

            cursor.execute(f'SELECT * FROM {SCHEMA}.{table} WHERE id = %s', [record_id])
            old_row = cursor.fetchone()
            if not old_row:
                return response(404, {'error': 'Запись не найдена'})
            old_dict = dict(old_row)

            if table in PERSONAL_TABLES:
                if old_dict.get('user_id') != auth_user_id:
                    log_security_event(cursor, conn, {
                        'user_id': auth_user_id, 'user_email': auth_email,
                        'action': 'idor_attempt', 'category': 'access_denied',
                        'resource': table, 'record_id': record_id, 'ip_address': ip,
                        'details': f'Попытка изменения чужого профиля #{record_id}',
                        'severity': 'critical', 'success': False,
                    })
                    return forbidden('Нет доступа к этой записи')
                body_data.pop('user_id', None)
            elif table in OBJECT_SCOPED_TABLES:
                obj_id_int = old_dict.get('object_id')
                if obj_id_int is None or not user_has_object_access(cursor, auth_user_id, int(obj_id_int), auth_role):
                    log_security_event(cursor, conn, {
                        'user_id': auth_user_id, 'user_email': auth_email,
                        'action': 'idor_attempt', 'category': 'access_denied',
                        'resource': table, 'record_id': record_id,
                        'object_id': obj_id_int, 'ip_address': ip,
                        'details': f'Попытка изменения записи в чужом объекте',
                        'severity': 'critical', 'success': False,
                    })
                    return forbidden('Нет доступа к этой записи')
                body_data.pop('object_id', None)

            old_value = {k: v for k, v in old_dict.items() if k in body_data}

            set_clause = ', '.join([f'{k} = %s' for k in body_data.keys()])
            values = list(body_data.values()) + [record_id]
            cursor.execute(
                f'UPDATE {SCHEMA}.{table} SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                values
            )
            conn.commit()

            if table in TRACKED_TABLES:
                log_security_event(cursor, conn, {
                    'user_id': auth_user_id, 'user_email': auth_email,
                    'action': 'update', 'category': 'data_change',
                    'resource': table,
                    'object_id': old_dict.get('object_id'),
                    'record_id': record_id,
                    'old_value': json.dumps(old_value, default=str, ensure_ascii=False)[:2000],
                    'new_value': json.dumps(body_data, default=str, ensure_ascii=False)[:2000],
                    'ip_address': ip, 'session_id': session_id,
                    'details': f'Обновлена запись #{record_id} в {table}',
                    'severity': 'info', 'success': True,
                })

            return response(200, {'success': True})

        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            table = params.get('table', 'object_characteristics')
            record_id = params.get('id')

            if not validate_table(table):
                return forbidden('Доступ к указанному ресурсу запрещён')
            if not record_id:
                return response(400, {'error': 'Не указан id записи'})
            try:
                record_id = int(record_id)
            except (TypeError, ValueError):
                return response(400, {'error': 'id должен быть числом'})

            cursor.execute(f'SELECT * FROM {SCHEMA}.{table} WHERE id = %s', [record_id])
            old_row = cursor.fetchone()
            if not old_row:
                return response(404, {'error': 'Запись не найдена'})
            old_dict = dict(old_row)

            if table in PERSONAL_TABLES:
                if old_dict.get('user_id') != auth_user_id:
                    log_security_event(cursor, conn, {
                        'user_id': auth_user_id, 'user_email': auth_email,
                        'action': 'idor_attempt', 'category': 'access_denied',
                        'resource': table, 'record_id': record_id, 'ip_address': ip,
                        'details': 'Попытка удаления чужого профиля',
                        'severity': 'critical', 'success': False,
                    })
                    return forbidden('Нет доступа к этой записи')
            elif table in OBJECT_SCOPED_TABLES:
                obj_id_int = old_dict.get('object_id')
                if obj_id_int is None or not user_has_object_access(cursor, auth_user_id, int(obj_id_int), auth_role):
                    log_security_event(cursor, conn, {
                        'user_id': auth_user_id, 'user_email': auth_email,
                        'action': 'idor_attempt', 'category': 'access_denied',
                        'resource': table, 'record_id': record_id,
                        'object_id': obj_id_int, 'ip_address': ip,
                        'details': 'Попытка удаления записи в чужом объекте',
                        'severity': 'critical', 'success': False,
                    })
                    return forbidden('Нет доступа к этой записи')

            cursor.execute(f'DELETE FROM {SCHEMA}.{table} WHERE id = %s', [record_id])
            conn.commit()

            if table in TRACKED_TABLES:
                log_security_event(cursor, conn, {
                    'user_id': auth_user_id, 'user_email': auth_email,
                    'action': 'delete', 'category': 'data_change',
                    'resource': table,
                    'object_id': old_dict.get('object_id'),
                    'record_id': record_id,
                    'old_value': json.dumps(old_dict, default=str, ensure_ascii=False)[:2000],
                    'ip_address': ip, 'session_id': session_id,
                    'details': f'Удалена запись #{record_id} из {table}',
                    'severity': 'warning', 'success': True,
                })

            return response(200, {'success': True})

        return response(405, {'error': 'Method not allowed'})

    finally:
        cursor.close()
        conn.close()