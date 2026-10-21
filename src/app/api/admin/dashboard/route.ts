import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || undefined;

  const metrics = db.getDashboardMetrics(date);
  return NextResponse.json({ metrics });
}
