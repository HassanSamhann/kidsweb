'use client';

import React, { useEffect } from 'react';
import { AudioPlayerProvider } from '../../contexts/AudioPlayerContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { InAppNotificationToast } from '../notification/InAppNotificationToast';
import { NotificationPrompt } from '../NotificationPrompt';
import { DashboardLayout } from '../layout/DashboardLayout';
import { useAuth, AuthProvider } from '../../hooks/useAuth';
import { syncTodayActivities } from '../../lib/activity';

function ServiceWorkerRegister() {
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}

function MonthlyStarsReset() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (!user || !user.id) return;

    const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const lastCheckedMonth = localStorage.getItem('kidsweb_last_checked_month');

    if (!lastCheckedMonth) {
      localStorage.setItem('kidsweb_last_checked_month', currentMonth);
      return;
    }

    if (lastCheckedMonth !== currentMonth) {
      fetch('/api/users/reset-stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('kidsweb_last_checked_month', currentMonth);
        }
      })
      .catch(err => console.error('Failed to reset monthly stars:', err));
    }
  }, [user, setUser]);

  return null;
}

function DatabaseSync() {
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (!user || !user.id) return;

    syncTodayActivities(user.id).then(latestUser => {
      if (latestUser) {
        setUser(latestUser);
      }
    });
  }, [user?.id]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AudioPlayerProvider>
        <ThemeProvider>
          <NotificationProvider>
            <DashboardLayout>
              <ServiceWorkerRegister />
              <MonthlyStarsReset />
              <DatabaseSync />
              <InAppNotificationToast />
              <NotificationPrompt />
              {children}
            </DashboardLayout>
          </NotificationProvider>
        </ThemeProvider>
      </AudioPlayerProvider>
    </AuthProvider>
  );
}

