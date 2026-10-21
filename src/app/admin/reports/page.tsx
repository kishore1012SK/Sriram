import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { ReportsClient } from './ReportsClient';


export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager'].includes(session.role)) {
    redirect('/admin/login');
  }

  const reports = db.getReports();

  return <ReportsClient initialReports={reports} />;
}
