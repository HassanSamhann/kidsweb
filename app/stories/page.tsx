'use client';

import React from 'react';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { StoryList } from '../../features/stories/StoryList';

export default function StoriesPage() {
  return (
    <PageWrapper>
      <AppHeader title="القصص" />
      <div className="p-4 flex-1">
        <StoryList />
      </div>
      <BottomNav />
    </PageWrapper>
  );
}
