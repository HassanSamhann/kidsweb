'use client';

export type ActivityType = 'azkar_morning' | 'azkar_evening' | 'quran_read' | 'quran_listen' | 'tafseer_listen' | 'hadith_read' | 'daily_visit';

const STAR_VALUES: Record<ActivityType, number> = {
  azkar_morning: 5,
  azkar_evening: 5,
  quran_read: 3,
  quran_listen: 2,
  tafseer_listen: 2,
  hadith_read: 3,
  daily_visit: 1,
};

const ACTIVITY_NAMES: Record<ActivityType, string> = {
  azkar_morning: 'إكمال أذكار الصباح',
  azkar_evening: 'إكمال أذكار المساء',
  quran_read: 'قراءة سورة من القرآن',
  quran_listen: 'استماع لتلاوة قرآنية',
  tafseer_listen: 'استماع لتسجيل تفسير',
  hadith_read: 'قراءة حديث نبوي',
  daily_visit: 'زيارة يومية',
};

export function getStarValue(type: ActivityType): number {
  return STAR_VALUES[type];
}

export function getActivityName(type: ActivityType): string {
  return ACTIVITY_NAMES[type];
}

export async function logActivity(type: ActivityType, metadata?: Record<string, unknown>) {
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
        stars: STAR_VALUES[type],
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
