import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تفسير القرآن الكريم',
  description:
    'تفسير القرآن الكريم - اقرأ تفسير آيات القرآن مع التفاسير الموثوقة. تفسير مختصر لكل آية من آيات الذكر الحكيم.',
  openGraph: {
    title: 'تفسير القرآن الكريم | إسلامي',
    description: 'تفسير آيات القرآن الكريم مع التفاسير الموثوقة والمختصرة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
