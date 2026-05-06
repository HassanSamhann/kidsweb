'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { PageWrapper } from '../../../components/ui/PageWrapper';
import { QuranReader } from '../../../features/quran/QuranReader';

export default function SingleSurahPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  return (
    <PageWrapper withBottomNav={false} className="bg-sky-light/20">
      <div className="p-4 flex flex-col h-full max-h-screen">
        <header className="flex items-center mb-6 shrink-0">
          <button 
            onClick={() => router.push('/quran')}
            className="p-2 bg-white rounded-full shadow-sm mr-4 hover:bg-gray-50"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-emerald-800">القرآن الكريم</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-8">
          <QuranReader surahId={id} />
        </div>
      </div>
    </PageWrapper>
  );
}
