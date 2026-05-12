import { MetadataRoute } from 'next';

const BASE = 'https://islamy-rust.vercel.app';

const staticPages = [
  '', '/quran', '/quran-read', '/tafseer', '/hadith', '/azkar',
  '/prayer', '/qibla', '/asmaa-allah', '/challenge', '/radio',
  '/stories', '/about', '/dashboard', '/leaderboard',
  '/games', '/coloring', '/settings', '/profile',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  const surahRoutes: MetadataRoute.Sitemap = Array.from({ length: 114 }, (_, i) => ({
    url: `${BASE}/quran/${i + 1}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...pages, ...surahRoutes];
}
