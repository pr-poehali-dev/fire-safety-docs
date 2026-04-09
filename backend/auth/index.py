import json
import os
import hashlib
import hmac
import secrets
import time
import base64
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

SCHEMA = 't_p36866218_fire_safety_docs'
JWT_SECRET = os.environ.get('JWT_SECRET', 'fire-safety-jwt-secret-2025')
ACCESS_TOKEN_TTL = 15 * 60
REFRESH_TOKEN_TTL = 7 * 24 * 3600
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
CORPORATE_DOMAIN = 'rusal.com'

PASSWORD_RULES = {
    'min_length': 12,
    'require_upper': True,
    'require_lower': True,
    'require_digit': True,
    'require_special': True,
}


def validate_password(password: str) -> Optional[str]:
    if len(password) < PASSWORD_RULES['min_length']:
        return f"Пароль должен содержать минимум {PASSWORD_RULES['min_length']} символов"
    if PASSWORD_RULES['require_upper'] and not any(c.isupper() for c in password):
        return 'Пароль должен содержать заглавные буквы'
    if PASSWORD_RULES['require_lower'] and not any(c.islower() for c in password):
        return 'Пароль должен содержать строчные буквы'
    if PASSWORD_RULES['require_digit'] and not any(c.isdigit() for c in password):
        return 'Пароль должен содержать цифры'
    if PASSWORD_RULES['require_special'] and not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?/' for c in password):
        return 'Пароль должен содержать спецсимволы (!@#$%^&*...)'
    return None


def hash_password(password: str, salt: str = None) -> tuple:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 310000).hex()
    return f"{salt}:{hashed}", salt


def verify_password(password: str, stored: str) -> bool:
    parts = stored.split(':')
    if len(parts) != 2:
        return False
    salt, stored_hash = parts
    check = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 310000).hex()
    return hmac.compare_digest(check, stored_hash)


def create_jwt(payload: dict, ttl: int) -> str:
    header = base64.urlsafe_b64encode(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode()).decode().rstrip('=')
    payload['exp'] = int(time.time()) + ttl
    payload['iat'] = int(time.time())
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload, default=str).encode()).decode().rstrip('=')
    signing_input = f"{header}.{payload_b64}"
    signature = hmac.new(JWT_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    return f"{header}.{payload_b64}.{sig_b64}"


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


def get_client_ip(event: dict) -> str:
    rc = event.get('requestContext', {})
    identity = rc.get('identity', {})
    if isinstance(identity, dict):
        ip = identity.get('sourceIp', '')
        if ip:
            return ip
    headers = event.get('headers', {}) or {}
    return headers.get('X-Forwarded-For', headers.get('x-forwarded-for', 'unknown')).split(',')[0].strip()


def log_auth_event(cursor, conn, email: str, action: str, success: bool, ip: str, user_id=None, user_agent='', details=''):
    cursor.execute(
        f"""INSERT INTO {SCHEMA}.auth_logs (user_id, email, action, success, ip_address, user_agent, details)
        VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        [user_id, email, action, success, ip, user_agent[:500] if user_agent else '', details[:1000] if details else '']
    )
    conn.commit()


def response(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
        },
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Аутентификация с JWT, блокировкой учётных записей и журналом событий"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-Auth-Token, X-Session-Id, X-Authorization',
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
        headers = event.get('headers', {}) or {}
        ip = get_client_ip(event)
        ua = headers.get('User-Agent', headers.get('user-agent', ''))

        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', action)

            if action == 'register':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '')
                full_name = body.get('full_name', '')
                role_code = body.get('role', 'responsible')
                phone = body.get('phone', '')
                position = body.get('position', '')

                if not email or not password or not full_name:
                    return response(400, {'error': 'Email, пароль и ФИО обязательны'})

                pw_error = validate_password(password)
                if pw_error:
                    return response(400, {'error': pw_error})

                cursor.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", [email])
                if cursor.fetchone():
                    log_auth_event(cursor, conn, email, 'register', False, ip, None, ua, 'Email уже существует')
                    return response(409, {'error': 'Пользователь с таким email уже существует'})

                cursor.execute(f"SELECT id FROM {SCHEMA}.roles WHERE code = %s", [role_code])
                role = cursor.fetchone()
                if not role:
                    return response(400, {'error': 'Неверная роль'})

                password_hash, _ = hash_password(password)

                cursor.execute(
                    f"""INSERT INTO {SCHEMA}.users
                    (email, password_hash, full_name, role_id, phone, position, password_changed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP) RETURNING id""",
                    [email, password_hash, full_name, role['id'], phone, position]
                )
                new_user = cursor.fetchone()
                conn.commit()

                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position,
                    r.code as role_code, r.name as role_name
                    FROM {SCHEMA}.users u JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    WHERE u.id = %s""",
                    [new_user['id']]
                )
                user_data = dict(cursor.fetchone())

                access_token = create_jwt({
                    'sub': user_data['id'],
                    'email': user_data['email'],
                    'role': user_data['role_code'],
                    'type': 'access'
                }, ACCESS_TOKEN_TTL)

                refresh_token = secrets.token_hex(48)
                refresh_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
                cursor.execute(
                    f"""INSERT INTO {SCHEMA}.refresh_tokens (user_id, token_hash, expires_at)
                    VALUES (%s, %s, %s)""",
                    [user_data['id'], refresh_hash, datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_TTL)]
                )
                conn.commit()

                log_auth_event(cursor, conn, email, 'register', True, ip, user_data['id'], ua, 'Успешная регистрация')

                user_data['token'] = access_token
                user_data['refresh_token'] = refresh_token
                user_data['token_expires'] = int(time.time()) + ACCESS_TOKEN_TTL

                return response(201, {'success': True, 'user': user_data})

            elif action == 'login':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '')

                if not email or not password:
                    return response(400, {'error': 'Email и пароль обязательны'})

                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position,
                    u.password_hash, u.is_active, u.failed_attempts, u.locked_until,
                    r.code as role_code, r.name as role_name
                    FROM {SCHEMA}.users u JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    WHERE u.email = %s""",
                    [email]
                )
                user = cursor.fetchone()

                if not user:
                    log_auth_event(cursor, conn, email, 'login', False, ip, None, ua, 'Пользователь не найден')
                    return response(401, {'error': 'Неверный email или пароль'})

                if not user['is_active']:
                    log_auth_event(cursor, conn, email, 'login', False, ip, user['id'], ua, 'Учётная запись деактивирована')
                    return response(403, {'error': 'Учётная запись деактивирована'})

                if user['locked_until']:
                    lock_until = user['locked_until']
                    if isinstance(lock_until, str):
                        lock_until = datetime.fromisoformat(lock_until)
                    if lock_until > datetime.utcnow():
                        remaining = int((lock_until - datetime.utcnow()).total_seconds() / 60) + 1
                        log_auth_event(cursor, conn, email, 'login', False, ip, user['id'], ua,
                                       f'Аккаунт заблокирован, осталось {remaining} мин')
                        return response(423, {
                            'error': f'Учётная запись заблокирована. Повторите через {remaining} мин.',
                            'locked_until': str(lock_until)
                        })
                    else:
                        cursor.execute(
                            f"UPDATE {SCHEMA}.users SET failed_attempts = 0, locked_until = NULL WHERE id = %s",
                            [user['id']]
                        )
                        conn.commit()

                if not verify_password(password, user['password_hash']):
                    attempts = (user['failed_attempts'] or 0) + 1
                    if attempts >= MAX_FAILED_ATTEMPTS:
                        lock_time = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
                        cursor.execute(
                            f"UPDATE {SCHEMA}.users SET failed_attempts = %s, locked_until = %s WHERE id = %s",
                            [attempts, lock_time, user['id']]
                        )
                        conn.commit()
                        log_auth_event(cursor, conn, email, 'login', False, ip, user['id'], ua,
                                       f'Неверный пароль (попытка {attempts}), аккаунт ЗАБЛОКИРОВАН на {LOCKOUT_MINUTES} мин')
                        return response(423, {
                            'error': f'Учётная запись заблокирована на {LOCKOUT_MINUTES} минут после {MAX_FAILED_ATTEMPTS} неудачных попыток',
                            'locked_until': str(lock_time)
                        })
                    else:
                        cursor.execute(
                            f"UPDATE {SCHEMA}.users SET failed_attempts = %s WHERE id = %s",
                            [attempts, user['id']]
                        )
                        conn.commit()
                        remaining = MAX_FAILED_ATTEMPTS - attempts
                        log_auth_event(cursor, conn, email, 'login', False, ip, user['id'], ua,
                                       f'Неверный пароль (попытка {attempts}/{MAX_FAILED_ATTEMPTS})')
                        return response(401, {
                            'error': f'Неверный email или пароль. Осталось попыток: {remaining}',
                            'attempts_remaining': remaining
                        })

                cursor.execute(
                    f"UPDATE {SCHEMA}.users SET failed_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = %s",
                    [user['id']]
                )
                conn.commit()

                access_token = create_jwt({
                    'sub': user['id'],
                    'email': user['email'],
                    'role': user['role_code'],
                    'type': 'access'
                }, ACCESS_TOKEN_TTL)

                refresh_token = secrets.token_hex(48)
                refresh_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
                cursor.execute(
                    f"""INSERT INTO {SCHEMA}.refresh_tokens (user_id, token_hash, expires_at)
                    VALUES (%s, %s, %s)""",
                    [user['id'], refresh_hash, datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_TTL)]
                )
                conn.commit()

                log_auth_event(cursor, conn, email, 'login', True, ip, user['id'], ua, 'Успешный вход')

                user_data = {
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'phone': user['phone'],
                    'position': user['position'],
                    'role_code': user['role_code'],
                    'role_name': user['role_name'],
                    'token': access_token,
                    'refresh_token': refresh_token,
                    'token_expires': int(time.time()) + ACCESS_TOKEN_TTL,
                }
                return response(200, {'success': True, 'user': user_data})

            elif action == 'refresh':
                refresh_token = body.get('refresh_token', '')
                if not refresh_token:
                    return response(400, {'error': 'refresh_token обязателен'})

                token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
                cursor.execute(
                    f"""SELECT rt.id, rt.user_id, rt.expires_at, u.email, u.is_active,
                    r.code as role_code, r.name as role_name,
                    u.full_name, u.phone, u.position
                    FROM {SCHEMA}.refresh_tokens rt
                    JOIN {SCHEMA}.users u ON rt.user_id = u.id
                    JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    WHERE rt.token_hash = %s AND rt.revoked = FALSE""",
                    [token_hash]
                )
                rt = cursor.fetchone()

                if not rt:
                    return response(401, {'error': 'Недействительный refresh-токен'})

                expires = rt['expires_at']
                if isinstance(expires, str):
                    expires = datetime.fromisoformat(expires)
                if expires < datetime.utcnow():
                    return response(401, {'error': 'Refresh-токен истёк. Войдите заново.'})

                if not rt['is_active']:
                    return response(403, {'error': 'Учётная запись деактивирована'})

                cursor.execute(f"UPDATE {SCHEMA}.refresh_tokens SET revoked = TRUE WHERE id = %s", [rt['id']])

                new_refresh = secrets.token_hex(48)
                new_hash = hashlib.sha256(new_refresh.encode()).hexdigest()
                cursor.execute(
                    f"""INSERT INTO {SCHEMA}.refresh_tokens (user_id, token_hash, expires_at)
                    VALUES (%s, %s, %s)""",
                    [rt['user_id'], new_hash, datetime.utcnow() + timedelta(seconds=REFRESH_TOKEN_TTL)]
                )
                conn.commit()

                access_token = create_jwt({
                    'sub': rt['user_id'],
                    'email': rt['email'],
                    'role': rt['role_code'],
                    'type': 'access'
                }, ACCESS_TOKEN_TTL)

                log_auth_event(cursor, conn, rt['email'], 'refresh', True, ip, rt['user_id'], ua, 'Токен обновлён')

                return response(200, {
                    'success': True,
                    'user': {
                        'id': rt['user_id'],
                        'email': rt['email'],
                        'full_name': rt['full_name'],
                        'phone': rt['phone'],
                        'position': rt['position'],
                        'role_code': rt['role_code'],
                        'role_name': rt['role_name'],
                        'token': access_token,
                        'refresh_token': new_refresh,
                        'token_expires': int(time.time()) + ACCESS_TOKEN_TTL,
                    }
                })

            elif action == 'logout':
                refresh_token = body.get('refresh_token', '')
                user_email = body.get('email', '')
                if refresh_token:
                    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
                    cursor.execute(
                        f"UPDATE {SCHEMA}.refresh_tokens SET revoked = TRUE WHERE token_hash = %s",
                        [token_hash]
                    )
                    conn.commit()
                log_auth_event(cursor, conn, user_email, 'logout', True, ip, body.get('user_id'), ua, 'Выход из системы')
                return response(200, {'success': True})

            elif action == 'verify':
                token = body.get('token', '')
                payload = decode_jwt(token)
                if not payload:
                    return response(401, {'error': 'Токен недействителен или истёк'})
                return response(200, {
                    'valid': True,
                    'user_id': payload.get('sub'),
                    'email': payload.get('email'),
                    'role': payload.get('role'),
                    'expires': payload.get('exp'),
                })

            elif action == 'update_user':
                user_id = body.get('user_id')
                if not user_id:
                    return response(400, {'error': 'user_id обязателен'})
                fields = {}
                for f in ['full_name', 'phone', 'position']:
                    if f in body:
                        fields[f] = body[f]
                if 'role' in body:
                    cursor.execute(f"SELECT id FROM {SCHEMA}.roles WHERE code = %s", [body['role']])
                    role = cursor.fetchone()
                    if role:
                        fields['role_id'] = role['id']
                if fields:
                    set_clause = ', '.join([f'{k} = %s' for k in fields.keys()])
                    values = list(fields.values()) + [user_id]
                    cursor.execute(f"UPDATE {SCHEMA}.users SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s", values)
                    conn.commit()
                return response(200, {'success': True})

            elif action == 'create_object':
                name = body.get('name', '')
                if not name:
                    return response(400, {'error': 'Наименование объекта обязательно'})

                fields_map = {
                    'name': name,
                    'address': body.get('address'),
                    'functional_class': body.get('functional_class'),
                    'commissioning_date': body.get('commissioning_date'),
                    'fire_resistance': body.get('fire_resistance'),
                    'structural_fire_hazard': body.get('structural_fire_hazard'),
                    'area': body.get('area'),
                    'floor_area': body.get('floor_area'),
                    'height': body.get('height'),
                    'floors': body.get('floors'),
                    'volume': body.get('volume'),
                    'outdoor_category': body.get('outdoor_category'),
                    'building_category': body.get('building_category'),
                    'workplaces': body.get('workplaces'),
                    'working_hours': body.get('working_hours'),
                    'photo': body.get('photo'),
                    'created_by': body.get('user_id'),
                }
                clean = {k: v for k, v in fields_map.items() if v is not None}
                cols = ', '.join(clean.keys())
                placeholders = ', '.join(['%s'] * len(clean))
                values = list(clean.values())

                cursor.execute(f"INSERT INTO {SCHEMA}.objects ({cols}) VALUES ({placeholders}) RETURNING id", values)
                obj = cursor.fetchone()
                conn.commit()

                if body.get('user_id'):
                    cursor.execute(
                        f"INSERT INTO {SCHEMA}.object_users (object_id, user_id) VALUES (%s, %s)",
                        [obj['id'], body['user_id']]
                    )
                    conn.commit()

                default_systems = [
                    ('АПС (автоматическая пожарная сигнализация)', 'aps'),
                    ('СОУЭ (система оповещения и управления эвакуацией)', 'soue'),
                    ('АУПТ (автоматическая установка пожаротушения)', 'aupt'),
                    ('Противопожарное водоснабжение', 'fire_water'),
                    ('Внутренний противопожарный водопровод (ВПВ)', 'vpv'),
                    ('Наружный противопожарный водопровод', 'outdoor_water'),
                ]
                for sys_name, sys_key in default_systems:
                    cursor.execute(
                        f"INSERT INTO {SCHEMA}.protection_systems (system_name, system_key, object_id) VALUES (%s, %s, %s)",
                        [sys_name, sys_key, obj['id']]
                    )
                conn.commit()
                return response(201, {'success': True, 'id': obj['id']})

        elif method == 'GET':
            if action == 'users':
                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position, u.is_active,
                    u.created_at, u.last_login, u.failed_attempts, u.locked_until,
                    r.code as role_code, r.name as role_name
                    FROM {SCHEMA}.users u JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    ORDER BY u.created_at DESC"""
                )
                users = [dict(row) for row in cursor.fetchall()]
                return response(200, users)

            elif action == 'roles':
                cursor.execute(f"SELECT id, code, name, description FROM {SCHEMA}.roles ORDER BY id")
                roles = [dict(row) for row in cursor.fetchall()]
                return response(200, roles)

            elif action == 'objects':
                user_id = params.get('user_id')
                if user_id:
                    cursor.execute(
                        f"""SELECT o.* FROM {SCHEMA}.objects o
                        LEFT JOIN {SCHEMA}.object_users ou ON o.id = ou.object_id
                        WHERE (o.created_by = %s OR ou.user_id = %s) AND o.is_active = TRUE
                        GROUP BY o.id ORDER BY o.created_at DESC""",
                        [user_id, user_id]
                    )
                else:
                    cursor.execute(f"SELECT * FROM {SCHEMA}.objects WHERE is_active = TRUE ORDER BY created_at DESC")
                objects = [dict(row) for row in cursor.fetchall()]
                return response(200, objects)

            elif action == 'object':
                object_id = params.get('object_id')
                if not object_id:
                    return response(400, {'error': 'object_id обязателен'})
                cursor.execute(f"SELECT * FROM {SCHEMA}.objects WHERE id = %s", [object_id])
                obj = cursor.fetchone()
                if not obj:
                    return response(404, {'error': 'Объект не найден'})
                return response(200, dict(obj))

            elif action == 'auth_logs':
                limit = int(params.get('limit', '100'))
                offset = int(params.get('offset', '0'))
                email_filter = params.get('email', '')

                where = ''
                query_params = []
                if email_filter:
                    where = 'WHERE al.email ILIKE %s'
                    query_params.append(f'%{email_filter}%')

                cursor.execute(
                    f"""SELECT al.id, al.email, al.action, al.success, al.ip_address,
                    al.user_agent, al.details, al.created_at, u.full_name
                    FROM {SCHEMA}.auth_logs al
                    LEFT JOIN {SCHEMA}.users u ON al.user_id = u.id
                    {where}
                    ORDER BY al.created_at DESC
                    LIMIT %s OFFSET %s""",
                    query_params + [limit, offset]
                )
                logs = [dict(row) for row in cursor.fetchall()]

                cursor.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.auth_logs al {where}", query_params)
                total = cursor.fetchone()['total']

                return response(200, {'logs': logs, 'total': total})

            elif action == 'password_rules':
                return response(200, {
                    'min_length': PASSWORD_RULES['min_length'],
                    'require_upper': PASSWORD_RULES['require_upper'],
                    'require_lower': PASSWORD_RULES['require_lower'],
                    'require_digit': PASSWORD_RULES['require_digit'],
                    'require_special': PASSWORD_RULES['require_special'],
                    'corporate_domain': CORPORATE_DOMAIN,
                })

        if method == 'PUT' and action == 'update_object':
            body = json.loads(event.get('body', '{}'))
            object_id = body.pop('object_id', None)
            if not object_id:
                return response(400, {'error': 'object_id обязателен'})
            body.pop('action', None)
            body.pop('user_id', None)
            if body:
                set_clause = ', '.join([f'{k} = %s' for k in body.keys()])
                values = list(body.values()) + [object_id]
                cursor.execute(f"UPDATE {SCHEMA}.objects SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s", values)
                conn.commit()
            return response(200, {'success': True})

        return response(405, {'error': 'Method not allowed'})

    finally:
        cursor.close()
        conn.close()
