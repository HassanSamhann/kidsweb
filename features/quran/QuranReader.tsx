import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export function QuranReader({ surahId }: { surahId: string }) {
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function fetchSurah() {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
        const data = await response.json();
        if (data.code === 200) {
          setSurah(data.data);
        }
      } catch (error) {
        console.error('Error fetching Surah:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSurah();
  }, [surahId]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const paddedId = surahId.padStart(3, '0');
  // Mishary Alafasy from mp3quran
  const audioUrl = `https://server8.mp3quran.net/afs/${paddedId}.mp3`;

  if (loading) return <div className="flex justify-center p-12"><LoadingSpinner size={48} /></div>;
  if (!surah) return <div className="text-center p-8">لم يتم العثور على السورة</div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header and Player */}
      <div className="bg-emerald-50 p-6 border-b border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-right">
          <h2 className="text-3xl font-black text-emerald-800 font-arabic mb-2">{surah.name}</h2>
          <p className="text-emerald-600 text-sm">{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-emerald-100">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <div className="px-4 flex items-center gap-2 text-emerald-700">
            <Volume2 className="w-5 h-5" />
            <span className="text-sm font-bold">مشاري العفاسي</span>
          </div>
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        </div>
      </div>

      {/* Reader Content */}
      <div className="p-6 md:p-12 text-center" dir="rtl">
        {surah.number !== 1 && surah.number !== 9 && (
          <div className="mb-8 font-arabic text-2xl md:text-3xl text-gray-800">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
        )}
        
        <div className="leading-[3.5] md:leading-[4]">
          {surah.ayahs.map((ayah, index) => {
            // Remove Bismillah from the first ayah text if it's not Al-Fatiha
            let text = ayah.text;
            if (index === 0 && surah.number !== 1 && text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
              text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
            }
            
            return (
              <React.Fragment key={ayah.number}>
                <span className="text-xl md:text-3xl font-arabic text-gray-800">{text}</span>
                <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-emerald-200 mx-2 text-emerald-600 text-xs md:text-sm font-bold">
                  {ayah.numberInSurah}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
