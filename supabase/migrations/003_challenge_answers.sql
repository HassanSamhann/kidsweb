ALTER TABLE challenge_sessions
ADD COLUMN player1_answers JSONB DEFAULT '{}',
ADD COLUMN player2_answers JSONB DEFAULT '{}';
