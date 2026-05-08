-- Auto-cleanup stale challenge sessions older than 10 minutes
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS int AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM challenge_sessions
  WHERE status = 'active'
    AND created_at < NOW() - INTERVAL '10 minutes';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Also clean up stale queue entries older than 10 minutes
  DELETE FROM challenge_queue
  WHERE created_at < NOW() - INTERVAL '10 minutes';

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
