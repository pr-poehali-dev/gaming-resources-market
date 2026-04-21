
-- Обновляем хеш пароля с учётом соли preyday_salt_2025
UPDATE pd_users 
SET password_hash = encode(sha256('preyday_salt_2025torgreal007'::bytea), 'hex')
WHERE username = 'adminaccount07';
