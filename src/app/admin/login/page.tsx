'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
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
        throw new Error(data.error || 'Authentication failed');
      }

      if (!['owner', 'manager', 'staff'].includes(data.user?.role)) {
        throw new Error('Access denied: Account does not possess staff or owner privileges.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 bg-[#0b1c15] text-[#f6f1e8] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#122920] rounded-3xl p-8 sm:p-10 border border-[#c87d55]/30 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Logo isDark className="justify-center" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a3c30] text-[11px] font-bold text-[#d9916b] border border-[#c87d55]/30 mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff & Owner Portal</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white pt-2">
            Salon Operations Login
          </h1>
          <p className="text-xs text-[#ece3d3]/70">
            Authorized access only for Sriram Salon management and barbers.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#ece3d3]">Staff Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#ece3d3]/40 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sriramsalon.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1a3c30] bg-[#0b1c15] text-sm text-white focus:ring-2 focus:ring-[#c87d55] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#ece3d3]">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#ece3d3]/40 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1a3c30] bg-[#0b1c15] text-sm text-white focus:ring-2 focus:ring-[#c87d55] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#c87d55] hover:bg-[#b06942] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <ArrowRight className="w-4 h-4 text-white" />
            )}
            <span>Enter Admin Portal</span>
          </button>
        </form>

        <div className="p-4 rounded-xl bg-[#0b1c15] border border-[#1a3c30] text-[11px] text-[#ece3d3]/70 space-y-1">
          <p className="font-semibold text-white">Default Initial Owner Credentials:</p>
          <p>Email: <code className="text-[#d9916b]">admin@sriramsalon.com</code></p>
          <p>Password: <code className="text-[#d9916b]">SriramAdmin@2026</code></p>
          <p className="text-[10px] text-gray-400 pt-1">
            (Password can be changed at any time in Owner Settings).
          </p>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-[#ece3d3]/70 hover:text-white transition-colors"
          >
            &larr; Return to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
}
