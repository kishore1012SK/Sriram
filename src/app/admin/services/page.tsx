import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { ServicesManagerClient } from './ServicesManagerClient';


export default async function AdminServicesPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    redirect('/admin/login');
  }

  // Get all services including inactive
  const services = db.getServices(false);
  const canEdit = ['owner', 'manager'].includes(session.role);

  return <ServicesManagerClient initialServices={services} canEdit={canEdit} />;
}
