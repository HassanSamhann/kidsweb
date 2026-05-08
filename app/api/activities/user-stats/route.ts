import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const [totalResult, recentResult] = await Promise.all([
      supabaseAdmin.rpc('get_user_monthly_stars', { p_user_id: userId }),
      supabaseAdmin
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    return NextResponse.json({
      total_stars: totalResult.data || 0,
      recent_activities: recentResult.data || [],
    });
  } catch (err) {
    console.error('Error in user-stats route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
