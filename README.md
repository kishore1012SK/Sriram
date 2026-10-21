# SRIRAM SALON — Web Application & UPI Payment Integration

Production-ready full-stack web application designed for **SRIRAM SALON**, a single-location hair salon and traditional barber shop in Pudukkottai, Tamil Nadu, India.

---

## 1. Business Profile & Details

* **Business Name:** Sriram Salon
* **Founder & Master Barber:** S. Ramasamy / Sriram
* **Location:** South 2nd Street, Pudukkottai, Tamil Nadu, India — 622001
* **Customer Helpline / Support:** `+91 94867 54402`
* **Official UPI ID:** `kishoreramr2004@oksbi`
* **Currency:** INR (₹)
* **Timezone:** Asia/Kolkata (`UTC+05:30`)

---

## 2. Shift Hours & Booking Constraints

The salon strictly enforces daily shift intervals. Appointments must fit completely within a single shift (no appointments spanning across break periods):

* **Monday to Friday (3 Shifts):**
  * Shift 1 (Morning): `06:30 AM – 10:00 AM`
  * Shift 2 (Midday): `10:30 AM – 02:00 PM`
  * Shift 3 (Evening): `03:00 PM – 09:30 PM`
  * *Sanitation & rest breaks:* `10:00–10:30` and `14:00–15:00`
* **Saturday & Sunday (Weekend Continuous):**
  * Full Day: `06:00 AM – 10:00 PM`

---

## 3. Official Services & Rates

| Service Name | Price (₹) | Duration | Description |
| :--- | :--- | :--- | :--- |
| **Men's Haircut** | ₹150 | 30 mins | Precision haircut customized to face shape, styled with premium finish. |
| **Children's Haircut** | ₹100 | 20 mins | Gentle, friendly haircut for boys & girls with clean detailing. |
| **Beard Trimming** | ₹70 | 15 mins | Crisp beard trim, edge detailing, and neckline contouring. |
| **Shaving** | ₹80 | 15 mins | Classic wet razor shave with warm lather, hot towel press, and lotion. |

---

## 4. UPI Payment Architecture & Verification Workflow

### Verified Payee Details
* **Payee Name:** Sriram Salon
* **UPI ID:** `kishoreramr2004@oksbi`
* **Support Phone:** `9486754402`

### Direct UPI Deep Link Format
Mobile customers can tap to open their installed UPI applications (Google Pay, PhonePe, Paytm, BHIM):
```
upi://pay?pa=kishoreramr2004@oksbi&pn=Sriram%20Salon&am={amount}&tr={booking_reference}&cu=INR&tn=Sriram%20Salon%20Booking%20{booking_reference}
```

### Strict Non-Fake Independent Verification Policy
1. **Pending Status by Default:** Generating a deep link or opening a UPI app does **not** prove payment. All customer payment attempts start in `Pending Verification` status.
2. **Customer UTR Recording:** Customers can mark payment attempted by submitting their 12-digit bank UTR (Unique Transaction Reference) / transaction ID during booking or on their booking details page (`/booking/[reference]`).
3. **Independent Admin Reconciliation:** Salon managers cross-reference the customer's UTR and booking reference against their official bank notification / SBI statement via the **UPI Verification Queue** in the Admin Portal (`/admin/sales`).
4. **Automated Billing on Verification:** When staff clicks **Verify Payment**:
   * The payment record status transitions to `verified`.
   * The appointment payment status transitions to `verified`.
   * An official sales invoice (`INV-YYYYMMDD-XXXX`) is automatically generated and linked.
5. **Cash at Salon Option:** Cash payment remains fully supported for customers who prefer to settle in person after service.
6. **Zero Sensitive Data Storage:** The application **never** asks for or stores UPI PINs, OTPs, or net banking passwords.

---

## 5. Admin & Staff Credentials

Access the administrative control center at `/admin/login`:

* **URL:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
* **Default Owner Email:** `admin@sriramsalon.com`
* **Default Password:** `SriramAdmin@2026`
* **Role:** `owner` (Full administrative rights)

---

## 6. Project Architecture & File Structure

```
├── .data/
│   └── db.json                         # Persistent transactional database
├── public/
│   └── images/
│       └── sriram-salon-brand.jpg      # Authentic founder portrait & official emblem
├── src/
│   ├── app/
│   │   ├── (customer routes)
│   │   │   ├── page.tsx                # Home page with founder photo & UPI badge
│   │   │   ├── services/page.tsx       # Rate card with official services
│   │   │   ├── book/BookingFlow.tsx    # Interactive 4-step booking with UPI checkout
│   │   │   ├── booking/[reference]/    # Appointment tracker & UTR submission
│   │   │   ├── queue/page.tsx          # Real-time walk-in queue token tracker
│   │   │   ├── contact/page.tsx        # Location on South 2nd Street, Pudukkottai
│   │   │   └── ...
│   │   ├── admin/
│   │   │   ├── appointments/           # Directory with UPI pending badges & links
│   │   │   ├── sales/                  # POS & UPI Verification Queue
│   │   │   ├── queue/                  # Walk-in queue caller
│   │   │   ├── reports/                # Revenue, services, and expense reports
│   │   │   └── settings/               # Business info and operating hours
│   │   └── api/
│   │       ├── appointments/           # Appointment creation & slot checking
│   │       ├── payments/               # Customer UTR submission & status
│   │       ├── payments/[id]/verify/   # Staff independent verification endpoint
│   │       ├── queue/                  # Token issuing & status advancement
│   │       └── sales/                  # Invoicing & sales reporting
│   ├── lib/
│   │   ├── upi.ts                      # Salon UPI config, link builder, UTR validator
│   │   ├── db/store.ts                 # Atomic transactional repository
│   │   └── auth/session.ts             # Cookie session management
│   └── test/                           # Automated Vitest test suite (35 tests)
└── supabase/
    └── migrations/                     # Production PostgreSQL DDL migrations
```

---

## 7. Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Run production build
npm run build

# 4. Start production server
npm start
# Server starts on http://localhost:3000
```

---

## 8. Verification & QA Status

* **Unit Tests:** 35 passing tests across 7 test suites (`src/test/*.test.ts`)
* **Production Build:** 41 routes successfully compiled and static-prerendered with 0 errors
* **Security Checks:** CSRF-safe cookies, password hashing with salt, sanitized inputs, zero exposed banking secrets.
