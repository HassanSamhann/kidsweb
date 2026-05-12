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

    // First, remove from queue if waiting
    await supabase.from('challenge_queue').delete().eq('user_id', user_id);

    // Check if user has an active session → forfeit
    const { data: session } = await supabase
      .from('challenge_sessions')
      .select('*')
      .or(`player1_id.eq.${user_id},player2_id.eq.${user_id}`)
      .eq('status', 'active')
      .maybeSingle();

    if (session) {
      const isPlayer1 = session.player1_id === user_id;
      const winnerId = isPlayer1 ? session.player2_id : session.player1_id;

      // Mark session as completed (only if still active)
      await supabase
        .from('challenge_sessions')
        .update({
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id)
        .eq('status', 'active');

      // Award winner only if not already awarded
      const { data: existing } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', winnerId)
        .eq('activity_type', 'challenge_win')
        .eq('metadata->>session_id', session.id)
        .maybeSingle();

      if (!existing && winnerId) {
        await supabase.from('user_activities').insert([
          {
            user_id: winnerId,
            activity_type: 'challenge_win',
            stars: 20,
            metadata: { opponent_id: user_id, forfeit: true, session_id: session.id },
          },
        ]);
      }

      return NextResponse.json({ success: true, forfeited: true });
    }

    return NextResponse.json({ success: true, forfeited: false });
  } catch (err) {
    console.error('Challenge leave error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
