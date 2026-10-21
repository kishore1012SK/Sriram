'use client';

import React, { useState } from 'react';
import { formatINR } from '@/lib/utils';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Receipt,
  Scissors,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Ticket,
} from 'lucide-react';

interface Props {
  initialReports: any;
}

export function ReportsClient({ initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [startDate, setStartDate] = useState(initialReports.period.start);
  const [endDate, setEndDate] = useState(initialReports.period.end);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (s = startDate, e = endDate) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?startDate=${s}&endDate=${e}`);
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch {
      // Keep
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (days: number) => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
    fetchReports(start, end);
  };

  const servicesEntries = Object.entries(reports.salesByService || {}) as [string, { count: number; total: number }][];
  const expensesEntries = Object.entries(reports.expensesByCategory || {}) as [string, number][];

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Analytics & Financials
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Performance Reports
          </h1>
          <p className="text-xs text-[#122920]/70">
            Audit recorded salon sales against operational expenses to track business surplus.
          </p>
        </div>

        {/* Date presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePresetChange(7)}
            className="px-3 py-1.5 rounded-xl border border-[#e6ddce] text-xs font-semibold bg-white hover:bg-[#f6f1e8]"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePresetChange(30)}
            className="px-3 py-1.5 rounded-xl border border-[#e6ddce] text-xs font-semibold bg-white hover:bg-[#f6f1e8]"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="p-4 rounded-2xl bg-white border border-[#e6ddce] shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#122920]">From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e6ddce] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c87d55]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#122920]">To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e6ddce] text-xs bg-white outline-none focus:ring-2 focus:ring-[#c87d55]"
          />
        </div>

        <button
          onClick={() => fetchReports(startDate, endDate)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Update Report</span>
        </button>
      </div>

      {/* Top Level Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold text-[#122920]/60 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Total Recorded Sales
          </span>
          <p className="font-serif text-3xl font-bold text-[#122920] mt-2">
            {formatINR(reports.totalSales)}
          </p>
          <span className="text-xs text-[#122920]/60 block">{reports.salesCount} Invoices generated</span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-1">
          <span className="text-xs uppercase font-bold text-[#122920]/60 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-red-600" />
            Total Recorded Expenses
          </span>
          <p className="font-serif text-3xl font-bold text-red-700 mt-2">
            {formatINR(reports.totalExpenses)}
          </p>
          <span className="text-xs text-[#122920]/60 block">Logged operational costs</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#122920] text-white border border-[#c87d55]/30 shadow-xl space-y-1">
          <span className="text-xs uppercase font-bold text-[#d9916b] flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Recorded Operating Surplus
          </span>
          <p className="font-serif text-3xl font-bold text-emerald-400 mt-2">
            {formatINR(reports.recordedOperatingSurplus)}
          </p>
          <span className="text-[10px] text-[#ece3d3]/70 block">
            Strictly: Sales minus recorded costs (not statutory net profit).
          </span>
        </div>
      </div>

      {/* Operational Stats: Appointments, Tokens, Cancellations */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#122920]/60 block">Appointments Handled</span>
            <span className="font-serif text-2xl font-bold text-[#122920] mt-0.5 block">
              {reports.appointmentsCount}
            </span>
          </div>
          <Calendar className="w-6 h-6 text-[#b06942]" />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#122920]/60 block">Walk-In Tokens Handled</span>
            <span className="font-serif text-2xl font-bold text-[#122920] mt-0.5 block">
              {reports.tokensCount}
            </span>
          </div>
          <Ticket className="w-6 h-6 text-[#b06942]" />
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e6ddce] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#122920]/60 block">Cancellations</span>
            <span className="font-serif text-2xl font-bold text-red-600 mt-0.5 block">
              {reports.cancellationsCount}
            </span>
          </div>
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
      </div>

      {/* Service Breakdown & Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Service */}
        <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#122920] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#b06942]" />
            Sales by Service
          </h3>

          {servicesEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#122920]/60">
              No sales logged for this date range.
            </div>
          ) : (
            <div className="space-y-3">
              {servicesEntries.map(([srvName, data]) => {
                const pct = reports.totalSales > 0 ? (data.total / reports.totalSales) * 100 : 0;
                return (
                  <div key={srvName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#122920]">
                        {srvName} ({data.count} served)
                      </span>
                      <span className="font-bold text-[#122920]">{formatINR(data.total)}</span>
                    </div>
                    <div className="w-full bg-[#f6f1e8] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#c87d55] h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#122920] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-600" />
            Expenses by Category
          </h3>

          {expensesEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#122920]/60">
              No expenses recorded for this date range.
            </div>
          ) : (
            <div className="space-y-3">
              {expensesEntries.map(([cat, amt]) => {
                const pct = reports.totalExpenses > 0 ? (amt / reports.totalExpenses) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#122920] capitalize">{cat}</span>
                      <span className="font-bold text-red-700">{formatINR(amt)}</span>
                    </div>
                    <div className="w-full bg-[#f6f1e8] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
