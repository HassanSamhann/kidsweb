import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get the start of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sum all stars earned by the user in the current month
    const { data: activities, error: actError } = await supabase
      .from('user_activities')
      .select('stars')
      .eq('user_id', user_id)
      .gte('created_at', startOfMonth.toISOString());

    if (actError) {
      console.error('Error fetching activities for reset:', actError);
      return NextResponse.json({ error: 'Failed to fetch current month activities' }, { status: 500 });
    }

    // Sum up the stars (making sure we handle negative stars from challenge entries correctly)
    const currentMonthStars = (activities || []).reduce((sum, act) => sum + (act.stars || 0), 0);
    const finalStars = Math.max(0, currentMonthStars);

    // Update the users table
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ stars: finalStars })
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user stars for reset:', updateError);
      return NextResponse.json({ error: 'Failed to update user stars' }, { status: 500 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('Error in reset-stars route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
