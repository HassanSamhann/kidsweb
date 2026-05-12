import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

async function checkAdmin(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();
  return user?.role === 'admin';
}

export async function GET(req: NextRequest) {
  try {
    const adminId = req.nextUrl.searchParams.get('admin_id');
    const userId = req.nextUrl.searchParams.get('user_id');
    const date = req.nextUrl.searchParams.get('date');

    if (!adminId || !userId) {
      return NextResponse.json({ error: 'admin_id and user_id required' }, { status: 400 });
    }

    const isAdmin = await checkAdmin(adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (date) {
      const start = `${date}T00:00:00Z`;
      const end = `${date}T23:59:59Z`;
      query = query.gte('created_at', start).lte('created_at', end);
    }

    const { data: activities, error } = await query;
    if (error) throw error;

    const { data: user } = await supabase
      .from('users')
      .select('username, stars')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      user: { id: userId, username: user?.username, stars: user?.stars },
      activities: activities || [],
    });
  } catch (err) {
    console.error('Admin user-activities error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
