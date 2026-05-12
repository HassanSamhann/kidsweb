import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حصن المسلم - الأذكار والأدعية',
  description:
    'أذكار الصباح والمساء، أذكار بعد الصلاة، أدعية قرآنية وأدعية الأنبياء، تسابيح، وأذكار النوم والاستيقاظ. حصن نفسك بالذكر.',
  openGraph: {
    title: 'حصن المسلم - الأذكار والأدعية اليومية | إسلامي',
    description: 'أذكار الصباح والمساء، أذكار بعد الصلاة، أدعية وأذكار متنوعة من الكتاب والسنة.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
