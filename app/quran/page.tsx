'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle, ChevronRight, Star } from 'lucide-react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { logActivity } from '../../lib/activity';

interface Moshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
}

interface Reciter {
  id: number;
  name: string;
  letter: string;
  moshaf: Moshaf[];
}

const ALPHABET = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];

export default function QuranPage() {
  const [selectedLetter, setSelectedLetter] = useState('أ');
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [allSurahs, setAllSurahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch All Surahs names
        const surahRes = await fetch('https://api.alquran.cloud/v1/surah');
        const surahData = await surahRes.json();
        setAllSurahs(surahData.data);

        // Fetch Reciters from mp3quran
        const reciterRes = await fetch('https://mp3quran.net/api/v3/reciters?language=ar');
        const reciterData = await reciterRes.json();
        setReciters(reciterData.reciters);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleReciterClick = (reciter: Reciter) => {
    setSelectedReciter(reciter);
  };

  const handlePlaySurah = (surahNumber: number) => {
    if (!selectedReciter || !selectedReciter.moshaf.length) return;
    
    const moshaf = selectedReciter.moshaf[0]; // Take the first moshaf version
    const paddedId = surahNumber.toString().padStart(3, '0');
    const audioUrl = `${moshaf.server}${paddedId}.mp3`;
    
    const surahInfo = allSurahs.find(s => s.number === surahNumber);

    playTrack({
      id: `${selectedReciter.id}-${surahNumber}`,
      title: surahInfo?.name || `سورة ${surahNumber}`,
      subtitle: selectedReciter.name,
      url: audioUrl
    });
    logActivity('quran_listen', { reciter_id: selectedReciter.id, surah_id: surahNumber });
  };

  const filteredReciters = reciters.filter(r => {
    const matchesLetter = r.letter === selectedLetter;
    const matchesSearch = r.name.includes(searchQuery);
    return searchQuery ? matchesSearch : matchesLetter;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size={48} /></div>;
  }

  return (
    <div className="p-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedReciter(null)}
            className="px-6 py-2.5 bg-cyan-500 text-gray-900 rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
          >
            {selectedReciter ? <ChevronRight className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            <span>{selectedReciter ? 'العودة للقراء' : 'الوصول السريع'}</span>
          </button>
        </div>

        <button className="px-8 py-2.5 bg-orange-400 text-gray-900 rounded-lg font-bold hover:bg-orange-300 transition shadow-lg shadow-orange-400/20">
          اختر الرواية / نوع المصحف
        </button>
      </div>

      {!selectedReciter ? (
        <div className="flex gap-8 relative">
          {/* Alphabet Sidebar */}
          <div className="hidden lg:flex flex-col gap-1 sticky top-24 h-fit max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                  selectedLetter === letter 
                    ? 'bg-cyan-500 text-gray-900 shadow-lg shadow-cyan-500/30' 
                    : 'text-gray-500 hover:bg-[#2d3748] hover:text-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Reciters Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
                قائمة القراء ({selectedLetter})
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="بحث باسم القارئ"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e2329] border border-[#2d3748] rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredReciters.map((reciter) => (
                <div 
                  key={reciter.id}
                  onClick={() => handleReciterClick(reciter)}
                  className="group bg-[#1e2329] hover:bg-[#252b36] border border-[#2d3748] hover:border-cyan-500/50 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-300"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-1 h-8 bg-cyan-600 rounded-full group-hover:bg-cyan-400 transition-colors"></div>
                    <span className="font-bold text-gray-200 group-hover:text-white transition-colors truncate">
                      {reciter.name}
                    </span>
                  </div>
                  <PlayCircle className="w-6 h-6 text-cyan-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
                </div>
              ))}
              {filteredReciters.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">لا يوجد قراء بهذا الاسم في هذا القسم</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <div className="mb-8 p-6 bg-cyan-900/10 border border-cyan-500/20 rounded-[2rem]">
            <h2 className="text-3xl font-black text-white flex items-center gap-4">
              <div className="w-3 h-10 bg-cyan-500 rounded-full"></div>
              سورة القرآن بصوت {selectedReciter.name}
            </h2>
            <p className="text-cyan-400 mt-2 mr-7 font-medium">رواية {selectedReciter.moshaf[0]?.name || 'حفص عن عاصم'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {selectedReciter.moshaf[0]?.surah_list.split(',').map((numStr) => {
              const num = parseInt(numStr);
              const surahInfo = allSurahs.find(s => s.number === num);
              return (
                <div 
                  key={num}
                  onClick={() => handlePlaySurah(num)}
                  className="bg-[#1e2329] p-4 rounded-xl border border-[#2d3748] hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2d3748] text-cyan-400 rounded-lg flex items-center justify-center text-xs font-bold group-hover:bg-cyan-500 group-hover:text-gray-900 transition-colors">
                      {num}
                    </div>
                    <span className="font-bold text-gray-200 font-arabic group-hover:text-white transition-colors">{surahInfo?.name || `سورة ${num}`}</span>
                  </div>
                  <PlayCircle className="w-5 h-5 text-gray-500 group-hover:text-cyan-500 transition-all" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
