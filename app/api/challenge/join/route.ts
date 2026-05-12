import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';
import { cleanupStaleSessions } from '../../../../lib/cleanup-challenges';
import quizData from '../../../../data/Islamic-Quizzes.json';

function pickRandomQuestions(count: number) {
  const all: any[] = [];
  for (const cat of (quizData as any).mainCategories) {
    for (const topic of cat.topics) {
      for (const level of ['level1', 'level2', 'level3']) {
        const qs = (topic.levelsData as any)[level];
        if (qs) all.push(...qs);
      }
    }
  }
  const shuffled = all.sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((q: any) => ({
    id: q.id,
    q: q.q,
    answers: q.answers.map((a: any) => ({ answer: a.answer })),
    correctIndex: q.answers.findIndex((a: any) => a.t === 1),
  }));
}

export async function POST(req: NextRequest) {
  try {
    await cleanupStaleSessions();
    const { user_id, username } = await req.json();
    if (!user_id || !username) {
      return NextResponse.json({ error: 'Missing user_id or username' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const [userResult, monthlyResult] = await Promise.all([
      supabase.from('users').select('stars').eq('id', user_id).single(),
      supabase.rpc('get_user_monthly_stars', { p_user_id: user_id }),
    ]);
    const lifetimeStars = userResult.data?.stars || 0;
    const monthlyStars = monthlyResult.data || 0;
    const totalStars = lifetimeStars + monthlyStars;
    if (totalStars < 10) {
      return NextResponse.json({ error: 'يجب أن يكون لديك على الأقل 10 نجوم للمشاركة في التحدي' }, { status: 400 });
    }

    const { data: existing } = await supabase.from('challenge_queue').select('id').eq('user_id', user_id).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'أنت بالفعل في قائمة الانتظار' }, { status: 400 });
    }

    const { data: activeSession } = await supabase
      .from('challenge_sessions')
      .select('id')
      .or(`player1_id.eq.${user_id},player2_id.eq.${user_id}`)
      .eq('status', 'active')
      .maybeSingle();
    if (activeSession) {
      return NextResponse.json({ error: 'لديك جلسة تحدٍ نشطة بالفعل' }, { status: 400 });
    }

    const { data: opponent } = await supabase
      .from('challenge_queue')
      .select('user_id, username')
      .neq('user_id', user_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (opponent) {
      await supabase.from('challenge_queue').delete().eq('user_id', opponent.user_id);

      const questions = pickRandomQuestions(10);
      const { data: session } = await supabase
        .from('challenge_sessions')
        .insert({
          player1_id: opponent.user_id,
          player2_id: user_id,
          player1_username: opponent.username,
          player2_username: username,
          questions,
        })
        .select('*')
        .single();

      // Deduct 10★ entry fee from both players
      await supabase.from('user_activities').insert([
        { user_id: opponent.user_id, activity_type: 'challenge_entry', stars: -10, metadata: { session_id: session?.id } },
        { user_id, activity_type: 'challenge_entry', stars: -10, metadata: { session_id: session?.id } },
      ]);

      return NextResponse.json({ matched: true, session });
    }

    await supabase.from('challenge_queue').insert({ user_id, username });
    return NextResponse.json({ matched: false, message: 'في انتظار متحدٍ...' });
  } catch (err) {
    console.error('Challenge join error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
