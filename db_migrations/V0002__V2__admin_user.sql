
-- Создаём аккаунт администратора
-- Пароль: admin123 (соль: preyday_salt_2025)
-- SHA256("preyday_salt_2025admin123") = нужно вычислить через backend
-- Пока вставляем placeholder, пароль сменить через UI
INSERT INTO pd_users (username, email, password_hash, is_admin)
SELECT 'admin', 'admin@preyday.shop', 'placeholder_change_via_register', TRUE
WHERE NOT EXISTS (SELECT 1 FROM pd_users WHERE email = 'admin@preyday.shop');

INSERT INTO pd_balances (user_id)
SELECT id FROM pd_users WHERE email = 'admin@preyday.shop'
AND NOT EXISTS (SELECT 1 FROM pd_balances WHERE user_id = (SELECT id FROM pd_users WHERE email = 'admin@preyday.shop'));
