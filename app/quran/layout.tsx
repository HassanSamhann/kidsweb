import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'القرآن الكريم - تلاوات',
  description:
    'استمع لتلاوات القرآن الكريم بأصوات كبار القراء. اختر السورة والقارئ واستمتع بأجمل التلاوات الخاشعة.',
  openGraph: {
    title: 'القرآن الكريم - استماع وتلاوات | إسلامي',
    description: 'استمع لتلاوات القرآن الكريم بصوت كبار القراء. اختر السورة التي تريد الاستماع إليها.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
