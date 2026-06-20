import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 20;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .rpc('get_leaderboard', { limit_count: limit });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Map the database returned 'stars' key to 'total_stars' to match frontend expects
    const enriched = (data || []).map((item: any) => ({
      user_id: item.user_id,
      username: item.username,
      total_stars: Number(item.stars ?? 0),
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.error('Error in leaderboard route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
