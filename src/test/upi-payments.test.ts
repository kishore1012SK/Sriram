import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db/store';
import { SALON_UPI_CONFIG, generateUpiLink, isValidUpiReference } from '@/lib/upi';

describe('Sriram Salon — UPI Payment Specifications', () => {
  it('has exact official business details and UPI ID', () => {
    expect(SALON_UPI_CONFIG.name).toBe('Sriram Salon');
    expect(SALON_UPI_CONFIG.upiId).toBe('kishoreramr2004@oksbi');
    expect(SALON_UPI_CONFIG.contactPhone).toBe('9486754402');
    expect(SALON_UPI_CONFIG.currency).toBe('INR');
  });

  describe('generateUpiLink', () => {
    it('generates standard compliant upi://pay deep link with all parameters', () => {
      const link = generateUpiLink({
        amount: 150,
        reference: 'SRM-20261021-TEST01',
      });

      expect(link.startsWith('upi://pay?')).toBe(true);
      const url = new URL(link);
      expect(url.searchParams.get('pa')).toBe('kishoreramr2004@oksbi');
      expect(url.searchParams.get('pn')).toBe('Sriram Salon');
      expect(url.searchParams.get('am')).toBe('150.00');
      expect(url.searchParams.get('cu')).toBe('INR');
      expect(url.searchParams.get('tr')).toBe('SRM-20261021-TEST01');
      expect(url.searchParams.get('tn')).toContain('SRM-20261021-TEST01');
    });

    it('formats decimal amounts accurately', () => {
      const link = generateUpiLink({
        amount: 70,
        reference: 'SRM-20261021-BEARD',
      });
      const url = new URL(link);
      expect(url.searchParams.get('am')).toBe('70.00');
    });
  });

  describe('isValidUpiReference', () => {
    it('validates 12-digit Indian bank UPI UTRs', () => {
      expect(isValidUpiReference('429182749102')).toBe(true);
      expect(isValidUpiReference('123456789012')).toBe(true);
      expect(isValidUpiReference('SBI123456789')).toBe(true);
    });

    it('rejects invalid or unsafe inputs', () => {
      expect(isValidUpiReference('')).toBe(false);
      expect(isValidUpiReference('   ')).toBe(false);
      expect(isValidUpiReference('123')).toBe(false); // too short (< 6 chars)
      expect(isValidUpiReference('123456789012345678901234567890123')).toBe(false); // too long (> 30 chars)
      expect(isValidUpiReference('DROP TABLE;')).toBe(false);
    });
  });

  describe('Database Payment Lifecycle & Non-Fake Verification', () => {
    // Dynamically isolate future Monday for each test run to avoid colliding with persisted bookings
    const runId = Math.floor(Math.random() * 500) + 10;
    const d = new Date('2029-01-01'); // Jan 1 2029 is a Monday
    d.setDate(d.getDate() + runId * 7);
    const testDate = d.toISOString().split('T')[0];

    it('records Cash appointment without creating pending online payment', () => {
      const app = db.createAppointment({
        customer_name: 'Cash Customer',
        customer_phone: '9840112233',
        service_id: 'srv-001',
        appointment_date: testDate,
        start_time: '07:00',
        payment_preference: 'cash',
      });

      expect(app.payment_preference).toBe('cash');
      expect(app.payment_status).toBe('pending');
      expect(app.upi_transaction_id).toBeNull();

      const paymentRecord = db.getPaymentByBookingReference(app.reference);
      expect(paymentRecord).toBeUndefined();
    });

    it('records UPI appointment in pending status and creates payment record', () => {
      const app = db.createAppointment({
        customer_name: 'UPI Customer',
        customer_phone: '9840998877',
        service_id: 'srv-001', // Men's Haircut, ₹150
        appointment_date: testDate,
        start_time: '08:00',
        payment_preference: 'upi',
      });

      expect(app.payment_preference).toBe('upi');
      expect(app.payment_status).toBe('pending');

      const payment = db.getPaymentByBookingReference(app.reference);
      expect(payment).toBeDefined();
      expect(payment?.amount).toBe(150);
      expect(payment?.upi_id).toBe('kishoreramr2004@oksbi');
      // STRICT REQUIREMENT: Status MUST remain pending upon creation
      expect(payment?.status).toBe('pending');
      expect(payment?.verified_at).toBeUndefined();
    });

    it('allows customer to submit UTR, retaining pending status for independent reconciliation', () => {
      const app = db.createAppointment({
        customer_name: 'Ramesh UTR Test',
        customer_phone: '9486123456',
        service_id: 'srv-002', // Children's Haircut, ₹100
        appointment_date: testDate,
        start_time: '09:00',
        payment_preference: 'upi',
      });

      // Customer marks payment attempted with 12-digit UTR
      const utr = '429182749102';
      const updatedPayment = db.recordPaymentAttempt({
        booking_reference: app.reference,
        upi_transaction_id: utr,
        notes: 'Submitted via Google Pay',
      });

      expect(updatedPayment.upi_transaction_id).toBe(utr);
      // STRICT: Must NOT be automatically marked verified!
      expect(updatedPayment.status).toBe('pending');

      const refreshedApp = db.getAppointmentByReference(app.reference);
      expect(refreshedApp?.upi_transaction_id).toBe(utr);
      expect(refreshedApp?.payment_status).toBe('pending');
    });

    it('allows admin to independently verify payment and automatically records sale', () => {
      const app = db.createAppointment({
        customer_name: 'Verified Customer',
        customer_phone: '9486999999',
        service_id: 'srv-003', // Beard Trimming, ₹70
        appointment_date: testDate,
        start_time: '11:00',
        payment_preference: 'upi',
        upi_transaction_id: '883920194821',
      });

      const payment = db.getPaymentByBookingReference(app.reference);
      expect(payment).toBeDefined();
      expect(payment?.status).toBe('pending');

      // Admin verifies transaction against bank statement
      const verified = db.verifyPayment(payment!.id, 'verified', 'admin-001', 'Bank credit confirmed');

      expect(verified.status).toBe('verified');
      expect(verified.verified_by).toBe('admin-001');
      expect(verified.verified_at).toBeDefined();

      // Check appointment status updated to verified
      const refreshedApp = db.getAppointmentByReference(app.reference);
      expect(refreshedApp?.payment_status).toBe('verified');

      // Check sales record automatically created
      const sales = db.getSales({ search: app.id });
      expect(sales.length).toBeGreaterThan(0);
      expect(sales[0].amount).toBe(70);
      expect(sales[0].payment_method).toBe('upi');
    });

    it('allows admin to reject invalid payment attempt', () => {
      const app = db.createAppointment({
        customer_name: 'Fake UTR Customer',
        customer_phone: '9486000000',
        service_id: 'srv-004', // Shaving, ₹80
        appointment_date: testDate,
        start_time: '12:00',
        payment_preference: 'upi',
        upi_transaction_id: '000000000000',
      });

      const payment = db.getPaymentByBookingReference(app.reference);
      expect(payment).toBeDefined();

      const rejected = db.verifyPayment(payment!.id, 'rejected', 'admin-001', 'No credit found in bank');
      expect(rejected.status).toBe('rejected');

      const refreshedApp = db.getAppointmentByReference(app.reference);
      expect(refreshedApp?.payment_status).toBe('rejected');
    });
  });
});
