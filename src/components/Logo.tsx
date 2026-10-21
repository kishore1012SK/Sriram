import React from 'react';
import Link from 'next/link';
import { Scissors } from 'lucide-react';

interface LogoProps {
  className?: string;
  isDark?: boolean;
}

export function Logo({ className = '', isDark = false }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
          isDark
            ? 'bg-[#1a3c30] text-[#d9916b] border border-[#c87d55]/30'
            : 'bg-[#122920] text-[#d9916b] shadow-sm'
        }`}
      >
        <Scissors className="w-5 h-5 -rotate-45" />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-serif tracking-wider font-bold text-lg leading-tight uppercase ${
            isDark ? 'text-[#f6f1e8]' : 'text-[#122920]'
          }`}
        >
          Sriram Salon
        </span>
        <span className="text-[10px] tracking-widest uppercase text-[#b06942] font-semibold">
          Pudukkottai • Estd.
        </span>
      </div>
    </Link>
  );
}
