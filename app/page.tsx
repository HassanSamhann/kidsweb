'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, BookText, HeartHandshake, Smile } from 'lucide-react';
import { PageWrapper } from '../components/ui/PageWrapper';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  const portals = [
    {
      title: 'القرآن الكريم',
      description: 'تلاوات خاشعة بأصوات كبار القراء',
      href: '/quran',
      icon: BookOpen,
      color: 'text-emerald-400 bg-emerald-500/10',
      borderColor: 'hover:border-emerald-500/50'
    },
    {
      title: 'الحديث النبوي',
      description: 'موسوعة الأحاديث النبوية الشريفة',
      href: '/hadith',
      icon: BookText,
      color: 'text-blue-400 bg-blue-500/10',
      borderColor: 'hover:border-blue-500/50'
    },
    {
      title: 'حصن المسلم',
      description: 'أذكار الصباح والمساء والأدعية',
      href: '/azkar',
      icon: HeartHandshake,
      color: 'text-purple-400 bg-purple-500/10',
      borderColor: 'hover:border-purple-500/50'
    },
    {
      title: 'ركن الأطفال',
      description: 'قصص، ألعاب، وتلوين ممتع ومفيد',
      href: '/stories',
      icon: Smile,
      color: 'text-orange-400 bg-orange-500/10',
      borderColor: 'hover:border-orange-500/50'
    }
  ];

  return (
    <div className="p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-white mb-3">أهلاً بك في منصة إسلامي</h1>
        <p className="text-gray-400 text-lg">بوابتك الشاملة للتعلم والعبادة</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl">
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <Link key={portal.href} href={portal.href}>
              <div className={`flex items-center p-8 rounded-[2rem] cursor-pointer transition-all duration-300 transform hover:-translate-y-2 bg-[#1e2329] border border-[#2d3748] shadow-xl ${portal.borderColor}`}>
                <div className={`p-5 rounded-2xl ml-6 ${portal.color}`}>
                  <Icon className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 font-arabic">{portal.title}</h2>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed">{portal.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
