'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Service, Employee } from '@/lib/types';
import { formatINR, formatTime12h, formatDateDDMMYYYY } from '@/lib/utils';
import { SALON_UPI_CONFIG, generateUpiLink, isValidUpiReference } from '@/lib/upi';
import {
  Scissors,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Banknote,
  ShieldCheck,
} from 'lucide-react';

interface BookingFlowProps {
  initialServices: Service[];
  initialEmployees: Employee[];
}

export function BookingFlow({ initialServices, initialEmployees }: BookingFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams?.get('service') || '';

  // Form State
  const [step, setStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId || (initialServices[0]?.id ?? ''));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('any');

  // Generate next 14 days
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [availableSlots, setAvailableSlots] = useState<{ time: string; employeeId: string; employeeName: string }[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Customer Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Payment Selection
  const [paymentPreference, setPaymentPreference] = useState<'cash' | 'upi'>('cash');
  const [upiTransactionId, setUpiTransactionId] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [submittingUtr, setSubmittingUtr] = useState<boolean>(false);
  const [utrSuccessMsg, setUtrSuccessMsg] = useState<string>('');
  const [utrErrorMsg, setUtrErrorMsg] = useState<string>('');

  // Submission State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    customer_name: string;
    customer_phone: string;
    service_name: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    employee_name: string;
    price_snapshot: number;
    payment_preference?: 'cash' | 'upi';
    payment_status?: string;
    upi_transaction_id?: string | null;
  } | null>(null);

  // Auto-fill customer info if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          if (!customerName) setCustomerName(data.user.full_name);
          if (!customerPhone) setCustomerPhone(data.user.phone);
          if (!customerEmail) setCustomerEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch slots whenever date, service, or employee changes
  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;

    setLoadingSlots(true);
    setErrorMsg('');
    setSelectedTime('');

    const empParam = selectedEmployeeId && selectedEmployeeId !== 'any' ? `&employee_id=${selectedEmployeeId}` : '';
    fetch(`/api/appointments/slots?date=${selectedDate}&service_id=${selectedServiceId}${empParam}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableSlots(data.slots || []);
      })
      .catch(() => {
        setErrorMsg('Could not load appointment slots. Please verify your connection.');
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [selectedDate, selectedServiceId, selectedEmployeeId]);

  const selectedService = initialServices.find((s) => s.id === selectedServiceId);

  // Build dates list for 14 days
  const dateOptions = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return { dateStr, dayLabel, formatted };
  });

  const handleCopyUpi = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(SALON_UPI_CONFIG.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter your name and phone number.');
      return;
    }

    if (!selectedTime) {
      setErrorMsg('Please select a time slot.');
      return;
    }

    if (paymentPreference === 'upi' && upiTransactionId && !isValidUpiReference(upiTransactionId)) {
      setErrorMsg('Please enter a valid UPI reference (minimum 6 characters, e.g. 12-digit UTR).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          service_id: selectedServiceId,
          employee_id: selectedEmployeeId === 'any' ? null : selectedEmployeeId,
          appointment_date: selectedDate,
          start_time: selectedTime,
          notes,
          payment_preference: paymentPreference,
          upi_transaction_id: paymentPreference === 'upi' && upiTransactionId ? upiTransactionId.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }

      setConfirmedBooking(data.appointment);
      setStep(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPaymentAttempt = async (ref: string, utrValue: string) => {
    if (!isValidUpiReference(utrValue)) {
      setUtrErrorMsg('Please enter a valid 12-digit UTR or transaction reference number.');
      return;
    }

    setSubmittingUtr(true);
    setUtrErrorMsg('');
    setUtrSuccessMsg('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_reference: ref,
          upi_transaction_id: utrValue.trim(),
          notes: 'Customer marked payment attempted in booking interface',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment attempt');
      }

      setUtrSuccessMsg('Payment reference saved! Status is Pending Verification.');
      setConfirmedBooking((prev) =>
        prev
          ? {
              ...prev,
              payment_preference: 'upi',
              payment_status: 'pending',
              upi_transaction_id: utrValue.trim(),
            }
          : null
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setUtrErrorMsg(msg);
    } finally {
      setSubmittingUtr(false);
    }
  };

  // STEP 5: SUCCESS CONFIRMATION
  if (confirmedBooking) {
    const upiLink = generateUpiLink({
      amount: confirmedBooking.price_snapshot,
      reference: confirmedBooking.reference,
    });

    return (
      <div className="max-w-2xl mx-auto p-6 sm:p-10 bg-white rounded-3xl border border-[#e6ddce] shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#f2f7f4] text-[#2f6954] flex items-center justify-center mx-auto border border-[#3e856c]/30">
          <CheckCircle2 className="w-9 h-9 text-[#2f6954]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-[#b06942]">
            Booking Confirmed
          </span>
          <h2 className="font-serif text-3xl font-bold text-[#122920]">
            Thank You, {confirmedBooking.customer_name}!
          </h2>
          <p className="text-sm text-[#122920]/75">
            Your appointment has been successfully scheduled at Sriram Salon.
          </p>
        </div>

        {/* Reference Code Card */}
        <div className="p-6 rounded-2xl bg-[#f6f1e8] border border-[#e6ddce] space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e6ddce] gap-2">
            <div>
              <span className="text-xs text-[#122920]/60 uppercase tracking-wider font-semibold">
                Booking Reference
              </span>
              <p className="font-mono text-xl font-bold text-[#b06942] tracking-wider">
                {confirmedBooking.reference}
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#2f6954] text-white self-start sm:self-auto">
              Confirmed Slot
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-[#122920]/60 block">Service</span>
              <span className="font-bold text-[#122920]">{confirmedBooking.service_name}</span>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Payable Amount</span>
              <span className="font-bold text-[#122920]">{formatINR(confirmedBooking.price_snapshot)}</span>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Date</span>
              <span className="font-semibold text-[#122920]">{formatDateDDMMYYYY(confirmedBooking.appointment_date)}</span>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Time Slot</span>
              <span className="font-semibold text-[#122920]">
                {formatTime12h(confirmedBooking.start_time)} – {formatTime12h(confirmedBooking.end_time)}
              </span>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Stylist</span>
              <span className="font-semibold text-[#122920]">{confirmedBooking.employee_name}</span>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Payment Preference</span>
              <span className="font-semibold text-[#122920] capitalize">
                {confirmedBooking.payment_preference === 'upi' ? 'UPI Payment' : 'Cash at Salon'}
              </span>
            </div>
          </div>
        </div>

        {/* UPI PAYMENT MODULE */}
        {confirmedBooking.payment_preference === 'upi' && (
          <div className="p-6 rounded-2xl bg-[#fcfbf9] border border-[#c87d55]/40 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6ddce] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#b06942]" />
                <h3 className="font-serif text-base font-bold text-[#122920]">
                  Sriram Salon — UPI Payment Details
                </h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                Pending Verification
              </span>
            </div>

            {/* Business & UPI ID Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#e6ddce]">
                <span className="text-[#122920]/60 block">Payee Business</span>
                <strong className="text-[#122920] text-sm">{SALON_UPI_CONFIG.name}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#e6ddce]">
                <span className="text-[#122920]/60 block">Payable Amount</span>
                <strong className="text-[#b06942] text-sm font-mono">
                  {formatINR(confirmedBooking.price_snapshot)}
                </strong>
              </div>
            </div>

            {/* UPI ID & Copy Button */}
            <div className="p-3.5 rounded-xl bg-[#f6f1e8] border border-[#e6ddce] flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-[#122920]/60 block font-semibold uppercase">Official UPI ID</span>
                <code className="font-mono text-sm font-bold text-[#122920]">
                  {SALON_UPI_CONFIG.upiId}
                </code>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#e6ddce] text-xs font-semibold text-[#122920] hover:bg-[#faf8f5] transition-all shadow-sm"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#b06942]" />
                    <span>Copy UPI ID</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct Pay Link */}
            <div>
              <a
                href={upiLink}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#122920] text-white text-xs sm:text-sm font-semibold hover:bg-[#1a3c30] transition-colors shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-[#d9916b]" />
                <span>Open in UPI App (GPay, PhonePe, Paytm, BHIM)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
              <p className="text-[11px] text-[#122920]/60 text-center mt-1.5">
                On mobile devices, this will launch your installed UPI applications with prefilled amount and booking reference.
              </p>
            </div>

            {/* Record Payment Attempt / Enter UTR */}
            <div className="pt-3 border-t border-[#e6ddce] space-y-2">
              <label className="text-xs font-bold text-[#122920] block">
                Have you completed your payment? Enter your 12-digit UPI UTR / Transaction ID:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={upiTransactionId}
                  onChange={(e) => setUpiTransactionId(e.target.value)}
                  placeholder="e.g. 429182749102"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#e6ddce] text-xs font-mono bg-white focus:ring-2 focus:ring-[#c87d55] outline-none"
                />
                <button
                  type="button"
                  disabled={submittingUtr || !upiTransactionId.trim()}
                  onClick={() => handleRecordPaymentAttempt(confirmedBooking.reference, upiTransactionId)}
                  className="px-4 py-2 rounded-xl bg-[#2f6954] text-white text-xs font-semibold hover:bg-[#235040] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submittingUtr && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Record Payment Attempt</span>
                </button>
              </div>

              {utrSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{utrSuccessMsg}</span>
                </div>
              )}

              {utrErrorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{utrErrorMsg}</span>
                </div>
              )}
            </div>

            {/* Security & Verification Notice */}
            <div className="p-3.5 rounded-xl bg-[#f4efe6] border border-[#e6ddce] text-[11px] text-[#122920]/80 space-y-1">
              <p className="font-bold text-[#122920] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#b06942]" />
                Independent Bank Verification Policy:
              </p>
              <p>• Payments are kept as <strong>Pending Verification</strong> until independently verified by salon administration against bank records.</p>
              <p>• <strong>Security Rule:</strong> Sriram Salon will NEVER ask for your UPI PIN, OTP, or net banking password.</p>
              <p>• For verification questions, call salon direct: <strong>+91 {SALON_UPI_CONFIG.contactPhone}</strong>.</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 rounded-xl bg-[#fcfbf9] border border-[#e6ddce] text-xs text-[#122920]/80 text-left space-y-1">
          <p className="font-bold text-[#122920]">Salon Arrival Instructions:</p>
          <p>• Please arrive 5 minutes prior to your scheduled time slot.</p>
          <p>• Location: South 2nd Street, Pudukkottai (Phone: +91 94867 54402).</p>
          <p>• Cash at salon is always accepted upon service completion.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => router.push(`/booking/${confirmedBooking.reference}`)}
            className="flex-1 py-3 px-4 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] transition-colors"
          >
            View Full Booking Details
          </button>
          <button
            onClick={() => router.push('/account/bookings')}
            className="flex-1 py-3 px-4 rounded-xl bg-white border border-[#e6ddce] text-[#122920] text-sm font-semibold hover:bg-[#f6f1e8] transition-colors"
          >
            My Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-[#e6ddce] shadow-xl overflow-hidden">
      {/* Header & Steps Indicator */}
      <div className="p-6 sm:p-8 bg-[#122920] text-[#f6f1e8] border-b border-[#c87d55]/30">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-bold text-[#d9916b]">
              Online Booking
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Reserve Your Salon Appointment
            </h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#1a3c30] text-[#d9916b] border border-[#c87d55]/30 font-mono font-semibold">
            Step {step} of 4
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {['Service', 'Date & Stylist', 'Time Slot', 'Confirmation'].map((name, idx) => (
            <div key={name} className="space-y-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  idx + 1 <= step ? 'bg-[#d9916b]' : 'bg-[#1a3c30]'
                }`}
              />
              <span className="text-[10px] hidden sm:block text-[#ece3d3]/70 truncate">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#122920]">
              1. Choose Your Service
            </h2>
            <p className="text-xs sm:text-sm text-[#122920]/70">
              Select the grooming service you would like to receive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialServices.map((service) => {
              const isSelected = service.id === selectedServiceId;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#c87d55] bg-[#fbf9f5] ring-2 ring-[#c87d55]/30'
                      : 'border-[#e6ddce] bg-white hover:border-[#c87d55]/60 hover:bg-[#faf8f5]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif text-lg font-bold text-[#122920]">
                        {service.name}
                      </h3>
                      <span className="font-serif text-lg font-bold text-[#b06942]">
                        {formatINR(service.price)}
                      </span>
                    </div>
                    <p className="text-xs text-[#122920]/75 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#f4efe6] flex items-center justify-between text-xs text-[#122920]/70">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#b06942]" />
                      <span>{service.duration_minutes} Mins</span>
                    </div>
                    <span className={`font-semibold ${isSelected ? 'text-[#b06942]' : 'text-gray-400'}`}>
                      {isSelected ? '✓ Selected' : 'Select'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => {
                if (!selectedServiceId) {
                  setErrorMsg('Please select a service');
                  return;
                }
                setErrorMsg('');
                setStep(2);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] transition-colors"
            >
              <span>Continue to Date & Stylist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE & STYLIST */}
      {step === 2 && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#122920]">
              2. Select Date & Stylist
            </h2>
            <p className="text-xs sm:text-sm text-[#122920]/70">
              Appointments can be reserved up to 14 days in advance.
            </p>
          </div>

          {/* Date Slider / Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#122920]/70">
              Select Appointment Date
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {dateOptions.map((opt) => {
                const isSelected = opt.dateStr === selectedDate;
                return (
                  <button
                    key={opt.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(opt.dateStr)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#c87d55] bg-[#122920] text-white shadow-sm'
                        : 'border-[#e6ddce] bg-white text-[#122920] hover:bg-[#f6f1e8]'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block opacity-75">
                      {opt.dayLabel}
                    </span>
                    <span className="text-xs font-semibold block mt-1">
                      {opt.formatted}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stylist Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#122920]/70">
              Preferred Stylist
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedEmployeeId('any')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedEmployeeId === 'any'
                    ? 'border-[#c87d55] bg-[#fbf9f5] ring-2 ring-[#c87d55]/30'
                    : 'border-[#e6ddce] bg-white hover:bg-[#f6f1e8]'
                }`}
              >
                <p className="text-sm font-bold text-[#122920]">Any Available Stylist</p>
                <p className="text-xs text-[#122920]/70 mt-1">Maximum slot flexibility</p>
              </button>

              {initialEmployees.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedEmployeeId === emp.id
                      ? 'border-[#c87d55] bg-[#fbf9f5] ring-2 ring-[#c87d55]/30'
                      : 'border-[#e6ddce] bg-white hover:bg-[#f6f1e8]'
                  }`}
                >
                  <p className="text-sm font-bold text-[#122920]">{emp.name}</p>
                  <p className="text-xs text-[#122920]/70 mt-1">Master Barber & Stylist</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#f4efe6]">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6ddce] text-xs font-semibold text-[#122920] hover:bg-[#f6f1e8]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                setErrorMsg('');
                setStep(3);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] transition-colors"
            >
              <span>View Available Slots</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT TIME SLOT */}
      {step === 3 && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#122920]">
              3. Choose Your Time Slot
            </h2>
            <p className="text-xs sm:text-sm text-[#122920]/70">
              Only times completely within salon working hours and free of stylist conflicts are displayed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f6f1e8] border border-[#e6ddce] text-xs flex items-center justify-between">
            <div>
              <span className="text-[#122920]/60">Date:</span>{' '}
              <strong className="text-[#122920]">{formatDateDDMMYYYY(selectedDate)}</strong>
            </div>
            <div>
              <span className="text-[#122920]/60">Duration:</span>{' '}
              <strong className="text-[#122920]">{selectedService?.duration_minutes} minutes</strong>
            </div>
          </div>

          {loadingSlots ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[#122920]/70">
              <Loader2 className="w-8 h-8 animate-spin text-[#b06942]" />
              <p className="text-xs">Computing live salon availability...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="py-12 p-6 rounded-2xl bg-[#faf8f5] border border-[#e6ddce] text-center space-y-3">
              <Clock className="w-8 h-8 text-[#b06942] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#122920]">
                No Available Slots on This Date
              </h3>
              <p className="text-xs text-[#122920]/70 max-w-md mx-auto">
                All appointments for this date are fully reserved or the salon schedule is booked. Please choose another date or select &apos;Any Available Stylist&apos;.
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#122920] text-white text-xs font-semibold"
              >
                Change Date
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#122920]/70">
                Available Opening Slots ({availableSlots.length} Slots Found)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-80 overflow-y-auto p-1">
                {availableSlots.map((slot) => {
                  const isSelected = slot.time === selectedTime;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#c87d55] bg-[#122920] text-white shadow font-bold'
                          : 'border-[#e6ddce] bg-white text-[#122920] hover:border-[#c87d55]/60 hover:bg-[#faf8f5]'
                      }`}
                    >
                      <span className="font-mono text-sm block">{formatTime12h(slot.time)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-[#f4efe6]">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6ddce] text-xs font-semibold text-[#122920] hover:bg-[#f6f1e8]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              disabled={!selectedTime}
              onClick={() => {
                if (!selectedTime) {
                  setErrorMsg('Please pick a time slot');
                  return;
                }
                setErrorMsg('');
                setStep(4);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Customer Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CUSTOMER DETAILS & FINAL CONFIRMATION */}
      {step === 4 && (
        <form onSubmit={handleBookSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#122920]">
              4. Review & Confirm Booking
            </h2>
            <p className="text-xs sm:text-sm text-[#122920]/70">
              Provide your contact details so we can reserve your appointment slot.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-5 rounded-2xl bg-[#f6f1e8] border border-[#e6ddce] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#122920]/60 block">Service</span>
              <strong className="text-[#122920] text-sm">{selectedService?.name}</strong>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Price Snapshot</span>
              <strong className="text-[#b06942] text-sm">{selectedService ? formatINR(selectedService.price) : ''}</strong>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Date</span>
              <strong className="text-[#122920] text-sm">{formatDateDDMMYYYY(selectedDate)}</strong>
            </div>
            <div>
              <span className="text-[#122920]/60 block">Time</span>
              <strong className="text-[#122920] text-sm">{formatTime12h(selectedTime)}</strong>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#122920]">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#122920]/50 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#122920]">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#122920]/50 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9486754402"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#122920]">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#122920]/50 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#122920]">
                  Special Notes / Styling Request <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Low fade, skin sensitive"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#122920]/80 block">
              Payment Method Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash at Salon */}
              <div
                onClick={() => setPaymentPreference('cash')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  paymentPreference === 'cash'
                    ? 'border-[#c87d55] bg-[#fbf9f5] ring-2 ring-[#c87d55]/30'
                    : 'border-[#e6ddce] bg-white hover:bg-[#faf8f5]'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${paymentPreference === 'cash' ? 'bg-[#122920] text-[#d9916b]' : 'bg-[#f6f1e8] text-[#122920]'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#122920]">Pay Cash at Salon</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-[#122920]/70 leading-relaxed">
                    Settle comfortably in cash or UPI upon service completion at our Pudukkottai salon.
                  </p>
                </div>
              </div>

              {/* UPI Online Payment */}
              <div
                onClick={() => setPaymentPreference('upi')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  paymentPreference === 'upi'
                    ? 'border-[#c87d55] bg-[#fbf9f5] ring-2 ring-[#c87d55]/30'
                    : 'border-[#e6ddce] bg-white hover:bg-[#faf8f5]'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${paymentPreference === 'upi' ? 'bg-[#122920] text-[#d9916b]' : 'bg-[#f6f1e8] text-[#122920]'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#122920]">UPI Online Payment</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                      Direct App
                    </span>
                  </div>
                  <p className="text-xs text-[#122920]/70 leading-relaxed">
                    Pay using Google Pay, PhonePe, Paytm, or BHIM directly to our verified salon UPI ID.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* UPI Information Card if UPI selected */}
          {paymentPreference === 'upi' && (
            <div className="p-5 rounded-2xl bg-[#fcfbf9] border border-[#c87d55]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#e6ddce] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#b06942]">
                    Salon UPI Details
                  </span>
                  <p className="text-sm font-bold text-[#122920]">{SALON_UPI_CONFIG.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#122920]/60 block">Exact Payable</span>
                  <span className="font-mono text-base font-bold text-[#b06942]">
                    {selectedService ? formatINR(selectedService.price) : '₹0'}
                  </span>
                </div>
              </div>

              {/* UPI ID Copy Block */}
              <div className="p-3 rounded-xl bg-white border border-[#e6ddce] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#122920]/60 uppercase font-semibold block">
                    Verified UPI ID
                  </span>
                  <code className="font-mono text-xs sm:text-sm font-bold text-[#122920]">
                    {SALON_UPI_CONFIG.upiId}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f6f1e8] text-xs font-semibold text-[#122920] hover:bg-[#e6ddce] transition-colors"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#b06942]" />
                      <span>Copy UPI ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Optional UPI UTR Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#122920]">
                  UPI UTR / Transaction Reference Number <span className="text-gray-400 font-normal">(Optional now — can also enter after booking)</span>
                </label>
                <input
                  type="text"
                  value={upiTransactionId}
                  onChange={(e) => setUpiTransactionId(e.target.value)}
                  placeholder="e.g. 429182749102 (12 digits)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ddce] text-xs font-mono bg-white focus:ring-2 focus:ring-[#c87d55] outline-none"
                />
              </div>

              {/* Strict Verification and Security Warning */}
              <div className="p-3 rounded-xl bg-[#f4efe6] border border-[#e6ddce] text-[11px] text-[#122920]/80 space-y-1">
                <p className="font-bold text-[#122920] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#b06942]" />
                  Independent Verification & Security Policy:
                </p>
                <p>• Payments are kept in <strong>Pending Verification</strong> status until verified by salon staff against bank records.</p>
                <p>• <strong>Safety Notice:</strong> Sriram Salon will NEVER ask for your UPI PIN, OTPs, or passwords.</p>
                <p>• Support Helpline: <strong>+91 {SALON_UPI_CONFIG.contactPhone}</strong>.</p>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-[#f4efe6]">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#e6ddce] text-xs font-semibold text-[#122920] hover:bg-[#f6f1e8]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#d9916b]" />
                  <span>Securing Appointment...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#d9916b]" />
                  <span>Confirm Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
