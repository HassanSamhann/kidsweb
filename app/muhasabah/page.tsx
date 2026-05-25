'use client';

import React from 'react';
import { CheckCircle2, Circle, RotateCcw, Printer, Percent } from 'lucide-react';
import {
  MUHASABAH_DATA,
  getMuhasabahDone,
  toggleMuhasabahItem,
  getTotalPoints,
  getCategoryProgress,
  resetToday,
} from '../../lib/muhasabah';

const DAY_NAMES: Record<string, string> = {
  Sunday: 'الأحد',
  Monday: 'الاثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
};

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export default function MuhasabahPage() {
  const [done, setDone] = React.useState<Record<string, boolean>>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setDone(getMuhasabahDone());
    setMounted(true);
  }, []);

  const handleToggle = (id: string) => {
    const next = toggleMuhasabahItem(id);
    setDone({ ...next });
  };

  const handleReset = () => {
    if (!confirm('هل تريد إعادة تعيين جدول اليوم؟')) return;
    resetToday();
    setDone({});
  };

  const totals = getTotalPoints();
  const progress = totals.max > 0 ? Math.round((totals.earned / totals.max) * 100) : 0;

  const now = new Date();
  const dayName = DAY_NAMES[now.toLocaleDateString('en-US', { weekday: 'long' })] || '';
  const dateStr = `${dayName}، ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;

  if (!mounted) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[var(--bg-card)] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">المحاسبة اليومية</h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="طباعة"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
              title="إعادة تعيين"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 border border-cyan-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">إجمالي التقدم</span>
            <span className="text-2xl font-black text-cyan-400">{progress}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-card)] rounded-full overflow-hidden border border-[var(--border-color)]">
            <div
              className="h-full bg-gradient-to-l from-cyan-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[var(--text-muted)]">
              {totals.earned} / {totals.max} نقطة
            </span>
            {progress === 100 && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                اكتمل ✓
              </span>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {MUHASABAH_DATA.map((cat) => {
            const catProgress = getCategoryProgress(cat.id);
            const catPercent = catProgress.max > 0 ? Math.round((catProgress.earned / catProgress.max) * 100) : 0;

            return (
              <div
                key={cat.id}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden"
              >
                {/* Category header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-input)]/50">
                  <h2 className="font-bold text-[var(--text-primary)]">{cat.label}</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--text-muted)]">{catProgress.earned}/{catProgress.max}</span>
                    <div className="w-16 h-1.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${catPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[var(--border-color)]/50">
                  {cat.items.map((item) => {
                    const isDone = done[item.id];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className={`w-full flex items-center justify-between p-3.5 px-5 text-right transition-all hover:bg-[var(--bg-input)]/50 ${
                          isDone ? 'bg-emerald-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-[var(--border-color)] shrink-0" />
                          )}
                          <span className={`text-sm ${isDone ? 'text-emerald-400 font-bold line-through opacity-80' : 'text-[var(--text-primary)]'}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`text-xs font-bold shrink-0 mr-3 ${isDone ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
                          {item.points}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
