'use client';

export type ActivityType = 'azkar_morning' | 'azkar_evening' | 'azkar_after_salah' | 'azkar_tasabih' | 'azkar_sleep' | 'azkar_wakeup' | 'azkar_dua_quran' | 'azkar_dua_prophets' | 'quran_read' | 'quran_listen' | 'tafseer_listen' | 'hadith_read' | 'daily_visit' | 'challenge_entry' | 'challenge_win' | 'challenge_lose';

const STAR_VALUES: Record<ActivityType, number> = {
  azkar_morning: 5,
  azkar_evening: 5,
  azkar_after_salah: 2,
  azkar_tasabih: 2,
  azkar_sleep: 3,
  azkar_wakeup: 1,
  azkar_dua_quran: 2,
  azkar_dua_prophets: 2,
  quran_read: 3,
  quran_listen: 2,
  tafseer_listen: 2,
  hadith_read: 3,
  daily_visit: 1,
  challenge_entry: -10,
  challenge_win: 20,
  challenge_lose: -10,
};

const ACTIVITY_NAMES: Record<ActivityType, string> = {
  azkar_morning: 'إكمال أذكار الصباح',
  azkar_evening: 'إكمال أذكار المساء',
  azkar_after_salah: 'إكمال أذكار بعد الصلاة',
  azkar_tasabih: 'إكمال التسابيح',
  azkar_sleep: 'إكمال أذكار النوم',
  azkar_wakeup: 'إكمال أذكار الاستيقاظ',
  azkar_dua_quran: 'إكمال الأدعية القرآنية',
  azkar_dua_prophets: 'إكمال أدعية الأنبياء',
  quran_read: 'قراءة سورة من القرآن',
  quran_listen: 'استماع لتلاوة قرآنية',
  tafseer_listen: 'استماع لتسجيل تفسير',
  hadith_read: 'قراءة حديث نبوي',
  daily_visit: 'زيارة يومية',
  challenge_entry: 'رسوم دخول التحدي',
  challenge_win: 'فوز في التحدي',
  challenge_lose: 'خسارة في التحدي',
};

export function getStarValue(type: ActivityType): number {
  return STAR_VALUES[type];
}

export function getActivityName(type: ActivityType): string {
  return ACTIVITY_NAMES[type];
}

// ---------------------------------------------------------------------------
// Azkar UI state (localStorage — for UI hints only, not for star calculations)
// ---------------------------------------------------------------------------

function today(): string {
  return new Date().toDateString();
}

export function isAzkarDoneToday(category: string): boolean {
  if (typeof window === 'undefined') return false;
  const key = `azkar_done_${category}_${today()}`;
  return localStorage.getItem(key) === 'true';
}

export function markAzkarDoneToday(category: string) {
  if (typeof window === 'undefined') return;
  const key = `azkar_done_${category}_${today()}`;
  localStorage.setItem(key, 'true');
}

// ---------------------------------------------------------------------------
// Progress persistence (localStorage — UI only)
// ---------------------------------------------------------------------------

const QURAN_PROGRESS_KEY = 'quran_progress';
const AZKAR_PROGRESS_PREFIX = 'azkar_progress_';

export function saveQuranProgress(surah: number, ayah?: number, page?: number) {
  const prev = getQuranProgress();
  localStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify({ surah, ayah: ayah ?? prev?.ayah, page: page ?? prev?.page, date: today() }));
}

export function getQuranProgress(): { surah: number; ayah?: number; page?: number } | null {
  try {
    const raw = localStorage.getItem(QURAN_PROGRESS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.surah ? { surah: data.surah, ayah: data.ayah, page: data.page } : null;
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

// ---------------------------------------------------------------------------
// canEarnToday — checks DB (server-side daily cap), not localStorage
// Returns the remaining stars the user can earn for this activity today.
// ---------------------------------------------------------------------------

export async function canEarnToday(type: ActivityType): Promise<boolean> {
  try {
    const stored = localStorage.getItem('kidsweb_user');
    if (!stored) return false;
    const user = JSON.parse(stored);
    if (!user?.id) return false;

    const res = await fetch(`/api/activities/can-earn?user_id=${user.id}&type=${type}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.can_earn === true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// logActivity — delegates daily cap to DB via log_activity_safe RPC
// Returns { actual_stars, total_stars } or null on failure
// ---------------------------------------------------------------------------

export async function logActivity(
  type: ActivityType,
  metadata?: Record<string, unknown>
): Promise<{ actual_stars: number; total_stars: number } | null> {
  const stored = localStorage.getItem('kidsweb_user');
  if (!stored) return null;

  const user = JSON.parse(stored);
  if (!user?.id) return null;

  try {
    const res = await fetch('/api/activities/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        activity_type: type,
        metadata: metadata || {},
      }),
    });

    if (!res.ok) return null;

    const result = await res.json();
    // result = { actual_stars: number, total_stars: number }
    return result;
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

export async function getLastMonthWinner() {
  try {
    const res = await fetch('/api/activities/last-month-winner', { cache: 'no-store' });
    return res.json();
  } catch {
    return { winner: null };
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

// ---------------------------------------------------------------------------
// claimDailyVisit — guards with localStorage date, logs via server
// ---------------------------------------------------------------------------

export async function claimDailyVisit() {
  const lastVisit = localStorage.getItem('daily_visit_date');
  const todayStr = new Date().toDateString();
  if (lastVisit === todayStr) return false;

  const result = await logActivity('daily_visit');
  if (result !== null) {
    localStorage.setItem('daily_visit_date', todayStr);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// syncTodayActivities
// Syncs azkar UI state (localStorage) from DB activities.
// Does NOT rebuild the daily cap from localStorage — the DB owns that.
// Returns the fresh user profile from DB.
// ---------------------------------------------------------------------------

export async function syncTodayActivities(userId: string): Promise<any | null> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [activitiesRes, profileRes] = await Promise.all([
      fetch(`/api/activities/today?user_id=${userId}&start_date=${startOfToday.toISOString()}`),
      fetch(`/api/users/profile?user_id=${userId}`),
    ]);

    const data       = await activitiesRes.json();
    const profileData = await profileRes.json();

    // Sync azkar UI done-state only (for hiding "أكملت" buttons)
    if (data && Array.isArray(data.activities)) {
      const todayStr = new Date().toDateString();
      const doneAzkarSet = new Set<string>();

      data.activities.forEach((act: any) => {
        if (act.activity_type.startsWith('azkar_') && act.stars > 0) {
          doneAzkarSet.add(act.activity_type);
        }
      });

      // Sync azkar_done_ keys for UI (does NOT affect star calculations)
      doneAzkarSet.forEach(type => {
        localStorage.setItem(`azkar_done_${type}_${todayStr}`, 'true');
      });

      // Sync daily visit key
      const hasVisit = data.activities.some((a: any) => a.activity_type === 'daily_visit' && a.stars > 0);
      if (hasVisit) {
        localStorage.setItem('daily_visit_date', todayStr);
      }
    }

    if (profileData && profileData.user) {
      return profileData.user;
    }
    return null;
  } catch (e) {
    console.error('Failed to sync today activities:', e);
    return null;
  }
}
