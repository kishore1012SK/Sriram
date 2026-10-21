import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { ExpensesClient } from './ExpensesClient';


export default async function AdminExpensesPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager'].includes(session.role)) {
    redirect('/admin/login');
  }

  const expenses = db.getExpenses();

  return <ExpensesClient initialExpenses={expenses} />;
}
