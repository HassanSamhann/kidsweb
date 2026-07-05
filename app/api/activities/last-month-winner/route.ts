import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // ── Primary: read from monthly_winners table (populated by the cron reset) ──
    // This is fast and consistent — no heavy aggregation query needed.
    const { data: winner, error: winnerError } = await supabase
      .from('monthly_winners')
      .select('username, stars, month_date')
      .order('month_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!winnerError && winner && winner.stars > 0) {
      const monthDate = new Date(winner.month_date);
      const monthName = monthDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
      return NextResponse.json(
        { winner: { username: winner.username, stars: winner.stars, monthName } },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // ── Fallback: compute from user_activities for last month ──
    // Used when monthly_winners table doesn't exist yet or is empty.
    const now = new Date();
    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const lastDay  = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));

    const { data: activities, error: actError } = await supabase
      .from('user_activities')
      .select('user_id, stars')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString());

    if (actError || !activities || activities.length === 0) {
      return NextResponse.json({ winner: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Aggregate stars per user
    const userStars: Record<string, number> = {};
    for (const act of activities) {
      if (act.stars) {
        userStars[act.user_id] = (userStars[act.user_id] || 0) + act.stars;
      }
    }

    // Find winner
    let winnerId: string | null = null;
    let maxStars = -1;
    for (const [userId, stars] of Object.entries(userStars)) {
      const finalStars = Math.max(0, stars);
      if (finalStars > maxStars) {
        maxStars = finalStars;
        winnerId = userId;
      }
    }

    if (!winnerId || maxStars <= 0) {
      return NextResponse.json({ winner: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', winnerId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ winner: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const monthName = firstDay.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

    return NextResponse.json(
      { winner: { username: userData.username, stars: maxStars, monthName } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('Error in last-month-winner route:', err);
    return NextResponse.json(
      { winner: null },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
