'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, HeartHandshake, CheckCircle2, Star, RotateCcw } from 'lucide-react';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { logActivity, isAzkarDoneToday, markAzkarDoneToday, saveAzkarProgress, getAzkarProgress, type ActivityType } from '../../lib/activity';
import { playAzkarCompleteSound, playClickSound } from '../../lib/sounds';

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
  const [rewardStars, setRewardStars] = useState(0);

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
    playClickSound();
    setSelectedCategory(category);
    setCounts({});
    setRemoving({});
    hasLoggedRef.current = false;

    // Restore saved progress
    const saved = getAzkarProgress(category);
    const restored: Record<number, boolean> = {};
    saved.forEach(i => { restored[i] = true; });
    setRemoved(restored);
  };

  const categoryAzkar = selectedCategory ? azkarData[selectedCategory]?.filter(z => z.content && z.content.trim() !== '') : [];
  const allRemoved = categoryAzkar.length > 0 && categoryAzkar.every((_, i) => removed[i]);

  // Save progress whenever removed changes
  useEffect(() => {
    if (selectedCategory) {
      const doneIndices = Object.entries(removed)
        .filter(([, v]) => v)
        .map(([k]) => parseInt(k));
      saveAzkarProgress(selectedCategory, doneIndices);
    }
  }, [removed, selectedCategory]);

  const categoryToType = (cat: string): ActivityType | null => {
    if (cat.includes('الصباح')) return 'azkar_morning';
    if (cat.includes('المساء')) return 'azkar_evening';
    if (cat.includes('بعد السلام')) return 'azkar_after_salah';
    if (cat.includes('تسابيح')) return 'azkar_tasabih';
    if (cat.includes('النوم')) return 'azkar_sleep';
    if (cat.includes('الاستيقاظ')) return 'azkar_wakeup';
    if (cat.includes('أدعية قرآنية')) return 'azkar_dua_quran';
    if (cat.includes('أدعية الأنبياء')) return 'azkar_dua_prophets';
    return null;
  };

  useEffect(() => {
    if (allRemoved && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      const type = selectedCategory ? categoryToType(selectedCategory) : null;

      if (type) {
        if (isAzkarDoneToday(type)) return;
        markAzkarDoneToday(type);
        playAzkarCompleteSound();
        logActivity(type, { category: selectedCategory }).then((res: any) => {
          const stars = res?.stars || 3;
          setRewardStars(stars);
          setShowReward(true);
          setTimeout(() => setShowReward(false), 3000);
        });
      }
    }
  }, [allRemoved, selectedCategory]);

  const resetCategory = () => {
    setCounts({});
    setRemoving({});
    setRemoved({});
    hasLoggedRef.current = false;
    if (selectedCategory) saveAzkarProgress(selectedCategory, []);
  };

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

  const doneToday = selectedCategory
    ? isAzkarDoneToday(categoryToType(selectedCategory) || 'azkar_morning')
    : false;

  return (
    <div className="p-8">
      {showReward && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 text-white px-6 py-3 rounded-full shadow-xl shadow-amber-500/30 animate-bounce-slow">
          <span className="flex items-center gap-2 font-bold">
            <Star className="w-5 h-5 fill-white" /> +{rewardStars} نجوم! أحسنت!
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
          <div className="flex gap-2">
            <button 
              onClick={resetCategory}
              className="px-4 py-2 bg-[#2d3748] text-gray-300 rounded-xl hover:bg-[#364052] transition-all flex items-center gap-2 text-sm"
              title="إعادة تعيين"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">إعادة</span>
            </button>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="px-6 py-2 bg-[#2d3748] text-gray-200 rounded-xl hover:bg-[#364052] transition-all flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5" />
              <span>العودة للتصنيفات</span>
            </button>
          </div>
        )}
      </header>

      <div className="pb-12">
        {loading ? (
          <div className="flex justify-center p-12"><LoadingSpinner size={48} /></div>
        ) : !selectedCategory ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(azkarData).map((category) => {
              const type = categoryToType(category);
              const doneTodayFlag = type ? isAzkarDoneToday(type) : false;
              return (
                <div 
                  key={category} 
                  onClick={() => handleCategorySelect(category)}
                  className="bg-[#1e2329] rounded-2xl p-6 flex items-center justify-between border border-[#2d3748] hover:border-purple-500/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      doneTodayFlag ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'
                    }`}>
                      {doneTodayFlag ? <CheckCircle2 className="w-6 h-6" /> : <HeartHandshake className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-200 group-hover:text-white flex items-center gap-2">
                        {category}
                        {doneTodayFlag && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">تم اليوم ✓</span>
                        )}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {doneToday && allRemoved && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-400 font-bold text-lg">أحسنت! أكملت أذكار اليوم ✓</p>
                <p className="text-emerald-400/60 text-sm mt-1">عد غداً لأذكار جديدة</p>
              </div>
            )}
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
