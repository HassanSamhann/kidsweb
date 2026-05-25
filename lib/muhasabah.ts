'use client';

export interface MuhasabahItem {
  id: string;
  label: string;
  points: number;
}

export interface MuhasabahCategory {
  id: string;
  label: string;
  items: MuhasabahItem[];
}

export const MUHASABAH_DATA: MuhasabahCategory[] = [
  {
    id: 'fajr',
    label: 'الفجر',
    items: [
      { id: 'fajr_wake', label: 'أذكار الاستيقاظ', points: 2 },
      { id: 'fajr_sunnah_before', label: 'السنة القبلية', points: 2 },
      { id: 'fajr_congregation', label: 'الجماعة الأولى', points: 2 },
      { id: 'fajr_athkar_after', label: 'أذكار بعد الصلاة', points: 2 },
      { id: 'fajr_morning_athkar', label: 'أذكار الصباح', points: 2 },
      { id: 'fajr_duha', label: 'الضحى ٤ ركعات', points: 2 },
    ],
  },
  {
    id: 'dhuhr',
    label: 'الظهر',
    items: [
      { id: 'dhuhr_sunnah_before', label: 'السنة القبلية ٤ ركعات', points: 2 },
      { id: 'dhuhr_congregation', label: 'الجماعة الأولى', points: 2 },
      { id: 'dhuhr_athkar_after', label: 'أذكار بعد الصلاة', points: 2 },
      { id: 'dhuhr_sunnah_after', label: 'السنة البعدية', points: 2 },
    ],
  },
  {
    id: 'asr',
    label: 'العصر',
    items: [
      { id: 'asr_congregation', label: 'الجماعة الأولى', points: 2 },
      { id: 'asr_athkar_after', label: 'أذكار بعد الصلاة', points: 2 },
      { id: 'asr_evening_athkar', label: 'أذكار المساء', points: 2 },
    ],
  },
  {
    id: 'maghrib',
    label: 'المغرب',
    items: [
      { id: 'maghrib_congregation', label: 'الجماعة الأولى', points: 2 },
      { id: 'maghrib_athkar_after', label: 'أذكار بعد الصلاة', points: 2 },
      { id: 'maghrib_sunnah_after', label: 'السنة البعدية', points: 2 },
    ],
  },
  {
    id: 'isha',
    label: 'العشاء',
    items: [
      { id: 'isha_congregation', label: 'الجماعة الأولى', points: 2 },
      { id: 'isha_athkar_after', label: 'أذكار بعد الصلاة', points: 2 },
      { id: 'isha_sunnah_after', label: 'السنة البعدية', points: 2 },
    ],
  },
  {
    id: 'night_prayer',
    label: 'قيام الليل والوتر',
    items: [
      { id: 'night_qiyam', label: 'ركعتان قيام ليل', points: 4 },
      { id: 'night_ward', label: 'الورد (ربعين)', points: 4 },
      { id: 'night_witr', label: 'الوتر', points: 1 },
    ],
  },
  {
    id: 'quran_fasting',
    label: 'القرآن والصيام',
    items: [
      { id: 'quran_memorize', label: 'حفظ نصف صفحة', points: 2 },
      { id: 'quran_read', label: 'قراءة ستة أرباع', points: 2 },
      { id: 'fasting', label: 'الصيام (الاثنين والخميس)', points: 5 },
    ],
  },
  {
    id: 'various_athkar',
    label: 'أذكار متنوعة',
    items: [
      { id: 'var_restroom', label: 'الخلاء', points: 2 },
      { id: 'var_dress', label: 'لبس الثوب وخلعه', points: 2 },
      { id: 'var_wudu', label: 'الوضوء', points: 2 },
      { id: 'var_enter_exit_home', label: 'دخول المنزل والخروج', points: 2 },
      { id: 'var_mosque', label: 'المسجد دخول وخروج', points: 2 },
      { id: 'var_walk_mosque', label: 'المشي إلى المسجد', points: 2 },
      { id: 'var_eat_drink', label: 'الأكل والشرب', points: 2 },
      { id: 'var_ride', label: 'الركوب', points: 2 },
      { id: 'var_before_sleep', label: 'قبل النوم', points: 2 },
    ],
  },
];

const STORAGE_PREFIX = 'muhasabah_';

function today(): string {
  return new Date().toDateString();
}

export function getMuhasabahDone(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${today()}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMuhasabahDone(done: Record<string, boolean>) {
  localStorage.setItem(`${STORAGE_PREFIX}${today()}`, JSON.stringify(done));
}

export function toggleMuhasabahItem(id: string): Record<string, boolean> {
  const done = getMuhasabahDone();
  if (done[id]) {
    delete done[id];
  } else {
    done[id] = true;
  }
  saveMuhasabahDone(done);
  return done;
}

export function getTotalPoints(): { earned: number; max: number } {
  const done = getMuhasabahDone();
  let earned = 0;
  let max = 0;
  for (const cat of MUHASABAH_DATA) {
    for (const item of cat.items) {
      max += item.points;
      if (done[item.id]) earned += item.points;
    }
  }
  return { earned, max };
}

export function getCategoryProgress(catId: string): { earned: number; max: number } {
  const done = getMuhasabahDone();
  const cat = MUHASABAH_DATA.find(c => c.id === catId);
  if (!cat) return { earned: 0, max: 0 };
  let earned = 0;
  let max = 0;
  for (const item of cat.items) {
    max += item.points;
    if (done[item.id]) earned += item.points;
  }
  return { earned, max };
}

export function resetToday() {
  localStorage.removeItem(`${STORAGE_PREFIX}${today()}`);
}
