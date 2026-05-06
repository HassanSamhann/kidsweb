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
  title: 'إسلامي乐园 | العب وتعلم',
  description: 'تطبيق تعليمي تفاعلي للأطفال المسلمين',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cn(notoKufi.className, "antialiased")}>
        {children}
      </body>
    </html>
  );
}
