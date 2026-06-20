/**
 * Apply SQL to Supabase via a 2-step approach:
 * 1. Create a temporary exec_sql helper function via REST (POST to /rest/v1/rpc)
 * 2. Use it to run all our DDL statements
 * 
 * Actually the cleanest approach: use the Supabase REST API
 * to directly POST DDL wrapped in a DO $$ block via a helper function.
 *
 * Strategy: bootstrap via the existing REST endpoint by creating 
 * a temp function, then call it.
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

// Bootstrap: create exec_sql function first using a raw REST insert trick
// We'll use the Supabase SQL HTTP endpoint that exists at /rest/v1/rpc/exec_sql
// But first we need to create it. We do this by calling an existing RPC that
// can execute DDL, OR we use the fact that service_role bypasses RLS.

// The trick: Supabase exposes a SQL endpoint for privileged users at:
// POST /rest/v1/ with Content-Type: application/sql (not standard)
// Let's try the management API v2 endpoint pattern

async function tryExecViaSQL(sql) {
  // Supabase internally exposes a SQL endpoint at this path for service_role
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  return res;
}

// Actually the correct way with service_role is to use the Supabase
// PostgREST endpoint with a specially crafted request.
// The most reliable approach for running DDL: use the Supabase CLI db push.
// Since we can't do that easily, let's try creating functions step by step
// using the RPC endpoint with the service_role key.

// BEST APPROACH: Write all SQL to a migration file and use supabase db push --linked
// after linking the project.

const MIGRATION_SQL = `
-- ============================================================
-- 005_stars_system.sql
-- Fix: Move all star calculations to DB to eliminate
-- device-specific localStorage inconsistencies
-- ============================================================

-- 1. get_user_monthly_stars: Calculates current month stars from activities
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

-- 2. check_daily_cap: Returns remaining stars a user can earn today for a given activity
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

-- 3. log_activity_safe: Logs an activity with server-side daily cap enforcement
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

  -- Penalties skip the daily cap check
  IF v_base <= 0 THEN
    INSERT INTO user_activities (user_id, activity_type, stars, metadata)
    VALUES (p_user_id, p_activity_type, v_base, p_metadata);
    RETURN v_base;
  END IF;

  v_cap    := check_daily_cap(p_user_id, p_activity_type);
  v_actual := LEAST(v_base, v_cap);

  INSERT INTO user_activities (user_id, activity_type, stars, metadata)
  VALUES (p_user_id, p_activity_type, v_actual, p_metadata);

  RETURN v_actual;
END;
$$;
GRANT EXECUTE ON FUNCTION log_activity_safe(UUID, TEXT, JSONB) TO authenticated, anon, service_role;

-- 4. get_leaderboard: Computes directly from user_activities (no cache)
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

-- 5. Trigger function: keeps users.stars in sync after every activity insert
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

-- 6. Attach trigger to user_activities
DROP TRIGGER IF EXISTS sync_stars_on_activity ON user_activities;
CREATE TRIGGER sync_stars_on_activity
AFTER INSERT ON user_activities
FOR EACH ROW EXECUTE FUNCTION sync_user_stars();

-- 7. Backfill: sync users.stars for all existing users to match current month activities
UPDATE users u
SET stars = get_user_monthly_stars(u.id);
`;

// Write the migration file
const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrationFile = path.join(migrationsDir, '005_stars_system.sql');
fs.writeFileSync(migrationFile, MIGRATION_SQL.trim(), 'utf8');
console.log(`✓ Migration file written: ${migrationFile}`);

// Now check if we can link and push
console.log('\nNext step: Run the following commands to apply:');
console.log(`  supabase link --project-ref jqilgcxaykhlqmugjrdg`);
console.log(`  supabase db push --linked`);
console.log('\nOR apply the SQL manually in Supabase SQL Editor:');
console.log(`  ${migrationFile}`);
