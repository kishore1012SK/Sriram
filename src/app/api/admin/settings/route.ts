import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const settings = db.getSettings();
  const businessHours = db.getBusinessHours();
  return NextResponse.json({ settings, businessHours });
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'Only the salon owner can update settings' }, { status: 403 });
    }

    const body = await request.json();
    const { settings, businessHours } = body;

    let updatedSettings = db.getSettings();
    if (settings) {
      updatedSettings = db.updateSettings(settings, session.id);
    }

    let updatedHours = db.getBusinessHours();
    if (businessHours && Array.isArray(businessHours)) {
      updatedHours = db.updateBusinessHours(businessHours, session.id);
    }

    return NextResponse.json({ success: true, settings: updatedSettings, businessHours: updatedHours });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
