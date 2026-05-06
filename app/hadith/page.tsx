'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, BookText } from 'lucide-react';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Hadith {
  hadithnumber: number;
  arabicnumber: number;
  text: string;
}

export default function HadithPage() {
  const router = useRouter();
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHadith() {
      try {
        // Fetching 40 Hadith Nawawi
        const response = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.json');
        const data = await response.json();
        setHadiths(data.hadiths);
      } catch (error) {
        console.error('Error fetching Hadith:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHadith();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
          الحديث النبوي الشريف
        </h1>
        <p className="text-gray-400 font-medium">الأربعون النووية للإمام النووي</p>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-12"><LoadingSpinner size={48} /></div>
        ) : (
          hadiths.map((hadith) => (
            <div key={hadith.hadithnumber} className="bg-[#1e2329] p-8 rounded-3xl shadow-sm border border-[#2d3748] relative group hover:border-blue-500/50 transition-all">
              <div className="absolute top-6 left-6 bg-blue-500/10 text-blue-400 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl border border-blue-500/20">
                {hadith.hadithnumber}
              </div>
              <BookText className="w-10 h-10 text-blue-500/30 mb-6" />
              <p className="text-2xl md:text-3xl leading-relaxed md:leading-[3] text-gray-100 font-arabic text-right">
                {hadith.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
