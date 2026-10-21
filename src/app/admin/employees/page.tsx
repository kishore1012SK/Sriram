import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { EmployeesManagerClient } from './EmployeesManagerClient';


export default async function AdminEmployeesPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager'].includes(session.role)) {
    redirect('/admin/login');
  }

  const employees = db.getEmployees(false);
  const services = db.getServices(true);
  const isOwner = session.role === 'owner';

  return (
    <EmployeesManagerClient
      initialEmployees={employees}
      services={services}
      isOwner={isOwner}
    />
  );
}
