'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Volume2, Calendar, BookOpen, Clock, Heart, Award, Trophy, Smile, HelpCircle } from 'lucide-react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

const TAKBEER_TRACK = {
  id: 'eid-takbeer',
  title: 'تكبيرات العيد',
  subtitle: 'بصوت أبرز منشدي العالم',
  url: '/eid-takbeer.mp3'
};

const TAKBEER_SECTIONS = [
  {
    id: 'sec1',
    title: 'التكبير والتحميد الأساسي',
    text: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللَّهُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، وَلِلَّهِ الْحَمْدُ.'
  },
  {
    id: 'sec2',
    title: 'التعظيم والتسبيح',
    text: 'اللَّهُ أَكْبَرُ كَبِيرًا، وَالْحَمْدُ لِلَّهِ كَثِيرًا، وَسُبْحَانَ اللَّهِ بُكْرَةً وَأَصِيلًا.'
  },
  {
    id: 'sec3',
    title: 'التوحيد والنصر',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، صَدَقَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَأَعَزَّ جُنْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ.'
  },
  {
    id: 'sec4',
    title: 'الإخلاص والعبادة',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ.'
  },
  {
    id: 'sec5',
    title: 'الصلاة على النبي ﷺ وآله',
    text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ، وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ، وَعَلَى أَصْحَابِ سَيِّدِنَا مُحَمَّدٍ، وَعَلَى أَنْصَارِ سَيِّدِنَا مُحَمَّدٍ، وَعَلَى أَزْوَاجِ سَيِّدِنَا مُحَمَّدٍ، وَعَلَى ذُرِّيَّةِ سَيِّدِنَا مُحَمَّدٍ وَسَلِّمْ تَسْلِيمًا كَثِيرًا.'
  }
];

const EID_SUNNAHS = [
  {
    title: 'الاغتسال والتطيّب',
    description: 'يُستحبّ الاغتسال ولبس أجمل وأجدد الملابس والتطيّب بالروائح الجميلة قبل الخروج لصلاة العيد.',
    icon: Smile,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  },
  {
    title: 'تناول تمرات وتراً',
    description: 'من السنة في عيد الفطر تناول تمرات (ثلاثة أو خمسة) قبل الذهاب للصلاة، وفي الأضحى بعد الصلاة.',
    icon: Award,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    title: 'الجهر بالتكبير',
    description: 'رفع الصوت بالتكبير أثناء الذهاب للمصلى وفي المساجد والبيوت لنشر البهجة والفرحة بالعيد.',
    icon: Sparkles,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  },
  {
    title: 'مخالفة الطريق',
    description: 'الذهاب إلى صلاة العيد من طريق، والعودة إلى البيت من طريق آخر لملاقاة أكبر عدد من المسلمين والسلام عليهم.',
    icon: Heart,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    title: 'التهنئة والمحبة',
    description: 'تبادل التهاني الجميلة مثل: (تقبل الله منا ومنكم صالح الأعمال) ونشر الابتسامة وزيارة الأقارب والأصدقاء.',
    icon: Trophy,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  }
];

export default function EidTakbeerPage() {
  const { currentTrack, isPlaying, progress, duration, playTrack, togglePlay, seek } = useAudioPlayer();
  const isThisPlaying = isPlaying && currentTrack?.id === TAKBEER_TRACK.id;

  // Takbeer Counter state for gamification
  const [takbeerCount, setTakbeerCount] = useState(0);
  const [badge, setBadge] = useState({ name: 'مبتدئ مبارك', desc: 'ابدأ بالتكبير لتحصل على وسامك الأول!', icon: '🕋' });
  const [sparkling, setSparkling] = useState(false);

  // Sync count milestones
  useEffect(() => {
    if (takbeerCount === 0) {
      setBadge({ name: 'مبتدئ مبارك', desc: 'ابدأ بالتكبير لتحصل على وسامك الأول!', icon: '🕋' });
    } else if (takbeerCount >= 100) {
      setBadge({ name: 'سلطان المكبّرين 👑', desc: 'ما شاء الله! أنت فخر الأمة ولسانك عامر بذكر الله!', icon: '👑' });
    } else if (takbeerCount >= 50) {
      setBadge({ name: 'فارس التكبير ⚔️', desc: 'أتممت 50 تكبيرة! لسانك يفيض بذكر الله الجميل!', icon: '⚔️' });
    } else if (takbeerCount >= 33) {
      setBadge({ name: 'المكبّر المخلص 💎', desc: 'أتممت 33 تكبيرة! بارك الله فيك ونوّر قلبك!', icon: '💎' });
    } else if (takbeerCount >= 10) {
      setBadge({ name: 'الذاكر النشيط 🌟', desc: 'عشر تكبيرات رائعة! استمر في كسب الحسنات العظيمة!', icon: '🌟' });
    } else if (takbeerCount >= 3) {
      setBadge({ name: 'المكبّر الصغير 🌱', desc: 'بداية مباركة! ثلاث تكبيرات تفتح لك أبواب الخير!', icon: '🌱' });
    }
  }, [takbeerCount]);

  const handleTakbeerClick = () => {
    setTakbeerCount(prev => prev + 1);
    setSparkling(true);
    setTimeout(() => setSparkling(false), 300);

    // Audio click effect (using window.Audio if wanted, but visual response is already amazing!)
    if (typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600 + (takbeerCount % 10) * 40, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch (e) {}
    }
  };

  const handlePlayToggle = () => {
    playTrack(TAKBEER_TRACK);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10" dir="rtl">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-cyan-900/30 border border-purple-500/10 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            تكبيرات العيد المبارك
          </h1>
          <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed max-w-xl">
            استمع وتعلّم وعطّر لسانك بتكبيرات العيد المبارك بأصوات شجيّة تملأ القلوب فرحاً وسروراً!
          </p>
        </div>

        <div className="relative shrink-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-amber-500/5 hover:scale-105 transition-transform">
            <span className="text-3xl">🕋</span>
            <span className="text-xs font-bold text-amber-400 mt-1">عيد مبارك</span>
          </div>
        </div>
      </header>

      {/* Grid: Player & Counter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Play Card (7 cols) */}
        <div className="lg:col-span-7 bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
          
          <div className="relative z-10 w-full space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                  ملف تفاعلي عالي الجودة
                </span>
                <h2 className="text-2xl font-black text-white mt-3 font-arabic">تكبيرات العيد الجماعية</h2>
                <p className="text-gray-400 text-sm mt-1">بصوت نخبة من كبار قارئي ومنشدي العالم الإسلامي</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl animate-bounce-slow">
                🎧
              </div>
            </div>

            {/* Glowing Center Visualizer */}
            <div className="h-44 bg-[#14181c] border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%) pointer-events-none" />
              
              {isThisPlaying ? (
                <div className="flex items-end gap-1.5 h-16 relative z-10">
                  {[...Array(12)].map((_, i) => {
                    const delays = ['0.1s', '0.4s', '0.2s', '0.6s', '0.3s', '0.5s', '0.2s', '0.7s', '0.1s', '0.4s', '0.3s', '0.6s'];
                    const heights = ['h-10', 'h-16', 'h-12', 'h-14', 'h-8', 'h-16', 'h-10', 'h-14', 'h-6', 'h-12', 'h-14', 'h-10'];
                    return (
                      <div 
                        key={i} 
                        style={{ animationDelay: delays[i] }}
                        className={`w-2.5 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full animate-[pulse_1s_infinite_alternate] ${heights[i]} shadow-md shadow-cyan-500/20`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-2 relative z-10 px-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
                    <Volume2 className="w-8 h-8" />
                  </div>
                  <p className="text-gray-400 text-sm font-semibold">اضغط على زر التشغيل في الأسفل للاستماع</p>
                  <p className="text-gray-500 text-xs">سيعمل الصوت في الخلفية لتتصفح الموقع بحرية</p>
                </div>
              )}
            </div>

            {/* Player Controls */}
            <div className="space-y-4">
              {/* Progress Slider */}
              {isThisPlaying && (
                <div className="space-y-2">
                  <div className="w-full flex items-center gap-3 text-xs text-cyan-400 font-mono" dir="ltr">
                    <span>{formatTime(progress)}</span>
                    <input 
                      type="range" 
                      min={0} 
                      max={duration || 100} 
                      value={progress}
                      onChange={(e) => seek(Number(e.target.value))}
                      className="flex-1 h-2 bg-[#1a1d24] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer border border-[#2d3748] transition-all hover:scale-105 active:scale-95"
                    />
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-4 items-center">
                <button
                  onClick={handlePlayToggle}
                  className={`flex-1 py-4 px-6 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                    isThisPlaying 
                      ? 'bg-amber-500 hover:bg-amber-400 text-gray-900 shadow-amber-500/25 active:scale-[0.98]' 
                      : 'bg-cyan-500 hover:bg-cyan-400 text-gray-900 shadow-cyan-500/25 active:scale-[0.98]'
                  }`}
                >
                  {isThisPlaying ? (
                    <>
                      <Pause className="w-6 h-6 fill-current" />
                      <span>إيقاف مؤقت للتكبيرات</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 fill-current" />
                      <span>تشغيل تكبيرات العيد 🎵</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gamified Counter Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

          <div className="relative z-10 w-full space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                تحدّي التكبير التفاعلي
              </span>
              <h2 className="text-2xl font-black text-white mt-3 font-arabic">ردّد التكبير بنفسك</h2>
              <p className="text-gray-400 text-sm mt-1">اضغط على الكعبة المشرّفة مع كل تكبيرة تكبّرها!</p>
            </div>

            {/* Clicker Button (Kaaba shape / circle) */}
            <div className="flex flex-col items-center py-4">
              <button
                onClick={handleTakbeerClick}
                className={`w-36 h-36 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 border-4 border-amber-500/30 flex flex-col items-center justify-center shadow-xl shadow-amber-500/15 cursor-pointer relative active:scale-90 select-none transition-all duration-150 ${
                  sparkling ? 'scale-110 ring-4 ring-amber-400/40 shadow-2xl' : ''
                }`}
              >
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_60%)] pointer-events-none" />
                <span className="text-5xl select-none">🕋</span>
                <span className="text-sm font-black text-gray-900 mt-2 select-none">اللَّهُ أَكْبَرُ</span>
                
                {/* Floating mini stars when clicked */}
                {sparkling && (
                  <>
                    <span className="absolute -top-4 -right-4 text-xl animate-ping select-none">✨</span>
                    <span className="absolute -bottom-4 -left-4 text-xl animate-ping select-none">🌟</span>
                  </>
                )}
              </button>

              {/* Stats */}
              <div className="mt-6 text-center space-y-1">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">عدد تكبيراتك</span>
                <p className="text-4xl font-black text-white font-mono">{takbeerCount}</p>
              </div>
            </div>

            {/* Reward Badge Box */}
            <div className="bg-[#14181c] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-3xl shrink-0">
                {badge.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-amber-400 font-bold block">وسامك الحالي:</span>
                <h4 className="font-bold text-white text-sm truncate mt-0.5">{badge.name}</h4>
                <p className="text-gray-400 text-xs truncate mt-0.5">{badge.desc}</p>
              </div>
              {takbeerCount > 0 && (
                <button
                  onClick={() => { if (confirm('هل تريد تصفير العداد والبدء من جديد؟')) setTakbeerCount(0); }}
                  className="p-2 text-gray-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                  title="إعادة تعيين العداد"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Words of Takbeer (الكلمات) */}
      <section className="bg-[#1e2329] border border-[#2d3748] rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white font-arabic">صيغة تكبيرات العيد المكتوبة</h3>
              <p className="text-gray-400 text-sm mt-0.5">اقرأ وردّد معنا الصيغة الكاملة والجميلة لتكبيرات العيد</p>
            </div>
          </div>

          <div className="space-y-6">
            {TAKBEER_SECTIONS.map((sec, index) => (
              <div 
                key={sec.id}
                className="bg-[#14181c] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold rounded-lg flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <h4 className="font-black text-purple-400 text-sm">{sec.title}</h4>
                </div>
                <p className="text-2xl md:text-3xl text-white font-arabic leading-[2.2] text-right font-medium pr-1 select-all hover:text-amber-300 transition-colors">
                  {sec.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eid Sunnahs & Manners */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-arabic">سنن وآداب يوم العيد السعيد</h3>
            <p className="text-gray-400 text-sm mt-0.5">تعلّم ماذا كان يفعل نبينا الكريم ﷺ في يوم العيد لتنال الأجر العظيم</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EID_SUNNAHS.map((sunnah) => {
            const Icon = sunnah.icon;
            return (
              <div 
                key={sunnah.title} 
                className={`p-6 rounded-[2rem] border bg-[#1e2329] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${sunnah.color}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-white text-lg font-arabic">{sunnah.title}</h4>
                    <div className="p-3 rounded-xl bg-white/5">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {sunnah.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timing and General Info Card */}
      <section className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-white font-arabic flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-400" />
              متى نكبّر لعيد الفطر وعيد الأضحى؟
            </h3>
            <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed">
              تختلف أوقات تكبيرات العيد المبارك بين عيد الفطر وعيد الأضحى، وتعلّمها يساعدنا على إحياء السُنّة النبوية المطهرة:
            </p>
            <div className="space-y-3">
              <div className="bg-[#14181c]/60 border border-white/5 rounded-2xl p-4">
                <h4 className="font-black text-cyan-400 text-sm mb-1">📅 تكبيرات عيد الفطر (المُرسلة):</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  تبدأ من غروب شمس ليلة العيد (آخر يوم من رمضان) وتستمر حتى خروج الإمام لصلاة العيد.
                </p>
              </div>
              <div className="bg-[#14181c]/60 border border-white/5 rounded-2xl p-4">
                <h4 className="font-black text-amber-400 text-sm mb-1">📅 تكبيرات عيد الأضحى (المُقيّدة):</h4>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  تبدأ من فجر يوم عرفة (التاسع من ذي الحجة) وتستمر أدبار الصلوات المكتوبة حتى عصر آخر أيام التشريق (الثالث عشر من ذي الحجة).
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-[#14181c]/40 border border-white/5 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-3xl animate-bounce-slow">
              🎉
            </div>
            <h4 className="text-lg font-black text-white font-arabic">هل تعلم يا بطل؟</h4>
            <p className="text-gray-300 text-xs font-semibold leading-relaxed max-w-sm">
              التكبير يعني تعظيم الله عز وجل، ونحن نكبّر لنشكر الله سبحانه وتعالى الذي وفقنا لتمام الطاعة والصيام في رمضان، وتوفيقنا للحج والأعمال الصالحة في عشر ذي الحجة!
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
