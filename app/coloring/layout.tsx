import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تلوين إسلامي للأطفال',
  description:
    'رسومات تلوين إسلامية للأطفال - صفحات تلوين تعليمية ممتعة تحتوي على رسومات إسلامية هادفة لتنمية مهارات الطفل.',
  openGraph: {
    title: 'تلوين إسلامي للأطفال | إسلامي',
    description: 'صفحات تلوين إسلامية ممتعة وتعليمية للأطفال.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
