import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export function SurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSurahs() {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        }
      } catch (error) {
        console.error('Error fetching Surahs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSurahs();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><LoadingSpinner size={48} /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {surahs.map((surah) => (
        <Link key={surah.number} href={`/quran/${surah.number}`}>
          <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold relative">
                <span className="text-sm">{surah.number}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 font-arabic">{surah.name}</h3>
                <p className="text-xs text-gray-500">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</p>
              </div>
            </div>
            <BookOpen className="w-5 h-5 text-gray-300" />
          </div>
        </Link>
      ))}
    </div>
  );
}
