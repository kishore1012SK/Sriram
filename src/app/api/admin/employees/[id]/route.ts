import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only the salon owner can update employees' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = db.updateEmployee(id, body, session.id);
    return NextResponse.json({ success: true, employee: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update employee';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
