'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { Star, BookOpen, Gamepad2, LogOut, Settings } from 'lucide-react';
import { stories } from '../../data/stories';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const completedStoriesCount = user.completed_stories.length;
  const totalStories = stories.length;
  
  const completedGamesCount = user.completed_games.length;
  const totalGames = 2; // Wudhu and Prayer

  return (
    <PageWrapper>
      <AppHeader title="حسابي" showStars={false} />
      
      <div className="p-4 flex-1 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-sky-light text-center mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-sky-light/50 -z-10" />
          
          <div className="w-24 h-24 bg-primary text-white rounded-full mx-auto flex items-center justify-center text-4xl font-black mb-4 shadow-lg border-4 border-white">
            {user.username.charAt(0)}
          </div>
          
          <h2 className="text-3xl font-black text-gray-800 mb-2">{user.username}</h2>
          
          <div className="inline-flex items-center gap-2 bg-gold-light/50 px-6 py-3 rounded-full mt-2">
            <Star className="w-8 h-8 text-gold fill-gold" />
            <span className="text-2xl font-black text-gray-800">{user.stars} نجمة</span>
          </div>
        </div>

        {/* Stats */}
        <h3 className="text-xl font-black text-primary-dark mb-4 px-2">إنجازاتي</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-primary-light flex flex-col items-center text-center">
            <div className="p-3 bg-primary-light/20 rounded-full mb-3">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <span className="text-2xl font-black text-gray-800 mb-1">{completedStoriesCount}/{totalStories}</span>
            <span className="text-sm font-bold text-gray-500">قصص مقروءة</span>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-sky-light flex flex-col items-center text-center">
            <div className="p-3 bg-sky-light/50 rounded-full mb-3">
              <Gamepad2 className="w-8 h-8 text-sky" />
            </div>
            <span className="text-2xl font-black text-gray-800 mb-1">{completedGamesCount}/{totalGames}</span>
            <span className="text-sm font-bold text-gray-500">ألعاب منجزة</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.push('/settings')}
            className="gap-2 text-lg py-4"
          >
            <Settings className="w-5 h-5" /> الإعدادات
          </Button>
          <Button 
            variant="danger" 
            fullWidth 
            onClick={handleLogout}
            className="gap-2 text-lg py-4"
          >
            <LogOut className="w-5 h-5" /> تسجيل الخروج
          </Button>
        </div>
      </div>

      <BottomNav />
    </PageWrapper>
  );
}
