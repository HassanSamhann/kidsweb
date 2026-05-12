'use client';

export type ActivityType = 'azkar_morning' | 'azkar_evening' | 'quran_read' | 'quran_listen' | 'tafseer_listen' | 'hadith_read' | 'daily_visit' | 'challenge_win' | 'challenge_lose';

const STAR_VALUES: Record<ActivityType, number> = {
  azkar_morning: 5,
  azkar_evening: 5,
  quran_read: 3,
  quran_listen: 2,
  tafseer_listen: 2,
  hadith_read: 3,
  daily_visit: 1,
  challenge_win: 10,
  challenge_lose: -10,
};

const DAILY_CAP: Record<ActivityType, number> = {
  azkar_morning: 5,
  azkar_evening: 5,
  quran_read: 5,
  quran_listen: 5,
  tafseer_listen: 5,
  hadith_read: 5,
  daily_visit: 1,
  challenge_win: 100,
  challenge_lose: 100,
};

const ACTIVITY_NAMES: Record<ActivityType, string> = {
  azkar_morning: 'إكمال أذكار الصباح',
  azkar_evening: 'إكمال أذكار المساء',
  quran_read: 'قراءة سورة من القرآن',
  quran_listen: 'استماع لتلاوة قرآنية',
  tafseer_listen: 'استماع لتسجيل تفسير',
  hadith_read: 'قراءة حديث نبوي',
  daily_visit: 'زيارة يومية',
  challenge_win: 'فوز في التحدي',
  challenge_lose: 'خسارة في التحدي',
};

export function getStarValue(type: ActivityType): number {
  return STAR_VALUES[type];
}

export function getActivityName(type: ActivityType): string {
  return ACTIVITY_NAMES[type];
}

// --- Daily cap & azkar tracking (localStorage) ---

function today(): string {
  return new Date().toDateString();
}

function getDailyStars(type: ActivityType): number {
  const key = `daily_stars_${type}_${today()}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

function addDailyStars(type: ActivityType, stars: number) {
  const key = `daily_stars_${type}_${today()}`;
  const current = getDailyStars(type);
  localStorage.setItem(key, String(current + stars));
}

export function canEarnToday(type: ActivityType, stars?: number): boolean {
  const earned = getDailyStars(type);
  const cap = DAILY_CAP[type];
  const adding = stars ?? STAR_VALUES[type];
  return earned + adding <= cap;
}

export function isAzkarDoneToday(category: string): boolean {
  const key = `azkar_done_${category}_${today()}`;
  return localStorage.getItem(key) === 'true';
}

export function markAzkarDoneToday(category: string) {
  const key = `azkar_done_${category}_${today()}`;
  localStorage.setItem(key, 'true');
}

// --- Progress persistence ---

const QURAN_PROGRESS_KEY = 'quran_progress';
const AZKAR_PROGRESS_PREFIX = 'azkar_progress_';

export function saveQuranProgress(surah: number, ayah?: number) {
  const prev = getQuranProgress();
  localStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify({ surah, ayah: ayah ?? prev?.ayah, date: today() }));
}

export function getQuranProgress(): { surah: number; ayah?: number } | null {
  try {
    const raw = localStorage.getItem(QURAN_PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.surah ? { surah: data.surah, ayah: data.ayah } : null;
  } catch { return null; }
}

export function saveAzkarProgress(category: string, removedIndices: number[]) {
  localStorage.setItem(AZKAR_PROGRESS_PREFIX + category, JSON.stringify(removedIndices));
}

export function getAzkarProgress(category: string): number[] {
  try {
    const raw = localStorage.getItem(AZKAR_PROGRESS_PREFIX + category);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

// --- Log activity with daily cap ---

export async function logActivity(type: ActivityType, metadata?: Record<string, unknown>) {
  const stored = localStorage.getItem('kidsweb_user');
  if (!stored) return null;

  const user = JSON.parse(stored);
  if (!user?.id) return null;

  // Check daily cap
  if (!canEarnToday(type)) {
    // Still log but with 0 stars (activity tracked, no reward)
    try {
      await fetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          activity_type: type,
          stars: 0,
          metadata: { ...(metadata || {}), capped: true },
        }),
      });
    } catch {}
    return null;
  }

  const starsToAward = Math.min(STAR_VALUES[type], DAILY_CAP[type] - getDailyStars(type));
  if (starsToAward <= 0) return null;

  addDailyStars(type, starsToAward);

  try {
    const res = await fetch('/api/activities/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        activity_type: type,
        stars: starsToAward,
        metadata: metadata || {},
      }),
    });
    return res.json();
  } catch (e) {
    console.error('Failed to log activity:', e);
    return null;
  }
}

export async function getLeaderboard(limit = 20) {
  try {
    const res = await fetch(`/api/activities/leaderboard?limit=${limit}`);
    return res.json();
  } catch {
    return [];
  }
}

export async function getUserStats(userId: string) {
  try {
    const res = await fetch(`/api/activities/user-stats?user_id=${userId}`);
    return res.json();
  } catch {
    return { total_stars: 0, recent_activities: [] };
  }
}

export async function claimDailyVisit() {
  const lastVisit = localStorage.getItem('daily_visit_date');
  const today = new Date().toDateString();
  if (lastVisit === today) return false;

  await logActivity('daily_visit');
  localStorage.setItem('daily_visit_date', today);
  return true;
}
