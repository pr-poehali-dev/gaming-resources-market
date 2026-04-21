"""
Авторизация: регистрация, логин, логаут, получение текущего пользователя.
"""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timezone

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    salt = os.environ.get('SECRET_SALT', 'preyday_salt_2025')
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def make_session(conn, user_id: int) -> str:
    session_id = secrets.token_hex(32)
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO pd_sessions (id, user_id) VALUES (%s, %s)",
            (session_id, user_id)
        )
    conn.commit()
    return session_id

def get_user_by_session(conn, session_id: str):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.username, u.email, u.is_admin, b.amount
            FROM pd_sessions s
            JOIN pd_users u ON u.id = s.user_id
            LEFT JOIN pd_balances b ON b.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW()
        """, (session_id,))
        return cur.fetchone()

def ok(data: dict, session_id: str = None):
    headers = dict(CORS)
    if session_id:
        headers['X-Set-Cookie'] = f'pd_session={session_id}; Path=/; HttpOnly; Max-Age=2592000'
        # Также кладём session_id в тело ответа — надёжнее чем заголовки
        data = dict(data)
        data['session_id'] = session_id
    return {'statusCode': 200, 'headers': headers, 'body': json.dumps(data)}

def err(msg: str, code: int = 400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            return err('Invalid JSON')

    session_id = None
    cookie_header = event.get('headers', {}).get('X-Cookie', '')
    for part in cookie_header.split(';'):
        part = part.strip()
        if part.startswith('pd_session='):
            session_id = part[len('pd_session='):]
            break
    if not session_id:
        session_id = event.get('headers', {}).get('X-Session-Id', '')

    conn = get_conn()

    try:
        # GET /me — текущий пользователь
        if method == 'GET' and path.endswith('/me'):
            if not session_id:
                return err('Not authorized', 401)
            row = get_user_by_session(conn, session_id)
            if not row:
                return err('Session expired', 401)
            return ok({'id': row[0], 'username': row[1], 'email': row[2],
                       'is_admin': row[3], 'balance': float(row[4] or 0)})

        # POST /register
        if method == 'POST' and path.endswith('/register'):
            username = (body.get('username') or '').strip()
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            if not username or not email or not password:
                return err('Заполните все поля')
            if len(username) < 3:
                return err('Никнейм минимум 3 символа')
            if len(password) < 6:
                return err('Пароль минимум 6 символов')
            pw_hash = hash_password(password)
            with conn.cursor() as cur:
                try:
                    cur.execute(
                        "INSERT INTO pd_users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                        (username, email, pw_hash)
                    )
                    user_id = cur.fetchone()[0]
                    cur.execute("INSERT INTO pd_balances (user_id) VALUES (%s)", (user_id,))
                    conn.commit()
                except psycopg2.errors.UniqueViolation:
                    conn.rollback()
                    return err('Такой email или никнейм уже зарегистрирован')
            sid = make_session(conn, user_id)
            return ok({'id': user_id, 'username': username, 'email': email,
                       'is_admin': False, 'balance': 0.0}, session_id=sid)

        # POST /login
        if method == 'POST' and path.endswith('/login'):
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            if not email or not password:
                return err('Введите email и пароль')
            pw_hash = hash_password(password)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.id, u.username, u.email, u.is_admin, b.amount
                    FROM pd_users u
                    LEFT JOIN pd_balances b ON b.user_id = u.id
                    WHERE u.email = %s AND u.password_hash = %s
                """, (email, pw_hash))
                row = cur.fetchone()
            if not row:
                return err('Неверный email или пароль')
            sid = make_session(conn, row[0])
            return ok({'id': row[0], 'username': row[1], 'email': row[2],
                       'is_admin': row[3], 'balance': float(row[4] or 0)}, session_id=sid)

        # POST /logout
        if method == 'POST' and path.endswith('/logout'):
            if session_id:
                with conn.cursor() as cur:
                    cur.execute("UPDATE pd_sessions SET expires_at = NOW() WHERE id = %s", (session_id,))
                conn.commit()
            return ok({'ok': True})

        return err('Not found', 404)
    finally:
        conn.close()