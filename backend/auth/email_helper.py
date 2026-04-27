"""
Email-helper для функции auth.
Используется при создании объекта для отправки тестового письма.
"""
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from typing import Dict, Any


def _get_smtp_config():
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


def _send_smtp(to_email: str, subject: str, html_body: str, text_body: str) -> Dict[str, Any]:
    cfg = _get_smtp_config()
    if not cfg:
        return {'success': False, 'error': 'SMTP не настроен'}

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = formataddr(('Система управления ПБ', cfg['user']))
    msg['To'] = to_email

    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    try:
        if cfg['port'] == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(cfg['host'], cfg['port'], context=context, timeout=15) as server:
                server.login(cfg['user'], cfg['password'])
                server.sendmail(cfg['user'], [to_email], msg.as_string())
        else:
            with smtplib.SMTP(cfg['host'], cfg['port'], timeout=15) as server:
                server.ehlo()
                server.starttls(context=ssl.create_default_context())
                server.ehlo()
                server.login(cfg['user'], cfg['password'])
                server.sendmail(cfg['user'], [to_email], msg.as_string())
        return {'success': True, 'error': None}
    except smtplib.SMTPAuthenticationError:
        return {'success': False, 'error': 'Неверный логин или пароль SMTP'}
    except smtplib.SMTPException as e:
        return {'success': False, 'error': f'SMTP-ошибка: {e}'}
    except Exception as e:
        return {'success': False, 'error': f'Ошибка отправки: {e}'}


def send_object_created_email(to: str, object_name: str, object_address: str, creator_name: str) -> Dict[str, Any]:
    """Отправляет приветственное письмо ответственному за объект"""
    if not to or '@' not in to:
        return {'success': False, 'error': 'Некорректный email'}

    addr_block = ''
    if object_address:
        addr_block = f'<p style="margin: 6px 0 0; color: #64748b; font-size: 13px;">{object_address}</p>'

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #2563EB 0%, #EA580C 100%); padding: 24px 32px; color: white;">
      <h1 style="margin: 0; font-size: 22px;">Объект защиты создан</h1>
      <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Система управления пожарной безопасностью</p>
    </div>
    <div style="padding: 28px 32px;">
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Здравствуйте!</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        В системе создан объект защиты. На этот email будут приходить уведомления:
      </p>
      <ul style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px;">
        <li>о приближающихся сроках проверок и ТО</li>
        <li>о пропущенных мероприятиях</li>
        <li>об истечении сроков (страхование, огнезащита)</li>
        <li>о результатах проверок и аудитов</li>
      </ul>
      <div style="background: #f8fafc; border-left: 4px solid #2563EB; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0 0 6px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Объект</p>
        <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 600;">{object_name}</p>
        {addr_block}
      </div>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Создатель: <strong>{creator_name}</strong>
      </p>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        Это автоматическое сообщение. Если вы получили его по ошибке — проигнорируйте.
      </p>
    </div>
  </div>
</body>
</html>"""

    text = (
        f'Объект защиты «{object_name}» создан.\n'
        f'Адрес: {object_address or "не указан"}\n'
        f'Создатель: {creator_name}\n\n'
        f'На этот email будут приходить уведомления о проверках, ТО, '
        f'истечении сроков и результатах аудитов.'
    )

    return _send_smtp(to, f'Объект «{object_name}» создан', html, text)
