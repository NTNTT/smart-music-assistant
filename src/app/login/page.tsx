'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Music, Mail, Lock, Sparkles, User, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);

  useEffect(() => {
    setIsSupabaseActive(!!supabase);
    
    // Check if user is already logged in
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.push('/');
        }
      });
    }
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      // Offline fallback: simulate login and redirect
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        router.push('/');
      }, 800);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split('@')[0],
            },
          },
        });

        if (error) throw error;
        
        setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản (hoặc đăng nhập ngay nếu email auto-confirm được bật).');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        router.push('/');
        // Trigger a page reload after a short delay to ensure context refreshes session state
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra trong quá trình xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-[#06070c] flex items-center justify-center p-4 overflow-hidden z-50">
      
      {/* Dynamic ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 filter blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/10 filter blur-[120px] pointer-events-none animate-pulse [animation-duration:6s]" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-zinc-800/50 shadow-2xl relative flex flex-col gap-6 backdrop-blur-2xl">
        
        {/* App Logo & Welcome Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Music className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300">
              Smart Music Assistant
            </h1>
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mt-1.5 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI RECOMMENDATION & ASSISTANT PLATFORM
            </p>
          </div>
        </div>

        {/* Info Box: Active Mode */}
        {!isSupabaseActive && (
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/40 text-[11px] text-zinc-400 leading-relaxed flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-400 block">Chế độ Demo Khách (Offline Mock Mode)</span>
              Đang hoạt động do chưa điền thông tin cấu hình Supabase trong `.env.local`. Bạn có thể trải nghiệm toàn bộ tính năng mà không cần tài khoản!
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-800/20 text-xs text-rose-400 flex gap-2.5 items-center">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/20 text-xs text-emerald-400 flex gap-2.5 items-start">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {/* Display Name (Only on Sign Up) */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Tên hiển thị</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên của bạn..."
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={isSignUp}
                  className="w-full py-2.5 pl-10 pr-4 rounded-xl text-xs text-zinc-200 glass-input"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-2.5 pl-10 pr-4 rounded-xl text-xs text-zinc-200 glass-input"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 ml-1">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-2.5 pl-10 pr-4 rounded-xl text-xs text-zinc-200 glass-input"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black font-semibold text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSignUp ? 'Đăng ký tài khoản mới' : 'Đăng nhập ứng dụng'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separator / Guest choice */}
        <div className="flex flex-col gap-3.5 text-center mt-2 border-t border-zinc-800/40 pt-4">
          <div className="flex justify-between text-xs px-1">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-cyan-400 hover:text-emerald-400 transition-colors font-medium"
            >
              {isSignUp ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </button>
          </div>

          <button
            onClick={handleContinueAsGuest}
            className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-800/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            Tiếp tục với chế độ khách
          </button>
        </div>

      </div>
    </div>
  );
}
