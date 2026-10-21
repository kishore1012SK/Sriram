import { NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { getSession } from '@/lib/auth/session';
import { ExpenseCategory } from '@/lib/types';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !['owner', 'manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const category = (searchParams.get('category') as ExpenseCategory) || undefined;

  const expenses = db.getExpenses({ startDate, endDate, category });
  return NextResponse.json({ expenses });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['owner', 'manager'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { category, amount, expense_date, description } = body;

    if (!category || amount === undefined || !expense_date || !description) {
      return NextResponse.json(
        { error: 'Category, amount, date, and description are required' },
        { status: 400 }
      );
    }

    const expense = db.addExpense({
      category: category as ExpenseCategory,
      amount: Number(amount),
      expense_date,
      description,
      recorded_by: session.id,
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add expense';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
