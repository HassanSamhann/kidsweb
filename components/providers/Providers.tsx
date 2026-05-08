'use client';

import React from 'react';
import { AudioPlayerProvider } from '../../contexts/AudioPlayerContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { DashboardLayout } from '../layout/DashboardLayout';

function ServiceWorkerRegister() {
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioPlayerProvider>
      <ThemeProvider>
        <DashboardLayout>
          <ServiceWorkerRegister />
          {children}
        </DashboardLayout>
      </ThemeProvider>
    </AudioPlayerProvider>
  );
}
