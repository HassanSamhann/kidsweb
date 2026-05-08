'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getLeaderboard } from '../../lib/activity';
import { Trophy, Star, Medal, Crown, RefreshCw } from 'lucide-react';

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-400', 'text-orange-400'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<{ user_id: string; username: string; total_stars: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = () => {
    setLoading(true);
    getLeaderboard(50).then(data => {
      setEntries(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">المتصدرين</h1>
            <p className="text-[var(--text-secondary)]">ترتيب المتسابقين حسب النجوم هذا الشهر</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="تحديث"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--text-muted)]">جاري التحميل...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-16 h-16 text-amber-400/30 mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">لا يوجد متسابقون بعد. كن أول من يبدأ!</p>
        </div>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {entries.map((entry, index) => {
            const isUser = entry.user_id === user?.id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  isUser
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  {index < 3 ? (
                    <Medal className={`w-8 h-8 ${MEDAL_COLORS[index]}`} />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[var(--border-color)] text-[var(--text-muted)] flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                  )}
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">
                      {entry.username}
                      {isUser && <span className="text-amber-400 mr-2 text-xs">(أنت)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-lg">{entry.total_stars}</span>
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
