import type { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  let title = 'قصة إسلامية';
  try {
    const storiesPath = path.join(process.cwd(), 'data', 'stories.ts');
    if (fs.existsSync(storiesPath)) {
      const content = fs.readFileSync(storiesPath, 'utf-8');
      const match = content.match(new RegExp(`id:\\s*['"]${id}['"][^}]*title:\\s*['"]([^'"]+)['"]`, 's'));
      if (match) title = match[1];
    }
  } catch {}

  return {
    title,
    description: `اقرأ قصة ${title} - قصص إسلامية هادفة للأطفال. قصص من القرآن الكريم والسيرة النبوية.`,
    openGraph: {
      title: `${title} | إسلامي`,
      description: `قصة ${title} - قصص إسلامية للأطفال.`,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
