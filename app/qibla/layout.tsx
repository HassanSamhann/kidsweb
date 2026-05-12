import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتجاه القبلة',
  description:
    'حدد اتجاه القبلة بدقة من موقعك الحالي باستخدام البوصلة. اعرف اتجاه الكعبة المشرفة لأداء الصلاة في الاتجاه الصحيح.',
  openGraph: {
    title: 'اتجاه القبلة - بوصلة القبلة | إسلامي',
    description: 'حدد اتجاه القبلة بدقة من أي مكان في العالم باستخدام البوصلة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
