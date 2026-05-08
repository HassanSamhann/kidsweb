'use client';

import React from 'react';
import { AudioPlayerProvider } from '../../contexts/AudioPlayerContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { DashboardLayout } from '../layout/DashboardLayout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioPlayerProvider>
      <ThemeProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ThemeProvider>
    </AudioPlayerProvider>
  );
}
