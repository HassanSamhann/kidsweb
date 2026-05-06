'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '../../../components/ui/PageWrapper';
import { WudhuGame } from '../../../features/games/wudhu/WudhuGame';
import { ChevronRight } from 'lucide-react';

export default function WudhuGamePage() {
  const router = useRouter();

  return (
    <PageWrapper withBottomNav={false} className="bg-sky-light/30">
      <div className="p-4 h-screen flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.push('/games')}
            className="p-2 bg-white rounded-full shadow-sm mr-4"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-black text-sky-800">لعبة الوضوء</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 pb-4">
          <WudhuGame />
        </div>
      </div>
    </PageWrapper>
  );
}
