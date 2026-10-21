import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Service,
  Employee,
  BusinessHourInterval,
  Appointment,
  WalkInToken,
  Sale,
  Expense,
  SalonSettings,
  Profile,
  AuditLog,
  AppointmentStatus,
  QueueTokenStatus,
  PaymentMethod,
  ExpenseCategory,
  PaymentRecord,
  PaymentRecordStatus,
} from '@/lib/types';

interface DatabaseSchema {
  profiles: Profile[];
  services: Service[];
  employees: Employee[];
  business_hours: BusinessHourInterval[];
  appointments: Appointment[];
  walk_in_tokens: WalkInToken[];
  sales: Sale[];
  expenses: Expense[];
  payments: PaymentRecord[];
  settings: SalonSettings;
  audit_logs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial 4 services strictly as specified
const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-001',
    name: "Men's Haircut",
    category: 'Haircuts',
    description: 'Precision haircut customized to your face shape, styled with premium finish.',
    price: 150,
    duration_minutes: 30,
    is_active: true,
    allow_online_booking: true,
    allow_walk_in: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-002',
    name: "Children's Haircut",
    category: 'Haircuts',
    description: 'Gentle, friendly haircut experience for boys and girls with clean detailing.',
    price: 100,
    duration_minutes: 20,
    is_active: true,
    allow_online_booking: true,
    allow_walk_in: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-003',
    name: 'Beard Trimming',
    category: 'Beard & Shave',
    description: 'Crisp beard trim, edge detailing, and neckline contouring with care.',
    price: 70,
    duration_minutes: 15,
    is_active: true,
    allow_online_booking: true,
    allow_walk_in: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-004',
    name: 'Shaving',
    category: 'Beard & Shave',
    description: 'Classic wet razor shave with warm lather, hot towel press, and soothing lotion.',
    price: 80,
    duration_minutes: 15,
    is_active: true,
    allow_online_booking: true,
    allow_walk_in: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Business opening hours intervals
// Mon-Fri: 06:30-10:00, 10:30-14:00, 15:00-21:30
// Sat-Sun: 06:00-22:00
const INITIAL_BUSINESS_HOURS: BusinessHourInterval[] = [
  // Sunday (0)
  { id: 'bh-0-1', day_of_week: 0, interval_index: 1, open_time: '06:00', close_time: '22:00', is_closed: false },
  // Monday (1)
  { id: 'bh-1-1', day_of_week: 1, interval_index: 1, open_time: '06:30', close_time: '10:00', is_closed: false },
  { id: 'bh-1-2', day_of_week: 1, interval_index: 2, open_time: '10:30', close_time: '14:00', is_closed: false },
  { id: 'bh-1-3', day_of_week: 1, interval_index: 3, open_time: '15:00', close_time: '21:30', is_closed: false },
  // Tuesday (2)
  { id: 'bh-2-1', day_of_week: 2, interval_index: 1, open_time: '06:30', close_time: '10:00', is_closed: false },
  { id: 'bh-2-2', day_of_week: 2, interval_index: 2, open_time: '10:30', close_time: '14:00', is_closed: false },
  { id: 'bh-2-3', day_of_week: 2, interval_index: 3, open_time: '15:00', close_time: '21:30', is_closed: false },
  // Wednesday (3)
  { id: 'bh-3-1', day_of_week: 3, interval_index: 1, open_time: '06:30', close_time: '10:00', is_closed: false },
  { id: 'bh-3-2', day_of_week: 3, interval_index: 2, open_time: '10:30', close_time: '14:00', is_closed: false },
  { id: 'bh-3-3', day_of_week: 3, interval_index: 3, open_time: '15:00', close_time: '21:30', is_closed: false },
  // Thursday (4)
  { id: 'bh-4-1', day_of_week: 4, interval_index: 1, open_time: '06:30', close_time: '10:00', is_closed: false },
  { id: 'bh-4-2', day_of_week: 4, interval_index: 2, open_time: '10:30', close_time: '14:00', is_closed: false },
  { id: 'bh-4-3', day_of_week: 4, interval_index: 3, open_time: '15:00', close_time: '21:30', is_closed: false },
  // Friday (5)
  { id: 'bh-5-1', day_of_week: 5, interval_index: 1, open_time: '06:30', close_time: '10:00', is_closed: false },
  { id: 'bh-5-2', day_of_week: 5, interval_index: 2, open_time: '10:30', close_time: '14:00', is_closed: false },
  { id: 'bh-5-3', day_of_week: 5, interval_index: 3, open_time: '15:00', close_time: '21:30', is_closed: false },
  // Saturday (6)
  { id: 'bh-6-1', day_of_week: 6, interval_index: 1, open_time: '06:00', close_time: '22:00', is_closed: false },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'Sriram',
    phone: '9486754402',
    is_active: true,
    services: ['srv-001', 'srv-002', 'srv-003', 'srv-004'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS: SalonSettings = {
  business_info: {
    name: 'Sriram Salon',
    phone: '9486754402',
    address: 'South 2nd Street, Pudukkottai, Tamil Nadu, India - 622001',
    country: 'India',
    currency: 'INR',
    currency_symbol: '₹',
    timezone: 'Asia/Kolkata',
    date_format: 'DD/MM/YYYY',
  },
  booking_rules: {
    max_advance_days: 14,
    slot_step_minutes: 15,
    cancellation_lead_hours: 2,
    cancellation_policy: 'Appointments can be cancelled up to 2 hours before the scheduled time free of charge.',
  },
  queue_settings: {
    is_open: true,
    max_daily_tokens: 100,
  },
};

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'prof-owner-001',
    email: 'admin@sriramsalon.com',
    // SHA256 of "SriramAdmin@2026"
    password_hash: crypto.createHash('sha256').update('SriramAdmin@2026').digest('hex'),
    full_name: 'Sriram (Owner)',
    phone: '9486754402',
    role: 'owner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

class SalonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure all required keys exist
        return {
          profiles: parsed.profiles || INITIAL_PROFILES,
          services: parsed.services?.length ? parsed.services : INITIAL_SERVICES,
          employees: parsed.employees?.length ? parsed.employees : INITIAL_EMPLOYEES,
          business_hours: parsed.business_hours?.length ? parsed.business_hours : INITIAL_BUSINESS_HOURS,
          appointments: parsed.appointments || [],
          walk_in_tokens: parsed.walk_in_tokens || [],
          sales: parsed.sales || [],
          expenses: parsed.expenses || [],
          payments: parsed.payments || [],
          settings: parsed.settings || INITIAL_SETTINGS,
          audit_logs: parsed.audit_logs || [],
        };
      }
    } catch {
      // In case of any read error, fallback to defaults
    }

    const defaultData: DatabaseSchema = {
      profiles: INITIAL_PROFILES,
      services: INITIAL_SERVICES,
      employees: INITIAL_EMPLOYEES,
      business_hours: INITIAL_BUSINESS_HOURS,
      appointments: [],
      walk_in_tokens: [],
      sales: [],
      expenses: [],
      payments: [],
      settings: INITIAL_SETTINGS,
      audit_logs: [],
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch {
      // Ignore if read-only filesystem (e.g. serverless)
    }
  }

  // --- SETTINGS ---
  getSettings(): SalonSettings {
    return this.data.settings;
  }

  updateSettings(settings: Partial<SalonSettings>, actorId?: string): SalonSettings {
    this.data.settings = {
      ...this.data.settings,
      ...settings,
      business_info: {
        ...this.data.settings.business_info,
        ...(settings.business_info || {}),
      },
      booking_rules: {
        ...this.data.settings.booking_rules,
        ...(settings.booking_rules || {}),
      },
      queue_settings: {
        ...this.data.settings.queue_settings,
        ...(settings.queue_settings || {}),
      },
    };
    this.addAuditLog('update', 'settings', 'global', { updated: settings }, actorId);
    this.saveData();
    return this.data.settings;
  }

  // --- SERVICES ---
  getServices(onlyActive = true): Service[] {
    if (onlyActive) {
      return this.data.services.filter((s) => s.is_active);
    }
    return [...this.data.services];
  }

  getServiceById(id: string): Service | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  addService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>, actorId?: string): Service {
    if (serviceData.price < 0) {
      throw new Error('Service price cannot be negative');
    }
    if (serviceData.duration_minutes <= 0) {
      throw new Error('Service duration must be greater than zero');
    }
    const newService: Service = {
      ...serviceData,
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.services.push(newService);
    this.addAuditLog('create', 'service', newService.id, { service: newService.name, price: newService.price }, actorId);
    this.saveData();
    return newService;
  }

  updateService(id: string, updates: Partial<Omit<Service, 'id' | 'created_at'>>, actorId?: string): Service {
    const index = this.data.services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Service not found');

    if (updates.price !== undefined && updates.price < 0) {
      throw new Error('Service price cannot be negative');
    }
    if (updates.duration_minutes !== undefined && updates.duration_minutes <= 0) {
      throw new Error('Service duration must be greater than zero');
    }

    const updated = {
      ...this.data.services[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.services[index] = updated;
    this.addAuditLog('update', 'service', id, { updates }, actorId);
    this.saveData();
    return updated;
  }

  // --- EMPLOYEES ---
  getEmployees(onlyActive = true): Employee[] {
    if (onlyActive) {
      return this.data.employees.filter((e) => e.is_active);
    }
    return [...this.data.employees];
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.data.employees.find((e) => e.id === id);
  }

  addEmployee(empData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, actorId?: string): Employee {
    const newEmployee: Employee = {
      ...empData,
      id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.employees.push(newEmployee);
    this.addAuditLog('create', 'employee', newEmployee.id, { name: newEmployee.name }, actorId);
    this.saveData();
    return newEmployee;
  }

  updateEmployee(id: string, updates: Partial<Omit<Employee, 'id' | 'created_at'>>, actorId?: string): Employee {
    const index = this.data.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Employee not found');

    const updated = {
      ...this.data.employees[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.employees[index] = updated;
    this.addAuditLog('update', 'employee', id, { updates }, actorId);
    this.saveData();
    return updated;
  }

  // --- BUSINESS HOURS ---
  getBusinessHours(): BusinessHourInterval[] {
    return [...this.data.business_hours];
  }

  updateBusinessHours(hours: BusinessHourInterval[], actorId?: string): BusinessHourInterval[] {
    this.data.business_hours = hours;
    this.addAuditLog('update', 'business_hours', 'global', { count: hours.length }, actorId);
    this.saveData();
    return this.data.business_hours;
  }

  isWithinBusinessHours(dateStr: string, startTimeStr: string, durationMinutes: number): boolean {
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (isNaN(dateObj.getTime())) return false;
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ...

    const dayIntervals = this.data.business_hours.filter(
      (b) => b.day_of_week === dayOfWeek && !b.is_closed
    );

    if (dayIntervals.length === 0) return false;

    // Convert candidate start & end into minutes from midnight
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const candidateStartMin = startH * 60 + startM;
    const candidateEndMin = candidateStartMin + durationMinutes;

    // Must fit COMPLETELY inside at least one opening interval
    for (const interval of dayIntervals) {
      const [openH, openM] = interval.open_time.split(':').map(Number);
      const [closeH, closeM] = interval.close_time.split(':').map(Number);
      const intervalOpenMin = openH * 60 + openM;
      const intervalCloseMin = closeH * 60 + closeM;

      if (candidateStartMin >= intervalOpenMin && candidateEndMin <= intervalCloseMin) {
        return true;
      }
    }

    return false;
  }

  // Helper: check time overlap between two intervals [A_start, A_end] and [B_start, B_end]
  private checkTimeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string
  ): boolean {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const sA = toMin(startA);
    const eA = toMin(endA);
    const sB = toMin(startB);
    const eB = toMin(endB);
    return Math.max(sA, sB) < Math.min(eA, eB);
  }

  // --- APPOINTMENTS ---
  getAppointments(filters?: {
    date?: string;
    employee_id?: string;
    customer_id?: string;
    status?: AppointmentStatus;
    search?: string;
  }): Appointment[] {
    let list = [...this.data.appointments];

    if (filters?.date) {
      list = list.filter((a) => a.appointment_date === filters.date);
    }
    if (filters?.employee_id) {
      list = list.filter((a) => a.employee_id === filters.employee_id);
    }
    if (filters?.customer_id) {
      list = list.filter((a) => a.customer_id === filters.customer_id);
    }
    if (filters?.status) {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.reference.toLowerCase().includes(q) ||
          a.customer_name.toLowerCase().includes(q) ||
          a.customer_phone.includes(q) ||
          a.service_name.toLowerCase().includes(q)
      );
    }

    // Sort by date and start_time desc
    return list.sort((a, b) => {
      if (a.appointment_date !== b.appointment_date) {
        return a.appointment_date.localeCompare(b.appointment_date);
      }
      return a.start_time.localeCompare(b.start_time);
    });
  }

  getAppointmentByReference(reference: string): Appointment | undefined {
    return this.data.appointments.find(
      (a) => a.reference.toUpperCase() === reference.trim().toUpperCase()
    );
  }

  getAppointmentById(id: string): Appointment | undefined {
    return this.data.appointments.find((a) => a.id === id);
  }

  // Get available slots for date and service
  getAvailableSlots(
    dateStr: string,
    serviceId: string,
    preferredEmployeeId?: string
  ): { time: string; employeeId: string; employeeName: string }[] {
    const service = this.getServiceById(serviceId);
    if (!service || !service.is_active) return [];

    const dateObj = new Date(dateStr + 'T00:00:00');
    if (isNaN(dateObj.getTime())) return [];
    const dayOfWeek = dateObj.getDay();

    const dayIntervals = this.data.business_hours.filter(
      (b) => b.day_of_week === dayOfWeek && !b.is_closed
    );
    if (dayIntervals.length === 0) return [];

    let eligibleEmployees = this.getEmployees(true);
    if (preferredEmployeeId && preferredEmployeeId !== 'any') {
      eligibleEmployees = eligibleEmployees.filter((e) => e.id === preferredEmployeeId);
    }

    if (eligibleEmployees.length === 0) return [];

    const existingAppointments = this.data.appointments.filter(
      (a) =>
        a.appointment_date === dateStr &&
        !['cancelled', 'no_show'].includes(a.status)
    );

    const step = this.data.settings.booking_rules.slot_step_minutes || 15;
    const availableSlots: { time: string; employeeId: string; employeeName: string }[] = [];

    for (const interval of dayIntervals) {
      const [openH, openM] = interval.open_time.split(':').map(Number);
      const [closeH, closeM] = interval.close_time.split(':').map(Number);
      const openMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;

      for (let m = openMin; m + service.duration_minutes <= closeMin; m += step) {
        const slotStartH = Math.floor(m / 60);
        const slotStartM = m % 60;
        const slotEndMin = m + service.duration_minutes;
        const slotEndH = Math.floor(slotEndMin / 60);
        const slotEndM = slotEndMin % 60;

        const startTimeStr = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
        const endTimeStr = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

        // Find an employee who is not busy during this interval
        for (const emp of eligibleEmployees) {
          const isBusy = existingAppointments.some(
            (a) =>
              a.employee_id === emp.id &&
              this.checkTimeOverlap(startTimeStr, endTimeStr, a.start_time, a.end_time)
          );

          if (!isBusy) {
            availableSlots.push({
              time: startTimeStr,
              employeeId: emp.id,
              employeeName: emp.name,
            });
            break; // slot is available
          }
        }
      }
    }

    return availableSlots;
  }

  createAppointment(payload: {
    customer_id?: string | null;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    service_id: string;
    employee_id?: string | null;
    appointment_date: string;
    start_time: string;
    notes?: string | null;
    payment_preference?: 'cash' | 'upi';
    upi_transaction_id?: string | null;
  }): Appointment {
    // 1. Validate service
    const service = this.getServiceById(payload.service_id);
    if (!service || !service.is_active) {
      throw new Error('Selected service is not currently available');
    }

    // 2. Compute end time
    const [startH, startM] = payload.start_time.split(':').map(Number);
    const endMinutes = startH * 60 + startM + service.duration_minutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    // 3. Validate against business hours
    const fitsBusinessHours = this.isWithinBusinessHours(
      payload.appointment_date,
      payload.start_time,
      service.duration_minutes
    );
    if (!fitsBusinessHours) {
      throw new Error(
        `Selected appointment time (${payload.start_time} - ${endTimeStr}) is outside salon opening hours or overlaps a break.`
      );
    }

    // 4. Select employee
    let chosenEmployee: Employee | undefined;
    if (payload.employee_id && payload.employee_id !== 'any') {
      chosenEmployee = this.getEmployeeById(payload.employee_id);
      if (!chosenEmployee || !chosenEmployee.is_active) {
        throw new Error('Selected employee is not currently active');
      }
    } else {
      // Pick first free employee
      const activeEmployees = this.getEmployees(true);
      for (const emp of activeEmployees) {
        const overlap = this.data.appointments.some(
          (a) =>
            a.appointment_date === payload.appointment_date &&
            a.employee_id === emp.id &&
            !['cancelled', 'no_show'].includes(a.status) &&
            this.checkTimeOverlap(payload.start_time, endTimeStr, a.start_time, a.end_time)
        );
        if (!overlap) {
          chosenEmployee = emp;
          break;
        }
      }
    }

    if (!chosenEmployee) {
      throw new Error('No employee is available for this slot. Please choose another time.');
    }

    // 5. Final check against overlap for chosen employee (atomic check)
    const hasOverlap = this.data.appointments.some(
      (a) =>
        a.appointment_date === payload.appointment_date &&
        a.employee_id === chosenEmployee!.id &&
        !['cancelled', 'no_show'].includes(a.status) &&
        this.checkTimeOverlap(payload.start_time, endTimeStr, a.start_time, a.end_time)
    );

    if (hasOverlap) {
      throw new Error('This slot is already booked for the selected stylist. Please pick an alternative slot.');
    }

    // 6. Generate non-guessable reference code: SRM-YYYYMMDD-XXXX
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const dateCompact = payload.appointment_date.replace(/-/g, '');
    const reference = `SRM-${dateCompact}-${randomHex}`;

    const newAppointment: Appointment = {
      id: `app-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      reference,
      customer_id: payload.customer_id || null,
      customer_name: payload.customer_name.trim(),
      customer_phone: payload.customer_phone.trim(),
      customer_email: payload.customer_email?.trim() || null,
      service_id: service.id,
      service_name: service.name,
      price_snapshot: service.price,
      duration_minutes: service.duration_minutes,
      employee_id: chosenEmployee.id,
      employee_name: chosenEmployee.name,
      appointment_date: payload.appointment_date,
      start_time: payload.start_time,
      end_time: endTimeStr,
      status: 'confirmed',
      payment_preference: payload.payment_preference || 'cash',
      payment_status: 'pending',
      upi_transaction_id: payload.upi_transaction_id?.trim() || null,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.appointments.push(newAppointment);

    // If customer selected online UPI, record payment record in pending status
    if (payload.payment_preference === 'upi') {
      const paymentRecord: PaymentRecord = {
        id: `pay-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
        booking_reference: reference,
        appointment_id: newAppointment.id,
        amount: service.price,
        payment_method: 'upi',
        upi_id: 'kishoreramr2004@oksbi',
        upi_transaction_id: payload.upi_transaction_id?.trim() || null,
        status: 'pending',
        customer_name: newAppointment.customer_name,
        customer_phone: newAppointment.customer_phone,
        notes: 'Customer opted for UPI payment during booking',
        created_at: new Date().toISOString(),
      };
      this.data.payments.push(paymentRecord);
    }

    this.addAuditLog('create', 'appointment', newAppointment.id, {
      reference: newAppointment.reference,
      customer: newAppointment.customer_name,
      service: newAppointment.service_name,
      payment_preference: newAppointment.payment_preference,
    });
    this.saveData();

    return newAppointment;
  }

  updateAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus,
    reason?: string,
    actorId?: string
  ): Appointment {
    const index = this.data.appointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    const app = this.data.appointments[index];
    const oldStatus = app.status;

    // Check cancellation lead time if customer cancels
    if (newStatus === 'cancelled') {
      const now = new Date();
      const appDateTime = new Date(`${app.appointment_date}T${app.start_time}:00`);
      const leadMs = this.data.settings.booking_rules.cancellation_lead_hours * 60 * 60 * 1000;
      // Admin can always cancel, but validate policy for records
      app.cancellation_reason = reason || 'Cancelled by customer/salon';
      app.cancelled_at = new Date().toISOString();
    }

    app.status = newStatus;
    app.updated_at = new Date().toISOString();

    this.addAuditLog('status_change', 'appointment', id, { from: oldStatus, to: newStatus, reason }, actorId);
    this.saveData();
    return app;
  }

  // --- WALK-IN QUEUE ---
  getWalkInTokens(dateStr?: string, status?: QueueTokenStatus): WalkInToken[] {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    let list = this.data.walk_in_tokens.filter((t) => t.token_date === targetDate);

    if (status) {
      list = list.filter((t) => t.status === status);
    }

    return list.sort((a, b) => a.token_number - b.token_number);
  }

  getWalkInTokenByReference(reference: string): WalkInToken | undefined {
    return this.data.walk_in_tokens.find(
      (t) => t.reference.toUpperCase() === reference.trim().toUpperCase()
    );
  }

  createWalkInToken(payload: {
    customer_name: string;
    customer_phone: string;
    service_id: string;
    employee_id?: string | null;
  }): WalkInToken {
    if (!this.data.settings.queue_settings.is_open) {
      throw new Error('Walk-in queue is currently closed for new entries.');
    }

    const today = new Date().toISOString().split('T')[0];
    const service = this.getServiceById(payload.service_id);
    if (!service || !service.is_active || !service.allow_walk_in) {
      throw new Error('Selected service is not eligible for walk-ins');
    }

    const todayTokens = this.data.walk_in_tokens.filter((t) => t.token_date === today);
    if (todayTokens.length >= this.data.settings.queue_settings.max_daily_tokens) {
      throw new Error('Daily walk-in limit reached for today.');
    }

    const nextTokenNumber = todayTokens.length > 0 ? Math.max(...todayTokens.map((t) => t.token_number)) + 1 : 1;

    // Calculate approximate wait time based on waiting queue
    const waitingTokens = todayTokens.filter((t) => ['waiting', 'called', 'checked_in'].includes(t.status));
    let estimatedWaitMinutes = 0;
    for (const wt of waitingTokens) {
      const wtService = this.getServiceById(wt.service_id);
      estimatedWaitMinutes += wtService?.duration_minutes || 20;
    }

    let empName: string | null = null;
    if (payload.employee_id) {
      const emp = this.getEmployeeById(payload.employee_id);
      empName = emp?.name || null;
    }

    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reference = `TK-${today.replace(/-/g, '')}-${randomHex}`;

    const newToken: WalkInToken = {
      id: `token-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      token_number: nextTokenNumber,
      token_date: today,
      reference,
      customer_name: payload.customer_name.trim(),
      customer_phone: payload.customer_phone.trim(),
      service_id: service.id,
      service_name: service.name,
      employee_id: payload.employee_id || null,
      employee_name: empName,
      status: 'waiting',
      estimated_wait_minutes: estimatedWaitMinutes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.walk_in_tokens.push(newToken);
    this.addAuditLog('create', 'walk_in_token', newToken.id, {
      token_number: newToken.token_number,
      reference: newToken.reference,
    });
    this.saveData();

    return newToken;
  }

  updateWalkInTokenStatus(
    id: string,
    newStatus: QueueTokenStatus,
    employeeId?: string,
    actorId?: string
  ): WalkInToken {
    const index = this.data.walk_in_tokens.findIndex((t) => t.id === id || t.reference === id);
    if (index === -1) throw new Error('Token not found');

    const token = this.data.walk_in_tokens[index];
    const oldStatus = token.status;
    token.status = newStatus;
    token.updated_at = new Date().toISOString();

    if (employeeId) {
      token.employee_id = employeeId;
      const emp = this.getEmployeeById(employeeId);
      token.employee_name = emp?.name || null;
    }

    if (newStatus === 'called' && !token.called_at) {
      token.called_at = new Date().toISOString();
    } else if (newStatus === 'in_service' && !token.service_started_at) {
      token.service_started_at = new Date().toISOString();
    } else if (newStatus === 'completed' && !token.completed_at) {
      token.completed_at = new Date().toISOString();
    }

    this.addAuditLog('status_change', 'walk_in_token', id, { from: oldStatus, to: newStatus }, actorId);
    this.saveData();
    return token;
  }

  // --- SALES ---
  getSales(filters?: { startDate?: string; endDate?: string; search?: string }): Sale[] {
    let list = [...this.data.sales];

    if (filters?.startDate) {
      list = list.filter((s) => s.created_at.split('T')[0] >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((s) => s.created_at.split('T')[0] <= filters.endDate!);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.sale_number.toLowerCase().includes(q) ||
          s.service_name.toLowerCase().includes(q) ||
          s.payment_method.toLowerCase().includes(q) ||
          (s.appointment_id && s.appointment_id.toLowerCase().includes(q)) ||
          (s.walk_in_token_id && s.walk_in_token_id.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  recordSale(payload: {
    appointment_id?: string | null;
    walk_in_token_id?: string | null;
    service_id: string;
    amount: number;
    payment_method: PaymentMethod;
    notes?: string | null;
    recorded_by?: string | null;
  }): Sale {
    if (payload.amount < 0) {
      throw new Error('Sale amount cannot be negative');
    }

    // Prevent duplicate sales for same appointment or walk-in token
    if (payload.appointment_id) {
      const existing = this.data.sales.find((s) => s.appointment_id === payload.appointment_id);
      if (existing) {
        throw new Error(`Sale already recorded for this appointment (${existing.sale_number})`);
      }
    }
    if (payload.walk_in_token_id) {
      const existing = this.data.sales.find((s) => s.walk_in_token_id === payload.walk_in_token_id);
      if (existing) {
        throw new Error(`Sale already recorded for this walk-in token (${existing.sale_number})`);
      }
    }

    const service = this.getServiceById(payload.service_id);
    const serviceName = service ? service.name : 'Salon Service';

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
    const saleNumber = `INV-${today}-${rand}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}-${rand}`,
      sale_number: saleNumber,
      appointment_id: payload.appointment_id || null,
      walk_in_token_id: payload.walk_in_token_id || null,
      service_id: payload.service_id,
      service_name: serviceName,
      amount: payload.amount,
      payment_method: payload.payment_method,
      recorded_by: payload.recorded_by || null,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.sales.push(newSale);
    this.addAuditLog('create', 'sale', newSale.id, {
      sale_number: newSale.sale_number,
      amount: newSale.amount,
      method: newSale.payment_method,
    }, payload.recorded_by || undefined);
    this.saveData();

    return newSale;
  }

  // --- EXPENSES ---
  getExpenses(filters?: { startDate?: string; endDate?: string; category?: ExpenseCategory }): Expense[] {
    let list = [...this.data.expenses];

    if (filters?.startDate) {
      list = list.filter((e) => e.expense_date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((e) => e.expense_date <= filters.endDate!);
    }
    if (filters?.category) {
      list = list.filter((e) => e.category === filters.category);
    }

    return list.sort((a, b) => b.expense_date.localeCompare(a.expense_date));
  }

  addExpense(payload: {
    category: ExpenseCategory;
    amount: number;
    expense_date: string;
    description: string;
    recorded_by?: string | null;
  }): Expense {
    if (payload.amount < 0) {
      throw new Error('Expense amount cannot be negative');
    }
    if (!payload.description.trim()) {
      throw new Error('Expense description is required');
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      category: payload.category,
      amount: payload.amount,
      expense_date: payload.expense_date,
      description: payload.description.trim(),
      recorded_by: payload.recorded_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.expenses.push(newExpense);
    this.addAuditLog('create', 'expense', newExpense.id, {
      category: newExpense.category,
      amount: newExpense.amount,
    }, payload.recorded_by || undefined);
    this.saveData();

    return newExpense;
  }

  // --- PAYMENTS & UPI VERIFICATION ---
  getPayments(filters?: { status?: PaymentRecordStatus; search?: string }): PaymentRecord[] {
    let list = [...this.data.payments];
    if (filters?.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.booking_reference.toLowerCase().includes(q) ||
          p.customer_name.toLowerCase().includes(q) ||
          p.customer_phone.includes(q) ||
          (p.upi_transaction_id && p.upi_transaction_id.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  getPaymentByBookingReference(reference: string): PaymentRecord | undefined {
    return this.data.payments.find(
      (p) => p.booking_reference.toUpperCase() === reference.trim().toUpperCase()
    );
  }

  recordPaymentAttempt(payload: {
    booking_reference: string;
    upi_transaction_id: string;
    notes?: string | null;
  }): PaymentRecord {
    const existing = this.getPaymentByBookingReference(payload.booking_reference);
    const appointment = this.getAppointmentByReference(payload.booking_reference);

    if (existing) {
      existing.upi_transaction_id = payload.upi_transaction_id.trim();
      existing.status = 'pending'; // Always remains pending until verified by staff/bank!
      if (payload.notes) existing.notes = payload.notes;
      if (appointment) {
        appointment.upi_transaction_id = payload.upi_transaction_id.trim();
        appointment.payment_status = 'pending';
      }
      this.addAuditLog('payment_attempt', 'payment', existing.id, {
        reference: payload.booking_reference,
        utr: payload.upi_transaction_id,
      });
      this.saveData();
      return existing;
    }

    if (!appointment) {
      throw new Error('Booking reference not found');
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      booking_reference: payload.booking_reference,
      appointment_id: appointment.id,
      amount: appointment.price_snapshot,
      payment_method: 'upi',
      upi_id: 'kishoreramr2004@oksbi',
      upi_transaction_id: payload.upi_transaction_id.trim(),
      status: 'pending', // NOT verified automatically!
      customer_name: appointment.customer_name,
      customer_phone: appointment.customer_phone,
      notes: payload.notes || 'Customer submitted UPI transaction reference',
      created_at: new Date().toISOString(),
    };

    appointment.payment_preference = 'upi';
    appointment.payment_status = 'pending';
    appointment.upi_transaction_id = payload.upi_transaction_id.trim();

    this.data.payments.push(newPayment);
    this.addAuditLog('payment_attempt', 'payment', newPayment.id, {
      reference: payload.booking_reference,
      utr: payload.upi_transaction_id,
    });
    this.saveData();
    return newPayment;
  }

  verifyPayment(
    paymentId: string,
    newStatus: 'verified' | 'rejected' | 'failed',
    actorId?: string,
    notes?: string
  ): PaymentRecord {
    const index = this.data.payments.findIndex((p) => p.id === paymentId);
    if (index === -1) throw new Error('Payment record not found');

    const payment = this.data.payments[index];
    payment.status = newStatus;
    payment.verified_at = new Date().toISOString();
    payment.verified_by = actorId || null;
    if (notes) payment.notes = notes;

    const appointment = payment.appointment_id ? this.getAppointmentById(payment.appointment_id) : undefined;
    if (appointment) {
      appointment.payment_status = newStatus;
      if (newStatus === 'verified') {
        // Automatically link/record sale if not already recorded
        const hasSale = this.data.sales.some((s) => s.appointment_id === appointment.id);
        if (!hasSale) {
          this.recordSale({
            appointment_id: appointment.id,
            service_id: appointment.service_id,
            amount: payment.amount,
            payment_method: 'upi',
            notes: `Auto-recorded upon UPI verification (UTR: ${payment.upi_transaction_id || 'N/A'})`,
            recorded_by: actorId || null,
          });
        }
      }
    }

    this.addAuditLog('verify_payment', 'payment', payment.id, {
      status: newStatus,
      booking: payment.booking_reference,
    }, actorId);
    this.saveData();
    return payment;
  }

  // --- REPORTS & DASHBOARD METRICS ---
  getDashboardMetrics(dateStr?: string) {
    const today = dateStr || new Date().toISOString().split('T')[0];

    const todayAppointments = this.data.appointments.filter((a) => a.appointment_date === today);
    const upcomingAppointments = this.data.appointments.filter(
      (a) => a.appointment_date >= today && !['completed', 'cancelled', 'no_show'].includes(a.status)
    );

    const todayTokens = this.data.walk_in_tokens.filter((t) => t.token_date === today);
    const waitingTokens = todayTokens.filter((t) => t.status === 'waiting' || t.status === 'called');
    const inServiceTokens = todayTokens.filter((t) => t.status === 'in_service');
    const inServiceAppointments = todayAppointments.filter((a) => a.status === 'in_service');
    const completedAppointments = todayAppointments.filter((a) => a.status === 'completed');

    const todaySales = this.data.sales
      .filter((s) => s.created_at.split('T')[0] === today)
      .reduce((sum, s) => sum + s.amount, 0);

    const todayExpenses = this.data.expenses
      .filter((e) => e.expense_date === today)
      .reduce((sum, e) => sum + e.amount, 0);

    const activeServices = this.data.services.filter((s) => s.is_active);
    const employees = this.data.employees;

    const recentActivity = [...this.data.audit_logs]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10);

    return {
      today,
      todayAppointmentsCount: todayAppointments.length,
      upcomingAppointmentsCount: upcomingAppointments.length,
      waitingTokensCount: waitingTokens.length,
      currentlyServingCount: inServiceTokens.length + inServiceAppointments.length,
      completedAppointmentsCount: completedAppointments.length,
      todayRecordedSales: todaySales,
      todayRecordedExpenses: todayExpenses,
      operatingSurplusToday: todaySales - todayExpenses,
      activeServicesCount: activeServices.length,
      employeesCount: employees.length,
      recentActivity,
    };
  }

  getReports(startDate?: string, endDate?: string) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const periodSales = this.data.sales.filter(
      (s) => s.created_at.split('T')[0] >= start && s.created_at.split('T')[0] <= end
    );
    const periodExpenses = this.data.expenses.filter(
      (e) => e.expense_date >= start && e.expense_date <= end
    );
    const periodAppointments = this.data.appointments.filter(
      (a) => a.appointment_date >= start && a.appointment_date <= end
    );
    const periodTokens = this.data.walk_in_tokens.filter(
      (t) => t.token_date >= start && t.token_date <= end
    );

    const totalSales = periodSales.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const recordedOperatingSurplus = totalSales - totalExpenses;

    // Sales by service
    const salesByService: Record<string, { count: number; total: number }> = {};
    for (const s of periodSales) {
      if (!salesByService[s.service_name]) {
        salesByService[s.service_name] = { count: 0, total: 0 };
      }
      salesByService[s.service_name].count += 1;
      salesByService[s.service_name].total += s.amount;
    }

    // Expenses by category
    const expensesByCategory: Record<string, number> = {};
    for (const e of periodExpenses) {
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    }

    // Appointment stats
    const appointmentsByStatus: Record<string, number> = {};
    for (const a of periodAppointments) {
      appointmentsByStatus[a.status] = (appointmentsByStatus[a.status] || 0) + 1;
    }

    return {
      period: { start, end },
      totalSales,
      totalExpenses,
      recordedOperatingSurplus,
      salesCount: periodSales.length,
      appointmentsCount: periodAppointments.length,
      tokensCount: periodTokens.length,
      cancellationsCount: periodAppointments.filter((a) => a.status === 'cancelled').length,
      salesByService,
      expensesByCategory,
      appointmentsByStatus,
    };
  }

  // --- AUDIT LOGS ---
  addAuditLog(
    action: string,
    entity_type: string,
    entity_id: string,
    details?: Record<string, unknown>,
    actor_id?: string
  ) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entity_type,
      entity_id,
      details,
      actor_id: actor_id || null,
      created_at: new Date().toISOString(),
    };
    this.data.audit_logs.push(log);
    // Keep last 1000 logs
    if (this.data.audit_logs.length > 1000) {
      this.data.audit_logs = this.data.audit_logs.slice(-1000);
    }
  }

  // --- AUTHENTICATION & PROFILES ---
  findProfileByEmail(email: string): Profile | undefined {
    return this.data.profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
  }

  findProfileByPhone(phone: string): Profile | undefined {
    return this.data.profiles.find((p) => p.phone === phone.trim());
  }

  findProfileById(id: string): Profile | undefined {
    return this.data.profiles.find((p) => p.id === id);
  }

  getAllProfiles(): Profile[] {
    return this.data.profiles.map((p) => {
      const { password_hash: _, ...rest } = p;
      return rest as Profile;
    });
  }

  registerCustomer(payload: {
    email: string;
    phone: string;
    full_name: string;
    password: string;
  }): Profile {
    const existing = this.findProfileByEmail(payload.email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const passwordHash = crypto.createHash('sha256').update(payload.password).digest('hex');
    const newProfile: Profile = {
      id: `prof-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      email: payload.email.trim().toLowerCase(),
      password_hash: passwordHash,
      full_name: payload.full_name.trim(),
      phone: payload.phone.trim(),
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.profiles.push(newProfile);
    this.addAuditLog('register', 'profile', newProfile.id, { email: newProfile.email, role: 'customer' });
    this.saveData();

    const { password_hash: _, ...safeProfile } = newProfile;
    return safeProfile as Profile;
  }

  verifyCredentials(email: string, password: string): Profile | null {
    const profile = this.findProfileByEmail(email);
    if (!profile || !profile.password_hash) return null;

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (hash === profile.password_hash) {
      const { password_hash: _, ...safe } = profile;
      return safe as Profile;
    }
    return null;
  }
}

// Global singleton instance
const globalForDb = globalThis as unknown as { salonDb?: SalonDatabase };
export const db = globalForDb.salonDb ?? new SalonDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.salonDb = db;
