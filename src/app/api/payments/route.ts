import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';
import { PaymentRecordStatus } from '@/lib/types';
import { isValidUpiReference } from '@/lib/upi';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get('status') as PaymentRecordStatus) || undefined;
  const search = searchParams.get('search') || undefined;

  const payments = db.getPayments({ status, search });
  return NextResponse.json({ payments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_reference, upi_transaction_id, notes } = body;

    if (!booking_reference?.trim()) {
      return NextResponse.json({ error: 'Booking reference is required' }, { status: 400 });
    }
    if (!upi_transaction_id?.trim()) {
      return NextResponse.json({ error: 'UPI Transaction ID / UTR is required' }, { status: 400 });
    }

    if (!isValidUpiReference(upi_transaction_id)) {
      return NextResponse.json(
        { error: 'Please enter a valid UPI reference or 12-digit UTR number' },
        { status: 400 }
      );
    }

    const payment = db.recordPaymentAttempt({
      booking_reference: booking_reference.trim(),
      upi_transaction_id: upi_transaction_id.trim(),
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      payment,
      message:
        'Payment attempt recorded. Status will remain Pending until independently verified by salon administration.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record payment attempt';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
