"""
Кубик Рубика: игрок ставит сумму и бросает кубик (1-6).
Сервер тоже бросает кубик. Больше — выигрыш x2, меньше — проигрыш, равно — возврат.
"""
import json
import os
import random
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

def get_session_user(conn, session_id):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT u.id, u.username, u.is_admin, b.amount
            FROM pd_sessions s
            JOIN pd_users u ON u.id = s.user_id
            LEFT JOIN pd_balances b ON b.user_id = u.id
            WHERE s.id = %s AND s.expires_at > NOW()
        """, (session_id,))
        return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    session_id = event.get('headers', {}).get('X-Session-Id', '')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            return err('Invalid JSON')

    conn = get_conn()
    try:
        user = get_session_user(conn, session_id) if session_id else None

        # POST ?action=roll — бросить кубик
        if method == 'POST' and action == 'roll':
            if not user:
                return err('Not authorized', 401)
            user_id, username, is_admin, balance = user
            balance = float(balance or 0)

            bet = body.get('bet')
            try:
                bet = float(bet)
                assert bet >= 10
            except Exception:
                return err('Минимальная ставка 10 ₽')

            if balance < bet:
                return err(f'Недостаточно средств. Баланс: {balance:.0f} ₽')

            player_roll = random.randint(1, 6)
            server_roll = random.randint(1, 6)

            if player_roll > server_roll:
                result = 'win'
                payout = bet  # получает ставку обратно + выигрыш = bet*2 итого
                balance_delta = bet
            elif player_roll < server_roll:
                result = 'lose'
                payout = -bet
                balance_delta = -bet
            else:
                result = 'tie'
                payout = 0
                balance_delta = 0

            with conn.cursor() as cur:
                if balance_delta != 0:
                    cur.execute(
                        "UPDATE pd_balances SET amount = amount + %s, updated_at=NOW() WHERE user_id=%s RETURNING amount",
                        (balance_delta, user_id)
                    )
                    new_balance = float(cur.fetchone()[0])
                else:
                    new_balance = balance

                cur.execute("""
                    INSERT INTO pd_cube_games (user_id, bet, player_roll, server_roll, result, payout)
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
                """, (user_id, bet, player_roll, server_roll, result, payout))
                game_id = cur.fetchone()[0]

            conn.commit()

            return ok({
                'game_id': game_id,
                'player_roll': player_roll,
                'server_roll': server_roll,
                'result': result,
                'bet': bet,
                'payout': payout,
                'new_balance': new_balance,
            })

        # GET ?action=history — последние 20 игр пользователя
        if method == 'GET' and action == 'history':
            if not user:
                return err('Not authorized', 401)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, bet, player_roll, server_roll, result, payout, created_at
                    FROM pd_cube_games WHERE user_id=%s ORDER BY created_at DESC LIMIT 20
                """, (user[0],))
                rows = cur.fetchall()
            return ok({'games': [
                {'id': r[0], 'bet': float(r[1]), 'player_roll': r[2], 'server_roll': r[3],
                 'result': r[4], 'payout': float(r[5]), 'created_at': str(r[6])}
                for r in rows
            ]})

        return err('Not found', 404)
    finally:
        conn.close()
