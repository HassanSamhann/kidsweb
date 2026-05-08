import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { user_id, activity_type, stars, metadata } = await req.json();

    if (!user_id || !activity_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('user_activities')
      .insert({ user_id, activity_type, stars, metadata })
      .select()
      .single();

    if (error) {
      console.error('Error logging activity:', error);
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error in log route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
