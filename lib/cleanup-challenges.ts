import { getSupabaseAdmin } from './supabase-admin';

export async function cleanupStaleSessions() {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.rpc('cleanup_stale_sessions');
  } catch (err) {
    console.error('Failed to cleanup stale sessions:', err);
  }
}
