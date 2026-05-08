-- Challenge Queue
CREATE TABLE challenge_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenge_queue_created ON challenge_queue(created_at);

-- Challenge Sessions
CREATE TABLE challenge_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_id UUID NOT NULL REFERENCES users(id),
  player2_id UUID NOT NULL REFERENCES users(id),
  player1_username TEXT NOT NULL,
  player2_username TEXT NOT NULL,
  questions JSONB NOT NULL,
  player1_score INT DEFAULT 0,
  player2_score INT DEFAULT 0,
  player1_done BOOLEAN DEFAULT FALSE,
  player2_done BOOLEAN DEFAULT FALSE,
  winner_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_challenge_sessions_player1 ON challenge_sessions(player1_id);
CREATE INDEX idx_challenge_sessions_player2 ON challenge_sessions(player2_id);
CREATE INDEX idx_challenge_sessions_status ON challenge_sessions(status);

-- Transfer stars between users
CREATE OR REPLACE FUNCTION transfer_stars(winner_id UUID, loser_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  UPDATE users SET stars = GREATEST(stars - amount, 0) WHERE id = loser_id;
  UPDATE users SET stars = stars + amount WHERE id = winner_id;
END;
$$ LANGUAGE plpgsql;
