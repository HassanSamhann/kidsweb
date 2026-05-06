import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: setAuthUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !pin.trim()) {
      setError('الرجاء إدخال الاسم ورمز الدخول');
      return;
    }

    if (pin.length !== 4) {
      setError('رمز الدخول يجب أن يكون 4 أرقام');
      return;
    }

    setIsLoading(true);
    
    try {
      const { user, error: loginError } = await login(username, pin);
      
      if (loginError || !user) {
        setError(loginError || 'حدث خطأ غير معروف');
        return;
      }
      
      setAuthUser(user);
      router.push('/stories');
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-6 bg-[#1e2329] p-6 md:p-8 rounded-[2rem] shadow-2xl border border-[#2d3748]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white mb-2">أهلاً بك مجدداً!</h2>
        <p className="text-gray-400 font-medium">سجل دخولك لتكمل رحلتك</p>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center font-bold text-sm border border-red-500/20">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 font-bold mb-2 pr-2" htmlFor="username">
            اسم المستخدم
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-[#131619] border border-[#2d3748] text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold text-lg placeholder:text-gray-600"
            placeholder="ادخل اسمك هنا"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-gray-400 font-bold mb-2 pr-2" htmlFor="pin">
            الرقم السري (4 أرقام)
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-6 py-4 rounded-2xl bg-[#131619] border border-[#2d3748] text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold text-2xl text-center tracking-widest placeholder:text-gray-600"
            placeholder="••••"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-4 rounded-2xl font-black text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <LoadingSpinner size={24} className="text-black" /> : 'دخول'}
        </button>
      </div>
    </form>
  );
}
