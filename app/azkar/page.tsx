'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Zikr {
  category: string;
  count: string;
  description: string;
  reference: string;
  content: string;
}

export default function AzkarPage() {
  const router = useRouter();
  const [azkarData, setAzkarData] = useState<Record<string, Zikr[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchAzkar() {
      try {
        const response = await fetch('/data/azkar.json');
        const data = await response.json();
        setAzkarData(data);
      } catch (error) {
        console.error('Error fetching Azkar:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAzkar();
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCounts({});
  };

  const incrementCount = (index: number, maxCount: number) => {
    setCounts(prev => {
      const current = prev[index] || 0;
      if (current < maxCount) {
        return { ...prev, [index]: current + 1 };
      }
      return prev;
    });
  };

  return (
    <div className="p-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
            حصن المسلم (الأذكار)
          </h1>
          <p className="text-gray-400 font-medium">{selectedCategory || 'اختر من الأذكار والأدعية اليومية'}</p>
        </div>
        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            className="px-6 py-2 bg-[#2d3748] text-gray-200 rounded-xl hover:bg-[#364052] transition-all flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
            <span>العودة للتصنيفات</span>
          </button>
        )}
      </header>

      <div className="pb-12">
        {loading ? (
          <div className="flex justify-center p-12"><LoadingSpinner size={48} /></div>
        ) : !selectedCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(azkarData).map((category) => (
              <div 
                key={category} 
                onClick={() => handleCategorySelect(category)}
                className="bg-[#1e2329] rounded-2xl p-6 flex items-center justify-between border border-[#2d3748] hover:border-purple-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-200 group-hover:text-white">{category}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {azkarData[selectedCategory]
              .filter(zikr => zikr.content && zikr.content.trim() !== '')
              .map((zikr, index) => {
                const maxCount = parseInt(zikr.count) || 1;
              const currentCount = counts[index] || 0;
              const isDone = currentCount >= maxCount;

              return (
                <div 
                  key={index} 
                  className={`p-8 rounded-[2rem] shadow-sm border transition-all duration-300 ${
                    isDone ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-[#1e2329] border-[#2d3748]'
                  }`}
                >
                  <p className="text-2xl md:text-3xl leading-relaxed md:leading-[3] text-gray-100 font-arabic text-right mb-6">
                    {zikr.content}
                  </p>
                  {zikr.description && (
                    <p className="text-sm text-gray-400 mb-6 bg-[#252b36] p-4 rounded-xl border-r-4 border-purple-500/50">{zikr.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2d3748]">
                    <button
                      onClick={() => incrementCount(index, maxCount)}
                      disabled={isDone}
                      className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                        isDone 
                          ? 'bg-emerald-500/10 text-emerald-400 cursor-default border border-emerald-500/20' 
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 active:scale-95'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : null}
                      {isDone ? 'تم الذكر بنجاح' : 'اضغط للعد'}
                    </button>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 mb-1">العدد المطلوب</span>
                      <div className="text-2xl font-black font-sans flex items-center gap-2">
                        <span className={isDone ? 'text-emerald-400' : 'text-purple-400'}>{currentCount}</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-gray-300">{maxCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
