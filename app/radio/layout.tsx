import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إذاعة القرآن الكريم',
  description:
    'إذاعة القرآن الكريم - استمع لبث مباشر لتلاوات عذبة من القرآن الكريم على مدار الساعة. تلاوات خاشعة لكبار القراء.',
  openGraph: {
    title: 'إذاعة القرآن الكريم | إسلامي',
    description: 'استمع للبث المباشر لإذاعة القرآن الكريم - تلاوات خاشعة على مدار الساعة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
