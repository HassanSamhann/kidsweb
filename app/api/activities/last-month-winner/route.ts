import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    // Calculate start and end of last month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Fetch user activities for last month
    const { data: activities, error: actError } = await supabase
      .from('user_activities')
      .select('user_id, stars')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString());

    if (actError) {
      console.error('Error fetching last month activities:', actError);
      return NextResponse.json({ winner: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (!activities || activities.length === 0) {
      return NextResponse.json({ winner: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Sum stars by user_id
    const userStars: Record<string, number> = {};
    activities.forEach(act => {
      if (act.stars) {
        userStars[act.user_id] = (userStars[act.user_id] || 0) + act.stars;
      }
    });

    // Find the user with maximum stars
    let winnerId = null;
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

    // Fetch the username for this winner
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', winnerId)
      .single();

    if (userError || !user) {
      console.error('Error fetching winner user details:', userError);
      return NextResponse.json({ winner: null }, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Get the Arabic month name
    // Since it's last month, let's format it
    const monthName = firstDay.toLocaleDateString('ar-EG', { month: 'long' });

    return NextResponse.json({
      winner: {
        username: user.username,
        stars: maxStars,
        monthName,
      }
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('Error in last-month-winner route:', err);
    return NextResponse.json({ winner: null }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
