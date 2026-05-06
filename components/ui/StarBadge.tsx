import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StarBadgeProps {
  count: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StarBadge({ count, className, size = 'md' }: StarBadgeProps) {
  return (
    <div 
      className={cn(
        'inline-flex items-center justify-center font-bold bg-white rounded-full shadow-sm border-2 border-gold-light',
        {
          'px-2 py-1 text-sm': size === 'sm',
          'px-3 py-1.5 text-base': size === 'md',
          'px-4 py-2 text-xl': size === 'lg',
        },
        className
      )}
    >
      <Star 
        className={cn(
          'fill-gold text-gold mr-1 animate-pulse-slow',
          {
            'w-4 h-4': size === 'sm',
            'w-5 h-5': size === 'md',
            'w-7 h-7': size === 'lg',
          }
        )} 
      />
      <span className="text-gray-800">{count}</span>
    </div>
  );
}
