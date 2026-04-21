
-- Обновляем кейс 1: Кейс с сетом ковбоя, 120р
UPDATE pd_cases SET name = 'Кейс с сетом ковбоя', price = 120.00 WHERE id = 1;

-- Обновляем призы кейса 1
UPDATE pd_case_prizes SET name='Сет ковбоя',    emoji='🤠', rarity='epic',      weight=15 WHERE id=3;
UPDATE pd_case_prizes SET name='Сет футболиста', emoji='⚽', rarity='common',    weight=35 WHERE id=1;
UPDATE pd_case_prizes SET name='Сет наёмника',   emoji='🔫', rarity='common',    weight=30 WHERE id=2;
UPDATE pd_case_prizes SET name='Сет охотника',   emoji='🏹', rarity='rare',      weight=12 WHERE id=4;
-- Меняем самурая на химзащиту
UPDATE pd_case_prizes SET name='Сет химзащиты',  emoji='☣️', rarity='rare',      weight=8  WHERE id=5;

-- Кейс 2: Кейс с сетом самурая, 80р
INSERT INTO pd_cases (name, price, is_active) VALUES ('Кейс с сетом самурая', 80.00, TRUE);
INSERT INTO pd_case_prizes (case_id, name, emoji, rarity, weight) VALUES
  (2, 'Сет самурая',    '⚔️', 'legendary', 5),
  (2, 'Сет футболиста', '⚽', 'common',    35),
  (2, 'Сет наёмника',   '🔫', 'common',    30),
  (2, 'Сет охотника',   '🏹', 'rare',      20),
  (2, 'Сет химзащиты',  '☣️', 'rare',      10);

-- Кейс 3: Кейс с зимним ковбоем, 200р
INSERT INTO pd_cases (name, price, is_active) VALUES ('Кейс с зимним ковбоем', 200.00, TRUE);
INSERT INTO pd_case_prizes (case_id, name, emoji, rarity, weight) VALUES
  (3, 'Сет НГ ковбоя',       '❄️', 'legendary', 5),
  (3, 'Новогодний белый сет', '⛄', 'epic',      15),
  (3, 'Сет НГ охотника',     '🏹', 'rare',      30),
  (3, 'Сет наёмника',        '🔫', 'common',    50);

-- Кейс 4: Кейс с патронами, 80р
INSERT INTO pd_cases (name, price, is_active) VALUES ('Кейс с патронами', 80.00, TRUE);
INSERT INTO pd_case_prizes (case_id, name, emoji, rarity, weight) VALUES
  (4, 'Ящик патронов',            '📦', 'legendary', 3),
  (4, '10 стаков зажигательных',  '🔥', 'epic',      5),
  (4, '10 стаков новогодних',     '❄️', 'epic',      5),
  (4, '10 стаков обычных',        '🔫', 'rare',      8),
  (4, '10 стаков улучшенных',     '⭐', 'rare',      9),
  (4, '5 стаков зажигательных',   '🔥', 'rare',      10),
  (4, '5 стаков новогодних',      '❄️', 'rare',      10),
  (4, '5 стаков обычных',         '🔫', 'common',    20),
  (4, '5 стаков улучшенных',      '⭐', 'common',    15),
  (4, '1 стак зажигательных',     '🔥', 'common',    5),
  (4, '1 стак новогодних',        '❄️', 'common',    5),
  (4, '1 стак обычных',           '🔫', 'common',    3),
  (4, '1 стак улучшенных',        '⭐', 'common',    2);
