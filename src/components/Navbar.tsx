'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { Menu, X, User, Calendar, Clock, Scissors, ShieldAlert } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; full_name: string; role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/book', label: 'Book Appointment' },
    { href: '/queue', label: 'Live Queue' },
    { href: '/contact', label: 'Contact & Hours' },
  ];

  const isAdminRoute = pathname?.startsWith('/admin');
  if (isAdminRoute) return null; // Admin has its own dedicated sidebar navigation

  return (
    <header className="sticky top-0 z-50 bg-[#fbf9f5]/90 backdrop-blur-md border-b border-[#e6ddce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#b06942] ${
                    isActive
                      ? 'text-[#122920] font-semibold border-b-2 border-[#c87d55] pb-1'
                      : 'text-[#122920]/75'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg bg-[#f6f1e8] text-[#122920] border border-[#e6ddce] hover:bg-[#ece3d3] transition-colors"
                >
                  <User className="w-4 h-4 text-[#b06942]" />
                  <span>{user.full_name.split(' ')[0]}</span>
                </Link>
                {['owner', 'manager', 'staff'].includes(user.role) && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#122920] text-[#f6f1e8] hover:bg-[#1a3c30] transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#d9916b]" />
                    Admin Portal
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[#122920] hover:text-[#b06942] transition-colors px-3 py-2"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#122920] hover:bg-[#1a3c30] border border-[#c87d55]/40 shadow-sm transition-all hover:shadow"
            >
              <Calendar className="w-4 h-4 text-[#d9916b]" />
              <span>Book Now</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[#122920] hover:bg-[#f6f1e8]"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#fbf9f5] border-b border-[#e6ddce] px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href
                  ? 'bg-[#f6f1e8] text-[#122920] font-semibold text-[#b06942]'
                  : 'text-[#122920]/80 hover:bg-[#f6f1e8]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-[#e6ddce] flex flex-col gap-2.5">
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-[#122920] hover:bg-[#f6f1e8]"
                >
                  <User className="w-5 h-5 text-[#b06942]" />
                  <span>My Account ({user.full_name})</span>
                </Link>
                {['owner', 'manager', 'staff'].includes(user.role) && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-[#f6f1e8] bg-[#122920]"
                  >
                    <ShieldAlert className="w-5 h-5 text-[#d9916b]" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium border border-[#e6ddce] bg-white text-[#122920]"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/book"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[#122920] text-white"
            >
              <Calendar className="w-4 h-4 text-[#d9916b]" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
