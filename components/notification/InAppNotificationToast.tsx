'use client';

import React, { useEffect } from 'react';
import { useNotifications, InAppNotification } from '../../contexts/NotificationContext';
import { X, Sparkles, Clock, BookOpen, Volume2 } from 'lucide-react';

export function InAppNotificationToast() {
  const { activeNotifications, dismissNotification } = useNotifications();

  if (activeNotifications.length === 0) return null;

  return (
    <div 
      className="fixed top-24 left-4 z-[9999] w-full max-w-sm space-y-3 pointer-events-none" 
      dir="rtl"
    >
      {activeNotifications.map((notif) => (
        <ToastItem 
          key={notif.id} 
          notif={notif} 
          onDismiss={() => dismissNotification(notif.id)} 
        />
      ))}
    </div>
  );
}

function ToastItem({ notif, onDismiss }: { notif: InAppNotification; onDismiss: () => void }) {
  // Dismiss automatically after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    azkar: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      icon: '✨',
      shadow: 'shadow-emerald-500/5',
      glow: 'after:bg-emerald-500/20',
    },
    prayer: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
      icon: '🕌',
      shadow: 'shadow-amber-500/5',
      glow: 'after:bg-amber-500/20',
    },
    surah: {
      bg: 'bg-purple-500/10 border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400',
      icon: '📖',
      shadow: 'shadow-purple-500/5',
      glow: 'after:bg-purple-500/20',
    },
    system: {
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
      icon: '🔔',
      shadow: 'shadow-cyan-500/5',
      glow: 'after:bg-cyan-500/20',
    },
  }[notif.type || 'system'];

  return (
    <div 
      className={`pointer-events-auto w-full p-4 rounded-2xl border backdrop-blur-xl ${config.bg} ${config.shadow} flex gap-3 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] shadow-lg animate-[slideIn_0.3s_ease-out]`}
    >
      {/* Decorative colored glow on top corner */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl pointer-events-none" />
      
      {/* Time indicator line */}
      <div className="absolute bottom-0 right-0 left-0 h-1 bg-white/5 overflow-hidden">
        <div className="h-full bg-current opacity-30 animate-[shrinkWidth_8s_linear_forwards]" />
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${config.iconBg}`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0 pr-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400">تذكير مبارك</span>
          <span className="text-[10px] font-mono text-gray-500">الآن</span>
        </div>
        <h4 className="font-black text-white text-sm leading-tight truncate">
          {notif.title}
        </h4>
        <p className="text-gray-300 text-xs font-semibold leading-relaxed">
          {notif.body}
        </p>
      </div>

      <button 
        onClick={onDismiss}
        className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition self-start shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
