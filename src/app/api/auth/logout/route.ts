import { NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/auth/session';

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({ authenticated: true, user: session });
}
