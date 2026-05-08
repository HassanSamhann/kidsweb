import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';
import { cleanupStaleSessions } from '../../../../lib/cleanup-challenges';

export async function POST(req: NextRequest) {
  try {
    await cleanupStaleSessions();
    const { session_id, user_id, q_index, selected } = await req.json();
    if (session_id === undefined || !user_id || q_index === undefined || selected === undefined) {
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
    const answersCol = isPlayer1 ? 'player1_answers' : 'player2_answers';
    const currentAnswers = (session as any)[answersCol] || {};

    if (currentAnswers[q_index] !== undefined) {
      return NextResponse.json({ ok: true, already_answered: true });
    }

    currentAnswers[q_index] = selected;

    const { error: updateErr } = await supabase
      .from('challenge_sessions')
      .update({ [answersCol]: currentAnswers })
      .eq('id', session_id);

    if (updateErr) throw updateErr;

    // Reload to get opponent's answers
    const { data: updated } = await supabase
      .from('challenge_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (!updated) throw new Error('Session not found after update');

    const oppCol = isPlayer1 ? 'player2_answers' : 'player1_answers';
    const oppAnswers = (updated as any)[oppCol] || {};
    const opponentAnsweredThis = oppAnswers[q_index] !== undefined;

    const qCount = (updated.questions as any[]).length;
    const myAnswerCount = Object.keys(currentAnswers).length;
    const oppAnswerCount = Object.keys(oppAnswers).length;
    const bothFinishedAll = myAnswerCount >= qCount && oppAnswerCount >= qCount;

    if (bothFinishedAll) {
      let myScore = 0, oppScore = 0;
      const questions = updated.questions as any[];
      for (let i = 0; i < qCount; i++) {
        if (currentAnswers[i] === questions[i].correctIndex) myScore++;
        if (oppAnswers[i] === questions[i].correctIndex) oppScore++;
      }

      let winnerId: string | null = null;
      if (myScore > oppScore) winnerId = user_id;
      else if (oppScore > myScore) winnerId = isPlayer1 ? updated.player2_id : updated.player1_id;

      await supabase
        .from('challenge_sessions')
        .update({
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
          player1_score: isPlayer1 ? myScore : oppScore,
          player2_score: isPlayer1 ? oppScore : myScore,
        })
        .eq('id', session_id);

      if (winnerId) {
        const loserId = winnerId === updated.player1_id ? updated.player2_id : updated.player1_id;
        // Deduct from loser's monthly stars (min 0)
        const { data: loserMonthly } = await supabase.rpc('get_user_monthly_stars', { p_user_id: loserId });
        const loserStars = loserMonthly || 0;
        const deduction = Math.min(10, loserStars);
        await supabase.from('user_activities').insert([
          { user_id: winnerId, activity_type: 'challenge_win', stars: 10, metadata: { opponent_id: loserId } },
          { user_id: loserId, activity_type: 'challenge_lose', stars: -deduction, metadata: { opponent_id: winnerId } },
        ]);
      }

      return NextResponse.json({
        ok: true,
        opponent_answered_this: opponentAnsweredThis,
        completed: true,
        winner_id: winnerId,
        my_score: myScore,
        opponent_score: oppScore,
      });
    }

    return NextResponse.json({
      ok: true,
      opponent_answered_this: opponentAnsweredThis,
      completed: false,
    });
  } catch (err) {
    console.error('Challenge answer error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
