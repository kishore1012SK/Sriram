import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/store';

describe('Business Hours & Interval Containment Validation', () => {
  // Let's test on a Monday date: e.g. 2026-10-26 (Monday)
  const mondayDate = '2026-10-26';
  // Saturday date: 2026-10-24 (Saturday)
  const saturdayDate = '2026-10-24';

  it('should accept an appointment completely within Shift 1 (06:30 - 10:00)', () => {
    // 07:00 for 30 minutes (07:00 to 07:30)
    const fits = db.isWithinBusinessHours(mondayDate, '07:00', 30);
    expect(fits).toBe(true);
  });

  it('should accept an appointment completely within Shift 2 (10:30 - 14:00)', () => {
    // 11:00 for 30 minutes
    const fits = db.isWithinBusinessHours(mondayDate, '11:00', 30);
    expect(fits).toBe(true);
  });

  it('should accept an appointment completely within Shift 3 (15:00 - 21:30)', () => {
    // 18:00 for 30 minutes
    const fits = db.isWithinBusinessHours(mondayDate, '18:00', 30);
    expect(fits).toBe(true);
  });

  it('should REJECT an appointment falling during Morning Break (10:00 - 10:30)', () => {
    // Starts at 10:05 for 20 mins
    const fits = db.isWithinBusinessHours(mondayDate, '10:05', 20);
    expect(fits).toBe(false);
  });

  it('should REJECT an appointment falling during Afternoon Break (14:00 - 15:00)', () => {
    // Starts at 14:15 for 30 mins
    const fits = db.isWithinBusinessHours(mondayDate, '14:15', 30);
    expect(fits).toBe(false);
  });

  it('should REJECT an appointment that starts in open interval but exceeds close time', () => {
    // Shift 1 ends at 10:00. Starts at 09:45 with 30 min duration -> ends at 10:15
    const fits = db.isWithinBusinessHours(mondayDate, '09:45', 30);
    expect(fits).toBe(false);
  });

  it('should REJECT an appointment outside salon operating hours completely', () => {
    // 05:00 AM (salon opens at 06:30 on weekdays)
    const fitsEarly = db.isWithinBusinessHours(mondayDate, '05:00', 30);
    expect(fitsEarly).toBe(false);

    // 22:00 PM (salon closes at 21:30 on weekdays)
    const fitsLate = db.isWithinBusinessHours(mondayDate, '22:00', 30);
    expect(fitsLate).toBe(false);
  });

  it('should accept continuous weekend schedule (06:00 - 22:00) on Saturday', () => {
    // 14:15 is an afternoon break on weekdays, but OPEN on Saturday
    const fitsSaturdayMidday = db.isWithinBusinessHours(saturdayDate, '14:15', 30);
    expect(fitsSaturdayMidday).toBe(true);
  });
});
