'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sunrise, Sunset, Moon, Sun, CloudSun, Clock, MapPin } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    gregorian: { date: string };
    hijri: {
      date: string;
      day: string;
      weekday: { ar: string };
      month: { ar: string };
      year: string;
    };
  };
}

const PRAYER_NAMES: Record<string, { ar: string; icon: React.ReactNode }> = {
  Fajr: { ar: 'الفجر', icon: <Moon className="w-5 h-5" /> },
  Sunrise: { ar: 'الشروق', icon: <Sunrise className="w-5 h-5" /> },
  Dhuhr: { ar: 'الظهر', icon: <Sun className="w-5 h-5" /> },
  Asr: { ar: 'العصر', icon: <CloudSun className="w-5 h-5" /> },
  Maghrib: { ar: 'المغرب', icon: <Sunset className="w-5 h-5" /> },
  Isha: { ar: 'العشاء', icon: <Moon className="w-5 h-5" /> },
};

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function getNextPrayer(timings: PrayerTimings): { key: string; index: number } | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < PRAYER_ORDER.length; i++) {
    const key = PRAYER_ORDER[i];
    const [h, m] = timings[key as keyof PrayerTimings].split(':').map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      return { key, index: i };
    }
  }
  return null;
}

export default function PrayerPage() {
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [countdown, setCountdown] = useState('');
  const [city, setCity] = useState('Cairo');
  const [country] = useState('Egypt');

  const fetchTimings = useCallback(async (c: string) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(c)}&country=${country}&method=5`);
      const json = await res.json();
      if (json.code === 200) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching prayer times:', err);
    } finally {
      setLoading(false);
    }
  }, [country]);

  useEffect(() => {
    fetchTimings(city);
  }, [city, fetchTimings]);

  useEffect(() => {
    if (!data) return;
    const timings = data.timings;

    function update() {
      const np = getNextPrayer(timings);
      if (np) {
        setNextPrayer(np.key);
        const now = new Date();
        const [h, m] = timings[np.key as keyof PrayerTimings].split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, 0);
        const diff = target.getTime() - now.getTime();
        if (diff > 0) {
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setCountdown(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        } else {
          setCountdown('');
        }
      } else {
        setNextPrayer(null);
        setCountdown('');
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const timings = data?.timings;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
          مواقيت الصلاة
        </h1>
        <p className="text-gray-400 font-medium">مواقيت الصلاة حسب مدينة {city}</p>
      </header>

      {loading && !data ? (
        <div className="flex justify-center p-12"><LoadingSpinner size={48} /></div>
      ) : data ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Date & Location */}
          <div className="bg-[#1e2329] rounded-[2rem] p-6 border border-[#2d3748]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-xl">
                <MapPin className="w-4 h-4" />
                <span className="font-bold">{city}</span>
              </div>
              <div className="text-left">
                <p className="text-gray-300 font-bold">{data.date.gregorian.date}</p>
              </div>
            </div>
            <div className="text-center border-t border-[#2d3748] pt-4">
              <p className="text-2xl font-black text-white font-arabic">
                {data.date.hijri.weekday.ar}
              </p>
              <p className="text-gray-400 mt-1">
                {data.date.hijri.day} {data.date.hijri.month.ar} {data.date.hijri.year} هـ
              </p>
            </div>
          </div>

          {/* Next Prayer Countdown */}
          {nextPrayer && countdown && (
            <div className="bg-gradient-to-br from-amber-600/20 to-amber-700/10 rounded-[2rem] p-6 border border-amber-500/30 text-center">
              <p className="text-gray-400 text-sm mb-2">متبقي على صلاة {PRAYER_NAMES[nextPrayer]?.ar}</p>
              <p className="text-4xl font-black text-amber-400 font-sans tracking-widest" dir="ltr">{countdown}</p>
            </div>
          )}

          {/* Prayer Times List */}
          <div className="space-y-3">
            {PRAYER_ORDER.map((key) => {
              if (!timings) return null;
              const time = timings[key as keyof PrayerTimings];
              const isNext = key === nextPrayer;
              const prayer = PRAYER_NAMES[key];

              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    isNext
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : 'bg-[#1e2329] border-[#2d3748]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isNext ? 'bg-amber-500/20 text-amber-400' : 'bg-[#2d3748] text-gray-400'
                    }`}>
                      {prayer?.icon}
                    </div>
                    <span className={`font-bold text-lg ${
                      isNext ? 'text-amber-300' : 'text-gray-200'
                    }`}>
                      {prayer?.ar}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-black font-sans tracking-wide ${
                      isNext ? 'text-amber-400' : 'text-gray-100'
                    }`}>
                      {time}
                    </span>
                    {isNext && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-lg font-bold">
                        التالي
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center p-12 text-gray-400">
          <p>تعذر تحميل مواقيت الصلاة. تأكد من اتصالك بالإنترنت.</p>
        </div>
      )}
    </div>
  );
}
