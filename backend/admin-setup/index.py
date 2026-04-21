"""
Одноразовая установка пароля для аккаунта admin@preyday.shop.
После первой установки — обычный /login через auth.
"""
import json, os, hashlib, psycopg2

CORS = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    salt = os.environ.get('SECRET_SALT', 'preyday_salt_2025')
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}
    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body') or '{}')
    new_password = body.get('password', '')
    secret_key = body.get('secret_key', '')

    # Простая защита — проверяем секретный ключ из env
    expected_key = os.environ.get('ADMIN_SETUP_KEY', '')
    if not expected_key or secret_key != expected_key:
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Invalid secret key'})}

    if len(new_password) < 6:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Password too short'})}

    pw_hash = hash_password(new_password)
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE pd_users SET password_hash=%s WHERE email='admin@preyday.shop' RETURNING id, username",
            (pw_hash,)
        )
        row = cur.fetchone()
    conn.commit()
    conn.close()

    if not row:
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Admin user not found'})}
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'username': row[1]})}
