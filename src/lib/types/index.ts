export type UserRole = 'owner' | 'manager' | 'staff' | 'customer';

export interface Profile {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  allow_online_booking: boolean;
  allow_walk_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  profile_id?: string | null;
  name: string;
  phone: string;
  is_active: boolean;
  services?: string[]; // service IDs
  created_at: string;
  updated_at: string;
}

export interface BusinessHourInterval {
  id: string;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  interval_index: number;
  open_time: string; // "HH:MM:SS" or "HH:MM"
  close_time: string;
  is_closed: boolean;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  reference: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  service_id: string;
  service_name: string;
  price_snapshot: number;
  duration_minutes: number;
  employee_id: string;
  employee_name: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: AppointmentStatus;
  payment_preference?: 'cash' | 'upi';
  payment_status?: 'pending' | 'verified' | 'failed' | 'rejected';
  upi_transaction_id?: string | null;
  notes?: string | null;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentRecordStatus = 'pending' | 'verified' | 'failed' | 'rejected';

export interface PaymentRecord {
  id: string;
  booking_reference: string;
  appointment_id?: string | null;
  walk_in_token_id?: string | null;
  amount: number;
  payment_method: 'upi' | 'cash';
  upi_id: string;
  upi_transaction_id?: string | null;
  status: PaymentRecordStatus;
  customer_name: string;
  customer_phone: string;
  notes?: string | null;
  created_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
}

export type QueueTokenStatus =
  | 'waiting'
  | 'called'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface WalkInToken {
  id: string;
  token_number: number;
  token_date: string; // YYYY-MM-DD
  reference: string; // non-guessable secure code
  customer_name: string;
  customer_phone: string;
  service_id: string;
  service_name?: string;
  employee_id?: string | null;
  employee_name?: string | null;
  status: QueueTokenStatus;
  estimated_wait_minutes: number;
  called_at?: string | null;
  service_started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'other';

export interface Sale {
  id: string;
  sale_number: string;
  appointment_id?: string | null;
  walk_in_token_id?: string | null;
  service_id: string;
  service_name: string;
  amount: number;
  payment_method: PaymentMethod;
  recorded_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory =
  | 'supplies'
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'maintenance'
  | 'marketing'
  | 'other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  description: string;
  recorded_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalonSettings {
  business_info: {
    name: string;
    phone: string;
    address: string;
    country: string;
    currency: string;
    currency_symbol: string;
    timezone: string;
    date_format: string;
  };
  booking_rules: {
    max_advance_days: number;
    slot_step_minutes: number;
    cancellation_lead_hours: number;
    cancellation_policy: string;
  };
  queue_settings: {
    is_open: boolean;
    max_daily_tokens: number;
  };
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, unknown>;
  created_at: string;
}
