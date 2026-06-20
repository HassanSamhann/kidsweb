import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/activities/can-earn?user_id=&type=
 * Checks how many stars remain for a user to earn today for a given activity type.
 * Uses check_daily_cap() Postgres function — no localStorage involved.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id');
    const type   = req.nextUrl.searchParams.get('type');

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing user_id or type' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: remaining, error } = await supabaseAdmin
      .rpc('check_daily_cap', { p_user_id: userId, p_activity_type: type });

    if (error) {
      console.error('Error checking daily cap:', error);
      return NextResponse.json({ error: 'Failed to check daily cap' }, { status: 500 });
    }

    return NextResponse.json({
      remaining: remaining ?? 0,
      can_earn: (remaining ?? 0) > 0,
    });
  } catch (err) {
    console.error('Error in can-earn route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
