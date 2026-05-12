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

      // Mark session as completed with winner = the other player
      await supabase
        .from('challenge_sessions')
        .update({
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      // Award winner +10 stars via user_activities
      await supabase.from('user_activities').insert([
        {
          user_id: winnerId,
          activity_type: 'challenge_win',
          stars: 10,
          metadata: { opponent_id: user_id, forfeit: true },
        },
      ]);

      // Deduct from forfeiter (capped to current monthly balance)
      const { data: forfeiterMonthly } = await supabase.rpc('get_user_monthly_stars', {
        p_user_id: user_id,
      });
      const forfeiterStars = forfeiterMonthly || 0;
      const deduction = Math.min(10, forfeiterStars);
      if (deduction > 0) {
        await supabase.from('user_activities').insert([
          {
            user_id,
            activity_type: 'challenge_lose',
            stars: -deduction,
            metadata: { opponent_id: winnerId, forfeit: true },
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
