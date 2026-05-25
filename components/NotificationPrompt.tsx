'use client';

import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, X } from 'lucide-react';

const PROMPT_KEY = 'kidsweb_notification_prompt_done';

export function NotificationPrompt() {
  const { permissionStatus, requestNativePermission, updateSettings } = useNotifications();
  const [show, setShow] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const done = localStorage.getItem(PROMPT_KEY);
    if (!done && 'Notification' in window && Notification.permission === 'default') {
      setShow(true);
    }
  }, []);

  const handleAllow = async () => {
    const granted = await requestNativePermission();
    if (granted) {
      updateSettings({ nativeEnabled: true });
      localStorage.setItem(PROMPT_KEY, '1');
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(PROMPT_KEY, '1');
    setShow(false);
  };

  if (!mounted || !show) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-[var(--bg-card)] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl shadow-cyan-500/10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1">تفعيل الإشعارات</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            فعل الإشعارات ليصلك تذكير بأذكار الصباح والمساء ومواقيت الصلاة
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAllow}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              تفعيل
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-[var(--bg-input)] text-[var(--text-muted)] rounded-xl text-xs font-bold hover:text-[var(--text-primary)] transition-colors"
            >
              لاحقاً
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
