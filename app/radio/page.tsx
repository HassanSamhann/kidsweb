'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio as RadioIcon, Tv, Loader2, Wifi } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RadioStation {
  id: number;
  name: string;
  url: string;
  tag?: string;
}

// ─── Stations from mp3quran.net API (pre-fetched & curated) ──────────────────
const FEATURED_STATIONS: RadioStation[] = [
  { id: 109082, name: 'إذاعة القرآن الكريم السعودية', url: 'https://stream.radiojar.com/0tpy1h0kxtzuv', tag: 'مباشر' },
  { id: 108, name: 'الإذاعة العامة - تلاوات متنوعة', url: 'https://backup.qurango.net/radio/mix', tag: 'متنوع' },
  { id: 79, name: 'مشاري العفاسي', url: 'https://backup.qurango.net/radio/mishary_alafasi' },
  { id: 33, name: 'عبدالرحمن السديس', url: 'https://backup.qurango.net/radio/abdulrahman_alsudaes' },
  { id: 63, name: 'ماهر المعيقلي', url: 'https://backup.qurango.net/radio/maher' },
  { id: 2, name: 'أبو بكر الشاطري', url: 'https://backup.qurango.net/radio/shaik_abu_bakr_al_shatri' },
  { id: 30, name: 'عبدالباسط عبدالصمد', url: 'https://backup.qurango.net/radio/abdulbasit_abdulsamad' },
  { id: 74, name: 'محمود خليل الحصري', url: 'https://backup.qurango.net/radio/mahmoud_khalil_alhussary' },
  { id: 69, name: 'محمد صديق المنشاوي', url: 'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi' },
  { id: 58, name: 'ناصر القطامي', url: 'https://backup.qurango.net/radio/nasser_alqatami' },
  { id: 56, name: 'هاني الرفاعي', url: 'https://backup.qurango.net/radio/hani_arrifai' },
  { id: 109, name: 'إذاعة تلاوات خاشعة', url: 'https://backup.qurango.net/radio/salma', tag: 'خاشعة' },
  { id: 115, name: 'سورة البقرة - جماعة من القراء', url: 'https://backup.qurango.net/radio/albaqarah' },
  { id: 10906, name: 'أذكار الصباح', url: 'https://backup.qurango.net/radio/athkar_sabah', tag: 'أذكار' },
  { id: 10907, name: 'أذكار المساء', url: 'https://backup.qurango.net/radio/athkar_masa', tag: 'أذكار' },
  { id: 114, name: 'إذاعة الرقية الشرعية', url: 'https://backup.qurango.net/radio/roqiah' },
  { id: 116, name: 'تفسير القرآن الكريم', url: 'https://backup.qurango.net/radio/tafseer', tag: 'تفسير' },
];

// ─── Live TV embed ────────────────────────────────────────────────────────────
const LIVE_TV = [
  { id: 'makkah', name: 'قناة القرآن الكريم - مكة المكرمة', embedId: 'jJ1vZnzOgQY', live: true },
  { id: 'madinah', name: 'إذاعة القرآن الكريم - المدينة المنورة', embedId: 'xQQO7mHsF74', live: true },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RadioPage() {
  const [activeTab, setActiveTab] = useState<'radio' | 'tv'>('radio');
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTV, setSelectedTV] = useState(LIVE_TV[0]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const playStation = useCallback((station: RadioStation) => {
    // Stop current
    stopAudio();
    setError(null);

    if (currentStation?.id === station.id && isPlaying) {
      setCurrentStation(null);
      return;
    }

    setCurrentStation(station);
    setIsLoading(true);

    const audio = new Audio(station.url);
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    audio.addEventListener('playing', () => {
      setIsPlaying(true);
      setIsLoading(false);
    });
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('error', () => {
      setError(`تعذّر تشغيل "${station.name}" — جرّب إذاعة أخرى`);
      setIsPlaying(false);
      setIsLoading(false);
    });
    audio.addEventListener('ended', () => { setIsPlaying(false); setIsLoading(false); });

    audio.play().catch(() => {
      setError(`تعذّر تشغيل "${station.name}"`);
      setIsPlaying(false);
      setIsLoading(false);
    });
  }, [currentStation, isPlaying, volume, isMuted, stopAudio]);

  const toggleCurrentStation = () => {
    if (!currentStation) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stopAudio(), [stopAudio]);

  const tagColors: Record<string, string> = {
    'مباشر': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'متنوع': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'أذكار': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'تفسير': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'خاشعة': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-3">
          <div className="w-2 h-8 bg-emerald-500 rounded-full" />
          إذاعة القرآن الكريم
        </h1>
        <p className="text-gray-400">بث مباشر لإذاعات القرآن الكريم والتلاوات العطرة</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#1a1f25] p-1 rounded-2xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('radio')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'radio' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
        >
          <RadioIcon className="w-4 h-4" />
          الإذاعات الصوتية
        </button>
        <button
          onClick={() => { setActiveTab('tv'); stopAudio(); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'tv' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-400 hover:text-white'}`}
        >
          <Tv className="w-4 h-4" />
          البث المرئي
        </button>
      </div>

      {/* ── RADIO TAB ────────────────────────────────────────────────── */}
      {activeTab === 'radio' && (
        <div className="space-y-6">
          {/* Now Playing bar */}
          {currentStation && (
            <div className="bg-gradient-to-l from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLoading ? 'bg-yellow-500/20' : isPlaying ? 'bg-emerald-500/20 animate-pulse' : 'bg-gray-500/20'}`}>
                  {isLoading ? <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" /> : isPlaying ? <Wifi className="w-6 h-6 text-emerald-400" /> : <RadioIcon className="w-6 h-6 text-gray-400" />}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{isLoading ? 'جاري التحميل...' : isPlaying ? 'يُبث الآن' : 'متوقف'}</p>
                  <p className="text-white font-bold">{currentStation.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Volume */}
                <button onClick={() => setIsMuted(m => !m)} className="text-gray-400 hover:text-white transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={e => setVolume(+e.target.value)}
                  className="w-24 h-1.5 accent-emerald-500 cursor-pointer"
                />
                {/* Play/Pause */}
                <button
                  onClick={toggleCurrentStation}
                  disabled={isLoading}
                  className="w-12 h-12 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 text-sm text-center">
              {error}
            </div>
          )}

          {/* Station Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURED_STATIONS.map(station => {
              const isActive = currentStation?.id === station.id;
              const isThisPlaying = isActive && isPlaying;
              const isThisLoading = isActive && isLoading;

              return (
                <button
                  key={station.id}
                  onClick={() => playStation(station)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-right transition-all duration-200 group ${isActive ? 'bg-emerald-600/10 border-emerald-500/40' : 'bg-[#1a1f25] border-white/5 hover:border-emerald-500/20 hover:bg-[#1e2530]'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isThisPlaying ? 'bg-emerald-500/20' : isThisLoading ? 'bg-yellow-500/20' : 'bg-white/5 group-hover:bg-emerald-500/10'}`}>
                    {isThisLoading
                      ? <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                      : isThisPlaying
                        ? <Pause className="w-4 h-4 text-emerald-400 fill-current" />
                        : <Play className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 fill-current ml-0.5 transition-colors" />
                    }
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className={`font-bold text-sm truncate ${isActive ? 'text-emerald-300' : 'text-white'}`}>{station.name}</p>
                    {station.tag && (
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border mt-1 ${tagColors[station.tag] ?? 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {station.tag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-600">مصدر الإذاعات: mp3quran.net — جميع الحقوق محفوظة لأصحابها</p>
        </div>
      )}

      {/* ── TV TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'tv' && (
        <div className="space-y-4">
          {/* Channel selector */}
          <div className="flex gap-2">
            {LIVE_TV.map(ch => (
              <button
                key={ch.id}
                onClick={() => setSelectedTV(ch)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedTV.id === ch.id ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-[#1a1f25] text-gray-400 border-white/5 hover:border-emerald-500/30 hover:text-white'}`}
              >
                {ch.name}
              </button>
            ))}
          </div>

          {/* Embed */}
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ paddingBottom: '56.25%' }}>
            <iframe
              key={selectedTV.id}
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${selectedTV.embedId}?autoplay=1&rel=0&modestbranding=1`}
              title={selectedTV.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <p className="text-center text-xs text-gray-600">البث المرئي مقدّم عبر قناة يوتيوب الرسمية</p>
        </div>
      )}
    </div>
  );
}
