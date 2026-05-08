import React from 'react';
import { cn } from '../../lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  withBottomNav?: boolean;
}

export function PageWrapper({ children, className, withBottomNav = true }: PageWrapperProps) {
  return (
      <main 
        className={cn(
          'min-h-screen bg-[var(--bg-main)] w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto relative overflow-hidden flex flex-col transition-colors',
          {
            'pb-20': withBottomNav
          },
          className
        )}
    >
      {children}
    </main>
  );
}
