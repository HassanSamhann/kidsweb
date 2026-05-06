'use client';

import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '../../components/ui/PageWrapper';
import { AppHeader } from '../../components/layout/AppHeader';
import { BottomNav } from '../../components/layout/BottomNav';
import { Droplets, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export default function GamesPage() {
  const { user } = useAuth();
  const completedGames = user?.completed_games || [];

  const games = [
    {
      id: 'wudhu',
      title: 'ترتيب الوضوء',
      description: 'تعلم كيف تتوضأ للصلاة بالترتيب الصحيح',
      href: '/games/wudhu',
      icon: Droplets,
      color: 'bg-sky-light text-sky-800 border-sky',
      iconColor: 'text-sky'
    },
    {
      id: 'prayer',
      title: 'أركان الصلاة',
      description: 'طابق أركان الصلاة مع ترتيبها الصحيح',
      href: '/games/prayer',
      icon: Heart,
      color: 'bg-primary-light text-primary-dark border-primary',
      iconColor: 'text-primary'
    }
  ];

  return (
    <PageWrapper>
      <AppHeader title="الألعاب" />
      <div className="p-4 flex-1 space-y-4">
        {games.map(game => {
          const Icon = game.icon;
          const isCompleted = completedGames.includes(game.id);
          
          return (
            <Link key={game.id} href={game.href} className="block">
              <div className={cn(
                "rounded-[2rem] p-6 shadow-md border-4 transition-all duration-300 transform hover:scale-105 active:scale-95 relative overflow-hidden",
                game.color
              )}>
                {isCompleted && (
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-gold/20 rounded-full flex items-end justify-start p-4">
                    <span className="text-xl">⭐</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Icon className={cn("w-10 h-10", game.iconColor)} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black mb-1">{game.title}</h3>
                    <p className="font-bold opacity-80">{game.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <BottomNav />
    </PageWrapper>
  );
}
