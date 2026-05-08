import { supabase } from './supabase';
import { User } from '../types';
import { hashPin } from './utils';

export async function signUp(username: string, pin: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      return { user: null, error: 'اسم المستخدم يجب أن يكون حرفين على الأقل' };
    }

    const hashedPin = await hashPin(pin);

    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return { user: null, error: 'خطأ في الاتصال بقاعدة البيانات. تأكد من أن جدول المستخدمين منشأ في Supabase.' };
    }

    if (existingUser) {
      return { user: null, error: 'هذا الاسم مستخدم مسبقاً، جرب اسماً آخر' };
    }

    const { data, error: insertError } = await supabase
      .from('users')
      .insert({ username: trimmedUsername, pin: hashedPin })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user:', insertError);
      if (insertError.code === '42501') {
        return { user: null, error: 'خطأ في صلاحيات قاعدة البيانات. تأكد من تفعيل RLS policy.' };
      }
      return { user: null, error: 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.' };
    }
    
    return { user: data as User, error: null };
  } catch (err: any) {
    console.error('Error in signUp:', err);
    return { user: null, error: 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.' };
  }
}

export async function login(username: string, pin: string): Promise<{ user: User | null; error: string | null }> {
  try {
    const trimmedUsername = username.trim();
    const hashedPin = await hashPin(pin);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', trimmedUsername)
      .eq('pin', hashedPin)
      .maybeSingle();

    if (error) {
      console.error('Error in login query:', error);
      return { user: null, error: 'خطأ في الاتصال بقاعدة البيانات.' };
    }

    if (!data) {
      return { user: null, error: 'الاسم أو رمز الدخول غير صحيح' };
    }

    return { user: data as User, error: null };
  } catch (err: any) {
    console.error('Error in login:', err);
    return { user: null, error: 'حدث خطأ أثناء تسجيل الدخول.' };
  }
}
