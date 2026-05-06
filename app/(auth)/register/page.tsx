'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '../../../features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-primary-light/20 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-primary mb-2 drop-shadow-sm">مرحباً بك في إسلامي乐园</h1>
          <p className="text-lg font-bold text-gray-600">هيا نصنع حساباً لك!</p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-6 text-center bg-white/60 p-4 rounded-2xl backdrop-blur-sm border-2 border-white">
          <p className="text-gray-600 font-bold mb-2">لديك حساب بالفعل؟</p>
          <Link 
            href="/login" 
            className="inline-block bg-sky-light text-sky-800 px-6 py-2 rounded-xl font-black hover:bg-sky hover:text-white transition-colors shadow-sm"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
