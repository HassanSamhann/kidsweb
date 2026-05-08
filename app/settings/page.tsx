'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { hashPin } from '../../lib/utils';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [newUsername, setNewUsername] = React.useState('');
  const [usernamePin, setUsernamePin] = React.useState('');
  const [usernameMsg, setUsernameMsg] = React.useState('');
  const [usernameOk, setUsernameOk] = React.useState(false);
  const [usernameLoading, setUsernameLoading] = React.useState(false);

  const [currentPin, setCurrentPin] = React.useState('');
  const [newPin, setNewPin] = React.useState('');
  const [confirmPin, setConfirmPin] = React.useState('');
  const [pinMsg, setPinMsg] = React.useState('');
  const [pinOk, setPinOk] = React.useState(false);
  const [pinLoading, setPinLoading] = React.useState(false);
  const [showPin, setShowPin] = React.useState(false);

  if (!user) {
    return (
      <div className="p-8 text-center py-20">
        <Settings className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">سجل الدخول أولاً</h2>
        <p className="text-[var(--text-muted)]">يجب تسجيل الدخول لتعديل الإعدادات</p>
      </div>
    );
  }

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (trimmed.length < 2) { setUsernameMsg('اسم المستخدم يجب أن يكون حرفين على الأقل'); setUsernameOk(false); return; }
    if (trimmed === user.username) { setUsernameMsg('هذا هو اسمك الحالي'); setUsernameOk(false); return; }
    if (!/^\d{4}$/.test(usernamePin)) { setUsernameMsg('رمز الدخول يجب أن يكون 4 أرقام'); setUsernameOk(false); return; }

    setUsernameLoading(true);
    setUsernameMsg('');

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, current_pin: usernamePin, new_username: trimmed }),
      });
      const data = await res.json();
      if (data.error) {
        setUsernameMsg(data.error);
        setUsernameOk(false);
      } else {
        setUser({ ...user, ...data.user });
        setUsernameMsg('تم تغيير اسم المستخدم بنجاح');
        setUsernameOk(true);
        setNewUsername('');
        setUsernamePin('');
      }
    } catch {
      setUsernameMsg('حدث خطأ، حاول مرة أخرى');
      setUsernameOk(false);
    }
    setUsernameLoading(false);
  };

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(currentPin)) { setPinMsg('رمز الدخول الحالي يجب أن يكون 4 أرقام'); setPinOk(false); return; }
    if (!/^\d{4}$/.test(newPin)) { setPinMsg('رمز الدخول الجديد يجب أن يكون 4 أرقام'); setPinOk(false); return; }
    if (newPin !== confirmPin) { setPinMsg('رمز الدخول غير مطابق'); setPinOk(false); return; }
    if (newPin === currentPin) { setPinMsg('رمز الدخول الجديد مطابق للحالي'); setPinOk(false); return; }

    setPinLoading(true);
    setPinMsg('');

    try {
      const hashed = await hashPin(newPin);
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, current_pin: currentPin, new_pin: newPin }),
      });
      const data = await res.json();
      if (data.error) {
        setPinMsg(data.error);
        setPinOk(false);
      } else {
        setUser({ ...user, ...data.user });
        setPinMsg('تم تغيير رمز الدخول بنجاح');
        setPinOk(true);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      }
    } catch {
      setPinMsg('حدث خطأ، حاول مرة أخرى');
      setPinOk(false);
    }
    setPinLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
          <Settings className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">الإعدادات</h1>
          <p className="text-[var(--text-secondary)]">تعديل اسم المستخدم ورمز الدخول</p>
        </div>
      </div>

      {/* Change Username */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">تغيير اسم المستخدم</h2>
        </div>

        <form onSubmit={handleUsernameChange} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">الاسم الحالي</label>
            <div className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold">
              {user.username}
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">الاسم الجديد</label>
            <input
              type="text"
              value={newUsername}
              onChange={e => { setNewUsername(e.target.value); setUsernameMsg(''); }}
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 text-right"
              placeholder="أدخل الاسم الجديد"
              dir="rtl"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">رمز الدخول الحالي للتأكيد</label>
            <input
              type="password"
              value={usernamePin}
              onChange={e => { setUsernamePin(e.target.value); setUsernameMsg(''); }}
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 text-right"
              placeholder="****"
              maxLength={4}
              inputMode="numeric"
            />
          </div>
          <button
            type="submit"
            disabled={usernameLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {usernameLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          {usernameMsg && (
            <div className={`flex items-center gap-2 text-sm font-bold ${usernameOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {usernameOk ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {usernameMsg}
            </div>
          )}
        </form>
      </div>

      {/* Change PIN */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">تغيير رمز الدخول</h2>
        </div>

        <form onSubmit={handlePinChange} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">رمز الدخول الحالي</label>
            <input
              type={showPin ? 'text' : 'password'}
              value={currentPin}
              onChange={e => { setCurrentPin(e.target.value); setPinMsg(''); }}
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 text-right"
              placeholder="****"
              maxLength={4}
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">رمز الدخول الجديد</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={newPin}
                onChange={e => { setNewPin(e.target.value); setPinMsg(''); }}
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 text-right"
                placeholder="****"
                maxLength={4}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--text-muted)] mb-1 block">تأكيد رمز الدخول الجديد</label>
            <input
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={e => { setConfirmPin(e.target.value); setPinMsg(''); }}
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 text-right"
              placeholder="****"
              maxLength={4}
              inputMode="numeric"
            />
          </div>
          <button
            type="submit"
            disabled={pinLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {pinLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          {pinMsg && (
            <div className={`flex items-center gap-2 text-sm font-bold ${pinOk ? 'text-emerald-400' : 'text-red-400'}`}>
              {pinOk ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {pinMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
