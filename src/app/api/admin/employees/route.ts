import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const employees = db.getEmployees(false);
  return NextResponse.json({ employees });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only the salon owner can add employees' }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, is_active, services } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Employee name is required' }, { status: 400 });
    }

    const newEmp = db.addEmployee(
      {
        name: name.trim(),
        phone: phone?.trim() || '',
        is_active: is_active ?? true,
        services: services || [],
      },
      session.id
    );

    return NextResponse.json({ success: true, employee: newEmp });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add employee';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
