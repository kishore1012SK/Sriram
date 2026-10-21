import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { AppointmentsClient } from './AppointmentsClient';


export default async function AdminAppointmentsPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    redirect('/admin/login');
  }

  const appointments = db.getAppointments();

  return <AppointmentsClient initialAppointments={appointments} />;
}
