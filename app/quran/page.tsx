'use client';

import React, { useState } from 'react';
import { Search, Filter, PlayCircle, ChevronRight } from 'lucide-react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

const RECITERS = [
  { id: '1', name: 'الحسيني العزازي', letter: 'أ' },
  { id: '2', name: 'الزين محمد أحمد', letter: 'أ' },
  { id: '3', name: 'الدوكالي محمد العالم', letter: 'أ' },
  { id: '4', name: 'الفاتح محمد الزبير', letter: 'أ' },
  { id: '5', name: 'العشري عمران', letter: 'أ' },
  { id: '6', name: 'العيون الكوشي', letter: 'أ' },
  { id: '7', name: 'القارئ ياسين', letter: 'أ' },
  { id: '8', name: 'الوليد الشمسان', letter: 'أ' },
  { id: '9', name: 'أحمد الحذيفي', letter: 'أ' },
  { id: '10', name: 'أحمد الحواشي', letter: 'أ' },
  { id: '11', name: 'أحمد السويلم', letter: 'أ' },
  { id: '12', name: 'أحمد الطرابلسي', letter: 'أ' },
  { id: '13', name: 'أحمد النفيس', letter: 'أ' },
  { id: '14', name: 'أحمد بن علي العجمي', letter: 'أ' },
  { id: '15', name: 'أحمد خليل شاهين', letter: 'أ' },
  { id: '16', name: 'أحمد ديان', letter: 'أ' },
  { id: '17', name: 'أحمد سعود', letter: 'أ' },
  { id: '18', name: 'أحمد صابر', letter: 'أ' },
  { id: '19', name: 'أحمد طالب بن حميد', letter: 'أ' },
  { id: '20', name: 'أحمد عامر', letter: 'أ' },
  { id: '21', name: 'أحمد عيسى المعصراوي', letter: 'أ' },
];

const ALPHABET = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'];

export default function QuranPage() {
  const [selectedLetter, setSelectedLetter] = useState('أ');
  const [selectedReciter, setSelectedReciter] = useState<null | typeof RECITERS[0]>(null);
  const [surahs, setSurahs] = useState<any[]>([]);
  const { playTrack } = useAudioPlayer();

  React.useEffect(() => {
    async function fetchSurahs() {
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await response.json();
      setSurahs(data.data);
    }
    fetchSurahs();
  }, []);

  const handleReciterClick = (reciter: typeof RECITERS[0]) => {
    setSelectedReciter(reciter);
  };

  const handlePlaySurah = (surah: any) => {
    if (!selectedReciter) return;
    
    const paddedId = surah.number.toString().padStart(3, '0');
    // Using mp3quran as a reliable source for recitations
    // We'll use a fixed server for now (server8 is Mishary Alafasy, let's use it as default)
    const audioUrl = `https://server8.mp3quran.net/afs/${paddedId}.mp3`;
    
    playTrack({
      id: `${selectedReciter.id}-${surah.number}`,
      title: surah.name,
      subtitle: selectedReciter.name,
      url: audioUrl
    });
  };

  return (
    <div className="p-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedReciter(null)}
            className="px-6 py-2.5 bg-cyan-500 text-gray-900 rounded-lg font-bold flex items-center gap-2 hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20"
          >
            {selectedReciter ? <ChevronRight className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            <span>{selectedReciter ? 'العودة للقراء' : 'الوصول السريع'}</span>
          </button>
          <button className="px-6 py-2.5 bg-[#2d3748] text-gray-200 rounded-lg font-bold hover:bg-[#3a4659] transition">
            وقفات تدبرية
          </button>
        </div>

        <button className="px-8 py-2.5 bg-orange-400 text-gray-900 rounded-lg font-bold hover:bg-orange-300 transition shadow-lg shadow-orange-400/20">
          اختر الرواية / نوع المصحف
        </button>
      </div>

      {!selectedReciter ? (
        <div className="flex gap-8 relative">
          {/* Alphabet Sidebar */}
          <div className="hidden lg:flex flex-col gap-1 sticky top-24 h-fit">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
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
                قائمة القراء
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="بحث باسم القارئ"
                  className="w-full bg-[#1e2329] border border-[#2d3748] rounded-lg py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {RECITERS.map((reciter) => (
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
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-6 h-6 text-cyan-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
              سورة القرآن بصوت {selectedReciter.name}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {surahs.map((surah) => (
              <div 
                key={surah.number}
                onClick={() => handlePlaySurah(surah)}
                className="bg-[#1e2329] p-4 rounded-2xl border border-[#2d3748] hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#2d3748] text-cyan-400 rounded-lg flex items-center justify-center text-xs font-bold group-hover:bg-cyan-500 group-hover:text-gray-900 transition-colors">
                    {surah.number}
                  </div>
                  <span className="font-bold text-gray-200 font-arabic">{surah.name}</span>
                </div>
                <PlayCircle className="w-5 h-5 text-gray-500 group-hover:text-cyan-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
