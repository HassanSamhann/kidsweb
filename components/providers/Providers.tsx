'use client';

import React from 'react';
import { AudioPlayerProvider } from '../../contexts/AudioPlayerContext';
import { DashboardLayout } from '../layout/DashboardLayout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AudioPlayerProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AudioPlayerProvider>
  );
}
