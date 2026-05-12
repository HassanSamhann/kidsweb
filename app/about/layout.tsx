import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن',
  description:
    'منصة إسلامي - منصة إسلامية شاملة تهدف لتقديم محتوى إسلامي موثوق وسهل الاستخدام. القرآن الكريم، الحديث، الأذكار، والتحديات.',
  openGraph: {
    title: 'من نحن | إسلامي',
    description: 'تعرف على منصة إسلامي - رؤيتنا ورسالتنا في تقديم المحتوى الإسلامي.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
