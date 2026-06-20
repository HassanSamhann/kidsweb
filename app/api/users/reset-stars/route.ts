import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/reset-stars
 * Since the Trigger now keeps users.stars in sync automatically after every
 * user_activities insert, this endpoint simply re-runs the sync for a given user
 * (useful for admin fixes or manual reconciliation).
 */
export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Recompute monthly stars from user_activities and update users.stars
    const { data: monthlyStars, error: rpcError } = await supabase
      .rpc('get_user_monthly_stars', { p_user_id: user_id });

    if (rpcError) {
      console.error('Error computing monthly stars:', rpcError);
      return NextResponse.json({ error: 'Failed to compute stars' }, { status: 500 });
    }

    const finalStars = Math.max(0, monthlyStars ?? 0);

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ stars: finalStars })
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user stars:', updateError);
      return NextResponse.json({ error: 'Failed to update user stars' }, { status: 500 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('Error in reset-stars route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
