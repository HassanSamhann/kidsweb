-- ============================================================
-- 006_monthly_reset.sql
-- Monthly leaderboard reset system:
--   1. monthly_winners table  — stores each month's champion
--   2. perform_monthly_reset() — archives winner, clears data
--   3. pg_cron job            — fires at 00:00 UTC on day 1
--
-- HOW TO RUN:
--   Paste this entire script in Supabase SQL Editor and run.
--   pg_cron must be enabled in your Supabase project:
--   Dashboard → Database → Extensions → pg_cron (enable)
-- ============================================================

-- ── 1. monthly_winners table ────────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_winners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL,
  stars       INT  NOT NULL DEFAULT 0,
  month_date  DATE NOT NULL,            -- first day of the won month, e.g. 2026-06-01
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (month_date)                   -- one winner per month
);

-- Index for fast recent-winner lookup
CREATE INDEX IF NOT EXISTS idx_monthly_winners_month_date
  ON monthly_winners (month_date DESC);

-- RLS: anyone can read, only service_role can write
ALTER TABLE monthly_winners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON monthly_winners;
CREATE POLICY "Allow public read"
  ON monthly_winners FOR SELECT
  USING (true);

-- ── 2. perform_monthly_reset() ──────────────────────────────
-- This function:
--   a) Finds the winner of last month (max positive stars)
--   b) Inserts/updates monthly_winners
--   c) Deletes all user_activities
--   d) Resets users.stars = 0
--
-- Safe to run multiple times (ON CONFLICT DO UPDATE).
CREATE OR REPLACE FUNCTION perform_monthly_reset()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_month_start  DATE;
  v_last_month_end    DATE;
  v_winner_id         UUID;
  v_winner_username   TEXT;
  v_winner_stars      INT;
  v_deleted_activities INT;
BEGIN
  -- ── Compute last-month boundaries (UTC) ──────────────────
  v_last_month_start := date_trunc('month', NOW() AT TIME ZONE 'UTC')::DATE
                        - INTERVAL '1 month';
  v_last_month_end   := date_trunc('month', NOW() AT TIME ZONE 'UTC')::DATE
                        - INTERVAL '1 day';

  -- ── a) Find winner of last month ─────────────────────────
  SELECT
    ua.user_id,
    u.username,
    GREATEST(0, SUM(ua.stars)::INT) AS total_stars
  INTO v_winner_id, v_winner_username, v_winner_stars
  FROM user_activities ua
  JOIN users u ON u.id = ua.user_id
  WHERE ua.created_at >= (v_last_month_start AT TIME ZONE 'UTC')
    AND ua.created_at <  ((v_last_month_end + INTERVAL '1 day') AT TIME ZONE 'UTC')
  GROUP BY ua.user_id, u.username
  HAVING GREATEST(0, SUM(ua.stars)::INT) > 0
  ORDER BY total_stars DESC
  LIMIT 1;

  -- ── b) Archive winner (if any) ───────────────────────────
  IF v_winner_id IS NOT NULL THEN
    INSERT INTO monthly_winners (user_id, username, stars, month_date)
    VALUES (v_winner_id, v_winner_username, v_winner_stars, v_last_month_start)
    ON CONFLICT (month_date) DO UPDATE
      SET user_id  = EXCLUDED.user_id,
          username = EXCLUDED.username,
          stars    = EXCLUDED.stars;
  END IF;

  -- ── c) Delete all activity records ───────────────────────
  DELETE FROM user_activities;
  GET DIAGNOSTICS v_deleted_activities = ROW_COUNT;

  -- ── d) Reset all users' stars to 0 ───────────────────────
  UPDATE users SET stars = 0;

  RETURN format(
    'Reset complete. Winner: %s (%s ★). Deleted %s activity records.',
    COALESCE(v_winner_username, 'none'),
    COALESCE(v_winner_stars::TEXT, '0'),
    v_deleted_activities
  );
END;
$$;

GRANT EXECUTE ON FUNCTION perform_monthly_reset() TO service_role;

-- ── 3. Schedule monthly cron job ─────────────────────────────
-- Requires pg_cron extension.
-- To enable: Supabase Dashboard → Database → Extensions → pg_cron → Enable
--
-- If pg_cron is NOT enabled yet, this block is skipped safely.
-- After enabling pg_cron, run the two SELECT statements in the comment at the bottom.
DO $outer$
DECLARE
  v_cron_exists BOOLEAN;
BEGIN
  -- Check if pg_cron extension is installed
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) INTO v_cron_exists;

  IF NOT v_cron_exists THEN
    RAISE NOTICE '⚠️  pg_cron is not enabled. Skipping cron job setup.';
    RAISE NOTICE '   To schedule automatic monthly resets:';
    RAISE NOTICE '   1. Enable pg_cron in Supabase Dashboard → Database → Extensions';
    RAISE NOTICE '   2. Run: SELECT cron.unschedule(''monthly-leaderboard-reset'');';
    RAISE NOTICE '   3. Run: SELECT cron.schedule(''monthly-leaderboard-reset'', ''1 0 1 * *'', ''SELECT perform_monthly_reset()'');';
    RETURN;
  END IF;

  -- Remove existing job if any (safe to re-run)
  BEGIN
    PERFORM cron.unschedule('monthly-leaderboard-reset');
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Schedule: 00:01 UTC on the 1st of every month
  PERFORM cron.schedule(
    'monthly-leaderboard-reset',
    '1 0 1 * *',
    'SELECT perform_monthly_reset()'
  );

  RAISE NOTICE '✅ Cron job scheduled: monthly-leaderboard-reset';
END;
$outer$;

-- ── 5. Additional: sync stars on DELETE too ────────────────
-- Fixes the "stars different across devices" issue: when the monthly
-- reset deletes all user_activities, users.stars must also be zeroed.
-- The perform_monthly_reset() function handles UPDATE separately,
-- but this trigger acts as a safety net for direct deletes.
CREATE OR REPLACE FUNCTION sync_user_stars_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET stars = get_user_monthly_stars(OLD.user_id)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS sync_stars_on_activity_delete ON user_activities;
CREATE TRIGGER sync_stars_on_activity_delete
AFTER DELETE ON user_activities
FOR EACH ROW EXECUTE FUNCTION sync_user_stars_on_delete();

-- ── 6. Verify & Next Steps ────────────────────────────────────
--
-- ✅ The following are now created:
--    - Table: monthly_winners
--    - Function: perform_monthly_reset()
--    - Function: sync_user_stars_on_delete()
--    - Trigger: sync_stars_on_activity_delete
--
-- ── To enable automatic monthly reset (pg_cron) ──────────────
-- Step 1: Go to Supabase Dashboard → Database → Extensions
--         Find "pg_cron" and click Enable
--
-- Step 2: Run these two statements in SQL Editor:
--
--   SELECT cron.unschedule('monthly-leaderboard-reset');  -- if exists
--   SELECT cron.schedule(
--     'monthly-leaderboard-reset',
--     '1 0 1 * *',
--     'SELECT perform_monthly_reset()'
--   );
--
-- Step 3: Verify the cron job was created:
--   SELECT * FROM cron.job WHERE jobname = 'monthly-leaderboard-reset';
--
-- ── Manual testing ────────────────────────────────────────────
-- Trigger a reset right now (for testing):
--   SELECT perform_monthly_reset();
--
-- View all past monthly winners:
--   SELECT * FROM monthly_winners ORDER BY month_date DESC;

