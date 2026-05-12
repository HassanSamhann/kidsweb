import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الإنجازات',
  description:
    'لوحة إنجازاتك - تابع تقدمك وجدول أعمالك اليومية. إحصائيات القراءة، الأذكار، والتحديات. حافظ على استمرارية عباداتك.',
  openGraph: {
    title: 'الإنجازات | إسلامي',
    description: 'تابع إنجازاتك اليومية في القراءة والأذكار والتحديات.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
