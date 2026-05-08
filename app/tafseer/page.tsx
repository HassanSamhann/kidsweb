'use client';

import React from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { BookText, Play, ChevronLeft, Headphones } from 'lucide-react';
import { logActivity } from '../../lib/activity';

const AUDIO_TAFSIR_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Audio-tafsir.json';
const SURAH_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/surah.json';

interface TafsirSoar {
  id: number;
  tafsir_id: number;
  name: string;
  url: string;
  sura_id: number;
}

interface TafsirEntry {
  name: string;
  soar: TafsirSoar[];
}

interface TafsirData {
  tafasir: TafsirEntry;
}

export default function TafseerPage() {
  const [tafsirData, setTafsirData] = React.useState<TafsirData | null>(null);
  const [surahs, setSurahs] = React.useState<{ number: string; name: string }[]>([]);
  const [selectedSuraId, setSelectedSuraId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();

  React.useEffect(() => {
    Promise.all([
      fetch(AUDIO_TAFSIR_API).then(r => r.json()),
      fetch(SURAH_API).then(r => r.json())
    ]).then(([tafsir, surahList]) => {
      setTafsirData(tafsir);
      setSurahs(surahList);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">جاري التحميل...</div>
    );
  }

  const groupedBySura = tafsirData?.tafasir?.soar?.reduce((acc, item) => {
    const key = item.sura_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<number, TafsirSoar[]>) || {};

  const suraIds = Object.keys(groupedBySura).map(Number).sort((a, b) => a - b);
  const currentRecordings = selectedSuraId ? groupedBySura[selectedSuraId] || [] : [];
  const currentSurahName = surahs.find(s => Number(s.number) === selectedSuraId)?.name || '';

  const handlePlay = (recording: TafsirSoar) => {
    playTrack({
      id: `tafsir-${recording.id}`,
      title: recording.name,
      subtitle: tafsirData?.tafasir?.name || 'تفسير',
      url: recording.url
    });
    logActivity('tafseer_listen', { recording_id: recording.id, sura_id: recording.sura_id });
  };

  const isCurrentTrack = (id: number) => {
    return currentTrack?.id === `tafsir-${id}`;
  };

  return (
    <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <BookText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">التفسير الصوتي</h1>
            <p className="text-[var(--text-secondary)]">استمع إلى تفسير الآيات القرآنية</p>
          </div>
        </div>

        {tafsirData?.tafasir && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Headphones className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{tafsirData.tafasir.name}</h2>
            </div>
            <p className="text-[var(--text-muted)] text-sm">{tafsirData.tafasir.soar.length} تسجيلاً متاحاً</p>
          </div>
        )}

        {selectedSuraId ? (
          /* Recordings for selected surah */
          <div>
            <button
              onClick={() => setSelectedSuraId(null)}
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>العودة إلى قائمة السور</span>
            </button>

            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{currentSurahName}</h3>

            <div className="space-y-3">
              {currentRecordings.map((recording) => (
                <button
                  key={recording.id}
                  onClick={() => handlePlay(recording)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isCurrentTrack(recording.id) && isPlaying
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 text-right">
                    <div className={`p-2 rounded-full ${
                      isCurrentTrack(recording.id) && isPlaying
                        ? 'bg-amber-500/20'
                        : 'bg-amber-500/10'
                    }`}>
                      <Play className={`w-4 h-4 ${
                        isCurrentTrack(recording.id) && isPlaying ? 'fill-amber-400' : ''
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{recording.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {isCurrentTrack(recording.id) && isPlaying ? 'جاري التشغيل...' : 'انقر للتشغيل'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Surah list with available recordings */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {suraIds.map((suraId) => {
              const surah = surahs.find(s => Number(s.number) === suraId);
              const count = groupedBySura[suraId]?.length || 0;
              return (
                <button
                  key={suraId}
                  onClick={() => setSelectedSuraId(suraId)}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 text-center hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm font-bold mx-auto mb-2 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                    {suraId}
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{surah?.name || `سورة ${suraId}`}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{count} تسجيل{count > 1 ? 'ات' : ''}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
  );
}
