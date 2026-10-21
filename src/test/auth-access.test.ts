import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/store';

describe('Authentication, Security & Roles', () => {
  it('should authenticate the owner with configured credentials', () => {
    const verified = db.verifyCredentials('admin@sriramsalon.com', 'SriramAdmin@2026');
    expect(verified).not.toBeNull();
    expect(verified?.role).toBe('owner');
    expect(verified?.email).toBe('admin@sriramsalon.com');
  });

  it('should reject invalid credentials', () => {
    const verified = db.verifyCredentials('admin@sriramsalon.com', 'WrongPassword');
    expect(verified).toBeNull();
  });

  it('should register a customer with hashed password and customer role', () => {
    const uniqueEmail = `testcust-${Date.now()}@example.com`;
    const customer = db.registerCustomer({
      email: uniqueEmail,
      phone: '9840112233',
      full_name: 'Test Customer',
      password: 'SecurePass123',
    });

    expect(customer).toBeDefined();
    expect(customer.role).toBe('customer');
    expect(customer.email).toBe(uniqueEmail);

    // Verify login
    const login = db.verifyCredentials(uniqueEmail, 'SecurePass123');
    expect(login).not.toBeNull();
    expect(login?.full_name).toBe('Test Customer');
  });

  it('should reject registration with duplicate email', () => {
    expect(() => {
      db.registerCustomer({
        email: 'admin@sriramsalon.com',
        phone: '9486754402',
        full_name: 'Imposter',
        password: 'Password123',
      });
    }).toThrow(/already exists/i);
  });
});
