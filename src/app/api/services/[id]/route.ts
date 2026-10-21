import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const updated = db.updateService(id, body, session.id);
    return NextResponse.json({ success: true, service: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update service';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
