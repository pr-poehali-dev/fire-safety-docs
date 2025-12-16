import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обработчик для работы с базой данных журнала пожарной безопасности
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id и др.
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            table = params.get('table', 'object_characteristics')
            
            cursor.execute(f'SELECT * FROM t_p36866218_fire_safety_docs.{table} ORDER BY id DESC')
            rows = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(row) for row in rows], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            table = body_data.pop('table', 'object_characteristics')
            
            fields = ', '.join(body_data.keys())
            placeholders = ', '.join(['%s'] * len(body_data))
            values = list(body_data.values())
            
            query = f'''
                INSERT INTO t_p36866218_fire_safety_docs.{table} ({fields})
                VALUES ({placeholders})
                RETURNING id
            '''
            
            cursor.execute(query, values)
            result = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': result['id']}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            table = body_data.pop('table', 'object_characteristics')
            record_id = body_data.pop('id')
            
            set_clause = ', '.join([f'{k} = %s' for k in body_data.keys()])
            values = list(body_data.values()) + [record_id]
            
            query = f'''
                UPDATE t_p36866218_fire_safety_docs.{table}
                SET {set_clause}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            '''
            
            cursor.execute(query, values)
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            table = params.get('table', 'object_characteristics')
            record_id = params.get('id')
            
            cursor.execute(
                f'DELETE FROM t_p36866218_fire_safety_docs.{table} WHERE id = %s',
                [record_id]
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
