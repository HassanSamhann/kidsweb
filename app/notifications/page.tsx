'use client';

import React, { useState } from 'react';
import { useNotifications, NotificationSettings } from '../../contexts/NotificationContext';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Smile, 
  Moon, 
  Sun, 
  Coffee, 
  Compass, 
  Award, 
  Play, 
  Check, 
  ShieldAlert, 
  MapPin 
} from 'lucide-react';

const POPULAR_CITIES = [
  { ar: "القاهرة", en: "Cairo" },
  { ar: "الإسكندرية", en: "Alexandria" },
  { ar: "الجيزة", en: "Giza" },
  { ar: "الإسماعيلية", en: "Ismailia" },
  { ar: "بور سعيد", en: "Port Said" },
  { ar: "السويس", en: "Suez" },
  { ar: "أسيوط", en: "Assiut" },
  { ar: "الأقصر", en: "Luxor" },
  { ar: "أسوان", en: "Aswan" },
  { ar: "طنطا", en: "Tanta" },
  { ar: "المنصورة", en: "Mansoura" },
  { ar: "دمياط", en: "Damietta" },
  { ar: "جدة", en: "Jeddah" },
  { ar: "الرياض", en: "Riyadh" },
  { ar: "مكة", en: "Makkah" },
  { ar: "المدينة", en: "Medina" },
  { ar: "الدمام", en: "Dammam" },
  { ar: "دبي", en: "Dubai" },
];

const SURAHS = [
  { id: 18, name: 'الكهف' },
  { id: 67, name: 'الملك' },
  { id: 36, name: 'يس' },
  { id: 56, name: 'الواقعة' },
  { id: 55, name: 'الرحمن' },
];

export default function NotificationsPage() {
  const { 
    settings, 
    updateSettings, 
    permissionStatus, 
    requestNativePermission, 
    triggerTestNotification 
  } = useNotifications();

  const [saving, setSaving] = useState(false);

  const toggleSetting = (key: keyof NotificationSettings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleTimeChange = (key: keyof NotificationSettings, val: string) => {
    updateSettings({ [key]: val });
  };

  const handleNumberChange = (key: keyof NotificationSettings, val: number) => {
    updateSettings({ [key]: val });
  };

  const handleStringChange = (key: keyof NotificationSettings, val: string) => {
    updateSettings({ [key]: val });
  };

  const handleSurahChange = (surahIdStr: string) => {
    const sId = Number(surahIdStr);
    const surah = SURAHS.find(s => s.id === sId);
    if (surah) {
      updateSettings({ surahId: sId, surahName: surah.name });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10" dir="rtl">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-pink-900/30 border border-purple-500/10 rounded-[2rem] p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-amber-400 animate-[swing_1.5s_ease-in-out_infinite]" />
            مركز التنبيهات الذكي
          </h1>
          <p className="text-gray-300 font-medium text-sm md:text-base leading-relaxed max-w-2xl">
            حافظ على صلاتك وأذكارك اليومية يا بطل! قم بتخصيص مواعيد التذكير المناسبة لك، وسنقوم بتنبيهك بصوت شجي وشاشات تفاعلية مميزة.
          </p>
        </div>

        <div className="relative shrink-0 z-10">
          <button
            onClick={triggerTestNotification}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-gray-900 font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            تجربة تنبيه الآن! 🔔
          </button>
        </div>
      </header>

      {/* Permission Section */}
      <section className="bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl shrink-0 ${
              permissionStatus === 'granted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {permissionStatus === 'granted' ? <Check className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">تنبيهات سطح المكتب والكمبيوتر</h3>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed max-w-xl">
                لتلقي التنبيهات في الخلفية حتى لو كنت تتصفح قسماً آخر من الموقع، يرجى تفعيل إشعارات المتصفح لتنال التذكير المبارك فوراً!
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {permissionStatus === 'granted' ? (
              <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                مفعّل بنجاح في المتصفح ✓
              </span>
            ) : (
              <button
                onClick={requestNativePermission}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-500/10"
              >
                تفعيل إشعارات المتصفح 🚀
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid: Global Toggles & Azkar Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: General Configuration (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-6 space-y-6 shadow-xl">
            <h3 className="font-black text-white text-lg border-b border-[#2d3748] pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              إعدادات عامة
            </h3>

            {/* Native Switch */}
            <div className="flex items-center justify-between p-3 bg-[#14181c] rounded-xl">
              <div>
                <span className="text-sm font-bold text-white block">إشعارات سطح المكتب</span>
                <span className="text-[10px] text-gray-500">إرسال إشعارات المتصفح</span>
              </div>
              <button
                onClick={() => toggleSetting('nativeEnabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  settings.nativeEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  settings.nativeEnabled ? 'translate-x-0' : '-translate-x-6'
                }`} />
              </button>
            </div>

            {/* Sound Switch */}
            <div className="flex items-center justify-between p-3 bg-[#14181c] rounded-xl">
              <div className="flex items-center gap-2">
                <div className="text-gray-400">
                  {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">المؤثرات الصوتية</span>
                  <span className="text-[10px] text-gray-500">رنين شجي عند التذكير</span>
                </div>
              </div>
              <button
                onClick={() => toggleSetting('soundEnabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  settings.soundEnabled ? 'bg-cyan-600' : 'bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  settings.soundEnabled ? 'translate-x-0' : '-translate-x-6'
                }`} />
              </button>
            </div>

            {/* Info Hint */}
            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-center space-y-2">
              <span className="text-2xl">💡</span>
              <p className="text-xs text-gray-400 leading-relaxed">
                نقوم بحفظ جميع إعداداتك تلقائياً على جهازك لتعمل في زيارتك القادمة بكل سهولة!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Azkar Reminders (8 cols) */}
        <div className="lg:col-span-8 bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xl">
          <h3 className="font-black text-white text-lg border-b border-[#2d3748] pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            أوقات وتنبيهات الأذكار اليومية
          </h3>

          <div className="space-y-4">
            
            {/* Morning Azkar */}
            <div className="bg-[#14181c] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">أذكار الصباح السعيدة ☀️</h4>
                  <p className="text-xs text-gray-400">تنبيه لبدء يومك ببركة ونشاط وقراءة الأذكار</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <input 
                  type="time" 
                  value={settings.morningAzkarTime}
                  onChange={(e) => handleTimeChange('morningAzkarTime', e.target.value)}
                  disabled={!settings.morningAzkarEnabled}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-mono text-sm focus:border-amber-500/50 outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => toggleSetting('morningAzkarEnabled')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                    settings.morningAzkarEnabled ? 'bg-amber-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                    settings.morningAzkarEnabled ? 'translate-x-0' : '-translate-x-6'
                  }`} />
                </button>
              </div>
            </div>

            {/* Evening Azkar */}
            <div className="bg-[#14181c] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">أذكار المساء الهادئة 🌙</h4>
                  <p className="text-xs text-gray-400">تنبيه لحفظك ورعايتك وقراءة أذكار المساء</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <input 
                  type="time" 
                  value={settings.eveningAzkarTime}
                  onChange={(e) => handleTimeChange('eveningAzkarTime', e.target.value)}
                  disabled={!settings.eveningAzkarEnabled}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-mono text-sm focus:border-purple-500/50 outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => toggleSetting('eveningAzkarEnabled')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                    settings.eveningAzkarEnabled ? 'bg-purple-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                    settings.eveningAzkarEnabled ? 'translate-x-0' : '-translate-x-6'
                  }`} />
                </button>
              </div>
            </div>

            {/* Waking Up Azkar */}
            <div className="bg-[#14181c] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl shrink-0">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">أذكار الاستيقاظ والصباح الباكر 🌅</h4>
                  <p className="text-xs text-gray-400">تذكير بقول دعاء الاستيقاظ لشكر الله</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <input 
                  type="time" 
                  value={settings.wakingAzkarTime}
                  onChange={(e) => handleTimeChange('wakingAzkarTime', e.target.value)}
                  disabled={!settings.wakingAzkarEnabled}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-mono text-sm focus:border-rose-500/50 outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => toggleSetting('wakingAzkarEnabled')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                    settings.wakingAzkarEnabled ? 'bg-rose-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                    settings.wakingAzkarEnabled ? 'translate-x-0' : '-translate-x-6'
                  }`} />
                </button>
              </div>
            </div>

            {/* Sleep Azkar */}
            <div className="bg-[#14181c] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">أذكار النوم والأحلام الطيبة 🌌</h4>
                  <p className="text-xs text-gray-400">تنبيه قبل النوم لقراءة أذكار النوم والنوم في أمان</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                <input 
                  type="time" 
                  value={settings.sleepAzkarTime}
                  onChange={(e) => handleTimeChange('sleepAzkarTime', e.target.value)}
                  disabled={!settings.sleepAzkarEnabled}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-mono text-sm focus:border-indigo-500/50 outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => toggleSetting('sleepAzkarEnabled')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                    settings.sleepAzkarEnabled ? 'bg-indigo-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                    settings.sleepAzkarEnabled ? 'translate-x-0' : '-translate-x-6'
                  }`} />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Prayer & Surah Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Prayer Approach Alarm Card */}
        <div className="bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xl">
          <h3 className="font-black text-white text-lg border-b border-[#2d3748] pb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            منبه اقتراب مواقيت الصلاة
          </h3>

          <div className="space-y-4">
            
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#14181c] rounded-xl">
              <div>
                <span className="text-sm font-bold text-white block">منبه الصلوات</span>
                <span className="text-[10px] text-gray-500">تنبيهك قبل كل صلاة لتبدأ بالاستعداد</span>
              </div>
              <button
                onClick={() => toggleSetting('prayerRemindersEnabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                  settings.prayerRemindersEnabled ? 'bg-amber-500' : 'bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  settings.prayerRemindersEnabled ? 'translate-x-0' : '-translate-x-6'
                }`} />
              </button>
            </div>

            {/* Custom Minutes Before Offset */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#14181c]/60 border border-white/5 rounded-2xl">
              <div>
                <span className="text-sm font-bold text-white block">التنبيه قبل الأذان بـ:</span>
                <span className="text-[10px] text-gray-400">الوقت الكافي للوضوء والاستعداد</span>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <select
                  value={settings.prayerMinutesBefore}
                  onChange={(e) => handleNumberChange('prayerMinutesBefore', Number(e.target.value))}
                  disabled={!settings.prayerRemindersEnabled}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-bold text-sm focus:border-amber-500/50 outline-none disabled:opacity-50"
                >
                  <option value={5}>5 دقائق</option>
                  <option value={10}>10 دقائق</option>
                  <option value={15}>15 دقيقة</option>
                  <option value={20}>20 دقيقة</option>
                  <option value={30}>30 دقيقة</option>
                </select>
              </div>
            </div>

            {/* Custom City Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#14181c]/60 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-sm font-bold text-white block">مدينة التنبيهات:</span>
                  <span className="text-[10px] text-gray-400">لحساب مواقيت الصلاة الصحيحة</span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <select
                  value={settings.prayerCity}
                  onChange={(e) => handleStringChange('prayerCity', e.target.value)}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-bold text-sm focus:border-amber-500/50 outline-none"
                >
                  {POPULAR_CITIES.map((c) => (
                    <option key={c.en} value={c.en}>
                      {c.ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Surah Reading Reminder Card */}
        <div className="bg-[#1e2329] border border-[#2d3748] rounded-[2rem] p-6 md:p-8 space-y-6 shadow-xl">
          <h3 className="font-black text-white text-lg border-b border-[#2d3748] pb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            تذكير قراءة سورة مخصصة
          </h3>

          <div className="space-y-4">
            
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#14181c] rounded-xl">
              <div>
                <span className="text-sm font-bold text-white block">تنبيه السورة اليومي</span>
                <span className="text-[10px] text-gray-500">تنبيهك لقراءة أو استماع سورتك المفضلة</span>
              </div>
              <button
                onClick={() => toggleSetting('surahReminderEnabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none shrink-0 ${
                  settings.surahReminderEnabled ? 'bg-indigo-500' : 'bg-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 transform ${
                  settings.surahReminderEnabled ? 'translate-x-0' : '-translate-x-6'
                }`} />
              </button>
            </div>

            {/* Surah Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#14181c]/60 border border-white/5 rounded-2xl">
              <div>
                <span className="text-sm font-bold text-white block">السورة المختارة:</span>
                <span className="text-[10px] text-gray-400">سورة ترغب في المداومة عليها</span>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <select
                  value={settings.surahId}
                  onChange={(e) => handleSurahChange(e.target.value)}
                  disabled={!settings.surahReminderEnabled}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-bold text-sm focus:border-indigo-500/50 outline-none disabled:opacity-50"
                >
                  {SURAHS.map((s) => (
                    <option key={s.id} value={s.id}>
                      سورة {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Surah Time */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#14181c]/60 border border-white/5 rounded-2xl">
              <div>
                <span className="text-sm font-bold text-white block">وقت التنبيه:</span>
                <span className="text-[10px] text-gray-400">الوقت اليومي المفضل لديك</span>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto">
                <input 
                  type="time" 
                  value={settings.surahReminderTime}
                  onChange={(e) => handleTimeChange('surahReminderTime', e.target.value)}
                  disabled={!settings.surahReminderEnabled}
                  className="bg-[#1e2329] border border-[#2d3748] text-white px-3 py-1.5 rounded-xl font-mono text-sm focus:border-indigo-500/50 outline-none disabled:opacity-50"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
