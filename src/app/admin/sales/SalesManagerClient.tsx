'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sale, Service, PaymentMethod, PaymentRecord } from '@/lib/types';
import { formatINR, formatDateDDMMYYYY } from '@/lib/utils';
import {
  CreditCard,
  Plus,
  TrendingUp,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Receipt,
  DollarSign,
  Smartphone,
  ShieldCheck,
  Check,
  X,
  Clock,
} from 'lucide-react';

interface Props {
  initialSales: Sale[];
  services: Service[];
  initialPayments?: PaymentRecord[];
}

export function SalesManagerClient({ initialSales, services, initialPayments = [] }: Props) {
  const searchParams = useSearchParams();
  const prefillAppId = searchParams?.get('appointment_id') || '';
  const prefillTokenId = searchParams?.get('walk_in_token_id') || '';
  const prefillServiceId = searchParams?.get('service_id') || '';
  const prefillAmount = searchParams?.get('amount') || '';

  const [activeTab, setActiveTab] = useState<'sales' | 'upi_queue'>('sales');
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(Boolean(prefillAppId || prefillTokenId));
  const [search, setSearch] = useState('');

  // Form Fields
  const [appointmentId, setAppointmentId] = useState(prefillAppId);
  const [tokenId, setTokenId] = useState(prefillTokenId);
  const [serviceId, setServiceId] = useState(prefillServiceId || services[0]?.id || '');
  const [amount, setAmount] = useState(prefillAmount || '150');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-set price when service changes if amount not prefilled
  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const srv = services.find((s) => s.id === id);
    if (srv) setAmount(String(srv.price));
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setErrorMsg('Please enter a valid positive amount');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointmentId || null,
          walk_in_token_id: tokenId || null,
          service_id: serviceId,
          amount: numAmount,
          payment_method: paymentMethod,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record sale');

      setSales((prev) => [data.sale, ...prev]);
      setShowModal(false);
      setAppointmentId('');
      setTokenId('');
      setNotes('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error recording sale';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, newStatus: 'verified' | 'rejected') => {
    setVerifyingId(paymentId);
    try {
      const res = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? data.payment : p))
      );

      // If verified, fetch refreshed sales
      if (newStatus === 'verified') {
        const salesRes = await fetch('/api/sales');
        const salesData = await salesRes.json();
        if (salesData.sales) setSales(salesData.sales);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      alert(msg);
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredSales = sales.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.sale_number.toLowerCase().includes(q) ||
      s.service_name.toLowerCase().includes(q) ||
      s.payment_method.toLowerCase().includes(q)
    );
  });

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.booking_reference.toLowerCase().includes(q) ||
      p.customer_name.toLowerCase().includes(q) ||
      p.customer_phone.includes(q) ||
      (p.upi_transaction_id && p.upi_transaction_id.toLowerCase().includes(q))
    );
  });

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            POS & Cash Register
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Sales & Payment Management
          </h1>
          <p className="text-xs text-[#122920]/70">
            Record counter sales, verify customer UPI bank payments, and maintain reconciled accounting.
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setErrorMsg('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#d9916b]" />
          <span>Record Counter Sale</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm">
          <span className="text-[11px] uppercase font-bold text-[#122920]/60 block">
            Recorded Revenue
          </span>
          <p className="font-serif text-2xl font-bold text-[#2f6954] mt-1">
            {formatINR(totalRevenue)}
          </p>
          <span className="text-[10px] text-gray-500">Across {filteredSales.length} Transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm">
          <span className="text-[11px] uppercase font-bold text-[#122920]/60 block">
            Cash Payments
          </span>
          <p className="font-serif text-2xl font-bold text-[#122920] mt-1">
            {formatINR(
              filteredSales
                .filter((s) => s.payment_method === 'cash')
                .reduce((a, s) => a + s.amount, 0)
            )}
          </p>
          <span className="text-[10px] text-gray-500">Counter physical cash</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm">
          <span className="text-[11px] uppercase font-bold text-[#122920]/60 block">
            Verified Digital / UPI
          </span>
          <p className="font-serif text-2xl font-bold text-[#b06942] mt-1">
            {formatINR(
              filteredSales
                .filter((s) => ['upi', 'card'].includes(s.payment_method))
                .reduce((a, s) => a + s.amount, 0)
            )}
          </p>
          <span className="text-[10px] text-gray-500">PhonePe, GPay, Paytm, Cards</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm">
          <span className="text-[11px] uppercase font-bold text-[#122920]/60 block">
            Pending UPI Checks
          </span>
          <p className="font-serif text-2xl font-bold text-amber-600 mt-1">
            {pendingPayments.length} Records
          </p>
          <span className="text-[10px] text-gray-500">Awaiting independent verification</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#e6ddce] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sales'
              ? 'bg-[#122920] text-white shadow-sm'
              : 'bg-white text-[#122920] border border-[#e6ddce] hover:bg-[#faf8f5]'
          }`}
        >
          Sales Invoices ({sales.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upi_queue')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upi_queue'
              ? 'bg-[#122920] text-white shadow-sm'
              : 'bg-white text-[#122920] border border-[#e6ddce] hover:bg-[#faf8f5]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#d9916b]" />
          <span>UPI Verification Queue</span>
          {pendingPayments.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
              {pendingPayments.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
        <input
          type="text"
          placeholder={
            activeTab === 'sales'
              ? 'Search by invoice number (INV-...), service, or payment method...'
              : 'Search by booking reference (SRM-...), customer name, phone, or UTR...'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-xs focus:ring-2 focus:ring-[#c87d55] outline-none bg-white"
        />
      </div>

      {/* TAB 1: SALES TABLE */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-sm overflow-hidden">
          {filteredSales.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#122920]/60 space-y-2">
              <Receipt className="w-8 h-8 text-[#b06942]/50 mx-auto" />
              <p className="font-serif text-base font-bold text-[#122920]">
                No Recorded Sales Yet
              </p>
              <p>Completed appointments or walk-in services are recorded as sales here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f6f1e8] text-[#122920] border-b border-[#e6ddce] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Linked Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4efe6]">
                  {filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#122920]">
                        {s.sale_number}
                      </td>
                      <td className="py-3.5 px-4 text-[#122920]/75">
                        {formatDateDDMMYYYY(s.created_at)} •{' '}
                        {new Date(s.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#122920]">
                        {s.service_name}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-[#2f6954]">
                        {formatINR(s.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f6f1e8] text-[#122920]">
                          {s.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#122920]/70">
                        {s.appointment_id ? `App: ${s.appointment_id}` : s.walk_in_token_id ? `Token: ${s.walk_in_token_id}` : 'Counter Walk-In'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPI VERIFICATION QUEUE */}
      {activeTab === 'upi_queue' && (
        <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-sm overflow-hidden space-y-4">
          <div className="p-4 bg-[#fcfbf9] border-b border-[#e6ddce] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#b06942]" />
              <span className="font-semibold text-[#122920]">
                Independent Reconciliation: Verify against SMS / SBI bank statement for UPI ID: <strong>kishoreramr2004@oksbi</strong>
              </span>
            </div>
            <span className="text-[#122920]/60">Salon Phone: +91 94867 54402</span>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#122920]/60 space-y-2">
              <Smartphone className="w-8 h-8 text-[#b06942]/50 mx-auto" />
              <p className="font-serif text-base font-bold text-[#122920]">
                No UPI Payment Records
              </p>
              <p>When customers attempt UPI payments and submit their UTR, records appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f6f1e8] text-[#122920] border-b border-[#e6ddce] uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Customer UTR / Ref</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4efe6]">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#b06942]">
                        {p.booking_reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-sm text-[#122920] block">{p.customer_name}</strong>
                        <span className="text-[11px] text-[#122920]/60">{p.customer_phone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#122920]">
                        {formatINR(p.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.upi_transaction_id ? (
                          <code className="font-mono text-xs px-2 py-1 rounded bg-[#f6f1e8] text-[#122920] font-bold">
                            {p.upi_transaction_id}
                          </code>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Not submitted yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#122920]/75">
                        {formatDateDDMMYYYY(p.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.status === 'verified' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                        ) : p.status === 'pending' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            Pending Verification
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 capitalize">
                            {p.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {p.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={verifyingId === p.id}
                              onClick={() => handleVerifyPayment(p.id, 'verified')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2f6954] text-white text-xs font-semibold hover:bg-[#235040] disabled:opacity-50"
                            >
                              {verifyingId === p.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>Verify Payment</span>
                            </button>

                            <button
                              type="button"
                              disabled={verifyingId === p.id}
                              onClick={() => handleVerifyPayment(p.id, 'rejected')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {p.status === 'verified' && (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            ✓ Verified & Invoiced
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e6ddce] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6ddce]">
              <h3 className="font-serif text-xl font-bold text-[#122920]">
                Record Counter Transaction
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleRecordSale} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Select Service *</label>
                <select
                  value={serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Default {formatINR(s.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Total Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Internal Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid in exact cash, included comb product"
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f4efe6]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-[#122920] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#122920] text-white font-semibold hover:bg-[#1a3c30] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Record Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
