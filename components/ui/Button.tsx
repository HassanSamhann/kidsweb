import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-bold transition-all focus:outline-none focus:ring-4 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
          {
            'bg-primary text-white hover:bg-primary-dark focus:ring-primary': variant === 'primary',
            'bg-sky text-white hover:bg-[#4ab8e5] focus:ring-sky': variant === 'secondary',
            'border-4 border-primary text-primary hover:bg-primary hover:text-white': variant === 'outline',
            'bg-transparent text-gray-700 hover:bg-gray-100': variant === 'ghost',
            'bg-coral text-white hover:bg-red-600 focus:ring-coral': variant === 'danger',
            'px-4 py-2 text-sm min-h-[44px]': size === 'sm',
            'px-6 py-3 text-lg min-h-[56px]': size === 'md',
            'px-8 py-4 text-xl min-h-[64px]': size === 'lg',
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
