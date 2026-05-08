'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserStats, getActivityName } from '../../lib/activity';
import { Star, Trophy, Clock, Target, Medal, TrendingUp, Activity } from 'lucide-react';

interface RecentActivity {
  id: string;
  activity_type: string;
  stars: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = React.useState<{ total_stars: number; recent_activities: RecentActivity[] } | null>(null);
  const [leaderboard, setLeaderboard] = React.useState<{ user_id: string; username: string; total_stars: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([
      getUserStats(user.id),
      fetch('/api/activities/leaderboard?limit=5').then(r => r.json()),
    ]).then(([s, lb]) => {
      setStats(s);
      setLeaderboard(lb);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">سجل الدخول أولاً</h2>
          <p className="text-[var(--text-muted)]">قم بإنشاء حساب أو تسجيل الدخول لمشاهدة إنجازاتك</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">جاري التحميل...</div>;
  }

  const userRank = leaderboard.findIndex(u => u.user_id === user.id) + 1;

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
          <Trophy className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">لوحة الإنجازات</h1>
          <p className="text-[var(--text-secondary)]">تتبع تقدمك ونجومك هذا الشهر</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-6 h-6" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">إجمالي النجوم</span>
          </div>
          <p className="text-4xl font-black text-amber-400">{stats?.total_stars || 0}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">هذا الشهر</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">عدد الأنشطة</span>
          </div>
          <p className="text-4xl font-black text-blue-400">{stats?.recent_activities?.length || 0}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">آخر 10 أنشطة</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
              <Medal className="w-6 h-6" />
            </div>
            <span className="text-sm text-[var(--text-muted)]">الترتيب</span>
          </div>
          <p className="text-4xl font-black text-green-400">
            {userRank > 0 ? `#${userRank}` : '--'}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">من بين {leaderboard.length} متسابق</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 mb-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          آخر الأنشطة
        </h2>
        {stats?.recent_activities && stats.recent_activities.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-input)]">
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {getActivityName(activity.activity_type as any) || activity.activity_type}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {new Date(activity.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
                <span className="text-amber-400 font-bold text-sm">+{activity.stars} ⭐</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[var(--text-muted)] py-8">لا توجد أنشطة بعد. ابدأ باستخدام التطبيق!</p>
        )}
      </div>

      {/* Leaderboard Preview */}
      {leaderboard.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            أفضل المتسابقين
          </h2>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  entry.user_id === user.id ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-[var(--bg-input)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-[var(--border-color)] text-[var(--text-muted)]'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {entry.username}
                    {entry.user_id === user.id && <span className="text-amber-400 mr-2 text-xs">(أنت)</span>}
                  </span>
                </div>
                <span className="text-amber-400 font-bold">{entry.total_stars} ⭐</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
