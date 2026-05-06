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
        'min-h-screen bg-cream w-full max-w-md mx-auto relative shadow-xl overflow-hidden flex flex-col',
        {
          'pb-20': withBottomNav // Space for bottom navigation
        },
        className
      )}
    >
      {children}
    </main>
  );
}
