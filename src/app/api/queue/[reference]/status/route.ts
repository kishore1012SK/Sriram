import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';
import { QueueTokenStatus } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { reference } = await params;
    const body = await request.json();
    const { status, employee_id } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = db.updateWalkInTokenStatus(
      reference,
      status as QueueTokenStatus,
      employee_id,
      session.id
    );

    return NextResponse.json({ success: true, token: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update token status';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
