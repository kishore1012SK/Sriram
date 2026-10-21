'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Appointment, AppointmentStatus } from '@/lib/types';
import { formatINR, formatTime12h, formatDateDDMMYYYY } from '@/lib/utils';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MoreVertical,
  Scissors,
  CreditCard,
  User,
  Phone,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface Props {
  initialAppointments: Appointment[];
}

export function AppointmentsClient({ initialAppointments }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = '/api/appointments?';
      if (dateFilter) url += `date=${dateFilter}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch {
      // Keep
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reference: string, newStatus: AppointmentStatus) => {
    setUpdatingId(reference);
    try {
      const res = await fetch(`/api/appointments/${reference}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.reference === reference ? data.appointment : a))
        );
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter local list
  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (dateFilter && a.appointment_date !== dateFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.reference.toLowerCase().includes(q) ||
        a.customer_name.toLowerCase().includes(q) ||
        a.customer_phone.includes(q) ||
        a.service_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>;
      case 'checked_in':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">Checked In</span>;
      case 'in_service':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">In Service</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Cancelled</span>;
      case 'no_show':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">No Show</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 capitalize">{status}</span>;
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Operations
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Appointments Directory
          </h1>
          <p className="text-xs text-[#122920]/70">
            View booking records, advance statuses, or generate payment invoices.
          </p>
        </div>

        <Link
          href="/book"
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30] self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4 text-[#d9916b]" />
          <span>New Booking</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#e6ddce] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-[#122920]/40 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or SRM- reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#e6ddce] text-xs focus:ring-2 focus:ring-[#c87d55] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e6ddce] text-xs bg-white focus:ring-2 focus:ring-[#c87d55] outline-none"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e6ddce] text-xs bg-white focus:ring-2 focus:ring-[#c87d55] outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="in_service">In Service</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          <button
            onClick={fetchAppointments}
            disabled={loading}
            className="p-2 rounded-xl border border-[#e6ddce] bg-white text-[#122920] hover:bg-[#f6f1e8]"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#b06942]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#122920]/60 space-y-2">
            <Calendar className="w-8 h-8 text-[#b06942]/50 mx-auto" />
            <p className="font-serif text-base font-bold text-[#122920]">
              No Appointments Match Filter
            </p>
            <p>Try clearing your search query or selecting a different date.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f1e8] text-[#122920] border-b border-[#e6ddce] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ref & Customer</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Stylist</th>
                  <th className="py-3.5 px-4">Price & Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4efe6]">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#b06942] block">
                        {app.reference}
                      </span>
                      <strong className="text-sm text-[#122920]">{app.customer_name}</strong>
                      <span className="text-[11px] text-[#122920]/60 block">{app.customer_phone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#122920]">
                      {app.service_name}
                      <span className="text-[10px] text-[#122920]/60 block font-normal">
                        {app.duration_minutes} mins
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#122920] block">
                        {formatDateDDMMYYYY(app.appointment_date)}
                      </span>
                      <span className="text-[#122920]/75">
                        {formatTime12h(app.start_time)} – {formatTime12h(app.end_time)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#122920]">
                      {app.employee_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-serif font-bold text-sm text-[#122920] block">
                        {formatINR(app.price_snapshot)}
                      </span>
                      {app.payment_status === 'verified' ? (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          UPI Verified
                        </span>
                      ) : app.payment_preference === 'upi' ? (
                        <div className="mt-0.5 space-y-0.5">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            UPI Pending
                          </span>
                          {app.upi_transaction_id && (
                            <span className="block font-mono text-[9px] text-gray-500 truncate max-w-[100px]" title={app.upi_transaction_id}>
                              UTR: {app.upi_transaction_id}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-[#f6f1e8] text-[#122920]/80">
                          Cash at Salon
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {/* Status Transition Quick Select */}
                      <select
                        value={app.status}
                        disabled={updatingId === app.reference}
                        onChange={(e) => handleStatusChange(app.reference, e.target.value as AppointmentStatus)}
                        className="px-2 py-1 rounded-lg border border-[#e6ddce] text-[11px] bg-white font-medium focus:ring-2 focus:ring-[#c87d55] outline-none"
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="in_service">In Service</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>

                      {app.payment_preference === 'upi' && app.payment_status === 'pending' && (
                        <Link
                          href={`/admin/sales?search=${app.reference}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#b06942] text-white text-[11px] font-semibold hover:bg-[#8c4e2e]"
                        >
                          <span>Verify UPI</span>
                        </Link>
                      )}

                      {app.status === 'completed' && app.payment_status !== 'verified' && (
                        <Link
                          href={`/admin/sales?appointment_id=${app.id}&service_id=${app.service_id}&amount=${app.price_snapshot}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2f6954] text-white text-[11px] font-semibold hover:bg-[#235040]"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Bill</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
