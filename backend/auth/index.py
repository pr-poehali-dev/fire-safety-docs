import json
import os
import hashlib
import hmac
import secrets
import time
import base64
import struct
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

SCHEMA = 't_p36866218_fire_safety_docs'
JWT_SECRET = os.environ.get('JWT_SECRET', 'fire-safety-jwt-secret-2025')
ENCRYPTION_KEY = os.environ.get('ENCRYPTION_KEY', '')
ACCESS_TOKEN_TTL = 15 * 60
REFRESH_TOKEN_TTL = 7 * 24 * 3600
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
CORPORATE_DOMAIN = 'rusal.com'
PD_FIELDS = ['full_name', 'phone', 'position']

SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
}


def _pad16(data: bytes) -> bytes:
    pad_len = 16 - (len(data) % 16)
    return data + bytes([pad_len] * pad_len)

def _unpad16(data: bytes) -> bytes:
    pad_len = data[-1]
    if pad_len < 1 or pad_len > 16:
        return data
    return data[:-pad_len]

def _xor_blocks(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))

def _aes_key_schedule(key: bytes):
    from struct import pack, unpack
    RCON = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]
    SBOX = [
        0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
        0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
        0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
        0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
        0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
        0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
        0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
        0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
        0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
        0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
        0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
        0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
        0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
        0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
        0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
        0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
    ]
    Nk, Nr = 8, 14
    words = list(unpack('>8I', key))
    for i in range(Nk, 4*(Nr+1)):
        t = words[i-1]
        if i % Nk == 0:
            t = ((SBOX[(t>>16)&0xff]<<24)|(SBOX[(t>>8)&0xff]<<16)|(SBOX[t&0xff]<<8)|SBOX[(t>>24)&0xff]) ^ (RCON[i//Nk-1]<<24)
        elif i % Nk == 4:
            t = (SBOX[(t>>24)&0xff]<<24)|(SBOX[(t>>16)&0xff]<<16)|(SBOX[(t>>8)&0xff]<<8)|SBOX[t&0xff]
        words.append(words[i-Nk] ^ t)
    return [pack('>4I', *words[4*r:4*r+4]) for r in range(Nr+1)]

def _aes_encrypt_block(block: bytes, round_keys: list) -> bytes:
    SBOX = [
        0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
        0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
        0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
        0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
        0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
        0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
        0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
        0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
        0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
        0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
        0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
        0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
        0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
        0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
        0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
        0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
    ]
    def xtime(a): return ((a<<1)^0x1b) & 0xff if a & 0x80 else (a<<1) & 0xff
    state = list(block)
    state = [s^k for s,k in zip(state, round_keys[0])]
    for r in range(1, len(round_keys)-1):
        state = [SBOX[b] for b in state]
        s = list(state)
        state[1],state[5],state[9],state[13] = s[5],s[9],s[13],s[1]
        state[2],state[6],state[10],state[14] = s[10],s[14],s[2],s[6]
        state[3],state[7],state[11],state[15] = s[15],s[3],s[7],s[11]
        for c in range(4):
            i = c*4
            a = state[i:i+4]
            state[i]   = xtime(a[0])^xtime(a[1])^a[1]^a[2]^a[3]
            state[i+1] = a[0]^xtime(a[1])^xtime(a[2])^a[2]^a[3]
            state[i+2] = a[0]^a[1]^xtime(a[2])^xtime(a[3])^a[3]
            state[i+3] = xtime(a[0])^a[0]^a[1]^a[2]^xtime(a[3])
        state = [s^k for s,k in zip(state, round_keys[r])]
    state = [SBOX[b] for b in state]
    s = list(state)
    state[1],state[5],state[9],state[13] = s[5],s[9],s[13],s[1]
    state[2],state[6],state[10],state[14] = s[10],s[14],s[2],s[6]
    state[3],state[7],state[11],state[15] = s[15],s[3],s[7],s[11]
    state = [s^k for s,k in zip(state, round_keys[-1])]
    return bytes(state)

def _derive_key_256(key_str: str) -> bytes:
    return hashlib.sha256(key_str.encode('utf-8')).digest()

def encrypt_field(plaintext: str) -> Optional[str]:
    if not ENCRYPTION_KEY or not plaintext:
        return None
    key = _derive_key_256(ENCRYPTION_KEY)
    iv = secrets.token_bytes(16)
    padded = _pad16(plaintext.encode('utf-8'))
    rk = _aes_key_schedule(key)
    ct = b''
    prev = iv
    for i in range(0, len(padded), 16):
        block = _xor_blocks(padded[i:i+16], prev)
        enc = _aes_encrypt_block(block, rk)
        ct += enc
        prev = enc
    return base64.b64encode(iv + ct).decode('ascii')

def decrypt_field(ciphertext: str) -> Optional[str]:
    if not ENCRYPTION_KEY or not ciphertext:
        return None
    try:
        key = _derive_key_256(ENCRYPTION_KEY)
        raw = base64.b64decode(ciphertext)
        iv = raw[:16]
        ct = raw[16:]
        ISBOX = [
            0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
            0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
            0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
            0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
            0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
            0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
            0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
            0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
            0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
            0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
            0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
            0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
            0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
            0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
            0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
            0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d,
        ]
        def xtime(a): return ((a<<1)^0x1b)&0xff if a&0x80 else (a<<1)&0xff
        def mul(a,b):
            p=0
            for _ in range(8):
                if b&1: p^=a
                hi=a&0x80; a=(a<<1)&0xff
                if hi: a^=0x1b
                b>>=1
            return p
        rk = _aes_key_schedule(key)
        drk = list(rk)
        drk.reverse()
        pt = b''
        prev = iv
        for i in range(0, len(ct), 16):
            block = list(ct[i:i+16])
            state = [b^k for b,k in zip(block, drk[0])]
            for r in range(1, len(drk)-1):
                s = list(state)
                state[1],state[5],state[9],state[13] = s[13],s[1],s[5],s[9]
                state[2],state[6],state[10],state[14] = s[10],s[14],s[2],s[6]
                state[3],state[7],state[11],state[15] = s[7],s[11],s[15],s[3]
                state = [ISBOX[b] for b in state]
                state = [s^k for s,k in zip(state, drk[r])]
                for c in range(4):
                    j = c*4
                    a = state[j:j+4]
                    state[j]   = mul(a[0],14)^mul(a[1],11)^mul(a[2],13)^mul(a[3],9)
                    state[j+1] = mul(a[0],9)^mul(a[1],14)^mul(a[2],11)^mul(a[3],13)
                    state[j+2] = mul(a[0],13)^mul(a[1],9)^mul(a[2],14)^mul(a[3],11)
                    state[j+3] = mul(a[0],11)^mul(a[1],13)^mul(a[2],9)^mul(a[3],14)
            s = list(state)
            state[1],state[5],state[9],state[13] = s[13],s[1],s[5],s[9]
            state[2],state[6],state[10],state[14] = s[10],s[14],s[2],s[6]
            state[3],state[7],state[11],state[15] = s[7],s[11],s[15],s[3]
            state = [ISBOX[b] for b in state]
            state = [s^k for s,k in zip(state, drk[-1])]
            dec_block = _xor_blocks(bytes(state), prev)
            pt += dec_block
            prev = bytes(block)
        return _unpad16(pt).decode('utf-8')
    except Exception:
        return None


def encrypt_user_fields(user_data: dict) -> dict:
    enc_data = {}
    for field in PD_FIELDS:
        if user_data.get(field):
            enc = encrypt_field(str(user_data[field]))
            if enc:
                enc_data[f'{field}_enc'] = enc
    if enc_data:
        enc_data['encryption_version'] = 1
    return enc_data


def decrypt_user_fields(user_row: dict) -> dict:
    result = dict(user_row)
    if result.get('encryption_version', 0) >= 1:
        for field in PD_FIELDS:
            enc_val = result.get(f'{field}_enc')
            if enc_val:
                dec = decrypt_field(enc_val)
                if dec:
                    result[field] = dec
    return result

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


RATE_LIMIT_LOGIN = 30
RATE_LIMIT_WINDOW = 60
CAPTCHA_THRESHOLD = 3


def check_rate_limit(cursor, conn, ip: str, endpoint: str, limit: int = RATE_LIMIT_LOGIN) -> tuple:
    cursor.execute(
        f"""SELECT request_count, window_start FROM {SCHEMA}.rate_limits
        WHERE ip_address = %s AND endpoint = %s""", [ip, endpoint]
    )
    row = cursor.fetchone()
    now = datetime.utcnow()
    if row:
        ws = row['window_start']
        if isinstance(ws, str):
            ws = datetime.fromisoformat(ws)
        if (now - ws).total_seconds() > RATE_LIMIT_WINDOW:
            cursor.execute(
                f"UPDATE {SCHEMA}.rate_limits SET request_count = 1, window_start = %s WHERE ip_address = %s AND endpoint = %s",
                [now, ip, endpoint]
            )
            conn.commit()
            return True, 1
        if row['request_count'] >= limit:
            return False, row['request_count']
        cursor.execute(
            f"UPDATE {SCHEMA}.rate_limits SET request_count = request_count + 1 WHERE ip_address = %s AND endpoint = %s",
            [ip, endpoint]
        )
        conn.commit()
        return True, row['request_count'] + 1
    else:
        cursor.execute(
            f"INSERT INTO {SCHEMA}.rate_limits (ip_address, endpoint, request_count, window_start) VALUES (%s, %s, 1, %s)",
            [ip, endpoint, now]
        )
        conn.commit()
        return True, 1


def generate_csrf_token(user_id: int) -> str:
    data = f"{user_id}:{int(time.time())}:{secrets.token_hex(8)}"
    sig = hmac.new(JWT_SECRET.encode(), data.encode(), hashlib.sha256).hexdigest()[:16]
    return base64.urlsafe_b64encode(f"{data}:{sig}".encode()).decode()


def verify_csrf_token(token: str, max_age: int = 3600) -> bool:
    try:
        decoded = base64.urlsafe_b64decode(token).decode()
        parts = decoded.rsplit(':', 1)
        if len(parts) != 2:
            return False
        data, sig = parts
        expected = hmac.new(JWT_SECRET.encode(), data.encode(), hashlib.sha256).hexdigest()[:16]
        if not hmac.compare_digest(sig, expected):
            return False
        ts = int(data.split(':')[1])
        if int(time.time()) - ts > max_age:
            return False
        return True
    except Exception:
        return False


def get_captcha_required(cursor, ip: str) -> bool:
    cursor.execute(
        f"""SELECT COUNT(*) as cnt FROM {SCHEMA}.auth_logs
        WHERE ip_address = %s AND action = 'login' AND success = FALSE
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '15 minutes'""",
        [ip]
    )
    row = cursor.fetchone()
    return (row['cnt'] or 0) >= CAPTCHA_THRESHOLD


def verify_captcha_answer(answer: str, expected: str) -> bool:
    if not answer or not expected:
        return False
    return answer.strip().lower() == expected.strip().lower()


def response(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': dict(SECURITY_HEADERS),
        'body': json.dumps(body, default=str),
        'isBase64Encoded': False
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Аутентификация с JWT, rate-limiting, CSRF, капчей и аудитом"""
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
                enc_fields = encrypt_user_fields({'full_name': full_name, 'phone': phone, 'position': position})

                enc_cols = ''
                enc_placeholders = ''
                enc_values = []
                if enc_fields:
                    enc_col_names = list(enc_fields.keys())
                    enc_cols = ', ' + ', '.join(enc_col_names)
                    enc_placeholders = ', ' + ', '.join(['%s'] * len(enc_col_names))
                    enc_values = list(enc_fields.values())

                cursor.execute(
                    f"""INSERT INTO {SCHEMA}.users
                    (email, password_hash, full_name, role_id, phone, position, password_changed_at{enc_cols})
                    VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP{enc_placeholders}) RETURNING id""",
                    [email, password_hash, full_name, role['id'], phone, position] + enc_values
                )
                new_user = cursor.fetchone()
                conn.commit()

                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position,
                    u.full_name_enc, u.phone_enc, u.position_enc, u.encryption_version,
                    r.code as role_code, r.name as role_name
                    FROM {SCHEMA}.users u JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    WHERE u.id = %s""",
                    [new_user['id']]
                )
                user_data = decrypt_user_fields(dict(cursor.fetchone()))
                for k in ['full_name_enc', 'phone_enc', 'position_enc', 'encryption_version']:
                    user_data.pop(k, None)

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

                allowed, req_count = check_rate_limit(cursor, conn, ip, 'login', RATE_LIMIT_LOGIN)
                if not allowed:
                    log_auth_event(cursor, conn, email, 'login', False, ip, None, ua,
                                   f'Rate limit превышен: {req_count}/{RATE_LIMIT_LOGIN} за {RATE_LIMIT_WINDOW}с')
                    return response(429, {
                        'error': f'Превышен лимит запросов ({RATE_LIMIT_LOGIN}/мин). Повторите позже.',
                        'retry_after': RATE_LIMIT_WINDOW
                    })

                captcha_required = get_captcha_required(cursor, ip)
                if captcha_required:
                    captcha_answer = body.get('captcha_answer', '')
                    captcha_expected = body.get('captcha_id', '')
                    if not captcha_answer:
                        import random
                        a, b = random.randint(2, 15), random.randint(2, 15)
                        captcha_id = str(a + b)
                        return response(200, {
                            'captcha_required': True,
                            'captcha_question': f'Сколько будет {a} + {b}?',
                            'captcha_id': captcha_id,
                        })
                    if not verify_captcha_answer(captcha_answer, captcha_expected):
                        return response(400, {'error': 'Неверный ответ на капчу', 'captcha_required': True})

                cursor.execute(
                    f"""SELECT u.id, u.email, u.full_name, u.phone, u.position,
                    u.full_name_enc, u.phone_enc, u.position_enc, u.encryption_version,
                    u.password_hash, u.is_active, u.failed_attempts, u.locked_until,
                    r.code as role_code, r.name as role_name
                    FROM {SCHEMA}.users u JOIN {SCHEMA}.roles r ON u.role_id = r.id
                    WHERE u.email = %s""",
                    [email]
                )
                user_raw = cursor.fetchone()
                user = decrypt_user_fields(dict(user_raw)) if user_raw else None

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

            elif action == 'csrf_token':
                uid = int(params.get('user_id', '0'))
                token = generate_csrf_token(uid)
                return response(200, {'csrf_token': token})

            elif action == 'data_protection':
                cursor.execute(f"SELECT config_key, config_value FROM {SCHEMA}.data_protection_config ORDER BY id")
                config = {r['config_key']: r['config_value'] for r in cursor.fetchall()}

                cursor.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.users WHERE encryption_version >= 1")
                encrypted_count = cursor.fetchone()['total']
                cursor.execute(f"SELECT COUNT(*) as total FROM {SCHEMA}.users")
                total_users = cursor.fetchone()['total']

                cursor.execute(f"SELECT * FROM {SCHEMA}.backup_checklist ORDER BY check_date DESC LIMIT 12")
                checklists = [dict(r) for r in cursor.fetchall()]

                return response(200, {
                    'config': config,
                    'encryption': {
                        'algorithm': 'AES-256-CBC',
                        'key_storage': 'environment_variable',
                        'key_configured': bool(ENCRYPTION_KEY),
                        'encrypted_users': encrypted_count,
                        'total_users': total_users,
                        'pdn_fields': PD_FIELDS,
                    },
                    'transport': {
                        'https_enforced': True,
                        'hsts_enabled': True,
                        'hsts_max_age': 31536000,
                        'security_headers': list(SECURITY_HEADERS.keys()),
                    },
                    'backup_checklists': checklists,
                })

            elif action == 'backup_checklist':
                cursor.execute(f"SELECT * FROM {SCHEMA}.backup_checklist ORDER BY check_date DESC LIMIT 24")
                return response(200, [dict(r) for r in cursor.fetchall()])

        if method == 'POST' and action == 'save_backup_check':
            body = json.loads(event.get('body', '{}'))
            cursor.execute(
                f"""INSERT INTO {SCHEMA}.backup_checklist
                (check_date, performed_by, backup_verified, restore_tested, data_integrity_ok, encryption_verified, offsite_copy_ok, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                [body.get('check_date'), body.get('performed_by'), body.get('backup_verified', False),
                 body.get('restore_tested', False), body.get('data_integrity_ok', False),
                 body.get('encryption_verified', False), body.get('offsite_copy_ok', False),
                 body.get('notes', '')]
            )
            result = cursor.fetchone()
            conn.commit()
            return response(201, {'success': True, 'id': result['id']})

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