import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { session_id, user_id, answers } = await req.json();
    if (!session_id || !user_id || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: session } = await supabase
      .from('challenge_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (!session || session.status !== 'active') {
      return NextResponse.json({ error: 'Session not found or already completed' }, { status: 400 });
    }

    const isPlayer1 = session.player1_id === user_id;
    if ((isPlayer1 && session.player1_done) || (!isPlayer1 && session.player2_done)) {
      return NextResponse.json({ error: 'You already submitted your answers' }, { status: 400 });
    }

    const questions = session.questions as any[];
    let score = 0;
    for (const ans of answers) {
      const q = questions.find((x: any) => x.id === ans.question_id);
      if (q && q.correctIndex === ans.selected) score++;
    }

    const update: any = {};
    if (isPlayer1) {
      update.player1_score = score;
      update.player1_done = true;
    } else {
      update.player2_score = score;
      update.player2_done = true;
    }

    const { data: updated } = await supabase
      .from('challenge_sessions')
      .update(update)
      .eq('id', session_id)
      .select()
      .single();

    if (updated.player1_done && updated.player2_done) {
      let winnerId: string | null = null;
      if (updated.player1_score > updated.player2_score) winnerId = updated.player1_id;
      else if (updated.player2_score > updated.player1_score) winnerId = updated.player2_id;

      await supabase
        .from('challenge_sessions')
        .update({ status: 'completed', winner_id: winnerId, completed_at: new Date().toISOString() })
        .eq('id', session_id);

      if (winnerId) {
        const loserId = winnerId === updated.player1_id ? updated.player2_id : updated.player1_id;
        await supabase.rpc('transfer_stars', { winner_id: winnerId, loser_id: loserId, amount: 10 });
        await supabase.from('user_activities').insert([
          { user_id: winnerId, activity_type: 'challenge_win', stars: 10, metadata: { opponent_id: loserId } },
          { user_id: loserId, activity_type: 'challenge_lose', stars: 0, metadata: { opponent_id: winnerId } },
        ]);
      }
    }

    return NextResponse.json({ score, done: true });
  } catch (err) {
    console.error('Challenge submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
