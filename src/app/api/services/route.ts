import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get('all') === 'true';

  const services = db.getServices(!showAll);
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, category, description, price, duration_minutes, is_active, allow_online_booking, allow_walk_in } = body;

    if (!name || price === undefined || duration_minutes === undefined) {
      return NextResponse.json({ error: 'Name, price, and duration are required' }, { status: 400 });
    }

    const newService = db.addService(
      {
        name,
        category: category || 'General',
        description: description || '',
        price: Number(price),
        duration_minutes: Number(duration_minutes),
        is_active: is_active ?? true,
        allow_online_booking: allow_online_booking ?? true,
        allow_walk_in: allow_walk_in ?? true,
      },
      session.id
    );

    return NextResponse.json({ success: true, service: newService });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add service';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
