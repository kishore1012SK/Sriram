'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Scissors,
  Users,
  UserCheck,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface Props {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { href: '/admin/queue', label: 'Walk-In Queue', icon: Ticket },
    { href: '/admin/services', label: 'Services', icon: Scissors },
    { href: '/admin/employees', label: 'Employees', icon: Users, roles: ['owner', 'manager'] },
    { href: '/admin/customers', label: 'Customers', icon: UserCheck },
    { href: '/admin/sales', label: 'Sales & POS', icon: CreditCard },
    { href: '/admin/expenses', label: 'Expenses', icon: Receipt, roles: ['owner', 'manager'] },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3, roles: ['owner', 'manager'] },
    { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['owner'] },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const filteredNav = navItems.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#0b1c15] text-[#f6f1e8] p-4 flex items-center justify-between border-b border-[#1a3c30] sticky top-0 z-40">
        <Logo isDark />
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-[#ece3d3] hover:bg-[#1a3c30]"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0b1c15] text-[#f6f1e8] border-r border-[#1a3c30] flex flex-col justify-between transition-transform lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Logo isDark />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 rounded-md text-[#ece3d3] hover:bg-[#1a3c30]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="p-3 rounded-2xl bg-[#122920] border border-[#1a3c30] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a3c30] text-[#d9916b] font-bold flex items-center justify-center text-sm border border-[#c87d55]/30">
              {user.full_name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c87d55]/20 text-[#d9916b] uppercase font-bold tracking-wider inline-block">
                {user.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1a3c30] text-white border-l-4 border-[#c87d55] shadow'
                      : 'text-[#ece3d3]/75 hover:bg-[#122920] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#d9916b]' : 'text-[#ece3d3]/50'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-[#1a3c30] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#ece3d3]/70 hover:bg-[#122920] hover:text-white"
          >
            <span>Customer Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}
    </>
  );
}
