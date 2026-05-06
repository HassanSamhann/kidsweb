import { supabase } from './supabase';
import { User } from '../types';
import { hashPin } from './utils';

export async function signUp(username: string, pin: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const hashedPin = await hashPin(pin);

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return { user: null, error: 'هذا الاسم مستخدم مسبقاً، جرب اسماً آخر' };
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([
        { username, pin: hashedPin }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return { user: data as User, error: null };
  } catch (err: any) {
    console.error('Error in signUp:', err);
    return { user: null, error: 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.' };
  }
}

export async function login(username: string, pin: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const hashedPin = await hashPin(pin);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('pin', hashedPin)
      .single();

    if (error || !data) {
      return { user: null, error: 'الاسم أو رمز الدخول غير صحيح' };
    }

    return { user: data as User, error: null };
  } catch (err: any) {
    console.error('Error in login:', err);
    return { user: null, error: 'حدث خطأ أثناء تسجيل الدخول.' };
  }
}
