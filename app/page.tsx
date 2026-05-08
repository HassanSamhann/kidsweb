'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, BookText, HeartHandshake, Smile, Clock, Star, BookMarked } from 'lucide-react';
import { PageWrapper } from '../components/ui/PageWrapper';
import { useAuth } from '../hooks/useAuth';

const HAFS_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Quran-json/hafs.json';
const SURAH_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/surah.json';
const HADITH_API = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi.json';

export default function Home() {
  const { user } = useAuth();
  const [ayahOfDay, setAyahOfDay] = React.useState<{ text: string; sura: string; aya: number } | null>(null);
  const [tafseerText, setTafseerText] = React.useState<string | null>(null);
  const [hadithOfDay, setHadithOfDay] = React.useState<{ text: string; number: number } | null>(null);
  const [showAyah, setShowAyah] = React.useState(true);

  React.useEffect(() => {
    const today = new Date().toDateString();
    const seed = today.split(' ').join('').length * new Date().getDate();
    const suraNo = (seed % 114) + 1;
    const ayaNo = (seed % 286) + 1;

    const cached = localStorage.getItem('ayah_of_day_full');
    let validCache = false;
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === today && parsed.data.suraNo === suraNo) {
        setAyahOfDay(parsed.data.ayah);
        setTafseerText(parsed.data.tafseer);
        validCache = true;
      }
    }

    if (!validCache) {
      Promise.all([
        fetch(HAFS_API).then(r => r.json()),
        fetch(SURAH_API).then(r => r.json())
      ]).then(([ayahs, surahs]) => {
        const match = ayahs.find((a: any) => a.sura_no === suraNo && a.aya_no === ayaNo);
        if (match) {
          const ayahData = {
            text: match.aya_text,
            sura: surahs.find((s: any) => Number(s.number) === suraNo)?.name || '',
            aya: ayaNo
          };
          setAyahOfDay(ayahData);

          fetch(`https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Quran-Data/Tafseer/tfseer_mokhtser/${suraNo}.json`)
            .then(r => r.json())
            .then((tafseerData: any[]) => {
              const tafseer = tafseerData.find((t: any) => t.verse_id === ayaNo)?.tafseer || null;
              setTafseerText(tafseer);
              localStorage.setItem('ayah_of_day_full', JSON.stringify({ date: today, data: { ayah: ayahData, tafseer, suraNo } }));
            })
            .catch(() => {
              localStorage.setItem('ayah_of_day_full', JSON.stringify({ date: today, data: { ayah: ayahData, tafseer: null, suraNo } }));
            });
        }
      }).catch(() => {});
    }

    const cachedHadith = localStorage.getItem('hadith_of_day');
    let validHadithCache = false;
    if (cachedHadith) {
      const parsed = JSON.parse(cachedHadith);
      if (parsed.date === today) {
        setHadithOfDay(parsed.data);
        validHadithCache = true;
      }
    }

    if (!validHadithCache) {
      fetch(HADITH_API)
        .then(r => r.json())
        .then((data: { hadiths: { hadithnumber: number; text: string }[] }) => {
          const idx = new Date().getDate() % data.hadiths.length;
          const hadith = data.hadiths[idx];
          if (hadith) {
            const hadithData = { text: hadith.text, number: hadith.hadithnumber };
            setHadithOfDay(hadithData);
            localStorage.setItem('hadith_of_day', JSON.stringify({ date: today, data: hadithData }));
          }
        }).catch(() => {});
    }
  }, []);

  const portals = [
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
                {ayahOfDay.text}
              </p>
              <p className="text-emerald-400/80 text-sm mb-4">
                {ayahOfDay.sura} - الآية {ayahOfDay.aya}
              </p>
              {tafseerText && (
                <div className="border-t border-emerald-500/20 pt-4 mt-2">
                  <p className="text-xs text-emerald-400/60 mb-2">التفسير المختصر:</p>
                  <p className="text-sm text-emerald-200/80 leading-relaxed text-right">
                    {tafseerText.split('<br>').map((part, i, arr) => (
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
            
            return (
              <Link key={portal.href} href={portal.href}>
                <div className={`flex items-center p-8 rounded-[2rem] cursor-pointer transition-all duration-300 transform hover:-translate-y-2 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl ${portal.borderColor} relative overflow-hidden group`}>
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
