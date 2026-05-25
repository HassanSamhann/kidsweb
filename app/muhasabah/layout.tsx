import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المحاسبة اليومية',
  description:
    'جدول المحاسبة اليومية - تابع أعمالك اليومية: الصلوات، الأذكار، قراءة القرآن، والصيام. حسّن عباداتك اليومية.',
  openGraph: {
    title: 'المحاسبة اليومية | إسلامي',
    description: 'جدول متابعة العبادات والأعمال اليومية.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
