'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, HeartHandshake, CheckCircle2, Star } from 'lucide-react';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { logActivity } from '../../lib/activity';

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
  const [removing, setRemoving] = useState<Record<number, boolean>>({});
  const [removed, setRemoved] = useState<Record<number, boolean>>({});
  const [showReward, setShowReward] = useState(false);

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

  const hasLoggedRef = React.useRef(false);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCounts({});
    setRemoving({});
    setRemoved({});
    hasLoggedRef.current = false;
  };

  const categoryAzkar = selectedCategory ? azkarData[selectedCategory]?.filter(z => z.content && z.content.trim() !== '') : [];
  const allRemoved = categoryAzkar.length > 0 && categoryAzkar.every((_, i) => removed[i]);

  useEffect(() => {
    if (allRemoved && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      const type = selectedCategory?.includes('الصباح') ? 'azkar_morning' : 
                   selectedCategory?.includes('المساء') ? 'azkar_evening' : null;
      if (type) {
        logActivity(type, { category: selectedCategory }).then(() => {
          setShowReward(true);
          setTimeout(() => setShowReward(false), 3000);
        });
      }
    }
  }, [allRemoved, selectedCategory]);

  const incrementCount = useCallback((index: number, maxCount: number) => {
    setCounts(prev => {
      const current = prev[index] || 0;
      if (current < maxCount) {
        const next = current + 1;
        if (next >= maxCount) {
          setRemoving(r => ({ ...r, [index]: true }));
          setTimeout(() => {
            setRemoved(r => ({ ...r, [index]: true }));
          }, 500);
        }
        return { ...prev, [index]: next };
      }
      return prev;
    });
  }, []);

  return (
    <div className="p-8">
      {showReward && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-white px-6 py-3 rounded-full shadow-xl shadow-amber-500/30 animate-bounce-slow">
          <span className="flex items-center gap-2 font-bold">
            <Star className="w-5 h-5 fill-white" /> +5 نجوم! أحسنت!
          </span>
        </div>
      )}
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
                if (removed[index]) return null;
                const maxCount = parseInt(zikr.count) || 1;
              const currentCount = counts[index] || 0;
              const isDone = currentCount >= maxCount;
              const isRemoving = removing[index];

              return (
                <div 
                  key={index} 
                  onClick={() => !isDone && !isRemoving && incrementCount(index, maxCount)}
                  className={`cursor-pointer select-none p-8 rounded-[2rem] shadow-sm border transition-all duration-500 ${
                    isRemoving
                      ? 'opacity-0 scale-75 -translate-y-4 pointer-events-none'
                      : 'opacity-100 scale-100 translate-y-0 bg-[#1e2329] border-[#2d3748]'
                  }`}
                >
                  <p className="text-2xl md:text-3xl leading-relaxed md:leading-[3] text-gray-100 font-arabic text-right mb-6">
                    {zikr.content}
                  </p>
                  {zikr.description && (
                    <p className="text-sm text-gray-400 mb-6 bg-[#252b36] p-4 rounded-xl border-r-4 border-purple-500/50">{zikr.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2d3748]">
                    <div
                      className={`px-8 py-3 rounded-2xl font-bold flex items-center gap-2 ${
                        isDone 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : null}
                      {isDone ? 'تم الذكر بنجاح ✓' : 'اضغط للعد'}
                    </div>
                    
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
