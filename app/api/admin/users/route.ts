import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

async function checkAdmin(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();
  if (!user || user.role !== 'admin') {
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, admin_id } = body;

    if (!admin_id) {
      return NextResponse.json({ error: 'admin_id required' }, { status: 400 });
    }

    const isAdmin = await checkAdmin(admin_id);
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    if (action === 'list') {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, stars, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Attach monthly stars for each user
      const enriched = await Promise.all(
        (users || []).map(async (u: any) => {
          const { data: monthly } = await supabase.rpc('get_user_monthly_stars', { p_user_id: u.id });
          return { ...u, monthly_stars: monthly || 0 };
        })
      );

      return NextResponse.json({ users: enriched });
    }

    if (action === 'update_stars') {
      const { user_id, stars } = body;
      if (!user_id || stars === undefined) {
        return NextResponse.json({ error: 'user_id and stars required' }, { status: 400 });
      }

      // Update both users.stars (lifetime) and log in user_activities (monthly)
      const { data: current } = await supabase
        .from('users')
        .select('stars')
        .eq('id', user_id)
        .single();
      const diff = stars - (current?.stars || 0);

      const { error: updateErr } = await supabase
        .from('users')
        .update({ stars })
        .eq('id', user_id);

      if (updateErr) throw updateErr;

      if (diff !== 0) {
        const { error: activityErr } = await supabase
          .from('user_activities')
          .insert({
            user_id,
            activity_type: 'admin_adjust',
            stars: diff,
            metadata: { note: 'تعديل بواسطة المشرف', adjusted_by: admin_id },
          });
        if (activityErr) console.error('Failed to log admin adjustment:', activityErr);
      }

      return NextResponse.json({ ok: true });
    }

    if (action === 'update_username') {
      const { user_id, username } = body;
      if (!user_id || !username) {
        return NextResponse.json({ error: 'user_id and username required' }, { status: 400 });
      }

      const trimmed = username.trim();
      if (trimmed.length < 2) {
        return NextResponse.json({ error: 'الاسم يجب أن يكون حرفين على الأقل' }, { status: 400 });
      }

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .neq('id', user_id)
        .eq('username', trimmed)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'هذا الاسم مستخدم مسبقاً' }, { status: 400 });
      }

      const { error } = await supabase
        .from('users')
        .update({ username: trimmed })
        .eq('id', user_id);

      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === 'delete') {
      const { user_id } = body;
      if (!user_id) {
        return NextResponse.json({ error: 'user_id required' }, { status: 400 });
      }

      const { error } = await supabase.from('users').delete().eq('id', user_id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
