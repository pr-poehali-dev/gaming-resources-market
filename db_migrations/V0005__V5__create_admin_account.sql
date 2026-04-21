
-- Создаём аккаунт администратора
-- Пароль: torgreal007 -> sha256 хеш
INSERT INTO pd_users (username, email, password_hash, is_admin)
VALUES (
  'adminaccount07',
  'm47909623@gmail.com',
  encode(sha256('torgreal007'::bytea), 'hex'),
  TRUE
);

-- Создаём баланс для аккаунта
INSERT INTO pd_balances (user_id)
SELECT id FROM pd_users WHERE username = 'adminaccount07';
