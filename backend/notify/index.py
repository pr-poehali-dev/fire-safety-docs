"""
Email-уведомления (redeploy).

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
from datetime import date, datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from typing import Dict, Any, Optional, List, Tuple

import psycopg2
from psycopg2.extras import RealDictCursor

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


PERIODICITY_DAYS = {
    'aups': 30, 'soue': 30, 'smoke_ventilation': 30, 'aupt': 30,
    'fire_extinguishers': 90, 'fire_blankets': 365, 'fire_protection': 365 * 5,
    'indoor_hydrants': 180, 'outdoor_hydrants': 180, 'hose_rolling': 365,
    'drills': 180,
}

SECTION_LABELS = {
    'aups': 'АУПС', 'soue': 'СОУЭ', 'smoke_ventilation': 'Противодымная вентиляция',
    'aupt': 'АУПТ', 'fire_extinguishers': 'Огнетушители', 'fire_blankets': 'Покрывала',
    'fire_protection': 'Огнезащита', 'indoor_hydrants': 'Внутренние пожарные краны',
    'outdoor_hydrants': 'Наружные гидранты', 'hose_rolling': 'Перекатка рукавов',
    'drills': 'Тренировки',
}


def get_db_conn():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return None
    return psycopg2.connect(dsn)


def find_alerts_for_object(conn, object_id: int) -> List[Dict[str, Any]]:
    """Возвращает список алертов: пропущенные и приближающиеся (≤30 дн) проверки."""
    alerts: List[Dict[str, Any]] = []
    today = date.today()

    section_tables = [
        ('section_fire_extinguishers', 'fire_extinguishers', 'maintenance_date', 'assigned_number'),
        ('section_fire_blankets', 'fire_blankets', 'inspection_date', 'location_info'),
        ('section_fire_protection', 'fire_protection', 'inspection_date', 'structure_info'),
        ('section_indoor_hydrants', 'indoor_hydrants', 'inspection_date', 'location'),
        ('section_hose_rolling', 'hose_rolling', 'inspection_date', 'location'),
    ]

    schema = 't_p36866218_fire_safety_docs'
    cur = conn.cursor(cursor_factory=RealDictCursor)

    for table, section_id, date_field, name_field in section_tables:
        try:
            cur.execute(f"SELECT id, {date_field}, {name_field} FROM {schema}.{table} WHERE object_id = {int(object_id)}")
            rows = cur.fetchall()
            for r in rows:
                d = r.get(date_field)
                if not d:
                    continue
                last_date = d if isinstance(d, date) else None
                if not last_date:
                    continue
                period = PERIODICITY_DAYS.get(section_id, 0)
                if not period:
                    continue
                next_due = last_date + timedelta(days=period)
                days_left = (next_due - today).days
                if days_left < 0:
                    severity = 'overdue'
                elif days_left <= 14:
                    severity = 'soon'
                elif days_left <= 30:
                    severity = 'upcoming'
                else:
                    continue
                alerts.append({
                    'section': SECTION_LABELS.get(section_id, section_id),
                    'item': str(r.get(name_field) or f"#{r.get('id')}"),
                    'last_date': last_date.isoformat(),
                    'next_due': next_due.isoformat(),
                    'days_left': days_left,
                    'severity': severity,
                })
        except Exception:
            conn.rollback()
            continue

    # Журналы (АУПС, СОУЭ и др.) — берём последнюю запись по section_id
    try:
        cur.execute(
            f"SELECT section_id, MAX((entry_data->>'work_date')::date) AS last_date "
            f"FROM {schema}.journal_entries WHERE object_id = {int(object_id)} "
            f"AND entry_data ? 'work_date' GROUP BY section_id"
        )
        for r in cur.fetchall():
            sid = r.get('section_id')
            ld = r.get('last_date')
            if not sid or not ld:
                continue
            period = PERIODICITY_DAYS.get(sid, 0)
            if not period:
                continue
            next_due = ld + timedelta(days=period)
            days_left = (next_due - today).days
            if days_left < 0:
                severity = 'overdue'
            elif days_left <= 14:
                severity = 'soon'
            elif days_left <= 30:
                severity = 'upcoming'
            else:
                continue
            alerts.append({
                'section': SECTION_LABELS.get(sid, sid),
                'item': 'Журнал ' + SECTION_LABELS.get(sid, sid),
                'last_date': ld.isoformat(),
                'next_due': next_due.isoformat(),
                'days_left': days_left,
                'severity': severity,
            })
    except Exception:
        conn.rollback()

    cur.close()
    return sorted(alerts, key=lambda a: a['days_left'])


def render_periodic_email(object_name: str, alerts: List[Dict[str, Any]]) -> str:
    overdue = [a for a in alerts if a['severity'] == 'overdue']
    soon = [a for a in alerts if a['severity'] == 'soon']
    upcoming = [a for a in alerts if a['severity'] == 'upcoming']

    def render_group(title: str, color: str, items: List[Dict[str, Any]]) -> str:
        if not items:
            return ''
        rows = ''.join([
            f'<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{a["section"]}</td>'
            f'<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">{a["item"]}</td>'
            f'<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">{a["next_due"]}</td>'
            f'<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:{color};font-weight:600;">'
            f'{("просрочено на " + str(abs(a["days_left"])) + " дн.") if a["severity"] == "overdue" else ("через " + str(a["days_left"]) + " дн.")}</td></tr>'
            for a in items
        ])
        return (
            f'<h3 style="color:{color};font-size:14px;margin:24px 0 8px;">{title} ({len(items)})</h3>'
            f'<table style="width:100%;border-collapse:collapse;font-size:13px;">{rows}</table>'
        )

    body = render_group('🔴 Пропущенные мероприятия', '#dc2626', overdue) + \
           render_group('🟡 Срок наступает в ближайшие 14 дней', '#d97706', soon) + \
           render_group('🔵 Предстоящие (до 30 дней)', '#2563eb', upcoming)

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f4f6f9;margin:0;padding:24px;">
  <div style="max-width:680px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#2563EB 0%,#EA580C 100%);padding:20px 28px;color:white;">
      <h1 style="margin:0;font-size:20px;">⚠️ Сводка по срокам пожарной безопасности</h1>
      <p style="margin:4px 0 0;opacity:0.9;font-size:13px;">Объект: {object_name}</p>
    </div>
    <div style="padding:20px 28px;">
      <p style="color:#334155;font-size:14px;">Найдено алертов: <strong>{len(alerts)}</strong></p>
      {body if alerts else '<p style="color:#10b981;">Все сроки в норме!</p>'}
      <p style="color:#94a3b8;font-size:11px;margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">
        Это автоматическое уведомление. Сформировано {datetime.now().strftime('%d.%m.%Y %H:%M')}.
      </p>
    </div>
  </div>
</body></html>"""


def run_periodic_check(target_object_id: Optional[int] = None) -> Dict[str, Any]:
    """Сканирует объекты и шлёт сводку на notification_email каждого."""
    conn = get_db_conn()
    if not conn:
        return {'success': False, 'error': 'DATABASE_URL не настроен'}

    schema = 't_p36866218_fire_safety_docs'
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if target_object_id:
            cur.execute(
                f"SELECT id, name, notification_email FROM {schema}.objects "
                f"WHERE id = {int(target_object_id)} AND notification_email IS NOT NULL"
            )
        else:
            cur.execute(
                f"SELECT id, name, notification_email FROM {schema}.objects "
                f"WHERE notification_email IS NOT NULL AND notification_email != ''"
            )
        objects = cur.fetchall()
    except Exception as e:
        cur.close()
        conn.close()
        return {'success': False, 'error': f'Не удалось получить список объектов: {e}'}

    summary = {'checked': 0, 'sent': 0, 'skipped': 0, 'failed': 0, 'details': []}

    for obj in objects:
        summary['checked'] += 1
        alerts = find_alerts_for_object(conn, obj['id'])
        # Отправляем только если есть критичные (overdue/soon)
        critical = [a for a in alerts if a['severity'] in ('overdue', 'soon')]
        if not critical:
            summary['skipped'] += 1
            summary['details'].append({'object': obj['name'], 'status': 'skipped', 'alerts': 0})
            continue

        html = render_periodic_email(obj['name'], alerts)
        result = send_email(
            to=[obj['notification_email']],
            subject=f"⚠️ Сроки ПБ: «{obj['name']}» — {len(critical)} критичных",
            html_body=html,
        )
        if result['success']:
            summary['sent'] += 1
            summary['details'].append({'object': obj['name'], 'status': 'sent', 'alerts': len(alerts), 'critical': len(critical)})
        else:
            summary['failed'] += 1
            summary['details'].append({'object': obj['name'], 'status': 'failed', 'error': result['error']})

    cur.close()
    conn.close()
    return {'success': True, **summary}


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

    # Cron-token для внешнего планировщика (без JWT)
    cron_token_header = headers_req.get('X-Cron-Token', headers_req.get('x-cron-token', ''))
    cron_token_env = os.environ.get('CRON_TOKEN', '')
    is_cron_call = bool(cron_token_header and cron_token_env and hmac.compare_digest(cron_token_header, cron_token_env))

    if not auth_payload and not is_cron_call:
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

        if action == 'run_periodic_check':
            # Можно вызывать как из UI (с JWT админа), так и внешним cron'ом (с CRON_TOKEN)
            target = body.get('object_id')
            try:
                target_id = int(target) if target else None
            except (ValueError, TypeError):
                target_id = None
            result = run_periodic_check(target_object_id=target_id)
            if not result.get('success'):
                return response(500, result)
            return response(200, result)

        return response(400, {'error': 'Unknown action'})

    return response(405, {'error': 'Method not allowed'})