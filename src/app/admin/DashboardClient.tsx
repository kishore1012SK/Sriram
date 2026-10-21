'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import {
  Calendar,
  Ticket,
  Clock,
  TrendingUp,
  Receipt,
  Users,
  Scissors,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Activity,
  AlertCircle,
} from 'lucide-react';

interface Props {
  initialMetrics: any;
  userRole: string;
}

export function DashboardClient({ initialMetrics, userRole }: Props) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [selectedDate, setSelectedDate] = useState(initialMetrics.today);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?date=${date}`);
      const data = await res.json();
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    fetchMetrics(val);
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Salon Overview
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Operational Dashboard
          </h1>
          <p className="text-xs text-[#122920]/70">
            Real-time metrics, appointment schedule, walk-in queue, and sales summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="px-3.5 py-2 rounded-xl border border-[#e6ddce] text-xs font-semibold bg-white text-[#122920] shadow-sm outline-none focus:ring-2 focus:ring-[#c87d55]"
          />
          <button
            onClick={() => fetchMetrics(selectedDate)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#e6ddce] bg-white text-[#122920] hover:bg-[#f6f1e8] shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#b06942]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Today's Appointments */}
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#122920]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider">Appointments</span>
            <Calendar className="w-4 h-4 text-[#b06942]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#122920]">
            {metrics.todayAppointmentsCount}
          </p>
          <span className="text-[10px] text-[#122920]/60 block">Scheduled on {selectedDate}</span>
        </div>

        {/* 2. Waiting Tokens */}
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#122920]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider">Queue Waiting</span>
            <Ticket className="w-4 h-4 text-[#b06942]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#b06942]">
            {metrics.waitingTokensCount}
          </p>
          <span className="text-[10px] text-[#122920]/60 block">Walk-in tokens in line</span>
        </div>

        {/* 3. In Service */}
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#122920]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Service</span>
            <Scissors className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#2f6954]">
            {metrics.currentlyServingCount}
          </p>
          <span className="text-[10px] text-[#122920]/60 block">Customers on chairs</span>
        </div>

        {/* 4. Completed */}
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#122920]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#3e856c]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#122920]">
            {metrics.completedAppointmentsCount}
          </p>
          <span className="text-[10px] text-[#122920]/60 block">Finished bookings</span>
        </div>

        {/* 5. Today's Sales */}
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#122920]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider">Recorded Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#122920]">
            {formatINR(metrics.todayRecordedSales)}
          </p>
          <span className="text-[10px] text-[#122920]/60 block">Actual receipts</span>
        </div>

        {/* 6. Today's Expenses */}
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[#122920]/60">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expenses</span>
            <Receipt className="w-4 h-4 text-red-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-red-700">
            {formatINR(metrics.todayRecordedExpenses)}
          </p>
          <span className="text-[10px] text-[#122920]/60 block">Supplies & costs</span>
        </div>
      </div>

      {/* Quick Action Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/appointments"
          className="p-6 rounded-3xl bg-[#122920] text-white border border-[#c87d55]/30 shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <Calendar className="w-6 h-6 text-[#d9916b]" />
            <ArrowRight className="w-5 h-5 text-[#d9916b] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-serif text-xl font-bold mt-4">Manage Appointments</h3>
          <p className="text-xs text-[#ece3d3]/80 mt-1">
            Check-in clients, change status, and view customer notes.
          </p>
        </Link>

        <Link
          href="/admin/queue"
          className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <Ticket className="w-6 h-6 text-[#b06942]" />
            <ArrowRight className="w-5 h-5 text-[#b06942] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#122920] mt-4">Walk-In Queue Board</h3>
          <p className="text-xs text-[#122920]/70 mt-1">
            Call next customer, start grooming service, mark check-ins.
          </p>
        </Link>

        <Link
          href="/admin/sales"
          className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <TrendingUp className="w-6 h-6 text-[#2f6954]" />
            <ArrowRight className="w-5 h-5 text-[#2f6954] group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#122920] mt-4">Record Counter Sale</h3>
          <p className="text-xs text-[#122920]/70 mt-1">
            Generate invoice, link to completed service, record Cash/UPI payment.
          </p>
        </Link>
      </div>

      {/* Operational Breakdown & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Salon Status Summary */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#122920] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#b06942]" />
              Staff & Salon Configuration
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#f6f1e8] border border-[#e6ddce]">
                <span className="text-[#122920]/60 block font-semibold">Active Services</span>
                <span className="font-serif text-2xl font-bold text-[#122920]">
                  {metrics.activeServicesCount}
                </span>
                <Link href="/admin/services" className="text-[11px] text-[#b06942] hover:underline block mt-1">
                  Configure services &rarr;
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-[#f6f1e8] border border-[#e6ddce]">
                <span className="text-[#122920]/60 block font-semibold">Registered Staff</span>
                <span className="font-serif text-2xl font-bold text-[#122920]">
                  {metrics.employeesCount}
                </span>
                <Link href="/admin/employees" className="text-[11px] text-[#b06942] hover:underline block mt-1">
                  View staff schedules &rarr;
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#fbf9f5] border border-[#e6ddce] text-xs text-[#122920]/80 space-y-1">
              <strong className="text-[#122920]">Daily Recorded Operating Surplus:</strong>
              <p className="font-serif text-xl font-bold text-[#2f6954]">
                {formatINR(metrics.operatingSurplusToday)}
              </p>
              <p className="text-[10px] text-gray-500">
                Calculated strictly as Today&apos;s Recorded Sales ({formatINR(metrics.todayRecordedSales)}) minus Recorded Expenses ({formatINR(metrics.todayRecordedExpenses)}).
              </p>
            </div>
          </div>
        </div>

        {/* Recent Administrative Activity Log */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#122920] flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#b06942]" />
                Recent System Activity
              </h3>
              <span className="text-xs text-[#122920]/60">Live Audit Trail</span>
            </div>

            {metrics.recentActivity?.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#122920]/60">
                No administrative activity logged yet today.
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {metrics.recentActivity.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#fcfbf9] border border-[#e6ddce] text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-[#122920] capitalize">
                        {log.action.replace('_', ' ')} • {log.entity_type}
                      </span>
                      <p className="text-[10px] text-[#122920]/60 font-mono">
                        {JSON.stringify(log.details || {})}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                      {new Date(log.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
