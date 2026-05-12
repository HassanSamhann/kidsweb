'use client';

import React from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Search, RotateCcw, Bookmark } from 'lucide-react';
import { logActivity, saveQuranProgress, getQuranProgress } from '../../lib/activity';
import { cleanAyahText } from '../../lib/quran-clean';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
}

const SURAH_API = 'https://api.alquran.cloud/v1/surah';
const SURAH_AYAHS_API = 'https://api.alquran.cloud/v1/surah';

export default function QuranReadPage() {
  const [surahs, setSurahs] = React.useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = React.useState<number | null>(null);
  const [ayahs, setAyahs] = React.useState<Ayah[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingAyahs, setLoadingAyahs] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [lastProgress, setLastProgress] = React.useState<{ surah: number; page?: number; ayah?: number } | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(0);

  // Group ayahs by page
  const pages = React.useMemo(() => {
    const map = new Map<number, Ayah[]>();
    for (const a of ayahs) {
      const arr = map.get(a.page) || [];
      arr.push(a);
      map.set(a.page, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [ayahs]);

  const totalPages = pages.length;
  const pageIndex = currentPage;

  React.useEffect(() => {
    fetch(SURAH_API)
      .then(r => r.json())
      .then(data => {
        setSurahs(data.data || []);
        setLoading(false);
        setLastProgress(getQuranProgress());
      })
      .catch(() => setLoading(false));
  }, []);

  const selectSurah = async (suraNo: number, targetPage: number | undefined = undefined, targetAya: number | undefined = undefined) => {
    setSelectedSurah(suraNo);
    setCurrentPage(0);
    loggedQuranRef.current = false;

    setLoadingAyahs(true);
    try {
      const res = await fetch(`${SURAH_AYAHS_API}/${suraNo}/quran-uthmani`);
      const json = await res.json();
      const ayahsData: Ayah[] = json.data?.ayahs || [];
      setAyahs(ayahsData);

      // Determine which page to show
      if (targetPage && targetAya) {
        // Find the page containing this ayah
        const page = ayahsData.find(a => a.numberInSurah === targetAya)?.page || 1;
        const pIdx = [...new Set(ayahsData.map(a => a.page))].sort((a, b) => a - b).indexOf(page);
        setCurrentPage(Math.max(0, pIdx));
      }
    } catch (e) {
      console.error('Failed to fetch surah ayahs', e);
    }
    setLoadingAyahs(false);
  };

  const goToPage = (idx: number) => {
    if (idx >= 0 && idx < totalPages) {
      setCurrentPage(idx);
      const [pn] = pages[idx];
      if (selectedSurah) {
        saveQuranProgress(selectedSurah, undefined, pn);
        setLastProgress(prev => ({ surah: selectedSurah, page: pn, ayah: prev?.ayah }));
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredSurahs = surahs.filter(s =>
    s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase()) || String(s.number).includes(search)
  );

  const loggedQuranRef = React.useRef(false);
  React.useEffect(() => {
    if (selectedSurah && ayahs.length > 0 && !loggedQuranRef.current) {
      loggedQuranRef.current = true;
      logActivity('quran_read', { surah_id: selectedSurah });
    }
  }, [selectedSurah, ayahs]);

  const currentSurah = surahs.find(s => s.number === selectedSurah);
  const currentIndex = surahs.findIndex(s => s.number === selectedSurah);

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
            onClick={() => { setSelectedSurah(null); setAyahs([]); setCurrentPage(0); }}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
            <span>العودة إلى قائمة السور</span>
          </button>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 md:p-10 mb-6">
            <h2 className="text-3xl font-black text-center text-[var(--text-primary)] mb-2">
              {currentSurah.name}
            </h2>
            <p className="text-center text-[var(--text-muted)] text-sm">
              سورة رقم {currentSurah.number} ({currentSurah.numberOfAyahs} آية)
            </p>
            {totalPages > 1 && (
              <p className="text-center text-[var(--text-muted)] text-xs mt-1">
                الصفحة {pages[pageIndex]?.[1]?.[0]?.page || '-'} من {pages[totalPages - 1]?.[1]?.[0]?.page || '-'}
              </p>
            )}
          </div>

          {loadingAyahs ? (
            <div className="text-center text-[var(--text-muted)] py-12">جاري تحميل الآيات...</div>
          ) : pages.length > 0 ? (
            <div>
              {/* Page content */}
              {(() => {
                const entry = pages[pageIndex];
                const pageNum = entry ? entry[0] : 0;
                const pageAyahs = entry ? entry[1] : [];
                return (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 md:p-10 mb-4">
                  <div className="text-center mb-6 pb-4 border-b border-[var(--border-color)]">
                    <span className="text-sm text-[var(--text-muted)]">صفحة {pageNum}</span>
                  </div>

                  <div className="leading-[2.2] text-[var(--text-primary)] font-arabic text-right">
                    {pageAyahs.map((ayah, ai) => (
                      <React.Fragment key={ayah.number}>
                        {ai > 0 && ' '}
                        <span
                          id={`aya-${ayah.numberInSurah}`}
                          className="group relative"
                        >
                          <span className="text-xl md:text-2xl align-middle">{cleanAyahText(ayah.text)}</span>
                          <span className="text-xs md:text-sm text-[var(--text-muted)] mx-1 align-middle" style={{ fontFamily: 'serif' }}>﴿{ayah.numberInSurah}﴾</span>
                          <button
                            onClick={() => {
                              saveQuranProgress(selectedSurah!, ayah.numberInSurah, ayah.page);
                              setLastProgress({ surah: selectedSurah!, page: ayah.page, ayah: ayah.numberInSurah });
                            }}
                            className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-cyan-400 hover:text-cyan-300 hover:bg-[var(--bg-card)] rounded-lg"
                            title="تعليم到这里"
                          >
                            <Bookmark className="w-3 h-3" />
                          </button>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="text-center mt-6 pt-4 border-t border-[var(--border-color)]">
                    <span className="text-sm text-[var(--text-muted)]">
                      {currentSurah.name} — صفحة {pageNum}
                    </span>
                  </div>
                </div>
                );
              })()}

              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mb-6">
                  <button
                    onClick={() => goToPage(pageIndex - 1)}
                    disabled={pageIndex <= 0}
                    className="flex items-center gap-1 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابقة</span>
                  </button>
                  <span className="text-sm text-[var(--text-muted)]">
                    {pageIndex + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(pageIndex + 1)}
                    disabled={pageIndex >= totalPages - 1}
                    className="flex items-center gap-1 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    <span>التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Surah Navigation */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    const prev = surahs[currentIndex - 1];
                    if (prev) selectSurah(prev.number);
                  }}
                  disabled={currentIndex <= 0}
                  className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  ← {surahs[currentIndex - 1]?.name || ''}
                </button>
                <button
                  onClick={() => {
                    const next = surahs[currentIndex + 1];
                    if (next) selectSurah(next.number);
                  }}
                  disabled={currentIndex >= surahs.length - 1}
                  className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {surahs[currentIndex + 1]?.name || ''} →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-[var(--text-muted)] py-12">لا توجد آيات</div>
          )}
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

          {/* Resume last reading */}
          {lastProgress && !search && (
            <div className="mb-6">
              <button
                onClick={() => selectSurah(lastProgress.surah, lastProgress.page, lastProgress.ayah)}
                className="w-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/30 rounded-2xl p-4 text-center hover:border-cyan-500/50 transition-all group"
              >
                <div className="flex items-center justify-center gap-3">
                  <RotateCcw className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-cyan-400 font-bold">تابع القراءة</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {surahs.find(s => s.number === lastProgress.surah)?.name || `سورة ${lastProgress.surah}`}
                      {lastProgress.ayah ? ` - آية ${lastProgress.ayah}` : ''}
                      {lastProgress.page ? ` (صفحة ${lastProgress.page})` : ''}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredSurahs.map((surah) => (
              <button
                key={surah.number}
                onClick={() => selectSurah(surah.number)}
                className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 text-center hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 group ${
                  surah.number === lastProgress?.surah ? 'ring-2 ring-cyan-500/50 border-cyan-500/30' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold mx-auto mb-2 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                  {surah.number}
                </div>
                <p className="text-sm font-bold text-[var(--text-primary)]">{surah.name}</p>
                {surah.number === lastProgress?.surah && (
                  <p className="text-[10px] text-cyan-400 mt-1">
                    {lastProgress.ayah ? `آية ${lastProgress.ayah}` : 'آخر قراءة'}
                  </p>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
