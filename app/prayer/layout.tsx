import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مواقيت الصلاة',
  description:
    'مواقيت وأوقات الصلاة حسب مدينتك - اعرف مواقيت الفجر، الظهر، العصر، المغرب، والعشاء بدقة مع إشعارات الأذان.',
  openGraph: {
    title: 'مواقيت الصلاة | إسلامي',
    description: 'مواقيت الصلاة الدقيقة حسب موقعك - الفجر، الظهر، العصر، المغرب، العشاء.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
