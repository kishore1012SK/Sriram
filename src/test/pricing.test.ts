import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db/store';

describe('Service Price and Duration Validation', () => {
  it('should have the exact initial 4 services with their official prices', () => {
    const services = db.getServices(true);
    expect(services.length).toBeGreaterThanOrEqual(4);

    const mensHaircut = services.find((s) => s.name === "Men's Haircut");
    const kidsHaircut = services.find((s) => s.name === "Children's Haircut");
    const beardTrim = services.find((s) => s.name === 'Beard Trimming');
    const shaving = services.find((s) => s.name === 'Shaving');

    expect(mensHaircut).toBeDefined();
    expect(mensHaircut?.price).toBe(150);
    expect(mensHaircut?.duration_minutes).toBe(30);

    expect(kidsHaircut).toBeDefined();
    expect(kidsHaircut?.price).toBe(100);
    expect(kidsHaircut?.duration_minutes).toBe(20);

    expect(beardTrim).toBeDefined();
    expect(beardTrim?.price).toBe(70);
    expect(beardTrim?.duration_minutes).toBe(15);

    expect(shaving).toBeDefined();
    expect(shaving?.price).toBe(80);
    expect(shaving?.duration_minutes).toBe(15);
  });

  it('should reject adding a service with negative price', () => {
    expect(() => {
      db.addService({
        name: 'Invalid Negative Price',
        category: 'Test',
        description: 'Test',
        price: -50,
        duration_minutes: 30,
        is_active: true,
        allow_online_booking: true,
        allow_walk_in: true,
      });
    }).toThrow('Service price cannot be negative');
  });

  it('should reject adding a service with zero or negative duration', () => {
    expect(() => {
      db.addService({
        name: 'Invalid Zero Duration',
        category: 'Test',
        description: 'Test',
        price: 150,
        duration_minutes: 0,
        is_active: true,
        allow_online_booking: true,
        allow_walk_in: true,
      });
    }).toThrow('Service duration must be greater than zero');
  });

  it('should allow the owner to update a service price and retain validity', () => {
    const services = db.getServices(true);
    const target = services[0];
    const originalPrice = target.price;

    const updated = db.updateService(target.id, { price: 160 });
    expect(updated.price).toBe(160);

    // Revert back
    db.updateService(target.id, { price: originalPrice });
  });
});
