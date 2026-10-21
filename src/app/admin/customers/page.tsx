import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { CustomersClient } from './CustomersClient';


export default async function AdminCustomersPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    redirect('/admin/login');
  }

  const profiles = db.getAllProfiles().filter((p) => p.role === 'customer');
  const appointments = db.getAppointments();

  const customerMap = new Map<string, {
    id: string;
    name: string;
    phone: string;
    email?: string;
    totalBookings: number;
    lastBookingDate?: string;
  }>();

  for (const p of profiles) {
    customerMap.set(p.phone, {
      id: p.id,
      name: p.full_name,
      phone: p.phone,
      email: p.email,
      totalBookings: 0,
    });
  }

  for (const a of appointments) {
    const existing = customerMap.get(a.customer_phone);
    if (existing) {
      existing.totalBookings += 1;
      if (!existing.lastBookingDate || a.appointment_date > existing.lastBookingDate) {
        existing.lastBookingDate = a.appointment_date;
      }
    } else {
      customerMap.set(a.customer_phone, {
        id: a.customer_id || `cust-${a.customer_phone}`,
        name: a.customer_name,
        phone: a.customer_phone,
        email: a.customer_email || undefined,
        totalBookings: 1,
        lastBookingDate: a.appointment_date,
      });
    }
  }

  return <CustomersClient initialCustomers={Array.from(customerMap.values())} />;
}
