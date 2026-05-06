import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Gamepad2, Palette, UserCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/stories', icon: BookOpen, label: 'قصص' },
    { href: '/games', icon: Gamepad2, label: 'ألعاب' },
    { href: '/coloring', icon: Palette, label: 'تلوين' },
    { href: '/profile', icon: UserCircle, label: 'حسابي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-gray-100 z-50">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center justify-center w-16 h-16 relative"
            >
              <div 
                className={cn(
                  'flex items-center justify-center transition-all duration-300 w-12 h-12 rounded-full',
                  isActive ? 'bg-primary-dark/10 -translate-y-2' : 'bg-transparent'
                )}
              >
                <Icon 
                  className={cn(
                    'transition-colors duration-300',
                    isActive ? 'text-primary w-7 h-7' : 'text-gray-400 w-6 h-6'
                  )} 
                />
              </div>
              <span 
                className={cn(
                  'text-xs font-bold transition-all duration-300 absolute bottom-0',
                  isActive ? 'text-primary opacity-100' : 'text-gray-400 opacity-80'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
