-- ============================================================
-- 005_stars_system.sql
-- Fix: Move all star calculations server-side (Postgres)
-- to eliminate device-specific localStorage inconsistencies.
-- ============================================================

-- 1. get_user_monthly_stars
--    Calculates total stars for a user in the current calendar month
CREATE OR REPLACE FUNCTION get_user_monthly_stars(p_user_id UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, COALESCE(SUM(stars), 0)::INT)
  FROM user_activities
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', NOW() AT TIME ZONE 'UTC')
    AND created_at <  date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month';
$$;
GRANT EXECUTE ON FUNCTION get_user_monthly_stars(UUID) TO authenticated, anon, service_role;

-- 2. check_daily_cap
--    Returns remaining stars a user can earn today for a given activity type.
--    Returns 0 if the daily cap has been reached.
CREATE OR REPLACE FUNCTION check_daily_cap(p_user_id UUID, p_activity_type TEXT)
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cap    INT;
  v_earned INT;
BEGIN
  v_cap := CASE p_activity_type
    WHEN 'azkar_morning'      THEN 5
    WHEN 'azkar_evening'      THEN 5
    WHEN 'azkar_after_salah'  THEN 5
    WHEN 'azkar_tasabih'      THEN 5
    WHEN 'azkar_sleep'        THEN 5
    WHEN 'azkar_wakeup'       THEN 5
    WHEN 'azkar_dua_quran'    THEN 5
    WHEN 'azkar_dua_prophets' THEN 5
    WHEN 'quran_read'         THEN 5
    WHEN 'quran_listen'       THEN 5
    WHEN 'tafseer_listen'     THEN 5
    WHEN 'hadith_read'        THEN 5
    WHEN 'daily_visit'        THEN 1
    ELSE 100
  END;

  SELECT COALESCE(SUM(GREATEST(stars, 0)), 0)::INT
  INTO v_earned
  FROM user_activities
  WHERE user_id       = p_user_id
    AND activity_type = p_activity_type
    AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')
    AND created_at <  date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 day';

  RETURN GREATEST(0, v_cap - v_earned);
END;
$$;
GRANT EXECUTE ON FUNCTION check_daily_cap(UUID, TEXT) TO authenticated, anon, service_role;

-- 3. log_activity_safe
--    Logs an activity with server-side daily cap enforcement.
--    Returns the actual stars awarded (0 if cap reached).
CREATE OR REPLACE FUNCTION log_activity_safe(
  p_user_id       UUID,
  p_activity_type TEXT,
  p_metadata      JSONB DEFAULT '{}'::jsonb
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base   INT;
  v_cap    INT;
  v_actual INT;
BEGIN
  v_base := CASE p_activity_type
    WHEN 'azkar_morning'      THEN 5
    WHEN 'azkar_evening'      THEN 5
    WHEN 'azkar_after_salah'  THEN 2
    WHEN 'azkar_tasabih'      THEN 2
    WHEN 'azkar_sleep'        THEN 3
    WHEN 'azkar_wakeup'       THEN 1
    WHEN 'azkar_dua_quran'    THEN 2
    WHEN 'azkar_dua_prophets' THEN 2
    WHEN 'quran_read'         THEN 3
    WHEN 'quran_listen'       THEN 2
    WHEN 'tafseer_listen'     THEN 2
    WHEN 'hadith_read'        THEN 3
    WHEN 'daily_visit'        THEN 1
    WHEN 'challenge_entry'    THEN -10
    WHEN 'challenge_win'      THEN 20
    WHEN 'challenge_lose'     THEN -10
    ELSE 0
  END;

  -- Penalties (negative stars) bypass the daily cap
  IF v_base <= 0 THEN
    INSERT INTO user_activities (user_id, activity_type, stars, metadata)
    VALUES (p_user_id, p_activity_type, v_base, p_metadata);
    -- Trigger will update users.stars automatically
    RETURN v_base;
  END IF;

  v_cap    := check_daily_cap(p_user_id, p_activity_type);
  v_actual := LEAST(v_base, v_cap);

  INSERT INTO user_activities (user_id, activity_type, stars, metadata)
  VALUES (p_user_id, p_activity_type, v_actual, p_metadata);
  -- Trigger will update users.stars automatically

  RETURN v_actual;
END;
$$;
GRANT EXECUTE ON FUNCTION log_activity_safe(UUID, TEXT, JSONB) TO authenticated, anon, service_role;

-- 4. get_leaderboard (rewrite)
--    Computes rankings directly from user_activities (no stale cache).
--    Only shows users with stars > 0 in the current month.
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INT DEFAULT 20)
RETURNS TABLE(user_id UUID, username TEXT, stars BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id        AS user_id,
    u.username,
    GREATEST(0, COALESCE(SUM(ua.stars), 0))::BIGINT AS stars
  FROM users u
  LEFT JOIN user_activities ua
    ON  ua.user_id = u.id
    AND ua.created_at >= date_trunc('month', NOW() AT TIME ZONE 'UTC')
    AND ua.created_at <  date_trunc('month', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 month'
  GROUP BY u.id, u.username
  HAVING GREATEST(0, COALESCE(SUM(ua.stars), 0)) > 0
  ORDER BY stars DESC
  LIMIT limit_count;
$$;
GRANT EXECUTE ON FUNCTION get_leaderboard(INT) TO authenticated, anon, service_role;

-- 5. sync_user_stars (trigger function)
--    Keeps users.stars in sync after every insert into user_activities.
CREATE OR REPLACE FUNCTION sync_user_stars()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET stars = get_user_monthly_stars(NEW.user_id)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- 6. Attach trigger
DROP TRIGGER IF EXISTS sync_stars_on_activity ON user_activities;
CREATE TRIGGER sync_stars_on_activity
AFTER INSERT ON user_activities
FOR EACH ROW EXECUTE FUNCTION sync_user_stars();

-- 7. Backfill: Sync users.stars for all existing users to current month total
UPDATE users u
SET stars = get_user_monthly_stars(u.id);
