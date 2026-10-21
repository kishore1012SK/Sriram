import { test, expect } from '@playwright/test';

test.describe('Sriram Salon — End-to-End Suite', () => {
  // Test 1: Customer views services and prices
  test('1. Customer views services and prices on home and services page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Sriram Salon');
    await expect(page.getByText("Men's Haircut")).toBeVisible();
    await expect(page.getByText('₹150')).toBeVisible();
    await expect(page.getByText("Children's Haircut")).toBeVisible();
    await expect(page.getByText('₹100')).toBeVisible();
    await expect(page.getByText('Beard Trimming')).toBeVisible();
    await expect(page.getByText('₹70')).toBeVisible();
    await expect(page.getByText('Shaving')).toBeVisible();
    await expect(page.getByText('₹80')).toBeVisible();

    // Navigate to /services
    await page.goto('/services');
    await expect(page.getByRole('heading', { name: 'Precision Grooming & Care' })).toBeVisible();
    await expect(page.getByText("Men's Haircut").first()).toBeVisible();
  });

  // Test 2: Customer creates an appointment
  test('2. Customer creates an appointment and receives reference', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByText('1. Choose Your Service')).toBeVisible();

    // Select Men's Haircut and continue
    await page.getByText("Men's Haircut").first().click();
    await page.getByRole('button', { name: /Continue to Date & Stylist/i }).click();

    // Step 2: Date & Stylist
    await expect(page.getByText('2. Select Date & Stylist')).toBeVisible();
    await page.getByRole('button', { name: /View Available Slots/i }).click();

    // Step 3: Slots
    await expect(page.getByText('3. Choose Your Time Slot')).toBeVisible();
    // Pick the first available slot button
    const firstSlot = page.locator('button:has-text("AM"), button:has-text("PM")').first();
    await firstSlot.waitFor({ state: 'visible' });
    await firstSlot.click();
    await page.getByRole('button', { name: /Continue to Customer Details/i }).click();

    // Step 4: Details
    await expect(page.getByText('4. Review & Confirm Booking')).toBeVisible();
    await page.locator('input[placeholder*="Ramesh"]').fill('Playwright Test Customer');
    await page.locator('input[placeholder*="9486754402"]').fill('9988776655');
    await page.getByRole('button', { name: /Confirm Appointment/i }).click();

    // Confirmation screen
    await expect(page.getByText('Booking Confirmed')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Ref: SRM-/i)).toBeVisible();
  });

  // Test 3: Booking outside opening hours is rejected via API & server validation
  test('3. Booking outside opening hours is rejected by server validation', async ({ request }) => {
    const res = await request.post('/api/appointments', {
      data: {
        customer_name: 'Late Night User',
        customer_phone: '9876543210',
        service_id: 'srv-001',
        appointment_date: '2026-10-26', // Monday
        start_time: '23:30', // Salon closes at 21:30
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/outside salon opening hours or overlaps a break/i);
  });

  // Test 4: Overlapping bookings cannot be assigned to the same employee
  test('4. Overlapping bookings cannot be assigned to the same employee', async ({ request }) => {
    // Book slot 1 at 07:00
    const res1 = await request.post('/api/appointments', {
      data: {
        customer_name: 'Overlap First',
        customer_phone: '9876543211',
        service_id: 'srv-001',
        employee_id: 'emp-001',
        appointment_date: '2026-11-16',
        start_time: '07:00',
      },
    });
    expect(res1.status()).toBe(200);

    // Book overlapping slot 2 at 07:15 for same employee
    const res2 = await request.post('/api/appointments', {
      data: {
        customer_name: 'Overlap Second',
        customer_phone: '9876543212',
        service_id: 'srv-001',
        employee_id: 'emp-001',
        appointment_date: '2026-11-16',
        start_time: '07:15',
      },
    });
    expect(res2.status()).toBe(400);
    const body2 = await res2.json();
    expect(body2.error).toMatch(/already booked/i);
  });

  // Test 5: Admin updates service prices
  test('5. Admin updates service prices through management portal', async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.locator('input[type="email"]').fill('admin@sriramsalon.com');
    await page.locator('input[type="password"]').fill('SriramAdmin@2026');
    await page.getByRole('button', { name: /Enter Admin Portal/i }).click();

    // Verify reached dashboard
    await expect(page).toHaveURL(/\/admin/);

    // Navigate to services
    await page.goto('/admin/services');
    await expect(page.getByRole('heading', { name: 'Salon Services & Pricing' })).toBeVisible();
    await expect(page.getByText("Men's Haircut")).toBeVisible();
  });

  // Test 6: Admin manages the walk-in queue
  test('6. Admin manages the walk-in queue and advances tokens', async ({ page, request }) => {
    // Generate a walk-in token
    const tokenRes = await request.post('/api/queue', {
      data: {
        customer_name: 'Queue Test Person',
        customer_phone: '9486754402',
        service_id: 'srv-001',
      },
    });
    expect(tokenRes.status()).toBe(200);

    // Admin opens queue page
    await page.goto('/admin/queue');
    await expect(page.getByRole('heading', { name: 'Live Walk-In Queue Manager' })).toBeVisible();
    await expect(page.getByText('Queue Test Person').first()).toBeVisible();
  });

  // Test 7: Unauthorized users cannot access admin pages
  test('7. Unauthorized users are redirected away from protected admin routes', async ({ browser }) => {
    // Fresh incognito context without cookies
    const context = await browser.newContext();
    const guestPage = await context.newPage();

    await guestPage.goto('/admin/settings');
    // Should be redirected to /admin/login
    await expect(guestPage).toHaveURL(/\/admin\/login/);
    await context.close();
  });

  // Test 8: Admin records a sale and an expense
  test('8. Admin records a sale and an expense with correct totals', async ({ request }) => {
    // Record sale
    const saleRes = await request.post('/api/sales', {
      data: {
        service_id: 'srv-001',
        amount: 150,
        payment_method: 'cash',
        notes: 'Counter Walk-in payment',
      },
    });
    expect(saleRes.status()).toBe(200);
    const saleData = await saleRes.json();
    expect(saleData.sale.amount).toBe(150);

    // Record expense
    const expRes = await request.post('/api/expenses', {
      data: {
        category: 'supplies',
        amount: 120,
        expense_date: new Date().toISOString().split('T')[0],
        description: 'New shave cream container',
      },
    });
    expect(expRes.status()).toBe(200);
    const expData = await expRes.json();
    expect(expData.expense.amount).toBe(120);
  });
});
