import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const token = db.getWalkInTokenByReference(reference);

  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  // Safe view for customer: return status and position
  const allTokens = db.getWalkInTokens(token.token_date);
  const waitingAhead = allTokens.filter(
    (t) => t.token_number < token.token_number && ['waiting', 'called', 'checked_in'].includes(t.status)
  ).length;

  return NextResponse.json({
    token: {
      token_number: token.token_number,
      token_date: token.token_date,
      reference: token.reference,
      customer_name: token.customer_name,
      service_name: token.service_name,
      status: token.status,
      estimated_wait_minutes: token.estimated_wait_minutes,
      waiting_ahead: waitingAhead,
      called_at: token.called_at,
      service_started_at: token.service_started_at,
      completed_at: token.completed_at,
      created_at: token.created_at,
    },
  });
}
