import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';
import { AppointmentStatus } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);

  const date = searchParams.get('date') || undefined;
  const status = (searchParams.get('status') as AppointmentStatus) || undefined;
  const employeeId = searchParams.get('employee_id') || undefined;
  const search = searchParams.get('search') || undefined;
  const phone = searchParams.get('phone') || undefined;

  // If customer is requesting, restrict to their own records
  if (session && session.role === 'customer') {
    const list = db.getAppointments({
      customer_id: session.id,
      status,
      date,
    });
    return NextResponse.json({ appointments: list });
  }

  // If unauthenticated user checks with their phone number (e.g. tracking my bookings)
  if (!session && phone) {
    const list = db.getAppointments({ search: phone.trim() });
    return NextResponse.json({ appointments: list });
  }

  // If admin/manager/staff
  if (session && ['owner', 'manager', 'staff'].includes(session.role)) {
    const list = db.getAppointments({
      date,
      status,
      employee_id: employeeId,
      search,
    });
    return NextResponse.json({ appointments: list });
  }

  return NextResponse.json({ error: 'Unauthorized to view appointments list' }, { status: 401 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      service_id,
      employee_id,
      appointment_date,
      start_time,
      notes,
      payment_preference,
      upi_transaction_id,
    } = body;

    // Validate inputs
    if (!customer_name?.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!customer_phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!service_id) {
      return NextResponse.json({ error: 'Please select a service' }, { status: 400 });
    }
    if (!appointment_date) {
      return NextResponse.json({ error: 'Appointment date is required' }, { status: 400 });
    }
    if (!start_time) {
      return NextResponse.json({ error: 'Appointment time is required' }, { status: 400 });
    }

    const session = await getSession();
    const customer_id = session?.id || null;

    const appointment = db.createAppointment({
      customer_id,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: customer_email?.trim() || null,
      service_id,
      employee_id: employee_id || null,
      appointment_date,
      start_time,
      notes: notes || null,
      payment_preference: payment_preference || 'cash',
      upi_transaction_id: upi_transaction_id || null,
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to book appointment';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
