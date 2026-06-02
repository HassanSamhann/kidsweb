import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('user_id');
    const startDate = req.nextUrl.searchParams.get('start_date');

    if (!userId || !startDate) {
      return NextResponse.json({ error: 'Missing user_id or start_date' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('activity_type, stars, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate);

    if (error) {
      console.error('Error fetching today activities:', error);
      return NextResponse.json({ error: 'Failed to fetch today activities' }, { status: 500 });
    }

    return NextResponse.json({ activities: activities || [] });
  } catch (err) {
    console.error('Error in today-activities route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
