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

  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: serviceRoleKey }
  });
  const doc = await res.json();
  
  console.log("get_leaderboard path def:");
  console.log(JSON.stringify(doc.paths['/rpc/get_leaderboard'], null, 2));

  console.log("\nget_user_monthly_stars path def:");
  console.log(JSON.stringify(doc.paths['/rpc/get_user_monthly_stars'], null, 2));
}

inspect();
