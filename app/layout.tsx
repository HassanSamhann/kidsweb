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
  title: {
    default: 'إسلامي - القرآن الكريم، الحديث، الأذكار، مواقيت الصلاة',
    template: '%s | إسلامي',
  },
  description:
    'منصة إسلامية شاملة: القرآن الكريم مكتوباً بالرسم العثماني مع التفسير، الحديث النبوي، الأذكار والأدعية اليومية، مواقيت الصلاة، أسماء الله الحسنى، وتحديات دينية تفاعلية. تصفح واقرأ واستمع وتعلم.',
  keywords: [
    'إسلامي',
    'القرآن الكريم',
    'قرآن',
    'تفسير',
    'تفسير القرآن',
    'حديث نبوي',
    'الحديث الشريف',
    'الأربعون النووية',
    'أذكار',
    'حصن المسلم',
    'أذكار الصباح والمساء',
    'أدعية',
    'مواقيت الصلاة',
    'أوقات الصلاة',
    'أسماء الله الحسنى',
    '99 names of allah',
    'القبلة',
    'اتجاه القبلة',
    'تحديات دينية',
    'أسئلة دينية',
    'إسلام',
    'دين',
    'تعليم إسلامي',
    'قراءة القرآن',
    'القرآن مكتوب',
    'الرسم العثماني',
    'آية اليوم',
    'حديث اليوم',
    'قصص إسلامية',
    'قصص الأنبياء',
    'أطفال',
    'تلوين إسلامي',
    'ألعاب إسلامية',
    'إذاعة القرآن',
    'quran',
    'islam',
    'islamic app',
    'prayer times',
  ],
  authors: [{ name: 'Hassan Samhan', url: 'https://hassansamhan.vercel.app/' }],
  creator: 'Hassan Samhan',
  publisher: 'Hassan Samhan',
  metadataBase: new URL('https://islamy-rust.vercel.app/'),
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: 'https://islamy-rust.vercel.app/',
    siteName: 'إسلامي',
    title: 'إسلامي - المنصة الإسلامية الشاملة',
    description:
      'القرآن الكريم، التفسير، الحديث، الأذكار، مواقيت الصلاة، أسماء الله الحسنى، وتحديات تفاعلية',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'إسلامي - المنصة الإسلامية الشاملة',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'إسلامي',
    description:
      'القرآن الكريم، التفسير، الحديث، الأذكار، مواقيت الصلاة، وأسماء الله الحسنى',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon',
    apple: '/icon',
  },
  verification: {
    google: '-D68qZqPOhLYBLL52He4pdOs44aYGuBdz9GI2Rs6lXo',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'إسلامي',
  },
  category: 'education',
};

import { Providers } from '../components/providers/Providers';
import { JsonLd } from '../components/JsonLd';
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <JsonLd />
      </head>
      <body className={cn(notoKufi.className, "antialiased")}>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
