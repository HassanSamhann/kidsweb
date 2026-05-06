import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RewardPopupProps {
  show: boolean;
  message: string;
  onClose?: () => void;
}

export function RewardPopup({ show, message, onClose }: RewardPopupProps) {
  const [render, setRender] = useState(show);

  useEffect(() => {
    if (show) setRender(true);
  }, [show]);

  const handleAnimationEnd = () => {
    if (!show) setRender(false);
  };

  if (!render) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0"
      )}
      onTransitionEnd={handleAnimationEnd}
    >
      <div className={cn(
        "bg-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center justify-center transform transition-all duration-500",
        show ? "scale-100 translate-y-0" : "scale-50 translate-y-10"
      )}>
        <div className="relative mb-4">
          <Star className="w-24 h-24 text-gold fill-gold animate-bounce-slow" />
          <Star className="w-8 h-8 text-gold fill-gold absolute -top-2 -right-4 animate-pulse" />
          <Star className="w-6 h-6 text-gold fill-gold absolute top-4 -left-6 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        
        <h2 className="text-2xl font-black text-primary-dark mb-2 text-center">
          {message}
        </h2>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-6 py-2 font-bold transition-colors pointer-events-auto"
          >
            إغلاق
          </button>
        )}
      </div>
      
      {/* Confetti effect background overlay */}
      {show && (
        <div className="absolute inset-0 bg-black/10 -z-10 pointer-events-auto" onClick={onClose} />
      )}
    </div>
  );
}
