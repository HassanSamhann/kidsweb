'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, BookText, HeartHandshake, Smile, Settings } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/quran', icon: BookOpen, label: 'القرآن الكريم' },
    { href: '/hadith', icon: BookText, label: 'الحديث النبوي' },
    { href: '/azkar', icon: HeartHandshake, label: 'حصن المسلم' },
    { href: '/stories', icon: Smile, label: 'ركن الأطفال' },
  ];

  return (
    <aside className="w-64 bg-[#1a1d24] border-l border-[#2d3748] h-full flex flex-col text-gray-300 hidden md:flex shrink-0 z-40 relative">
      <div className="p-6 flex items-center gap-3 border-b border-[#2d3748]">
        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 text-xl">
          🕌
        </div>
        <h1 className="text-2xl font-black text-white">إسلامي</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2d3748] text-cyan-400 font-bold border-r-4 border-cyan-400' 
                  : 'hover:bg-[#252b36] hover:text-white border-r-4 border-transparent'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2d3748]">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-[#252b36] hover:text-white transition-colors text-right">
          <Settings className="w-5 h-5 text-gray-400" />
          <span>الإعدادات</span>
        </button>
      </div>
    </aside>
  );
}
