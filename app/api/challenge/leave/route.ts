import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';
import { cleanupStaleSessions } from '../../../../lib/cleanup-challenges';

export async function DELETE(req: NextRequest) {
  try {
    await cleanupStaleSessions();
    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    await supabase.from('challenge_queue').delete().eq('user_id', user_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Challenge leave error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
