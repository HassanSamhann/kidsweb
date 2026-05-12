import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التحدي - أسئلة دينية',
  description:
    'تحدي الأسئلة الإسلامية - تنافس مع الآخرين في أسئلة دينية من القرآن والحديث والفقه والسيرة. اختبر معلوماتك واربح النجوم.',
  openGraph: {
    title: 'التحدي - أسئلة دينية تفاعلية | إسلامي',
    description: 'تنافس مع الآخرين في أسئلة إسلامية واربح النجوم. اختبر معرفتك الدينية.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
