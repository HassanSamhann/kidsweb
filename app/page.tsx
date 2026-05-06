'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If we have a user in localStorage, redirect to stories
    // Otherwise the middleware will catch it, but this is for client-side fast redirect
    if (user) {
      router.replace('/stories');
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-sky-light flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black text-primary animate-bounce mb-8">إسلامي乐园</h1>
        <LoadingSpinner size={48} />
      </div>
    </div>
  );
}
