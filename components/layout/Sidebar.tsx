'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Home, BookOpen, BookText, HeartHandshake, Smile, Settings, Radio as RadioIcon, Info, Clock, Star, BookMarked, Headphones, Trophy, LayoutDashboard, Swords, Compass, Shield } from 'lucide-react';

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/challenge', icon: Swords, label: 'التحدي', isNew: true },
    { href: '/quran', icon: BookOpen, label: 'القرآن الكريم' },
    { href: '/quran-read', icon: BookMarked, label: 'قراءة القرآن' },
    { href: '/tafseer', icon: Headphones, label: 'التفسير' },
    { href: '/radio', icon: RadioIcon, label: 'إذاعة القرآن' },
    { href: '/hadith', icon: BookText, label: 'الحديث النبوي' },
    { href: '/azkar', icon: HeartHandshake, label: 'حصن المسلم' },
    { href: '/prayer', icon: Clock, label: 'مواقيت الصلاة' },
    { href: '/qibla', icon: Compass, label: 'اتجاه القبلة' },
    { href: '/asmaa-allah', icon: Star, label: 'أسماء الله الحسنى' },
    { href: '/stories', icon: Smile, label: 'ركن الأطفال' },
    { href: '/about', icon: Info, label: 'من نحن' },
    { href: '/dashboard', icon: LayoutDashboard, label: 'الإنجازات' },
    { href: '/leaderboard', icon: Trophy, label: 'المتصدرين' },
  ];

  return (
    <aside className="w-64 bg-[var(--bg-sidebar)] border-l border-[var(--border-color)] h-full flex flex-col text-[var(--text-secondary)] shrink-0 z-40 relative transition-colors">
      <div className="p-6 flex items-center gap-3 border-b border-[var(--border-color)]">
        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
          <svg 
            viewBox="0 0 24 24" 
            className="w-6 h-6 text-cyan-500"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20 12v10"/><path d="M4 12v10"/><path d="M2 20h20"/><path d="M7 22v-5c0-1.1.9-2 2-2h6a2 2 0 0 1 2 2v5"/><path d="M12 2v2"/><path d="M12 8c-2.2 0-4-1.8-4-4a4 4 0 0 1 8 0c0 2.2-1.8 4-4 4Z"/><path d="M3.5 12a2.5 2.5 0 0 1 5 0"/><path d="M15.5 12a2.5 2.5 0 0 1 5 0"/><path d="M2 12h5"/><path d="M17 12h5"/>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-white">إسلامي</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-[#2d3748] text-cyan-400 font-bold border-r-4 border-cyan-400' 
                  : 'hover:bg-[#252b36] hover:text-white border-r-4 border-transparent'
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {(item as any).isNew && (
                  <span className="mr-auto text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">جديد</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)] space-y-2">
        <Link href="/settings" onClick={onClose} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-[#252b36] hover:text-white transition-colors text-right">
          <Settings className="w-5 h-5 text-gray-400" />
          <span>الإعدادات</span>
        </Link>
        {user?.role === 'admin' && (
          <Link href="/admin" onClick={onClose} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-[#252b36] hover:text-white transition-colors text-right">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-red-400">الإدارة</span>
          </Link>
        )}
        
        <div className="px-4 py-4 mt-2 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">Created by</p>
          <a 
            href="https://hassansamhan.vercel.app/" 
            target="_blank" 
            className="text-xs font-bold text-gray-300 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
          >
            Hassan Samhan
            <Settings className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>
    </aside>
  );
}
