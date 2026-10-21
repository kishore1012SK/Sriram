'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Appointment } from '@/lib/types';
import { formatINR, formatTime12h, formatDateDDMMYYYY } from '@/lib/utils';
import { SALON_UPI_CONFIG, generateUpiLink, isValidUpiReference } from '@/lib/upi';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Banknote,
  AlertCircle,
} from 'lucide-react';

interface Props {
  appointment: Appointment;
  cancellationLeadHours: number;
  cancellationPolicy: string;
}

export function BookingDetailsClient({
  appointment: initialApp,
  cancellationLeadHours,
  cancellationPolicy,
}: Props) {
  const [app, setApp] = useState<Appointment>(initialApp);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reason, setReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  // UPI State
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrInput, setUtrInput] = useState(initialApp.upi_transaction_id || '');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrMsg, setUtrMsg] = useState('');
  const [utrErr, setUtrErr] = useState('');

  const handleCopyUpi = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(SALON_UPI_CONFIG.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleRecordUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUpiReference(utrInput)) {
      setUtrErr('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
      return;
    }

    setSubmittingUtr(true);
    setUtrErr('');
    setUtrMsg('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_reference: app.reference,
          upi_transaction_id: utrInput.trim(),
          notes: 'Customer submitted UTR from booking details page',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment reference');

      setUtrMsg('Your payment reference has been recorded! Status is Pending Verification.');
      setApp((prev) => ({
        ...prev,
        payment_preference: 'upi',
        payment_status: 'pending',
        upi_transaction_id: utrInput.trim(),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting reference';
      setUtrErr(msg);
    } finally {
      setSubmittingUtr(false);
    }
  };

  // Check if cancellation is permitted based on policy
  const now = new Date();
  const appDateTime = new Date(`${app.appointment_date}T${app.start_time}:00`);
  const diffHours = (appDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel =
    !['completed', 'cancelled', 'no_show'].includes(app.status) &&
    diffHours >= cancellationLeadHours;

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError('');

    try {
      const res = await fetch(`/api/appointments/${app.reference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          reason: reason || 'Customer requested cancellation',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel appointment');
      }

      setApp(data.appointment);
      setShowCancelModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error cancelling';
      setCancelError(msg);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'checked_in':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Checked In</span>;
      case 'in_service':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">In Service</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 capitalize">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-xl overflow-hidden space-y-6 p-6 sm:p-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#e6ddce] gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Appointment Record
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#122920] mt-1">
            {app.service_name}
          </h1>
          <p className="font-mono text-sm text-[#122920]/70 mt-0.5">
            Ref: {app.reference}
          </p>
        </div>
        <div>{getStatusBadge(app.status)}</div>
      </div>

      {/* Appointment Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-[#f6f1e8] border border-[#e6ddce] text-xs sm:text-sm">
        <div>
          <span className="text-[#122920]/60 block text-xs">Customer Name</span>
          <span className="font-bold text-[#122920]">{app.customer_name}</span>
        </div>
        <div>
          <span className="text-[#122920]/60 block text-xs">Phone Number</span>
          <span className="font-bold text-[#122920]">{app.customer_phone}</span>
        </div>
        <div>
          <span className="text-[#122920]/60 block text-xs">Appointment Date</span>
          <span className="font-bold text-[#122920]">{formatDateDDMMYYYY(app.appointment_date)}</span>
        </div>
        <div>
          <span className="text-[#122920]/60 block text-xs">Scheduled Time</span>
          <span className="font-bold text-[#122920]">
            {formatTime12h(app.start_time)} – {formatTime12h(app.end_time)} ({app.duration_minutes}m)
          </span>
        </div>
        <div>
          <span className="text-[#122920]/60 block text-xs">Assigned Stylist</span>
          <span className="font-bold text-[#122920]">{app.employee_name}</span>
        </div>
        <div>
          <span className="text-[#122920]/60 block text-xs">Payment Preference</span>
          <span className="font-bold text-[#122920] capitalize">
            {app.payment_preference === 'upi' ? 'UPI Payment' : 'Cash at Salon'}
          </span>
        </div>
        <div>
          <span className="text-[#122920]/60 block text-xs">Amount Due</span>
          <span className="font-serif text-base font-bold text-[#b06942]">
            {formatINR(app.price_snapshot)}
          </span>
        </div>
      </div>

      {/* UPI Payment & Verification Section */}
      <div className="p-6 rounded-2xl bg-[#fcfbf9] border border-[#c87d55]/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e6ddce] gap-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#b06942]" />
            <div>
              <h3 className="font-serif text-base font-bold text-[#122920]">
                Payment Status & UPI Checkout
              </h3>
              <p className="text-xs text-[#122920]/70">
                Official salon payee: <strong>{SALON_UPI_CONFIG.name}</strong>
              </p>
            </div>
          </div>
          <div>
            {app.payment_status === 'verified' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>UPI Payment Verified</span>
              </span>
            ) : app.payment_status === 'pending' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Staff Verification</span>
              </span>
            ) : app.payment_status === 'rejected' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Payment Reference Unverified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f6f1e8] text-[#122920] border border-[#e6ddce]">
                <Banknote className="w-3.5 h-3.5 text-[#b06942]" />
                <span>Pay at Salon / UPI</span>
              </span>
            )}
          </div>
        </div>

        {/* UPI Details & Copy Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-[#e6ddce] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#122920]/60 block">Verified UPI ID</span>
              <code className="font-mono text-sm font-bold text-[#122920]">
                {SALON_UPI_CONFIG.upiId}
              </code>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f6f1e8] text-xs font-semibold text-[#122920] hover:bg-[#e6ddce] transition-colors"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#b06942]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#e6ddce] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#122920]/60 block">Exact Payable</span>
              <strong className="font-serif text-base font-bold text-[#b06942]">
                {formatINR(app.price_snapshot)}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-[#122920]/60 block">Booking Ref</span>
              <code className="font-mono text-xs font-bold text-[#122920]">{app.reference}</code>
            </div>
          </div>
        </div>

        {/* App link */}
        {app.payment_status !== 'verified' && (
          <div>
            <a
              href={generateUpiLink({ amount: app.price_snapshot, reference: app.reference })}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#122920] text-white text-xs sm:text-sm font-semibold hover:bg-[#1a3c30] transition-colors shadow-sm"
            >
              <Smartphone className="w-4 h-4 text-[#d9916b]" />
              <span>Open in UPI App (Google Pay / PhonePe / Paytm / BHIM)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        )}

        {/* Enter / Update UTR */}
        {app.payment_status !== 'verified' && (
          <form onSubmit={handleRecordUtr} className="pt-2 space-y-2">
            <label className="text-xs font-bold text-[#122920] block">
              Mark Payment Attempted (Enter 12-digit UPI UTR / Transaction ID):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="e.g. 429182749102"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e6ddce] text-xs font-mono bg-white focus:ring-2 focus:ring-[#c87d55] outline-none"
              />
              <button
                type="submit"
                disabled={submittingUtr || !utrInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#2f6954] text-white text-xs font-semibold hover:bg-[#235040] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {submittingUtr && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Record Payment Attempt</span>
              </button>
            </div>

            {utrMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{utrMsg}</span>
              </div>
            )}

            {utrErr && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{utrErr}</span>
              </div>
            )}
          </form>
        )}

        {/* Verification Policy Disclaimer */}
        <div className="p-3.5 rounded-xl bg-[#f4efe6] border border-[#e6ddce] text-[11px] text-[#122920]/80 space-y-1">
          <p className="font-bold text-[#122920] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#b06942]" />
            Independent Verification Policy & Security:
          </p>
          <p>• Payments are kept as <strong>Pending Verification</strong> until independently checked by salon staff against bank records.</p>
          <p>• <strong>Never share UPI PIN or OTP:</strong> Sriram Salon will never ask for your UPI PIN or passwords.</p>
          <p>• Salon direct telephone: <strong>+91 {SALON_UPI_CONFIG.contactPhone}</strong>.</p>
        </div>
      </div>

      {app.notes && (
        <div className="p-4 rounded-xl bg-[#fcfbf9] border border-[#e6ddce] text-xs">
          <span className="font-bold text-[#122920]">Styling Notes:</span> {app.notes}
        </div>
      )}

      {/* Cancellation Notice if cancelled */}
      {app.status === 'cancelled' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
          <span className="font-bold">This appointment was cancelled.</span>
          {app.cancellation_reason && <p>Reason: {app.cancellation_reason}</p>}
        </div>
      )}

      {/* Salon Location Info */}
      <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] flex items-start gap-3 text-xs text-[#122920]/80">
        <MapPin className="w-5 h-5 text-[#c87d55] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-[#122920] text-sm block">Sriram Salon</strong>
          <p>South 2nd Street, Pudukkottai, Tamil Nadu, India — 622001</p>
          <a
            href="https://maps.google.com/?q=South+2nd+Street+Pudukkottai+Tamil+Nadu+622001"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#b06942] font-semibold hover:underline inline-block pt-1"
          >
            Get Driving Directions &rarr;
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#f4efe6]">
        <Link
          href="/account/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122920] hover:text-[#b06942]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Bookings</span>
        </Link>

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
          >
            Cancel Appointment
          </button>
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e6ddce] space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-lg font-bold text-[#122920]">
                Confirm Cancellation
              </h3>
            </div>

            <p className="text-xs text-[#122920]/75">
              {cancellationPolicy}
            </p>

            {cancelError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {cancelError}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#122920]">Reason (Optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why you are cancelling..."
                className="w-full p-2.5 rounded-xl border border-[#e6ddce] text-xs outline-none focus:ring-2 focus:ring-[#c87d55]"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#122920] hover:bg-gray-100"
              >
                Nevermind
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {cancelling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Yes, Cancel Booking</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
