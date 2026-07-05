import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 20;

    const supabaseAdmin = getSupabaseAdmin();

    // Use the get_leaderboard RPC which computes directly from user_activities
    // using UTC date_trunc — no device-side caching, no stale users.stars column.
    const { data, error } = await supabaseAdmin
      .rpc('get_leaderboard', { limit_count: limit });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Normalise: map DB 'stars' → 'total_stars' expected by the frontend.
    const enriched = (data || []).map((item: any) => ({
      user_id:     item.user_id,
      username:    item.username,
      total_stars: Math.max(0, Number(item.stars ?? 0)),
    }));

    return NextResponse.json(enriched, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Error in leaderboard route:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
