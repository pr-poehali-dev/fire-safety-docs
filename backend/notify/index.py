"""
Email-уведомления.

Поддерживает 2 режима:
1. Внешний вызов через HTTP (action='send_test', 'send_notification')
2. Импорт send_email() напрямую из других backend-функций

Авторизация: для всех HTTP-вызовов требуется JWT (X-Auth-Token).
SMTP-настройки берутся из переменных окружения.
"""
import json
import os
import smtplib
import ssl
import hmac
import hashlib
import base64
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from typing import Dict, Any, Optional, List

JWT_SECRET = os.environ.get('JWT_SECRET', 'fire-safety-jwt-secret-2025')

SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
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


def response(status: int, body) -> dict:
    return {
        'statusCode': status,
        'headers': dict(SECURITY_HEADERS),
        'body': json.dumps(body, default=str, ensure_ascii=False),
        'isBase64Encoded': False
    }


def get_smtp_config() -> Optional[dict]:
    host = os.environ.get('SMTP_HOST', '').strip()
    port_str = os.environ.get('SMTP_PORT', '').strip()
    user = os.environ.get('SMTP_USER', '').strip()
    password = os.environ.get('SMTP_PASSWORD', '').strip()
    if not host or not port_str or not user or not password:
        return None
    try:
        port = int(port_str)
    except ValueError:
        return None
    return {'host': host, 'port': port, 'user': user, 'password': password}


def send_email(to: List[str], subject: str, html_body: str, text_body: str = '') -> Dict[str, Any]:
    """
    Отправляет email через SMTP. Возвращает {'success': bool, 'error': str|None}.
    Безопасно вызывать без настроенного SMTP — вернёт success=False с ошибкой.
    """
    cfg = get_smtp_config()
    if not cfg:
        return {'success': False, 'error': 'SMTP не настроен (нет SMTP_HOST/PORT/USER/PASSWORD в секретах)'}

    if not to:
        return {'success': False, 'error': 'Не указан получатель'}

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = formataddr(('Система управления ПБ', cfg['user']))
    msg['To'] = ', '.join(to)

    if not text_body:
        # Простейшее извлечение текста из HTML для совместимости
        text_body = html_body.replace('<br>', '\n').replace('<br/>', '\n').replace('<br />', '\n')
        import re as _re
        text_body = _re.sub(r'<[^>]+>', '', text_body)

    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    try:
        if cfg['port'] == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(cfg['host'], cfg['port'], context=context, timeout=20) as server:
                server.login(cfg['user'], cfg['password'])
                server.sendmail(cfg['user'], to, msg.as_string())
        else:
            with smtplib.SMTP(cfg['host'], cfg['port'], timeout=20) as server:
                server.ehlo()
                server.starttls(context=ssl.create_default_context())
                server.ehlo()
                server.login(cfg['user'], cfg['password'])
                server.sendmail(cfg['user'], to, msg.as_string())
        return {'success': True, 'error': None}
    except smtplib.SMTPAuthenticationError:
        return {'success': False, 'error': 'Неверный логин или пароль SMTP'}
    except smtplib.SMTPException as e:
        return {'success': False, 'error': f'SMTP-ошибка: {e}'}
    except Exception as e:
        return {'success': False, 'error': f'Ошибка отправки: {e}'}


def render_object_created_email(object_name: str, object_address: str, creator_name: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Объект создан</title></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #2563EB 0%, #EA580C 100%); padding: 24px 32px; color: white;">
      <h1 style="margin: 0; font-size: 22px;">🛡️ Объект защиты создан</h1>
      <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Система управления пожарной безопасностью</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Здравствуйте!</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        В системе управления пожарной безопасностью создан объект защиты.
        На этот email будут приходить уведомления:
      </p>
      <ul style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px;">
        <li>о приближающихся сроках проверок и ТО</li>
        <li>о пропущенных мероприятиях (ТО, тренировки, перезарядка огнетушителей)</li>
        <li>об истечении сроков (страхование, огнезащита)</li>
        <li>о результатах проверок и аудитов</li>
      </ul>
      <div style="background: #f8fafc; border-left: 4px solid #2563EB; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0 0 6px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Объект</p>
        <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">{object_name}</p>
        {f'<p style="margin: 6px 0 0; color: #64748b; font-size: 13px;">{object_address}</p>' if object_address else ''}
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Создатель объекта: <strong>{creator_name}</strong>
      </p>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        Это автоматическое сообщение от системы управления пожарной безопасностью.
        Если вы получили это письмо по ошибке — проигнорируйте его.
      </p>
    </div>
  </div>
</body>
</html>
""".strip()


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Email-уведомления: отправка тестовых и плановых писем"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    headers_req = event.get('headers', {}) or {}
    token = headers_req.get('X-Auth-Token', headers_req.get('x-auth-token', ''))
    if not token:
        token = headers_req.get('X-Authorization', headers_req.get('x-authorization', ''))
        if token and token.lower().startswith('bearer '):
            token = token[7:].strip()
    auth_payload = decode_jwt(token) if token else None
    if not auth_payload:
        return response(401, {'error': 'Требуется авторизация'})

    if method == 'GET':
        cfg = get_smtp_config()
        return response(200, {
            'configured': cfg is not None,
            'host': cfg['host'] if cfg else None,
            'port': cfg['port'] if cfg else None,
        })

    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', '')

        if action == 'send_test':
            to_email = body.get('to', '').strip()
            object_name = body.get('object_name', 'Тестовый объект')
            object_address = body.get('object_address', '')
            creator_name = body.get('creator_name', auth_payload.get('email', 'Пользователь'))

            if not to_email or '@' not in to_email:
                return response(400, {'error': 'Не указан корректный email получателя'})

            html = render_object_created_email(object_name, object_address, creator_name)
            result = send_email(
                to=[to_email],
                subject=f'Объект «{object_name}» создан',
                html_body=html,
            )
            if not result['success']:
                return response(500, {'error': result['error']})
            return response(200, {'success': True, 'sent_to': to_email})

        if action == 'send_notification':
            to_email = body.get('to', '').strip()
            subject = body.get('subject', 'Уведомление')
            html_body = body.get('html', '')
            text_body = body.get('text', '')
            if not to_email or '@' not in to_email:
                return response(400, {'error': 'Не указан корректный email получателя'})
            if not html_body and not text_body:
                return response(400, {'error': 'Не указан текст письма'})

            result = send_email(to=[to_email], subject=subject, html_body=html_body or text_body, text_body=text_body)
            if not result['success']:
                return response(500, {'error': result['error']})
            return response(200, {'success': True})

        return response(400, {'error': 'Unknown action'})

    return response(405, {'error': 'Method not allowed'})
