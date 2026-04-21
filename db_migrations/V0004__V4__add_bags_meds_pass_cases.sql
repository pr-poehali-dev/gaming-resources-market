
-- Кейс 5: рюкзаки 100р
INSERT INTO pd_cases (name, price, is_active) VALUES ('Кейс с рюкзаками', 100.00, TRUE);
INSERT INTO pd_case_prizes (case_id, name, emoji, rarity, weight) VALUES
  (5, 'Военный рюкзак',        '🎒', 'epic',      10),
  (5, 'Рюкзак первопроходца',  '🏕️', 'rare',      30),
  (5, 'Школьный рюкзак',       '🎓', 'common',    35),
  (5, 'Пасхальный рюкзак',     '🐣', 'legendary',  2);

-- Кейс 6: медикаменты 100р
INSERT INTO pd_cases (name, price, is_active) VALUES ('Кейс с медикаментами', 100.00, TRUE);
INSERT INTO pd_case_prizes (case_id, name, emoji, rarity, weight) VALUES
  (6, 'Антибиотики',   '💊', 'epic',      15),
  (6, 'Большая аптека','🏥', 'legendary', 5),
  (6, 'Повязки',       '🩹', 'common',    30),
  (6, 'Бинты',         '🧻', 'common',    30),
  (6, 'Супы',          '🍲', 'rare',      12),
  (6, 'Варенье',       '🍯', 'rare',       8);

-- Кейс 7: золотой пропуск 
INSERT INTO pd_cases (name, price, is_active) VALUES ('Кейс с пропуском', 150.00, TRUE);
INSERT INTO pd_case_prizes (case_id, name, emoji, rarity, weight) VALUES
  (7, 'Золотой пропуск', '🏆', 'legendary', 5),
  (7, 'Проигрыш',        '💸', 'common',   70);
