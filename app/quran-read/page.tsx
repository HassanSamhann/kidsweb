'use client';

import React from 'react';
import { BookOpen, ChevronLeft, Search, Star } from 'lucide-react';
import { logActivity } from '../../lib/activity';

interface Surah {
  number: string;
  name: string;
}

interface Ayah {
  id: number;
  sura_no: number;
  aya_no: number;
  aya_text: string;
  page: number;
}

const SURAH_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/surah.json';
const HAFS_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Quran-json/hafs.json';

export default function QuranReadPage() {
  const [surahs, setSurahs] = React.useState<Surah[]>([]);
  const [allAyahs, setAllAyahs] = React.useState<Ayah[]>([]);
  const [selectedSurah, setSelectedSurah] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingAyahs, setLoadingAyahs] = React.useState(false);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    fetch(SURAH_API)
      .then(r => r.json())
      .then(data => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectSurah = async (suraNo: number) => {
    setSelectedSurah(suraNo);
    loggedQuranRef.current = false;
    if (allAyahs.length > 0) return;
    
    setLoadingAyahs(true);
    try {
      const res = await fetch(HAFS_API);
      const data: Ayah[] = await res.json();
      setAllAyahs(data);
    } catch (e) {
      console.error('Failed to fetch Quran data', e);
    }
    setLoadingAyahs(false);
  };

  const goToSurah = (suraNo: number) => {
    setSelectedSurah(suraNo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSurahs = surahs.filter(s =>
    s.name.includes(search) || s.number.includes(search)
  );

  const loggedQuranRef = React.useRef(false);
  React.useEffect(() => {
    if (selectedSurah && allAyahs.length > 0 && !loggedQuranRef.current) {
      loggedQuranRef.current = true;
      logActivity('quran_read', { surah_id: selectedSurah });
    }
  }, [selectedSurah, allAyahs]);

  const currentSurahAyat = allAyahs.filter(a => a.sura_no === selectedSurah);
  const currentSurah = surahs.find(s => Number(s.number) === selectedSurah);
  const currentIndex = surahs.findIndex(s => Number(s.number) === selectedSurah);

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">جاري التحميل...</div>
    );
  }

  return (
    <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">القرآن الكريم</h1>
            <p className="text-[var(--text-secondary)]">اقرأ وتمعن في آيات الله</p>
          </div>
        </div>

        {selectedSurah && currentSurah ? (
          /* Ayah View */
          <div>
            <button
              onClick={() => setSelectedSurah(null)}
              className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>العودة إلى قائمة السور</span>
            </button>

            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 md:p-10 mb-6">
              <h2 className="text-3xl font-black text-center text-[var(--text-primary)] mb-2">
                {currentSurah.name}
              </h2>
              <p className="text-center text-[var(--text-muted)] text-sm">
                سورة رقم {currentSurah.number} ({currentSurahAyat.length} آية)
              </p>
            </div>

            {loadingAyahs ? (
              <div className="text-center text-[var(--text-muted)] py-12">جاري تحميل الآيات...</div>
            ) : (
              <div className="space-y-4">
                {currentSurahAyat.map((ayah) => (
                  <div
                    key={ayah.id}
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-500/20">
                        {ayah.aya_no}
                      </span>
                      <p className="text-2xl md:text-3xl leading-[2.2] text-[var(--text-primary)] font-arabic flex-1 text-right">
                        {ayah.aya_text}
                      </p>
                    </div>
                    <div className="mt-3 text-xs text-[var(--text-muted)] text-left">
                      صفحة {ayah.page}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => goToSurah(surahs[currentIndex - 1] ? Number(surahs[currentIndex - 1].number) : 1)}
                disabled={currentIndex <= 0}
                className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← {surahs[currentIndex - 1]?.name || ''}
              </button>
              <button
                onClick={() => goToSurah(surahs[currentIndex + 1] ? Number(surahs[currentIndex + 1].number) : 114)}
                disabled={currentIndex >= surahs.length - 1}
                className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {surahs[currentIndex + 1]?.name || ''} →
              </button>
            </div>
          </div>
        ) : (
          /* Surah List */
          <>
            <div className="relative max-w-md mb-8">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="ابحث عن سورة..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-full py-3 pr-12 pl-6 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => selectSurah(Number(surah.number))}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 text-center hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold mx-auto mb-2 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                    {surah.number}
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{surah.name}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
  );
}
