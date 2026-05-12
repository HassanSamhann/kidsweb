import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ألعاب إسلامية للأطفال',
  description:
    'ألعاب إسلامية تعليمية وممتعة للأطفال - تعلم أركان الصلاة، الوضوء، وغيرها من المهارات الإسلامية بطريقة تفاعلية.',
  openGraph: {
    title: 'ألعاب إسلامية للأطفال | إسلامي',
    description: 'ألعاب إسلامية تعليمية ممتعة للأطفال - تعلم العبادات بطريقة تفاعلية.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
