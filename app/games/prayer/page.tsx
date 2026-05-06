'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '../../../components/ui/PageWrapper';
import { PrayerGame } from '../../../features/games/prayer/PrayerGame';
import { ChevronRight } from 'lucide-react';

export default function PrayerGamePage() {
  const router = useRouter();

  return (
    <PageWrapper withBottomNav={false} className="bg-primary-light/20">
      <div className="p-4 h-screen flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.push('/games')}
            className="p-2 bg-white rounded-full shadow-sm mr-4"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-black text-primary-dark">أركان الصلاة</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 pb-4">
          <PrayerGame />
        </div>
      </div>
    </PageWrapper>
  );
}
