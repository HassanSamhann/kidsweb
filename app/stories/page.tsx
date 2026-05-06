'use client';

import React from 'react';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { StoryList } from '../../features/stories/StoryList';

export default function StoriesPage() {
  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <div className="w-2 h-8 bg-orange-400 rounded-full"></div>
          ركن القصص للأطفال
        </h1>
        <p className="text-gray-400 font-medium">قصص تعليمية ممتعة ومفيدة</p>
      </header>

      <div className="pb-12">
        <StoryList />
      </div>
    </div>
  );
}
