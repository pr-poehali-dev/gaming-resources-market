"""
Управление балансом: запрос на пополнение, получение баланса, история.
Администратор подтверждает/отклоняет заявки вручную.
"""
import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

SBER_CARD = os.environ.get('SBER_CARD_NUMBER', '2202 2024 XXXX XXXX')
TG_ADMIN = 'https://t.me/Torgreal7'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_session_user(conn, session_id: str):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.username, u.is_admin, b.amount
            FROM pd_sessions s
            JOIN pd_users u ON u.id = s.user_id
            LEFT JOIN pd_balances b ON b.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW()
        """, (session_id,))
        return cur.fetchone()

def get_session_id(event):
    sid = ''
    cookie_header = event.get('headers', {}).get('X-Cookie', '')
    for part in cookie_header.split(';'):
        part = part.strip()
        if part.startswith('pd_session='):
            sid = part[len('pd_session='):]
    if not sid:
        sid = event.get('headers', {}).get('X-Session-Id', '')
    return sid

def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    session_id = get_session_id(event)
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            return err('Invalid JSON')

    conn = get_conn()
    try:
        user = get_session_user(conn, session_id) if session_id else None

        # GET /balance — текущий баланс
        if method == 'GET' and path.endswith('/balance'):
            if not user:
                return err('Not authorized', 401)
            return ok({'balance': float(user[3] or 0), 'sber_card': SBER_CARD, 'tg_admin': TG_ADMIN})

        # POST /deposit — создать заявку на пополнение
        if method == 'POST' and path.endswith('/deposit'):
            if not user:
                return err('Not authorized', 401)
            amount = body.get('amount')
            try:
                amount = float(amount)
                assert amount >= 50
            except Exception:
                return err('Минимальная сумма пополнения 50 ₽')
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO pd_deposits (user_id, amount) VALUES (%s, %s) RETURNING id",
                    (user[0], amount)
                )
                deposit_id = cur.fetchone()[0]
            conn.commit()
            return ok({
                'deposit_id': deposit_id,
                'amount': amount,
                'status': 'pending',
                'sber_card': SBER_CARD,
                'message': f'Переведи {amount:.0f} ₽ на карту СберБанк. После перевода напиши @Torgreal7 с номером заявки #{deposit_id}'
            })

        # GET /deposits — история заявок пользователя
        if method == 'GET' and path.endswith('/deposits'):
            if not user:
                return err('Not authorized', 401)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, amount, status, comment, created_at
                    FROM pd_deposits WHERE user_id = %s
                    ORDER BY created_at DESC LIMIT 20
                """, (user[0],))
                rows = cur.fetchall()
            return ok({'deposits': [
                {'id': r[0], 'amount': float(r[1]), 'status': r[2],
                 'comment': r[3], 'created_at': r[4].isoformat()}
                for r in rows
            ]})

        # === ADMIN ONLY ===

        # GET /admin/deposits — все заявки (только для админа)
        if method == 'GET' and path.endswith('/admin/deposits'):
            if not user or not user[2]:
                return err('Forbidden', 403)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT d.id, d.user_id, u.username, d.amount, d.status, d.created_at
                    FROM pd_deposits d JOIN pd_users u ON u.id = d.user_id
                    WHERE d.status = 'pending'
                    ORDER BY d.created_at ASC
                """)
                rows = cur.fetchall()
            return ok({'deposits': [
                {'id': r[0], 'user_id': r[1], 'username': r[2],
                 'amount': float(r[3]), 'status': r[4], 'created_at': r[5].isoformat()}
                for r in rows
            ]})

        # POST /admin/confirm — подтвердить и зачислить баланс
        if method == 'POST' and path.endswith('/admin/confirm'):
            if not user or not user[2]:
                return err('Forbidden', 403)
            deposit_id = body.get('deposit_id')
            action = body.get('action', 'confirm')
            if not deposit_id:
                return err('deposit_id required')
            with conn.cursor() as cur:
                cur.execute("SELECT user_id, amount, status FROM pd_deposits WHERE id = %s", (deposit_id,))
                dep = cur.fetchone()
                if not dep:
                    return err('Заявка не найдена', 404)
                if dep[2] != 'pending':
                    return err('Заявка уже обработана')
                if action == 'confirm':
                    cur.execute(
                        "UPDATE pd_deposits SET status='confirmed', confirmed_at=NOW() WHERE id=%s",
                        (deposit_id,)
                    )
                    cur.execute(
                        "UPDATE pd_balances SET amount = amount + %s, updated_at=NOW() WHERE user_id=%s",
                        (dep[1], dep[0])
                    )
                    cur.execute(
                        "INSERT INTO pd_admin_log (admin_id, action, target_user_id, details) VALUES (%s, %s, %s, %s)",
                        (user[0], 'confirm_deposit', dep[0], json.dumps({'deposit_id': deposit_id, 'amount': float(dep[1])}))
                    )
                else:
                    cur.execute(
                        "UPDATE pd_deposits SET status='rejected', confirmed_at=NOW(), comment=%s WHERE id=%s",
                        (body.get('reason', 'Отклонено администратором'), deposit_id)
                    )
            conn.commit()
            return ok({'ok': True, 'action': action})

        # GET /admin/users — список всех пользователей
        if method == 'GET' and path.endswith('/admin/users'):
            if not user or not user[2]:
                return err('Forbidden', 403)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT u.id, u.username, u.email, b.amount, u.is_admin, u.created_at
                    FROM pd_users u LEFT JOIN pd_balances b ON b.user_id=u.id
                    ORDER BY u.created_at DESC
                """)
                rows = cur.fetchall()
            return ok({'users': [
                {'id': r[0], 'username': r[1], 'email': r[2],
                 'balance': float(r[3] or 0), 'is_admin': r[4], 'created_at': r[5].isoformat()}
                for r in rows
            ]})

        # POST /admin/adjust — ручное изменение баланса
        if method == 'POST' and path.endswith('/admin/adjust'):
            if not user or not user[2]:
                return err('Forbidden', 403)
            target_id = body.get('user_id')
            delta = body.get('delta')
            reason = body.get('reason', '')
            if not target_id or delta is None:
                return err('user_id and delta required')
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE pd_balances SET amount = GREATEST(0, amount + %s), updated_at=NOW() WHERE user_id=%s",
                    (float(delta), target_id)
                )
                cur.execute(
                    "INSERT INTO pd_admin_log (admin_id, action, target_user_id, details) VALUES (%s, %s, %s, %s)",
                    (user[0], 'adjust_balance', target_id, json.dumps({'delta': float(delta), 'reason': reason}))
                )
            conn.commit()
            return ok({'ok': True})

        return err('Not found', 404)
    finally:
        conn.close()
