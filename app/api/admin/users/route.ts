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

      // monthly_stars is now equal to users.stars (kept in sync by DB trigger)
      const enriched = (users || []).map((u: any) => ({
        ...u,
        monthly_stars: u.stars,
      }));

      return NextResponse.json({ users: enriched });
    }

    if (action === 'update_stars') {
      const { user_id, stars } = body;
      if (!user_id || stars === undefined) {
        return NextResponse.json({ error: 'user_id and stars required' }, { status: 400 });
      }

      // Compute diff between requested value and current monthly total
      const { data: currentMonthly } = await supabase.rpc('get_user_monthly_stars', { p_user_id: user_id });
      const currentVal = typeof currentMonthly === 'number' ? currentMonthly : 0;
      const diff = stars - currentVal;

      if (diff !== 0) {
        // Insert an admin_adjust activity — the DB Trigger will update users.stars automatically
        const { error: activityErr } = await supabase
          .from('user_activities')
          .insert({
            user_id,
            activity_type: 'admin_adjust',
            stars: diff,
            metadata: { note: 'تعديل بواسطة المشرف', adjusted_by: admin_id },
          });
        if (activityErr) {
          console.error('Failed to log admin adjustment:', activityErr);
          throw activityErr;
        }
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

      // Cascade delete all related records
      await supabase.from('user_activities').delete().eq('user_id', user_id);
      await supabase.from('challenge_queue').delete().eq('user_id', user_id);
      await supabase.from('challenge_sessions').delete().or(`player1_id.eq.${user_id},player2_id.eq.${user_id}`);

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
