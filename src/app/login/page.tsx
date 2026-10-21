'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      if (['owner', 'manager', 'staff'].includes(data.user?.role)) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 bg-[#fbf9f5] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#e6ddce] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Logo className="justify-center" />
          <h1 className="font-serif text-2xl font-bold text-[#122920] pt-2">
            Welcome Back
          </h1>
          <p className="text-xs text-[#122920]/70">
            Sign in to view your appointments and manage your profile.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#122920]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#122920]/50 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:ring-2 focus:ring-[#c87d55] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#122920]">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#122920]/50 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:ring-2 focus:ring-[#c87d55] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] transition-colors flex items-center justify-center gap-2 shadow"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#d9916b]" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#d9916b]" />
            )}
            <span>Sign In</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#f4efe6] text-center text-xs text-[#122920]/75 space-y-2">
          <p>
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-semibold text-[#b06942] hover:underline">
              Create an Account
            </Link>
          </p>
          <p>
            Are you salon staff?{' '}
            <Link href="/admin/login" className="font-semibold text-[#122920] hover:underline">
              Admin Login &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
