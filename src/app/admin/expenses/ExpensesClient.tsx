'use client';

import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '@/lib/types';
import { formatINR, formatDateDDMMYYYY } from '@/lib/utils';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Loader2,
  DollarSign,
  Tag,
} from 'lucide-react';

interface Props {
  initialExpenses: Expense[];
}

export function ExpensesClient({ initialExpenses }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form Fields
  const [category, setCategory] = useState<ExpenseCategory>('supplies');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Amount must be a positive number in ₹');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Description is required');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: numAmount,
          expense_date: date,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add expense');

      setExpenses((prev) => [data.expense, ...prev]);
      setShowModal(false);
      setAmount('');
      setDescription('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding expense';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const filtered = expenses.filter((e) => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    }
    return true;
  });

  const totalExpenses = filtered.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Outflows
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Salon Expenses
          </h1>
          <p className="text-xs text-[#122920]/70">
            Log supplies, equipment sanitization blades, utility bills, rent, and staff remuneration.
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
          <span>Record Expense</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-[#122920]/60 block">
            Total Filtered Operating Expenses
          </span>
          <p className="font-serif text-3xl font-bold text-red-700 mt-0.5">
            {formatINR(totalExpenses)}
          </p>
        </div>
        <div className="text-xs text-[#122920]/75">
          <span>{filtered.length} Recorded expense entries</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search expense description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-xs focus:ring-2 focus:ring-[#c87d55] outline-none bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-[#e6ddce] text-xs bg-white focus:ring-2 focus:ring-[#c87d55] outline-none w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          <option value="supplies">Supplies & Blades</option>
          <option value="rent">Shop Rent</option>
          <option value="utilities">Electricity & Water</option>
          <option value="salaries">Salaries</option>
          <option value="maintenance">Maintenance</option>
          <option value="marketing">Signage & Marketing</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#122920]/60 space-y-2">
            <Receipt className="w-8 h-8 text-[#b06942]/50 mx-auto" />
            <p className="font-serif text-base font-bold text-[#122920]">
              No Expenses Logged
            </p>
            <p>Click &quot;Record Expense&quot; above to log salon expenses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f1e8] text-[#122920] border-b border-[#e6ddce] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4efe6]">
                {filtered.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#122920]">
                      {formatDateDDMMYYYY(exp.expense_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f6f1e8] text-[#122920]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#122920]">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 font-serif text-sm font-bold text-red-700 text-right">
                      {formatINR(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e6ddce] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6ddce]">
              <h3 className="font-serif text-xl font-bold text-[#122920]">
                Record Salon Expense
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

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                >
                  <option value="supplies">Supplies & Blades</option>
                  <option value="rent">Shop Rent</option>
                  <option value="utilities">Electricity & Water</option>
                  <option value="salaries">Salaries</option>
                  <option value="maintenance">Maintenance & Repairs</option>
                  <option value="marketing">Signage & Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Disinfectant spray and razor cartridges"
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
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
