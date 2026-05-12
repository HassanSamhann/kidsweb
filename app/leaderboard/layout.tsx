import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المتصدرين - لوحة الشرف',
  description:
    'لوحة المتصدرين - تصدر قائمة الأكثر نشاطاً في المنصة. انضم إلى التحديات واربح النجوم لتتصدر القائمة.',
  openGraph: {
    title: 'المتصدرين | إسلامي',
    description: 'قائمة المتصدرين - تنافس مع الآخرين واربح النجوم لتكون في الصدارة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
