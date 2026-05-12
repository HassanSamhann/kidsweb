import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قراءة القرآن',
  description:
    'اقرأ القرآن الكريم كاملاً بالرسم العثماني - مصحف مكتوب بخط واضح مع تجربة قراءة سلسة. تصفح السور والصفحات بكل يسر.',
  openGraph: {
    title: 'قراءة القرآن بالرسم العثماني | إسلامي',
    description: 'اقرأ القرآن الكريم كاملاً بالرسم العثماني مع تجربة قراءة سلسة ومريحة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
