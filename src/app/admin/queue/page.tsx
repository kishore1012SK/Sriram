import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { AdminQueueClient } from './AdminQueueClient';


export default async function AdminQueuePage() {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    redirect('/admin/login');
  }

  const tokens = db.getWalkInTokens();
  const services = db.getServices(true);
  const employees = db.getEmployees(true);

  return (
    <AdminQueueClient
      initialTokens={tokens}
      services={services}
      employees={employees}
    />
  );
}
