'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AccountSignOutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a3c30] text-xs font-semibold text-[#f6f1e8] hover:bg-[#235040] border border-[#c87d55]/30 transition-colors self-start sm:self-auto"
    >
      <LogOut className="w-3.5 h-3.5 text-[#d9916b]" />
      <span>Sign Out</span>
    </button>
  );
}
