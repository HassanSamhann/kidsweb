'use client';

import React from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { BookText, Play, ChevronLeft, Headphones, BookOpen, Sparkles } from 'lucide-react';
import { logActivity } from '../../lib/activity';
import { cleanAyahText, cleanTafseerText } from '../../lib/quran-clean';

const AUDIO_TAFSIR_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Audio-tafsir.json';
const SURAH_API = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/surah.json';
const TEXT_TAFSEER_BASE = 'https://raw.githubusercontent.com/itsSamBz/Islamic-Api/main/Quran-Data/Tafseer';

const TAFSEER_SOURCES = [
  { id: 'tfseer_mokhtser', name: 'المختصر في التفسير' },
  { id: 'tfseer_moyser', name: 'الميسر' },
  { id: 'tfseer_sady', name: 'تفسير السعدي' },
  { id: 'tfsseer_ayser_al_ltfseer', name: 'أيسر التفاسير' },
] as const;

type TabType = 'audio' | 'text';

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

interface TextTafseerVerse {
  verse_id: number;
  text_uthmani: string;
  tafseer: string;
  t_verse_number: number;
  t_chapter_id: number;
  t_name_arabic: string;
}

export default function TafseerPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>('audio');
  const [tafsirData, setTafsirData] = React.useState<TafsirData | null>(null);
  const [surahs, setSurahs] = React.useState<{ number: string; name: string }[]>([]);
  const [selectedSuraId, setSelectedSuraId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [textTafseer, setTextTafseer] = React.useState<TextTafseerVerse[] | null>(null);
  const [textTafseerLoading, setTextTafseerLoading] = React.useState(false);
  const [selectedSource, setSelectedSource] = React.useState<string>('tfseer_mokhtser');
  const [dailyAyah, setDailyAyah] = React.useState<{ ayah: TextTafseerVerse; source: string; surahName: string } | null>(null);
  const [loggedSura, setLoggedSura] = React.useState<number | null>(null);
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

  React.useEffect(() => {
    if (activeTab === 'text' && selectedSuraId) {
      setTextTafseerLoading(true);
      setTextTafseer(null);
      fetch(`${TEXT_TAFSEER_BASE}/${selectedSource}/${selectedSuraId}.json`)
        .then(r => r.json())
        .then((data: TextTafseerVerse[]) => {
          setTextTafseer(data);
          setTextTafseerLoading(false);
        })
        .catch(() => setTextTafseerLoading(false));
    }
  }, [activeTab, selectedSuraId, selectedSource]);

  React.useEffect(() => {
    const cached = localStorage.getItem('daily_tafseer_ayah');
    const today = new Date().toDateString();
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) {
          setDailyAyah(parsed.data);
          return;
        }
      } catch {}
    }
    const randomSura = Math.floor(Math.random() * 114) + 1;
    const source = TAFSEER_SOURCES[Math.floor(Math.random() * TAFSEER_SOURCES.length)];
    fetch(`${TEXT_TAFSEER_BASE}/${source.id}/${randomSura}.json`)
      .then(r => r.json())
      .then((data: TextTafseerVerse[]) => {
        if (data.length > 0) {
          const idx = Math.floor(Math.random() * data.length);
          const ayah = data[idx];
          const dailyData = { ayah, source: source.name, surahName: ayah.t_name_arabic };
          setDailyAyah(dailyData);
          localStorage.setItem('daily_tafseer_ayah', JSON.stringify({ date: today, data: dailyData }));
        }
      })
      .catch(() => {});
  }, []);

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

  const handleSelectSuraText = (suraId: number) => {
    setSelectedSuraId(suraId);
    if (loggedSura !== suraId) {
      setLoggedSura(suraId);
      logActivity('tafseer_listen', { type: 'text', sura_id: suraId });
    }
  };

  const isCurrentTrack = (id: number) => {
    return currentTrack?.id === `tafsir-${id}`;
  };

  const formatTafseerText = (text: string) => {
    return cleanTafseerText(text).split('<br />').map((part, i, arr) => (
      <React.Fragment key={i}>
        {part}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">جاري التحميل...</div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
          <BookText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">التفسير</h1>
          <p className="text-[var(--text-secondary)]">استمع أو اقرأ تفسير الآيات القرآنية</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] w-fit">
        <button
          onClick={() => { setActiveTab('audio'); setSelectedSuraId(null); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'audio'
              ? 'bg-amber-500/10 text-amber-400 shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>تفسير صوتي</span>
        </button>
        <button
          onClick={() => { setActiveTab('text'); setSelectedSuraId(null); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'text'
              ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>تفسير كتابي</span>
        </button>
      </div>

      {activeTab === 'audio' && (
        <>
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
        </>
      )}

      {activeTab === 'text' && (
        <>
          {!selectedSuraId && dailyAyah && (
            <div className="bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-[var(--text-primary)]">آية اليوم مع تفسيرها</h2>
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
                <p className="text-2xl text-center leading-loose font-arabic text-[var(--text-primary)] mb-4">
                  {cleanAyahText(dailyAyah.ayah.text_uthmani)}
                </p>
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold">
                    {dailyAyah.surahName} - آية {dailyAyah.ayah.verse_id}
                  </span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    التفسير ({dailyAyah.source}):
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {formatTafseerText(dailyAyah.ayah.tafseer)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!selectedSuraId && (
            <>
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">التفسير الكتابي</h2>
                </div>
                <p className="text-[var(--text-muted)] text-sm">اختر السورة لعرض تفسير آياتها</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {TAFSEER_SOURCES.map(source => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      selectedSource === source.id
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-emerald-500/20'
                    }`}
                  >
                    {source.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {surahs.filter(s => Number(s.number) >= 1 && Number(s.number) <= 114).map((surah) => {
                  const suraNum = Number(surah.number);
                  return (
                    <button
                      key={suraNum}
                      onClick={() => handleSelectSuraText(suraNum)}
                      className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 text-center hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold mx-auto mb-2 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                        {suraNum}
                      </div>
                      <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{surah.name}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {selectedSuraId && (
            <div>
              <button
                onClick={() => { setSelectedSuraId(null); setTextTafseer(null); }}
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>العودة إلى قائمة السور</span>
              </button>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {surahs.find(s => Number(s.number) === selectedSuraId)?.name || `سورة ${selectedSuraId}`}
                </h3>
                <select
                  value={selectedSource}
                  onChange={e => setSelectedSource(e.target.value)}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  {TAFSEER_SOURCES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {textTafseerLoading ? (
                <div className="text-center text-[var(--text-muted)] py-12">جاري تحميل التفسير...</div>
              ) : textTafseer ? (
                <div className="space-y-6">
                  {textTafseer.map((verse) => (
                    <div
                      key={verse.verse_id}
                      className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-emerald-500/20 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/20">
                          {verse.verse_id}
                        </span>
                      </div>
                      <p className="text-xl text-right leading-loose font-arabic text-[var(--text-primary)] mb-4">
                        {cleanAyahText(verse.text_uthmani)}
                      </p>
                      <div className="border-t border-[var(--border-color)] pt-4">
                        <p className="text-xs text-[var(--text-muted)] mb-2">التفسير:</p>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {formatTafseerText(verse.tafseer)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[var(--text-muted)] py-12">
                  تعذر تحميل التفسير لهذه السورة
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
