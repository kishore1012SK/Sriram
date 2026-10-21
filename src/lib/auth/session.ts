import { cookies } from 'next/headers';
import { Profile, UserRole } from '@/lib/types';
import { db } from '@/lib/db/store';

const SESSION_COOKIE_NAME = 'sriram_salon_session';

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const sessionData = Buffer.from(JSON.stringify(user)).toString('base64');

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    const user = JSON.parse(decoded) as SessionUser;

    // Verify user still exists in database
    const profile = db.findProfileById(user.id);
    if (!profile) return null;

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      role: profile.role,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error('Forbidden: Insufficient privileges');
  }

  return session;
}
