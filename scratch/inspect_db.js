const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

async function inspect() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing env vars!");
    return;
  }

  const headers = {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  };

  console.log("Connecting to:", supabaseUrl);

  // Call rpc/get_leaderboard to see what it does
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_leaderboard`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ limit_count: 5 })
    });
    const data = await res.json();
    console.log("\nget_leaderboard response:", data);
  } catch (e) {
    console.error("Error get_leaderboard:", e);
  }

  // Check if we can view function definition of get_leaderboard or others using pg_proc through RPC or if we can query user_activities table
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/user_activities?limit=2`, {
      headers
    });
    const data = await res.json();
    console.log("\nuser_activities sample:", data);
  } catch (e) {
    console.error("Error user_activities:", e);
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/users?limit=2`, {
      headers
    });
    const data = await res.json();
    console.log("\nusers sample:", data);
  } catch (e) {
    console.error("Error users:", e);
  }
}

inspect();
