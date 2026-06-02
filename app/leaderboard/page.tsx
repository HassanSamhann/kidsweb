'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getLeaderboard, getLastMonthWinner } from '../../lib/activity';
import { Trophy, Star, Medal, Crown, RefreshCw } from 'lucide-react';

const MEDAL_COLORS = ['text-yellow-400', 'text-gray-400', 'text-orange-400'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = React.useState<{ user_id: string; username: string; total_stars: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastMonthWinner, setLastMonthWinner] = React.useState<{ username: string; stars: number; monthName: string } | null>(null);

  const fetchData = () => {
    setLoading(true);
    getLeaderboard(3).then(data => {
      setEntries(data);
    }).catch(() => {});

    getLastMonthWinner().then(data => {
      if (data && data.winner) {
        setLastMonthWinner(data.winner);
      } else {
        setLastMonthWinner(null);
      }
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
            <h1 className="text-3xl font-black text-[var(--text-primary)]">المتصدرين (أول 3)</h1>
            <p className="text-[var(--text-secondary)]">أفضل 3 متسابقين حسب النجوم هذا الشهر</p>
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

      {/* Last Month Winner Card */}
      {lastMonthWinner && (
        <div className="max-w-2xl mb-8 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 rounded-[2.5rem] p-6 flex items-center justify-between shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Trophy className="w-7 h-7 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs text-amber-400 font-bold mb-1">بطل الشهر الماضي ({lastMonthWinner.monthName})</p>
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-arabic">{lastMonthWinner.username}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 font-bold">
            <span className="text-xl font-black">{lastMonthWinner.stars}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      )}

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
