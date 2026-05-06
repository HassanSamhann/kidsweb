import type { Metadata } from 'next';
import { Noto_Kufi_Arabic } from 'next/font/google';
import './globals.css';
import { cn } from '../lib/utils';

const notoKufi = Noto_Kufi_Arabic({ 
  subsets: ['arabic'],
  weight: ['400', '700', '900'],
  variable: '--font-noto-kufi'
});

export const metadata: Metadata = {
  title: 'إسلامي',
  description: 'قران, احاديث , قصص , ادعية, اذكار',
};

import { Providers } from '../components/providers/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cn(notoKufi.className, "antialiased")}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
