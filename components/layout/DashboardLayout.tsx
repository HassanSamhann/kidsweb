'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { GlobalAudioPlayer } from '../audio/GlobalAudioPlayer';
import { usePathname } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  // Hide dashboard layout on auth pages
  const isAuthPage = pathname?.includes('/login') || pathname?.includes('/register');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#131619] text-gray-200 overflow-hidden font-arabic" dir="rtl">
      {/* Sidebar - Hidden on mobile by default */}
      <div className={`md:flex ${sidebarOpen ? 'flex absolute inset-0 z-50' : 'hidden'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <div 
            className="flex-1 bg-black/50 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-[#1a1d24] pb-24">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        <GlobalAudioPlayer />
      </div>
    </div>
  );
}
