import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || undefined;
  const session = await getSession();

  const tokens = db.getWalkInTokens(date);

  // If public request, mask customer phone numbers for privacy
  const isStaff = session && ['owner', 'manager', 'staff'].includes(session.role);

  const sanitizedTokens = tokens.map((t) => {
    if (isStaff) return t;
    return {
      id: t.id,
      token_number: t.token_number,
      token_date: t.token_date,
      reference: t.reference,
      customer_name: t.customer_name.charAt(0) + '***' + (t.customer_name.slice(-1) || ''),
      // Phone is NEVER exposed publicly
      service_id: t.service_id,
      service_name: t.service_name,
      status: t.status,
      estimated_wait_minutes: t.estimated_wait_minutes,
      called_at: t.called_at,
      created_at: t.created_at,
    };
  });

  return NextResponse.json({ tokens: sanitizedTokens });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, service_id, employee_id } = body;

    if (!customer_name?.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!customer_phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }
    if (!service_id) {
      return NextResponse.json({ error: 'Please select a service' }, { status: 400 });
    }

    const token = db.createWalkInToken({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      service_id,
      employee_id: employee_id || null,
    });

    return NextResponse.json({ success: true, token });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create token';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
