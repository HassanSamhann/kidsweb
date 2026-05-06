'use client';

import React from 'react';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { ColoringApp } from '../../features/coloring/ColoringApp';

export default function ColoringPage() {
  return (
    <PageWrapper className="bg-primary-light/10">
      <AppHeader title="مرسمي الصغير" />
      <div className="p-4 flex-1 flex flex-col h-[calc(100vh-160px)]">
        <ColoringApp />
      </div>
      <BottomNav />
    </PageWrapper>
  );
}
