import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';

  // Return all registered customer profiles, plus aggregated customer records from appointments
  const profiles = db.getAllProfiles().filter((p) => p.role === 'customer');
  const appointments = db.getAppointments();

  // Combine profile and walk-in customer records
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

  let customers = Array.from(customerMap.values());
  if (search) {
    customers = customers.filter(
      (c) => c.name.toLowerCase().includes(search) || c.phone.includes(search) || (c.email && c.email.toLowerCase().includes(search))
    );
  }

  return NextResponse.json({ customers });
}
