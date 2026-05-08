import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export async function PUT(req: NextRequest) {
  try {
    const { user_id, current_pin, new_username, new_pin } = await req.json();

    if (!user_id || !current_pin) {
      return NextResponse.json({ error: 'user_id and current_pin are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: user } = await supabase.from('users').select('*').eq('id', user_id).single();
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Hash current_pin and verify
    const msgUint8 = new TextEncoder().encode(current_pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedCurrentPin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (user.pin !== hashedCurrentPin) {
      return NextResponse.json({ error: 'رمز الدخول الحالي غير صحيح' }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (new_username !== undefined) {
      const trimmed = new_username.trim();
      if (trimmed.length < 2) {
        return NextResponse.json({ error: 'اسم المستخدم يجب أن يكون حرفين على الأقل' }, { status: 400 });
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

      updates.username = trimmed;
    }

    if (new_pin !== undefined) {
      if (!/^\d{4}$/.test(new_pin)) {
        return NextResponse.json({ error: 'رمز الدخول يجب أن يكون 4 أرقام' }, { status: 400 });
      }

      const msgUint8 = new TextEncoder().encode(new_pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      updates.pin = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'لا توجد تغييرات للحفظ' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
