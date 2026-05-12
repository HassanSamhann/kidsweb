import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'أسماء الله الحسنى',
  description:
    'أسماء الله الحسنى 99 اسماً مع معانيها - تعرف على أسماء الله وصفاته العلى مع شرح مبسط لكل اسم. أسماء الله الحسنى كاملة مكتوبة.',
  openGraph: {
    title: 'أسماء الله الحسنى - 99 اسماً | إسلامي',
    description: 'أسماء الله الحسنى كاملة 99 اسماً مع شرح المعاني والأدلة من الكتاب والسنة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
