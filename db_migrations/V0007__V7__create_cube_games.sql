
CREATE TABLE IF NOT EXISTS pd_cube_games (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES pd_users(id),
  bet NUMERIC(12,2) NOT NULL,
  player_roll INTEGER NOT NULL,
  server_roll INTEGER NOT NULL,
  result VARCHAR(10) NOT NULL, -- 'win' | 'lose' | 'tie'
  payout NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
