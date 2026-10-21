import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { createSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const { email, phone, full_name, password } = await request.json();

    if (!email || !phone || !full_name || !password) {
      return NextResponse.json(
        { error: 'All fields (name, email, phone, password) are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const newUser = db.registerCustomer({
      email,
      phone,
      full_name,
      password,
    });

    await createSession({
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      phone: newUser.phone,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
