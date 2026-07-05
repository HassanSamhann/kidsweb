import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Radio, Globe, Moon, Sun, User as UserIcon, Menu, LogOut, ChevronDown, Star, LayoutDashboard, Settings, Shield, Loader2, X, BookOpen, BookText, HeartHandshake, Hash } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserStats } from '../../lib/activity';
import { InstallPWA } from '../InstallPWA';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  page:   <BookOpen className="w-4 h-4" />,
  surah:  <BookOpen className="w-4 h-4 text-cyan-400" />,
  hadith: <BookText className="w-4 h-4 text-blue-400" />,
  azkar:  <HeartHandshake className="w-4 h-4 text-purple-400" />,
  allah:  <Star className="w-4 h-4 text-amber-400" />,
};

const TYPE_LABELS: Record<string, string> = {
  page:   'صفحة',
  surah:  'سورة',
  hadith: 'حديث',
  azkar:  'أذكار',
  allah:  'اسم الله',
};

interface SearchResult {
  type: string;
  label: string;
  description?: string;
  path: string;
}

function useSearch() {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query || query.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setOpen(true);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  }, [query]);

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return { query, setQuery, results, loading, open, setOpen, clear };
};

export function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [starCount, setStarCount] = React.useState<number | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const { query, setQuery, results, loading, open, setOpen, clear } = useSearch();

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
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  React.useEffect(() => {
    clear();
  }, [pathname]);

  const handleSearchSelect = (path: string) => {
    clear();
    router.push(path);
  };

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
      <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative mx-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="البحث عن قارئ، سورة، أو ذكر..."
          className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] rounded-full py-2.5 pl-12 pr-6 text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-right"
        />
        {/* Loading / Clear */}
        <div className="absolute left-11 top-1/2 -translate-y-1/2 flex items-center">
          {loading ? (
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
          ) : query ? (
            <button onClick={clear} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {/* Search Dropdown */}
        {open && (
          <div className="search-dropdown max-h-[380px] overflow-y-auto w-full">
            {results.length === 0 && !loading ? (
              <div className="px-4 py-6 text-center text-[var(--text-muted)] text-sm">
                لا توجد نتائج لـ «{query}»
              </div>
            ) : (
              <ul className="py-1">
                {results.map((r, i) => (
                  <li key={`${r.type}-${i}`}>
                    <button
                      onClick={() => handleSearchSelect(r.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-[var(--bg-input)] transition-colors group"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--bg-app)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-cyan-400 transition-colors">
                        {TYPE_ICONS[r.type] || <Hash className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{r.label}</p>
                        {r.description && (
                          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{r.description}</p>
                        )}
                      </div>
                      <span className="flex-shrink-0 text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-app)] px-2 py-0.5 rounded-full">
                        {TYPE_LABELS[r.type] || r.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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

        <InstallPWA />

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
                {mounted && user?.role === 'admin' && (
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
