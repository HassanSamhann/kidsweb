import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الحديث النبوي الشريف',
  description:
    'موسوعة الأحاديث النبوية الشريفة - تصفح وقراءة الأحاديث الصحيحة من الأربعين النووية وغيرها. حديث اليوم النبوي الشريف.',
  openGraph: {
    title: 'الحديث النبوي الشريف | إسلامي',
    description: 'اقرأ الأحاديث النبوية الشريفة، حديث اليوم، والأربعين النووية كاملة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
