import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AdminSidebar } from './AdminSidebar';


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If not authenticated or customer role, redirect to /admin/login
  // We can let /admin/login render its own page without the sidebar wrapper
  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col lg:flex-row">
      {session && ['owner', 'manager', 'staff'].includes(session.role) && (
        <AdminSidebar user={session} />
      )}
      <main className={`flex-1 min-w-0 ${session && ['owner', 'manager', 'staff'].includes(session.role) ? 'lg:pl-64' : ''}`}>
        {children}
      </main>
    </div>
  );
}
