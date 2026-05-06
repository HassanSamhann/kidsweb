import React from 'react';
import { StarBadge } from '../ui/StarBadge';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface AppHeaderProps {
  title: string;
  className?: string;
  showStars?: boolean;
}

export function AppHeader({ title, className, showStars = true }: AppHeaderProps) {
  const { user } = useAuth();

  return (
    <header className={cn('flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm sticky top-0 z-40', className)}>
      <h1 className="text-2xl font-extrabold text-primary-dark drop-shadow-sm">{title}</h1>
      {showStars && user && (
        <StarBadge count={user.stars} size="md" />
      )}
    </header>
  );
}
