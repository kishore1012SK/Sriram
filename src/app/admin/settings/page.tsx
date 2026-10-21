import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { SettingsClient } from './SettingsClient';


export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== 'owner') {
    redirect('/admin/login');
  }

  const settings = db.getSettings();
  const hours = db.getBusinessHours();

  return <SettingsClient initialSettings={settings} initialHours={hours} />;
}
