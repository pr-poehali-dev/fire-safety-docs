import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

SCHEMA = 't_p36866218_fire_safety_docs'

def hash_password(password: str, salt: str = None) -> tuple:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return f"{salt}:{hashed}", salt

def verify_password(password: str, stored: str) -> bool:
    salt, hashed = stored.split(':')
    check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return check == hashed

def response(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Авторизация, регистрация и управление пользователями"""
    method = event.get('httpMethod', 'GET')

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

    try:
        params = event.get('queryStringParameters') or {}
        action = params.get('action', '')

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

                cursor.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", [email])
                if cursor.fetchone():
                    return response(409, {'error': 'Пользователь с таким email уже существует'})

                cursor.execute(f"SELECT id FROM {SCHEMA}.roles WHERE code = %s", [role_code])
                role = cursor.fetchone()
                if not role:
                    return response(400, {'error': 'Неверная роль'})

                password_hash, _ = hash_password(password)
                token = secrets.token_hex(32)

                cursor.execute(
                    f"""INSERT INTO {SCHEMA}.users (email, password_hash, full_name, role_id, phone, position)
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                    [email, password_hash, full_name, role['id'], phone, position]
                )
                user = cursor.fetchone()
                conn.commit()

                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position,
                    r.code as role_code, r.name as role_name
                    FROM {SCHEMA}.users u JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    WHERE u.id = %s""",
                    [user['id']]
                )
                user_data = dict(cursor.fetchone())
                user_data['token'] = token

                return response(201, {'success': True, 'user': user_data})

            elif action == 'login':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '')

                if not email or not password:
                    return response(400, {'error': 'Email и пароль обязательны'})

                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position, u.password_hash, u.is_active,
                    r.code as role_code, r.name as role_name
                    FROM {SCHEMA}.users u JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    WHERE u.email = %s""",
                    [email]
                )
                user = cursor.fetchone()

                if not user:
                    return response(401, {'error': 'Неверный email или пароль'})

                if not user['is_active']:
                    return response(403, {'error': 'Учётная запись деактивирована'})

                if not verify_password(password, user['password_hash']):
                    return response(401, {'error': 'Неверный email или пароль'})

                token = secrets.token_hex(32)
                user_data = dict(user)
                del user_data['password_hash']
                del user_data['is_active']
                user_data['token'] = token

                return response(200, {'success': True, 'user': user_data})

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

        elif method == 'GET':
            if action == 'users':
                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position, u.is_active, u.created_at,
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

        if method == 'POST' and action == 'create_object':
            body = json.loads(event.get('body', '{}'))
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
