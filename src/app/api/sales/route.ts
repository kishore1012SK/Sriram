import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';
import { PaymentMethod } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const search = searchParams.get('search') || undefined;

  const sales = db.getSales({ startDate, endDate, search });
  return NextResponse.json({ sales });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { appointment_id, walk_in_token_id, service_id, amount, payment_method, notes } = body;

    if (!service_id || amount === undefined || !payment_method) {
      return NextResponse.json(
        { error: 'Service, amount, and payment method are required' },
        { status: 400 }
      );
    }

    const sale = db.recordSale({
      appointment_id: appointment_id || null,
      walk_in_token_id: walk_in_token_id || null,
      service_id,
      amount: Number(amount),
      payment_method: payment_method as PaymentMethod,
      notes: notes || null,
      recorded_by: session.id,
    });

    return NextResponse.json({ success: true, sale });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record sale';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
