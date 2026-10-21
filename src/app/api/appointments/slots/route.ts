import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('service_id');
  const employeeId = searchParams.get('employee_id') || undefined;

  if (!date || !serviceId) {
    return NextResponse.json(
      { error: 'Date and service_id are required' },
      { status: 400 }
    );
  }

  const slots = db.getAvailableSlots(date, serviceId, employeeId);
  return NextResponse.json({ slots });
}
