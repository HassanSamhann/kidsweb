'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '../../../features/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-sky-light flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-primary mb-2 drop-shadow-md">إسلامي乐园</h1>
          <p className="text-xl font-bold text-sky-700">العب، تعلم، وامرح!</p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center bg-white/60 p-4 rounded-2xl backdrop-blur-sm border-2 border-white">
          <p className="text-gray-600 font-bold mb-2">ليس لديك حساب؟</p>
          <Link 
            href="/register" 
            className="inline-block bg-gold-light text-yellow-800 px-6 py-2 rounded-xl font-black hover:bg-gold hover:text-white transition-colors shadow-sm"
          >
            سجل الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
