import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/store';

describe('Sales, Expenses & Recorded Operating Surplus', () => {
  it('should record a sale linked to an appointment with payment method and prevent duplicate sales', () => {
    const services = db.getServices(true);
    const service = services[0];

    const app = db.createAppointment({
      customer_name: 'Ganesh',
      customer_phone: '9443000001',
      service_id: service.id,
      appointment_date: '2026-11-10',
      start_time: '09:00',
    });

    // Record sale
    const sale = db.recordSale({
      appointment_id: app.id,
      service_id: service.id,
      amount: 150,
      payment_method: 'upi',
      notes: 'Customer paid via Google Pay QR',
    });

    expect(sale).toBeDefined();
    expect(sale.sale_number).toMatch(/^INV-\d{8}-[A-F0-9]{4}$/);
    expect(sale.amount).toBe(150);
    expect(sale.payment_method).toBe('upi');
    expect(sale.appointment_id).toBe(app.id);

    // Attempting to record duplicate sale for same appointment MUST throw
    expect(() => {
      db.recordSale({
        appointment_id: app.id,
        service_id: service.id,
        amount: 150,
        payment_method: 'cash',
      });
    }).toThrow(/already recorded/i);
  });

  it('should record operational expenses by category', () => {
    const expense = db.addExpense({
      category: 'supplies',
      amount: 450,
      expense_date: '2026-11-10',
      description: 'Sterilization spirit and replacement razor blades',
    });

    expect(expense).toBeDefined();
    expect(expense.category).toBe('supplies');
    expect(expense.amount).toBe(450);
  });

  it('should accurately calculate recorded operating surplus (Recorded Sales minus Recorded Expenses)', () => {
    const reports = db.getReports('2026-11-01', '2026-11-30');
    expect(reports.recordedOperatingSurplus).toBe(reports.totalSales - reports.totalExpenses);
  });
});
