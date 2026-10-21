import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/store';

describe('Walk-In Queue System & Sequence Validation', () => {
  it('should generate sequential walk-in tokens for the day with non-guessable references', () => {
    const services = db.getServices(true);
    const service = services[0];

    const token1 = db.createWalkInToken({
      customer_name: 'Dinesh',
      customer_phone: '9840123456',
      service_id: service.id,
    });

    const token2 = db.createWalkInToken({
      customer_name: 'Venkatesh',
      customer_phone: '9840123457',
      service_id: service.id,
    });

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token2.token_number).toBe(token1.token_number + 1);
    expect(token1.reference).toMatch(/^TK-\d{8}-[A-F0-9]{6}$/);
    expect(token2.reference).toMatch(/^TK-\d{8}-[A-F0-9]{6}$/);
    expect(token1.status).toBe('waiting');
  });

  it('should correctly transition through queue states: called, checked_in, in_service, completed', () => {
    const services = db.getServices(true);
    const service = services[0];
    const employees = db.getEmployees(true);

    const token = db.createWalkInToken({
      customer_name: 'Rajesh',
      customer_phone: '9840123458',
      service_id: service.id,
    });

    // 1. Called
    const called = db.updateWalkInTokenStatus(token.id, 'called');
    expect(called.status).toBe('called');
    expect(called.called_at).toBeDefined();

    // 2. Checked In
    const checkedIn = db.updateWalkInTokenStatus(token.id, 'checked_in');
    expect(checkedIn.status).toBe('checked_in');

    // 3. In Service with Stylist Assignment
    const inService = db.updateWalkInTokenStatus(token.id, 'in_service', employees[0].id);
    expect(inService.status).toBe('in_service');
    expect(inService.employee_id).toBe(employees[0].id);
    expect(inService.employee_name).toBe(employees[0].name);
    expect(inService.service_started_at).toBeDefined();

    // 4. Completed
    const completed = db.updateWalkInTokenStatus(token.id, 'completed');
    expect(completed.status).toBe('completed');
    expect(completed.completed_at).toBeDefined();
  });
});
