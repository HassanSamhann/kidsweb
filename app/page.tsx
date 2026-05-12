'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, BookText, HeartHandshake, Smile, Clock, Star, BookMarked, Swords } from 'lucide-react';
import { PageWrapper } from '../components/ui/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import { cleanAyahText, cleanTafseerText } from '../lib/quran-clean';

const TEXT_TAFSEER_BASE = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Quran-Data/Tafseer/tfseer_mokhtser';
const SURAH_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/surah.json';
const HADITH_API = 'https://raw.githubusercontent.com/fawazahmed0/hadith-api/master/editions/ara-nawawi.min.json';

export default function Home() {
  const { user } = useAuth();
  const [ayahOfDay, setAyahOfDay] = React.useState<{ text: string; sura: string; aya: number } | null>(null);
  const [tafseerText, setTafseerText] = React.useState<string | null>(null);
  const [hadithOfDay, setHadithOfDay] = React.useState<{ text: string; number: number } | null>(null);
  const [showAyah, setShowAyah] = React.useState(true);
  const fetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const today = new Date().toDateString();

    // --- Ayah of the day ---
    const cached = localStorage.getItem('home_ayah');
    if (cached) try {
      const p = JSON.parse(cached);
      if (p.date === today) {
        setAyahOfDay(p.data.ayah);
        setTafseerText(p.data.tafseer);
      }
    } catch {}

    // Always try to refresh in background, avoid stale cache
    fetch(SURAH_API).then(r => r.json()).then(surahs => {
      const tryAyah = (attempt = 0): Promise<void> => {
        if (attempt > 20) return Promise.resolve(); // give up after 20 tries
        const suraNo = ((new Date().getDate() + attempt * 7) % 114) + 1;
        const ayaNo = ((new Date().getDate() + attempt * 13) % 286) + 1;
        return fetch(`${TEXT_TAFSEER_BASE}/${suraNo}.json`)
          .then(r => r.json())
          .then((tafseerData: any[]) => {
            if (!Array.isArray(tafseerData)) return tryAyah(attempt + 1);
            const match = tafseerData.find((t: any) => t.t_verse_number === ayaNo);
            if (!match) return tryAyah(attempt + 1);
            const suraName = surahs.find((s: any) => Number(s.number) === suraNo)?.name || match.t_name_arabic || '';
            const ayahData = { text: match.text_uthmani, sura: suraName, aya: ayaNo };
            const tafseer = match.tafseer || null;
            setAyahOfDay(ayahData);
            setTafseerText(tafseer);
            localStorage.setItem('home_ayah', JSON.stringify({ date: today, data: { ayah: ayahData, tafseer } }));
          })
          .catch(() => tryAyah(attempt + 1));
      };
      tryAyah();
    }).catch(() => {});

    // --- Hadith of the day ---
    const hadCached = localStorage.getItem('home_hadith');
    if (hadCached) try {
      const p = JSON.parse(hadCached);
      if (p.date === today) { setHadithOfDay(p.data); }
    } catch {}

    fetch(HADITH_API).then(r => r.json()).then((data: any) => {
      const hadiths = data?.hadiths || [];
      if (hadiths.length === 0) return;
      const idx = (new Date().getDate() + new Date().getMonth()) % hadiths.length;
      const h = hadiths[idx];
      if (h?.text) {
        const hData = { text: h.text, number: h.hadithnumber || idx };
        setHadithOfDay(hData);
        localStorage.setItem('home_hadith', JSON.stringify({ date: today, data: hData }));
      }
    }).catch(() => {});
  }, []);

  const portals = [
    {
      title: 'التحدي',
      description: 'تنافس مع الآخرين في الأسئلة الإسلامية واربح النجوم',
      href: '/challenge',
      icon: Swords,
      color: 'text-amber-400 bg-amber-500/10',
      borderColor: 'hover:border-amber-500/50',
      isNew: true,
    },
    {
      title: 'القرآن الكريم',
      description: 'تلاوات خاشعة بأصوات كبار القراء',
      href: '/quran',
      icon: BookOpen,
      color: 'text-emerald-400 bg-emerald-500/10',
      borderColor: 'hover:border-emerald-500/50'
    },
    {
      title: 'قراءة القرآن',
      description: 'اقرأ القرآن الكريم مكتوباً بالرسم العثماني',
      href: '/quran-read',
      icon: BookMarked,
      color: 'text-green-400 bg-green-500/10',
      borderColor: 'hover:border-green-500/50'
    },
    {
      title: 'الحديث النبوي',
      description: 'موسوعة الأحاديث النبوية الشريفة',
      href: '/hadith',
      icon: BookText,
      color: 'text-blue-400 bg-blue-500/10',
      borderColor: 'hover:border-blue-500/50'
    },
    {
      title: 'مواقيت الصلاة',
      description: 'أوقات الصلاة حسب مدينتك',
      href: '/prayer',
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10',
      borderColor: 'hover:border-amber-500/50'
    },
    {
      title: 'أسماء الله الحسنى',
      description: '99 اسماً لله تعالى مع معانيها',
      href: '/asmaa-allah',
      icon: Star,
      color: 'text-rose-400 bg-rose-500/10',
      borderColor: 'hover:border-rose-500/50'
    },
    {
      title: 'حصن المسلم',
      description: 'أذكار الصباح والمساء والأدعية',
      href: '/azkar',
      icon: HeartHandshake,
      color: 'text-purple-400 bg-purple-500/10',
      borderColor: 'hover:border-purple-500/50'
    },
    {
      title: 'ركن الأطفال',
      description: 'قصص، ألعاب، وتلوين ممتع ومفيد',
      href: '/stories',
      icon: Smile,
      color: 'text-orange-400 bg-orange-500/10',
      borderColor: 'hover:border-orange-500/50'
    }
  ];

  return (
    <PageWrapper>
      <div className="p-8">
        {/* Toggle between Ayah & Hadith */}
        {ayahOfDay && hadithOfDay && (
          <div className="flex gap-2 mb-6 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] w-fit mx-auto">
            <button
              onClick={() => setShowAyah(true)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                showAyah
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              آية اليوم
            </button>
            <button
              onClick={() => setShowAyah(false)}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                !showAyah
                  ? 'bg-blue-500/10 text-blue-400 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              حديث اليوم
            </button>
          </div>
        )}

        {/* Ayah of the Day */}
        {showAyah && ayahOfDay && (
          <div className="mb-12 bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border border-emerald-500/20 rounded-[2rem] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_70%)]" />
            <div className="relative z-10">
              <p className="text-xs text-emerald-400/70 uppercase tracking-widest mb-2 font-bold">آية اليوم</p>
              <p className="text-2xl md:text-3xl leading-[2.2] text-white mb-4 font-arabic">
                {cleanAyahText(ayahOfDay.text)}
              </p>
              <p className="text-emerald-400/80 text-sm mb-4">
                {ayahOfDay.sura} - الآية {ayahOfDay.aya}
              </p>
              {tafseerText && (
                <div className="border-t border-emerald-500/20 pt-4 mt-2">
                  <p className="text-xs text-emerald-400/60 mb-2">التفسير المختصر:</p>
                  <p className="text-sm text-emerald-200/80 leading-relaxed text-right">
                    {cleanTafseerText(tafseerText).split('<br />').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hadith of the Day */}
        {!showAyah && hadithOfDay && (
          <div className="mb-12 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-[2rem] p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]" />
            <div className="relative z-10">
              <p className="text-xs text-blue-400/70 uppercase tracking-widest mb-2 font-bold">حديث اليوم</p>
              <p className="text-xl md:text-2xl leading-[2] text-white mb-4 font-arabic">
                {hadithOfDay.text}
              </p>
              <p className="text-blue-400/80 text-sm">
                الحديث رقم {hadithOfDay.number} - الأربعون النووية
              </p>
            </div>
          </div>
        )}

        <header className="mb-12">
          <h1 className="text-4xl font-black text-[var(--text-primary)] mb-3">أهلاً بك في منصة إسلامي</h1>
          <p className="text-[var(--text-secondary)] text-lg">بوابتك الشاملة للتعلم والعبادة</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isKidsCorner = portal.title === 'ركن الأطفال';
            const isNew = portal.isNew;
            
            return (
              <Link key={portal.href} href={portal.href}>
                <div className={`flex items-center p-8 rounded-[2rem] cursor-pointer transition-all duration-300 transform hover:-translate-y-2 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl ${portal.borderColor} relative overflow-hidden group`}>
                  {isNew && (
                    <div className="absolute top-4 left-4 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30 backdrop-blur-sm z-10">
                      جديد
                    </div>
                  )}
                  {isKidsCorner && (
                    <div className="absolute top-4 left-4 bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30 backdrop-blur-sm z-10">
                      جاري التحديث
                    </div>
                  )}
                  <div className={`p-5 rounded-2xl ml-6 ${portal.color}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2 font-arabic">{portal.title}</h2>
                    <p className="text-[var(--text-secondary)] text-sm font-medium leading-relaxed">{portal.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
