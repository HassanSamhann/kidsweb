import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function RegisterForm() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: setAuthUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('الرجاء إدخال اسمك');
      return;
    }

    if (pin.length !== 4) {
      setError('الرقم السري يجب أن يكون 4 أرقام');
      return;
    }

    if (pin !== confirmPin) {
      setError('الرقم السري غير متطابق');
      return;
    }

    setIsLoading(true);
    
    try {
      const { user, error: signUpError } = await signUp(username, pin);
      
      if (signUpError || !user) {
        setError(signUpError || 'حدث خطأ أثناء التسجيل');
        return;
      }
      
      setAuthUser(user);
      router.push('/stories'); // Redirect to home/stories
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5 bg-[#1e2329] p-6 md:p-8 rounded-[2rem] shadow-2xl border border-[#2d3748]">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-white mb-2">حساب جديد</h2>
        <p className="text-gray-400 font-medium">ابدأ رحلتك التعليمية معنا</p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-center font-bold text-sm border border-red-500/20">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 font-bold mb-1 pr-2 text-sm" htmlFor="username">
            اكتب اسمك
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-[#131619] border border-[#2d3748] text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold text-lg placeholder:text-gray-600"
            placeholder="مثال: أحمد"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-gray-400 font-bold mb-1 pr-2 text-sm" htmlFor="pin">
            اختر رقماً سرياً (4 أرقام)
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-5 py-3 rounded-2xl bg-[#131619] border border-[#2d3748] text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold text-2xl text-center tracking-widest placeholder:text-gray-600"
            placeholder="••••"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-gray-400 font-bold mb-1 pr-2 text-sm" htmlFor="confirmPin">
            أعد كتابة الرقم السري
          </label>
          <input
            id="confirmPin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-5 py-3 rounded-2xl bg-[#131619] border border-[#2d3748] text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold text-2xl text-center tracking-widest placeholder:text-gray-600"
            placeholder="••••"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-4 rounded-2xl font-black text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner size={24} className="text-black" /> : 'إنشاء الحساب'}
        </button>
      </div>
    </form>
  );
}
