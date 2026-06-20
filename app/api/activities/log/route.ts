import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { user_id, activity_type, metadata } = await req.json();

    if (!user_id || !activity_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Use server-side log_activity_safe which enforces daily cap in Postgres
    // Returns the actual stars awarded (0 if cap reached, negative for penalties)
    const { data: actualStars, error } = await supabaseAdmin
      .rpc('log_activity_safe', {
        p_user_id: user_id,
        p_activity_type: activity_type,
        p_metadata: metadata || {},
      });

    if (error) {
      console.error('Error logging activity via RPC:', error);
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }

    // Fetch updated user stars directly from DB (trigger already updated it)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stars')
      .eq('id', user_id)
      .single();

    return NextResponse.json({
      actual_stars: actualStars ?? 0,
      total_stars: user?.stars ?? 0,
    });
  } catch (err) {
    console.error('Error in log route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
