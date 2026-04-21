"""
Кейсы: получение списка кейсов, прокрутка (провабельный результат через seed), история выигрышей.
"""
import json
import os
import hashlib
import secrets
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

TG_ADMIN = 'https://t.me/Torgreal7'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

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

def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, default=str)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

def provable_spin(server_seed: str, client_seed: str, nonce: int, total_weight: int) -> int:
    """Провабельная случайность: hash(server_seed + client_seed + nonce) → результат."""
    raw = f"{server_seed}:{client_seed}:{nonce}"
    h = hashlib.sha256(raw.encode()).hexdigest()
    val = int(h[:8], 16)
    return val % total_weight

def pick_prize(prizes, roll: int):
    """Выбрать приз по weighted random."""
    cumulative = 0
    for p in prizes:
        cumulative += p['weight']
        if roll < cumulative:
            return p
    return prizes[-1]

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    # Платформа обрезает sub-path — читаем action из query или path
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    # Восстанавливаем маршрут: либо из path, либо из ?action=
    if not action:
        # path всегда '/', берём из последнего сегмента оригинального пути
        raw = event.get('headers', {}).get('X-Original-Uri', path)
        if raw and raw != '/':
            action = raw.strip('/').split('/')[-1]
    print(f"[cases] method={method} path={repr(path)} action={repr(action)}")
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

        # GET ?action=cases — список активных кейсов с призами
        if method == 'GET' and (action == 'cases' or path.endswith('/cases')):
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, price, image_url FROM pd_cases WHERE is_active=TRUE ORDER BY id")
                cases = cur.fetchall()
                result = []
                for c in cases:
                    cur.execute("""
                        SELECT id, name, emoji, rarity, weight
                        FROM pd_case_prizes WHERE case_id=%s ORDER BY weight DESC
                    """, (c[0],))
                    prizes = [{'id': p[0], 'name': p[1], 'emoji': p[2], 'rarity': p[3], 'weight': p[4]} for p in cur.fetchall()]
                    result.append({'id': c[0], 'name': c[1], 'price': float(c[2]), 'image_url': c[3], 'prizes': prizes})
            return ok({'cases': result})

        # POST ?action=spin — прокрутить кейс
        if method == 'POST' and (action == 'spin' or path.endswith('/spin')):
            if not user:
                return err('Not authorized', 401)
            user_id, username, is_admin, balance = user
            balance = float(balance or 0)

            case_id = body.get('case_id')
            spin_count = int(body.get('spin_count', 1))
            client_seed = (body.get('client_seed') or secrets.token_hex(8)).strip()[:64]

            if not case_id:
                return err('case_id required')
            if spin_count < 1 or spin_count > 10:
                return err('spin_count должен быть от 1 до 10')

            # Получаем кейс
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, price FROM pd_cases WHERE id=%s AND is_active=TRUE", (case_id,))
                case = cur.fetchone()
            if not case:
                return err('Кейс не найден', 404)

            total_cost = float(case[2]) * spin_count
            if balance < total_cost:
                return err(f'Недостаточно средств. Нужно {total_cost:.0f} ₽, у вас {balance:.0f} ₽')

            # Получаем призы
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, emoji, rarity, weight FROM pd_case_prizes WHERE case_id=%s", (case_id,))
                prize_rows = cur.fetchall()
            prizes = [{'id': p[0], 'name': p[1], 'emoji': p[2], 'rarity': p[3], 'weight': p[4]} for p in prize_rows]
            total_weight = sum(p['weight'] for p in prizes)

            # Генерируем server seed
            server_seed = secrets.token_hex(16)
            seed_hash = hashlib.sha256(server_seed.encode()).hexdigest()

            # Крутим
            results = []
            with conn.cursor() as cur:
                # Списываем баланс
                cur.execute(
                    "UPDATE pd_balances SET amount = amount - %s, updated_at=NOW() WHERE user_id=%s AND amount >= %s RETURNING amount",
                    (total_cost, user_id, total_cost)
                )
                if not cur.fetchone():
                    conn.rollback()
                    return err('Недостаточно средств (race condition)')

                for i in range(spin_count):
                    roll = provable_spin(server_seed, client_seed, i, total_weight)
                    prize = pick_prize(prizes, roll)
                    cur.execute("""
                        INSERT INTO pd_spins
                          (user_id, case_id, prize_id, spin_count, total_cost, seed_hash, client_seed, result_index)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
                    """, (user_id, case_id, prize['id'], 1, float(case[2]), seed_hash, client_seed, roll))
                    spin_id = cur.fetchone()[0]
                    results.append({
                        'spin_id': spin_id,
                        'prize': prize,
                        'roll': roll,
                        'seed_hash': seed_hash,
                        'client_seed': client_seed,
                        'server_seed': server_seed,
                    })

            conn.commit()

            # Новый баланс
            with conn.cursor() as cur:
                cur.execute("SELECT amount FROM pd_balances WHERE user_id=%s", (user_id,))
                new_balance = float(cur.fetchone()[0])

            tg_msg = f"Хочу получить приз! Пользователь: {username}\n"
            for r in results:
                tg_msg += f"Спин #{r['spin_id']}: {r['prize']['emoji']} {r['prize']['name']} (seed_hash: {r['seed_hash'][:16]}...)\n"
            tg_link = f"{TG_ADMIN}?text={tg_msg.replace(' ','%20')}"

            return ok({
                'results': results,
                'total_cost': total_cost,
                'new_balance': new_balance,
                'tg_link': tg_link,
                'tg_admin': TG_ADMIN,
            })

        # GET ?action=spins — история выигрышей пользователя
        if method == 'GET' and (action == 'spins' or path.endswith('/spins')):
            if not user:
                return err('Not authorized', 401)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT s.id, c.name, p.name, p.emoji, p.rarity, s.total_cost,
                           s.seed_hash, s.client_seed, s.server_seed, s.is_claimed, s.created_at
                    FROM pd_spins s
                    JOIN pd_cases c ON c.id=s.case_id
                    JOIN pd_case_prizes p ON p.id=s.prize_id
                    WHERE s.user_id=%s ORDER BY s.created_at DESC LIMIT 50
                """, (user[0],))
                rows = cur.fetchall()
            return ok({'spins': [
                {'id': r[0], 'case': r[1], 'prize': r[2], 'emoji': r[3], 'rarity': r[4],
                 'cost': float(r[5]), 'seed_hash': r[6], 'client_seed': r[7],
                 'is_claimed': r[9], 'created_at': str(r[10])}
                for r in rows
            ]})

        # === ADMIN ===

        # GET ?action=admin_spins — все выигрыши для проверки
        if method == 'GET' and (action == 'admin_spins' or path.endswith('/admin/spins')):
            if not user or not user[2]:
                return err('Forbidden', 403)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT s.id, u.username, c.name, p.name, p.emoji, p.rarity,
                           s.total_cost, s.seed_hash, s.client_seed, s.is_claimed, s.created_at
                    FROM pd_spins s
                    JOIN pd_users u ON u.id=s.user_id
                    JOIN pd_cases c ON c.id=s.case_id
                    JOIN pd_case_prizes p ON p.id=s.prize_id
                    ORDER BY s.created_at DESC LIMIT 100
                """)
                rows = cur.fetchall()
            return ok({'spins': [
                {'id': r[0], 'username': r[1], 'case': r[2], 'prize': r[3],
                 'emoji': r[4], 'rarity': r[5], 'cost': float(r[6]),
                 'seed_hash': r[7], 'client_seed': r[8],
                 'is_claimed': r[9], 'created_at': str(r[10])}
                for r in rows
            ]})

        # POST ?action=admin_claim — отметить приз выданным
        if method == 'POST' and (action == 'admin_claim' or path.endswith('/admin/claim')):
            if not user or not user[2]:
                return err('Forbidden', 403)
            spin_id = body.get('spin_id')
            if not spin_id:
                return err('spin_id required')
            with conn.cursor() as cur:
                cur.execute("UPDATE pd_spins SET is_claimed=TRUE WHERE id=%s", (spin_id,))
                cur.execute(
                    "INSERT INTO pd_admin_log (admin_id, action, details) VALUES (%s, %s, %s)",
                    (user[0], 'claim_prize', json.dumps({'spin_id': spin_id}))
                )
            conn.commit()
            return ok({'ok': True})

        # POST ?action=verify — публичная проверка честности спина
        if method == 'POST' and (action == 'verify' or path.endswith('/verify')):
            server_seed = body.get('server_seed', '')
            client_seed = body.get('client_seed', '')
            nonce = int(body.get('nonce', 0))
            total_weight = int(body.get('total_weight', 100))
            if not server_seed or not client_seed:
                return err('server_seed and client_seed required')
            roll = provable_spin(server_seed, client_seed, nonce, total_weight)
            seed_hash = hashlib.sha256(server_seed.encode()).hexdigest()
            return ok({'roll': roll, 'seed_hash': seed_hash, 'verified': True})

        return err('Not found', 404)
    finally:
        conn.close()