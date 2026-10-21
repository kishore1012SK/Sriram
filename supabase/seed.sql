-- ====================================================================
-- SRIRAM SALON - SEED DATA
-- ====================================================================

-- 1. Initial 4 Services (strictly as specified, no invented prices)
INSERT INTO services (id, name, category, description, price, duration_minutes, is_active, allow_online_booking, allow_walk_in)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Men''s Haircut', 'Haircuts', 'Classic or modern haircut tailored to your style with precision styling.', 150.00, 30, TRUE, TRUE, TRUE),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Children''s Haircut', 'Haircuts', 'Gentle, patient haircut for boys and girls with clean finish.', 100.00, 20, TRUE, TRUE, TRUE),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Beard Trimming', 'Beard & Shave', 'Sharp beard shaping, contouring, and trimming to suit your face.', 70.00, 15, TRUE, TRUE, TRUE),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Shaving', 'Beard & Shave', 'Traditional clean razor shave with warm lather and soothing aftercare.', 80.00, 15, TRUE, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Business Opening Hours
-- Days: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
-- Mon-Fri (1-5): 06:30 to 10:00, 10:30 to 14:00, 15:00 to 21:30
-- Sat-Sun (6, 0): 06:00 to 22:00

DELETE FROM business_hours;

-- Monday (1)
INSERT INTO business_hours (day_of_week, interval_index, open_time, close_time) VALUES
  (1, 1, '06:30:00', '10:00:00'),
  (1, 2, '10:30:00', '14:00:00'),
  (1, 3, '15:00:00', '21:30:00');

-- Tuesday (2)
INSERT INTO business_hours (day_of_week, interval_index, open_time, close_time) VALUES
  (2, 1, '06:30:00', '10:00:00'),
  (2, 2, '10:30:00', '14:00:00'),
  (2, 3, '15:00:00', '21:30:00');

-- Wednesday (3)
INSERT INTO business_hours (day_of_week, interval_index, open_time, close_time) VALUES
  (3, 1, '06:30:00', '10:00:00'),
  (3, 2, '10:30:00', '14:00:00'),
  (3, 3, '15:00:00', '21:30:00');

-- Thursday (4)
INSERT INTO business_hours (day_of_week, interval_index, open_time, close_time) VALUES
  (4, 1, '06:30:00', '10:00:00'),
  (4, 2, '10:30:00', '14:00:00'),
  (4, 3, '15:00:00', '21:30:00');

-- Friday (5)
INSERT INTO business_hours (day_of_week, interval_index, open_time, close_time) VALUES
  (5, 1, '06:30:00', '10:00:00'),
  (5, 2, '10:30:00', '14:00:00'),
  (5, 3, '15:00:00', '21:30:00');

-- Saturday (6)
INSERT INTO business_hours (day_of_week, interval_index, open_time, close_time) VALUES
  (6, 1, '06:00:00', '22:00:00');

-- Sunday (0)
INSERT INTO business_hours (day_of_week, interval_index, open_time, close_time) VALUES
  (0, 1, '06:00:00', '22:00:00');

-- 3. Initial Salon Staff
INSERT INTO employees (id, name, phone, is_active)
VALUES ('e1b2c3d4-0001-4000-8000-000000000001', 'Sriram', '9486754402', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Map all services to employee
INSERT INTO employee_services (employee_id, service_id)
VALUES
  ('e1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001'),
  ('e1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002'),
  ('e1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003'),
  ('e1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0004-4000-8000-000000000004')
ON CONFLICT DO NOTHING;

-- 4. Salon Settings
INSERT INTO salon_settings (id, key, value)
VALUES
  (gen_random_uuid(), 'business_info', '{
    "name": "Sriram Salon",
    "phone": "9486754402",
    "address": "South 2nd Street, Pudukkottai, Tamil Nadu, India - 622001",
    "country": "India",
    "currency": "INR",
    "currency_symbol": "₹",
    "timezone": "Asia/Kolkata",
    "date_format": "DD/MM/YYYY"
  }'::jsonb),
  (gen_random_uuid(), 'booking_rules', '{
    "max_advance_days": 14,
    "slot_step_minutes": 15,
    "cancellation_lead_hours": 2,
    "cancellation_policy": "Appointments can be cancelled up to 2 hours before the scheduled time free of charge."
  }'::jsonb),
  (gen_random_uuid(), 'queue_settings', '{
    "is_open": true,
    "max_daily_tokens": 100
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
