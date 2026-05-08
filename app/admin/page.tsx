'use client';

import React from 'react';
import { Shield, User, Star, Trash2, Save, X, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  username: string;
  stars: number;
  monthly_stars: number;
  role: string | null;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [editStars, setEditStars] = React.useState<Record<string, string>>({});
  const [editUsername, setEditUsername] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [msg, setMsg] = React.useState('');

  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', admin_id: user?.id }),
    });
    const data = await res.json();
    if (data.users) {
      setUsers(data.users);
      const starsMap: Record<string, string> = {};
      const usernameMap: Record<string, string> = {};
      for (const u of data.users) {
        starsMap[u.id] = String(u.monthly_stars ?? u.stars);
        usernameMap[u.id] = u.username;
      }
      setEditStars(starsMap);
      setEditUsername(usernameMap);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const doAction = async (action: string, targetId: string, extra: Record<string, any> = {}) => {
    setSaving(prev => ({ ...prev, [targetId]: true }));
    setMsg('');
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, admin_id: user?.id, user_id: targetId, ...extra }),
    });
    const data = await res.json();
    if (data.error) {
      setMsg(data.error);
    } else {
      setMsg('تم الحفظ');
      fetchUsers();
    }
    setSaving(prev => ({ ...prev, [targetId]: false }));
  };

  const handleDelete = async (targetId: string, username: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${username}"؟`)) return;
    await doAction('delete', targetId);
  };

  const handleSaveStars = (targetId: string) => {
    const val = parseInt(editStars[targetId]);
    if (isNaN(val) || val < 0) { setMsg('النجوم يجب أن تكون رقماً صحيحاً'); return; }
    doAction('update_stars', targetId, { stars: val });
  };

  const handleSaveUsername = (targetId: string) => {
    const val = editUsername[targetId]?.trim();
    if (!val || val.length < 2) { setMsg('الاسم يجب أن يكون حرفين على الأقل'); return; }
    doAction('update_username', targetId, { username: val });
  };

  if (!user) {
    return (
      <div className="p-8 text-center py-20">
        <Shield className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">سجل الدخول أولاً</h2>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="p-8 text-center py-20">
        <Shield className="w-16 h-16 text-red-400/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">غير مصرح</h2>
        <p className="text-[var(--text-muted)]">هذه الصفحة مخصصة للمشرفين فقط</p>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.username.includes(search) || u.id.includes(search)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-red-500/10 text-red-400">
          <Shield className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">لوحة الإدارة</h1>
          <p className="text-[var(--text-secondary)]">إدارة المستخدمين</p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--border-color)] transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-[var(--text-primary)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {msg && (
        <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl mb-4 text-sm font-bold flex items-center gap-2 border border-emerald-500/20">
          <AlertCircle className="w-4 h-4" /> {msg}
          <button onClick={() => setMsg('')} className="mr-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 pr-12 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-red-500 text-right"
          placeholder="بحث عن مستخدم..."
        />
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-input)]">
                <th className="text-right p-3 font-bold text-[var(--text-muted)]">المستخدم</th>
                <th className="text-right p-3 font-bold text-[var(--text-muted)]">النجوم</th>
                <th className="text-right p-3 font-bold text-[var(--text-muted)]">الصلاحية</th>
                <th className="text-right p-3 font-bold text-[var(--text-muted)]">تاريخ التسجيل</th>
                <th className="text-center p-3 font-bold text-[var(--text-muted)]">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-input)]/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-sm font-bold shrink-0">
                        {u.username.charAt(0)}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          value={editUsername[u.id] || ''}
                          onChange={e => setEditUsername(prev => ({ ...prev, [u.id]: e.target.value }))}
                          className="bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-red-500 text-[var(--text-primary)] font-bold py-0.5 outline-none transition-colors"
                        />
                        <button
                          onClick={() => handleSaveUsername(u.id)}
                          disabled={saving[u.id]}
                          className="p-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <input
                        type="number"
                        value={editStars[u.id] || '0'}
                        onChange={e => setEditStars(prev => ({ ...prev, [u.id]: e.target.value }))}
                        className="w-16 bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-red-500 text-[var(--text-primary)] font-bold py-0.5 outline-none transition-colors text-center"
                      />
                      <button
                        onClick={() => handleSaveStars(u.id)}
                        disabled={saving[u.id]}
                        className="p-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      u.role === 'admin'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)] text-xs">
                    {new Date(u.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(u.id, u.username)}
                      disabled={saving[u.id] || u.role === 'admin'}
                      className="p-2 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="حذف المستخدم"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[var(--text-muted)]">
                    لا يوجد مستخدمين
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
        {users.length} مستخدم إجمالاً
      </p>
    </div>
  );
}
