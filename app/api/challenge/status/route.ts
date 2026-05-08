import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: session } = await supabase
      .from('challenge_sessions')
      .select('*')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (session) {
      const isPlayer1 = session.player1_id === userId;
      return NextResponse.json({
        inQueue: false,
        session: {
          ...session,
          myScore: isPlayer1 ? session.player1_score : session.player2_score,
          opponentScore: isPlayer1 ? session.player2_score : session.player1_score,
          myDone: isPlayer1 ? session.player1_done : session.player2_done,
          opponentDone: isPlayer1 ? session.player2_done : session.player1_done,
          opponentUsername: isPlayer1 ? session.player2_username : session.player1_username,
        }
      });
    }

    const { data: queue } = await supabase
      .from('challenge_queue')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    return NextResponse.json({ inQueue: !!queue, session: null });
  } catch (err) {
    console.error('Challenge status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
