import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (!['verified', 'rejected', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'Status must be verified, rejected, or failed' }, { status: 400 });
    }

    const updated = db.verifyPayment(id, status, session.id, notes);
    return NextResponse.json({ success: true, payment: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
