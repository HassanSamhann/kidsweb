'use client';

import React from 'react';
import { Search, Radio, Globe, Moon, User, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-20 bg-[#1e2329] border-b border-[#2d3748] flex items-center justify-between px-6 sticky top-0 z-30">
      
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 text-gray-400 hover:text-white transition"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xl relative mx-4">
        <Search className="absolute left-4 w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder="البحث عن قارئ، سورة، أو ذكر..."
          className="w-full bg-[#1a1d24] border border-[#2d3748] rounded-full py-2.5 pl-12 pr-6 text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-right"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors text-sm font-bold shadow-lg shadow-red-600/20">
          <Radio className="w-4 h-4" />
          <span>راديو مباشر</span>
        </button>

        <div className="h-8 w-px bg-[#2d3748] mx-2 hidden md:block"></div>

        <button className="p-2 text-gray-400 hover:text-white transition" title="English">
          <Globe className="w-5 h-5" />
        </button>
        
        <button className="p-2 text-gray-400 hover:text-white transition" title="الوضع الليلي">
          <Moon className="w-5 h-5" />
        </button>

        <button className="flex items-center gap-2 p-1.5 md:px-4 md:py-2 bg-[#2d3748] hover:bg-[#364052] text-gray-200 rounded-full transition-all border border-transparent hover:border-gray-500">
          <User className="w-5 h-5" />
          <span className="hidden md:inline text-sm font-bold">
            {mounted && user ? user.username : 'تسجيل الدخول'}
          </span>
        </button>
      </div>
      
    </header>
  );
}
