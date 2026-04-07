import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

SCHEMA = 't_p36866218_fire_safety_docs'

def response(status: int, body) -> dict:
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Универсальный CRUD для таблиц с поддержкой фильтрации по object_id"""
    method: str = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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

            fields = ', '.join(body_data.keys())
            placeholders = ', '.join(['%s'] * len(body_data))
            values = list(body_data.values())

            cursor.execute(
                f'INSERT INTO {SCHEMA}.{table} ({fields}) VALUES ({placeholders}) RETURNING id',
                values
            )
            result = cursor.fetchone()
            conn.commit()

            return response(201, {'success': True, 'id': result['id']})

        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            table = body_data.pop('table', 'object_characteristics')
            record_id = body_data.pop('id')

            set_clause = ', '.join([f'{k} = %s' for k in body_data.keys()])
            values = list(body_data.values()) + [record_id]

            cursor.execute(
                f'UPDATE {SCHEMA}.{table} SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s',
                values
            )
            conn.commit()

            return response(200, {'success': True})

        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            table = params.get('table', 'object_characteristics')
            record_id = params.get('id')

            cursor.execute(f'DELETE FROM {SCHEMA}.{table} WHERE id = %s', [record_id])
            conn.commit()

            return response(200, {'success': True})

        return response(405, {'error': 'Method not allowed'})

    finally:
        cursor.close()
        conn.close()
