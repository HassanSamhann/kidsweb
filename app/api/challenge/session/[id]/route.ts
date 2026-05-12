import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data: session } = await supabase
      .from('challenge_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  } catch (err) {
    console.error('Challenge session error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
