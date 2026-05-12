import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قصص إسلامية للأطفال',
  description:
    'قصص إسلامية ممتعة للأطفال - قصص الأنبياء، قصص الصحابة، وقصص من القرآن. محتوى هادف وتعليمي ممتع للصغار.',
  openGraph: {
    title: 'قصص إسلامية للأطفال | إسلامي',
    description: 'قصص إسلامية ممتعة وهادفة للأطفال - قصص الأنبياء والصحابة وقصص من القرآن.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
