
CREATE TABLE IF NOT EXISTS pd_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pd_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES pd_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS pd_balances (
  user_id INTEGER PRIMARY KEY REFERENCES pd_users(id),
  amount NUMERIC(12,2) DEFAULT 0 CHECK (amount >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pd_deposits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES pd_users(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pd_cases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pd_case_prizes (
  id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES pd_cases(id),
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) DEFAULT '🎁',
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary')),
  weight INTEGER DEFAULT 100 CHECK (weight > 0),
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS pd_spins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES pd_users(id),
  case_id INTEGER NOT NULL REFERENCES pd_cases(id),
  prize_id INTEGER NOT NULL REFERENCES pd_case_prizes(id),
  spin_count INTEGER DEFAULT 1,
  total_cost NUMERIC(12,2) NOT NULL,
  seed_hash VARCHAR(64) NOT NULL,
  client_seed VARCHAR(64) NOT NULL,
  result_index INTEGER NOT NULL,
  is_claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pd_admin_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES pd_users(id),
  action VARCHAR(100) NOT NULL,
  target_user_id INTEGER REFERENCES pd_users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pd_cases (name, price, is_active) VALUES ('Кейс выжившего', 180.00, TRUE);

INSERT INTO pd_case_prizes (case_id, name, emoji, rarity, weight) VALUES
  (1, 'Сет футболиста', '⚽', 'common', 40),
  (1, 'Сет наёмника', '🔫', 'common', 30),
  (1, 'Сет ковбоя', '🤠', 'rare', 20),
  (1, 'Сет охотника', '🏹', 'epic', 8),
  (1, 'Сет самурая', '⚔️', 'legendary', 2);
