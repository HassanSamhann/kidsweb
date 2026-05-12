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

      // Try to complete the session — filter by 'active' to ensure only
      // one request (the first) actually does the completion + award
      await supabase
        .from('challenge_sessions')
        .update({
          status: 'completed',
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
          player1_score: isPlayer1 ? myScore : oppScore,
          player2_score: isPlayer1 ? oppScore : myScore,
        })
        .eq('id', session_id)
        .eq('status', 'active');

      // Read back to see who really won (scores from whoever completed it)
      const { data: finalized } = await supabase
        .from('challenge_sessions')
        .select('winner_id, player1_score, player2_score')
        .eq('id', session_id)
        .single();

      const realWinner = finalized?.winner_id;
      const finalMyScore = isPlayer1 ? finalized?.player1_score : finalized?.player2_score;
      const finalOppScore = isPlayer1 ? finalized?.player2_score : finalized?.player1_score;

      // Only award if no challenge_win exists for this session yet
      if (realWinner) {
        const { data: existing } = await supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', realWinner)
          .eq('activity_type', 'challenge_win')
          .eq('metadata->>session_id', session_id)
          .maybeSingle();

        if (!existing) {
          const loserId = realWinner === updated.player1_id ? updated.player2_id : updated.player1_id;
          await supabase.from('user_activities').insert([
            { user_id: realWinner, activity_type: 'challenge_win', stars: 20, metadata: { opponent_id: loserId, session_id } },
          ]);
        }
      }

      return NextResponse.json({
        ok: true,
        opponent_answered_this: opponentAnsweredThis,
        completed: true,
        winner_id: realWinner,
        my_score: finalMyScore ?? 0,
        opponent_score: finalOppScore ?? 0,
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
