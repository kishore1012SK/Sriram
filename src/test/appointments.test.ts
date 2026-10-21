import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db/store';

describe('Appointment Booking & Conflict Validation', () => {
  // Use a unique Monday in the future for each test run to ensure clean isolated slots
  const runId = Math.floor(Math.random() * 50) + 1;
  // Calculate next Monday + runId weeks
  const d = new Date('2028-01-03'); // Jan 3 2028 is a Monday
  d.setDate(d.getDate() + runId * 7);
  const testDate = d.toISOString().split('T')[0];

  it('should successfully book an available slot and snapshot the official price', () => {
    const services = db.getServices(true);
    const haircut = services.find((s) => s.name === "Men's Haircut")!;
    const employees = db.getEmployees(true);
    const stylist = employees[0];

    const appointment = db.createAppointment({
      customer_name: 'Murugan',
      customer_phone: '9876543210',
      service_id: haircut.id,
      employee_id: stylist.id,
      appointment_date: testDate,
      start_time: '08:00',
    });

    expect(appointment).toBeDefined();
    expect(appointment.status).toBe('confirmed');
    expect(appointment.price_snapshot).toBe(150); // Locked to official price
    expect(appointment.duration_minutes).toBe(30);
    expect(appointment.end_time).toBe('08:30');
    expect(appointment.reference).toContain(`SRM-${testDate.replace(/-/g, '')}-`);
  });

  it('should REJECT an overlapping appointment for the same employee', () => {
    const services = db.getServices(true);
    const haircut = services.find((s) => s.name === "Men's Haircut")!;
    const employees = db.getEmployees(true);
    const stylist = employees[0];

    // Attempting to book 08:15 to 08:45 overlaps with 08:00 to 08:30
    expect(() => {
      db.createAppointment({
        customer_name: 'Karthik',
        customer_phone: '9876543211',
        service_id: haircut.id,
        employee_id: stylist.id,
        appointment_date: testDate,
        start_time: '08:15',
      });
    }).toThrow(/already booked/i);
  });

  it('should REJECT an appointment booked during a salon break interval', () => {
    const services = db.getServices(true);
    const haircut = services.find((s) => s.name === "Men's Haircut")!;

    // 10:15 is inside the 10:00 - 10:30 break on weekdays
    expect(() => {
      db.createAppointment({
        customer_name: 'Praveen',
        customer_phone: '9876543212',
        service_id: haircut.id,
        appointment_date: testDate,
        start_time: '10:15',
      });
    }).toThrow(/outside salon opening hours or overlaps a break/i);
  });

  it('should update appointment status through valid transitions', () => {
    const services = db.getServices(true);
    const shave = services.find((s) => s.name === 'Shaving')!;

    const app = db.createAppointment({
      customer_name: 'Suresh',
      customer_phone: '9876543213',
      service_id: shave.id,
      appointment_date: testDate,
      start_time: '16:00',
    });

    const checkedIn = db.updateAppointmentStatus(app.id, 'checked_in');
    expect(checkedIn.status).toBe('checked_in');

    const inService = db.updateAppointmentStatus(app.id, 'in_service');
    expect(inService.status).toBe('in_service');

    const completed = db.updateAppointmentStatus(app.id, 'completed');
    expect(completed.status).toBe('completed');
  });
});
