'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Radio, Globe, Moon, Sun, User as UserIcon, Menu, LogOut, ChevronDown, Star, LayoutDashboard, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserStats } from '../../lib/activity';

export function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [starCount, setStarCount] = React.useState<number | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (user) {
      getUserStats(user.id).then(s => setStarCount(s.total_stars)).catch(() => {});
    }
  }, [user]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
      
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 text-gray-400 hover:text-white transition"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xl relative mx-4">
        <Search className="absolute left-4 w-5 h-5 text-[var(--text-muted)]" />
        <input 
          type="text" 
          placeholder="البحث عن قارئ، سورة، أو ذكر..."
          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-full py-2.5 pl-12 pr-6 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-right"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        <Link
          href="/radio"
          className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors text-sm font-bold shadow-lg shadow-red-600/20"
        >
          <Radio className="w-4 h-4" />
          <span>راديو مباشر</span>
        </Link>

        <div className="h-8 w-px bg-[var(--border-color)] mx-2 hidden md:block"></div>

        <button className="p-2 text-gray-400 hover:text-white transition" title="English">
          <Globe className="w-5 h-5" />
        </button>
        
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-white transition" 
          title={theme === 'dark' ? 'الوضع الصباحي' : 'الوضع الليلي'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {mounted && user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 md:px-4 md:py-2 bg-[var(--bg-card)] hover:bg-[var(--border-color)] text-[var(--text-primary)] rounded-full transition-all border border-[var(--border-color)]"
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-bold">
                {user.username}
              </span>
              {starCount !== null && (
                <span className="hidden md:flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3" />
                  {starCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-muted)]">مستخدم</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{user.username}</p>
                  {starCount !== null && (
                    <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3" /> {starCount} نجمة هذا الشهر
                    </p>
                  )}
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors text-sm font-bold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>لوحة الإنجازات</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors text-sm font-bold"
                >
                  <Settings className="w-4 h-4" />
                  <span>الإعدادات</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
                  >
                    <Shield className="w-4 h-4" />
                    <span>الإدارة</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                    router.push('/login');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              href="/login"
              className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link 
              href="/register"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-cyan-600/20"
            >
              إنشاء حساب
            </Link>
          </div>
        )}
      </div>
      
    </header>
  );
}
