import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { DashboardClient } from './DashboardClient';


export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    redirect('/admin/login');
  }

  const metrics = db.getDashboardMetrics();

  return <DashboardClient initialMetrics={metrics} userRole={session.role} />;
}
