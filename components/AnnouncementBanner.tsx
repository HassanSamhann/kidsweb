'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';

const ANNOUNCEMENT_KEY = 'kidsweb_announcement_dismissed';
const ANNOUNCEMENT_TEXT = '🎉 المحاسبة اليومية — تابع صلواتك وأذكارك وأعمالك اليومية واحصل على تقييم يومي!';

export function AnnouncementBanner() {
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(true);

  React.useEffect(() => {
    setMounted(true);
    const val = localStorage.getItem(ANNOUNCEMENT_KEY);
    if (!val || val !== ANNOUNCEMENT_TEXT) {
      setDismissed(false);
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(ANNOUNCEMENT_KEY, ANNOUNCEMENT_TEXT);
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  return (
    <div
      className={`mb-6 bg-gradient-to-l from-cyan-900/40 to-emerald-900/40 border border-cyan-500/20 rounded-2xl p-4 flex items-center gap-3 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5" />
      </div>
      <p className="text-sm text-[var(--text-primary)] flex-1 leading-relaxed">
        {ANNOUNCEMENT_TEXT}
      </p>
      <button
        onClick={handleDismiss}
        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
