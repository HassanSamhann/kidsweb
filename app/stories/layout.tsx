'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    // If we are mounted and no user, redirect to login
    // We use a small delay or check to avoid flashing if user is being loaded from localStorage
  }, []);

  if (!mounted) return null;

  if (!user) {
    // Redirect to login but save the attempted URL to return later if desired
    router.push('/login');
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <LoadingSpinner size={48} />
        <p className="text-gray-400 font-bold">يرجى تسجيل الدخول للوصول إلى ركن الأطفال...</p>
      </div>
    );
  }

  return <>{children}</>;
}
