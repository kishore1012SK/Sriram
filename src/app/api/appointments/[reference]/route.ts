import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';
import { AppointmentStatus } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const appointment = db.getAppointmentByReference(reference);

  if (!appointment) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  return NextResponse.json({ appointment });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const body = await request.json();
    const { status, reason } = body;

    const appointment = db.getAppointmentByReference(reference);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const session = await getSession();

    // If customer is cancelling
    if (status === 'cancelled') {
      const updated = db.updateAppointmentStatus(
        appointment.id,
        'cancelled',
        reason || 'Customer cancellation',
        session?.id
      );
      return NextResponse.json({ success: true, appointment: updated });
    }

    // Status transitions other than cancellation require staff/manager/owner
    if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized to change appointment status' }, { status: 403 });
    }

    const updated = db.updateAppointmentStatus(
      appointment.id,
      status as AppointmentStatus,
      reason,
      session.id
    );

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
