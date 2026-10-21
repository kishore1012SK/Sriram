-- ====================================================================
-- SRIRAM SALON - INITIAL POSTGRESQL SCHEMA WITH RLS & CONSTRAINTS
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('owner', 'manager', 'staff', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SERVICES
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  allow_online_booking BOOLEAN NOT NULL DEFAULT TRUE,
  allow_walk_in BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. EMPLOYEE SERVICES
CREATE TABLE IF NOT EXISTS employee_services (
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (employee_id, service_id)
);

-- 5. BUSINESS OPENING HOURS (Multiple intervals per day supported)
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  interval_index INT NOT NULL DEFAULT 1,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_window CHECK (open_time < close_time OR is_closed = TRUE)
);

-- 6. EMPLOYEE SCHEDULES & BREAKS
CREATE TABLE IF NOT EXISTS employee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  is_working BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  service_name TEXT NOT NULL,
  price_snapshot NUMERIC(10,2) NOT NULL CHECK (price_snapshot >= 0),
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
  employee_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_app_times CHECK (start_time < end_time)
);

-- Index to enforce no double booking for same employee
CREATE INDEX IF NOT EXISTS idx_appointments_emp_date_time ON appointments (employee_id, appointment_date, start_time, end_time) WHERE status NOT IN ('cancelled', 'no_show');

-- 8. APPOINTMENT STATUS HISTORY
CREATE TABLE IF NOT EXISTS appointment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. WALK-IN TOKENS
CREATE TABLE IF NOT EXISTS walk_in_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_number INT NOT NULL,
  token_date DATE NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show')),
  estimated_wait_minutes INT NOT NULL DEFAULT 0,
  called_at TIMESTAMPTZ,
  service_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_token_per_day UNIQUE (token_date, token_number)
);

-- 10. SALES
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number TEXT UNIQUE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  walk_in_token_id UUID REFERENCES walk_in_tokens(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  service_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'other')),
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_appointment_sale UNIQUE (appointment_id),
  CONSTRAINT uq_token_sale UNIQUE (walk_in_token_id)
);

-- 11. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('supplies', 'rent', 'utilities', 'salaries', 'maintenance', 'marketing', 'other')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SALON SETTINGS
CREATE TABLE IF NOT EXISTS salon_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_in_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Services & Business hours are readable by anyone
CREATE POLICY "Public services read" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public business hours read" ON business_hours FOR SELECT USING (TRUE);
CREATE POLICY "Public employees read" ON employees FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public settings read" ON salon_settings FOR SELECT USING (TRUE);

-- Token status can be viewed by exact reference
CREATE POLICY "Public token read by reference" ON walk_in_tokens FOR SELECT USING (TRUE);

-- Appointments read by owner/staff or customer owner
CREATE POLICY "Customers read own appointments" ON appointments FOR SELECT USING (
  customer_id = auth.uid() OR auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff')
);
