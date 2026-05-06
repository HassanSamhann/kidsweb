'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '../../../features/auth/RegisterForm';
import { ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#131619] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md z-10">
        <div className="mb-6 flex justify-between items-center">
          <Link 
            href="/" 
            className="flex items-center text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            <span className="font-bold">العودة للرئيسية</span>
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">إنشاء حساب</h1>
          <p className="text-lg font-medium text-emerald-400">انضم إلينا في رحلة التعلم</p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-6 text-center p-6 rounded-[2rem] bg-[#1e2329] border border-[#2d3748] shadow-2xl">
          <p className="text-gray-400 font-bold mb-4 text-lg">لديك حساب بالفعل؟</p>
          <Link 
            href="/login" 
            className="inline-block w-full bg-[#2d3748] hover:bg-[#3d4b5f] text-white px-6 py-4 rounded-2xl font-black transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-[#4a5568]"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
