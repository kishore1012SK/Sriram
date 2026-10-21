'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WalkInToken, Service, Employee, QueueTokenStatus } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  Ticket,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle2,
  XCircle,
  Play,
  Volume2,
  AlertCircle,
  Plus,
  RefreshCw,
  Loader2,
  CreditCard,
} from 'lucide-react';

interface Props {
  initialTokens: WalkInToken[];
  services: Service[];
  employees: Employee[];
}

export function AdminQueueClient({ initialTokens, services, employees }: Props) {
  const [tokens, setTokens] = useState<WalkInToken[]>(initialTokens);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New token modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.tokens) setTokens(data.tokens);
    } catch {
      // Keep
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: QueueTokenStatus,
    empId?: string
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/queue/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, employee_id: empId }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setTokens((prev) =>
          prev.map((t) => (t.id === id ? data.token : t))
        );
      }
    } catch {
      alert('Failed to update token status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custPhone.trim()) {
      setErrorMsg('Name and phone are required');
      return;
    }

    setCreateLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: custName,
          customer_phone: custPhone,
          service_id: selectedServiceId,
          employee_id: selectedEmpId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue token');

      setShowNewModal(false);
      setCustName('');
      setCustPhone('');
      fetchQueue();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating token';
      setErrorMsg(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  // Quick action: Call next waiting customer
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const nextToken = waitingTokens[0];

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Front Desk Queue
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Live Walk-In Queue Manager
          </h1>
          <p className="text-xs text-[#122920]/70">
            Monitor waiting walk-ins, advance statuses, assign barbers, and call next tokens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
          >
            <Plus className="w-4 h-4 text-[#d9916b]" />
            <span>Issue Walk-in Token</span>
          </button>
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#e6ddce] bg-white text-[#122920] hover:bg-[#f6f1e8]"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#b06942]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Call Next Banner */}
      {nextToken && (
        <div className="p-5 rounded-2xl bg-[#122920] text-white border border-[#c87d55]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#c87d55] text-white flex items-center justify-center font-serif text-xl font-bold">
              #{nextToken.token_number}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#d9916b] tracking-wider">
                Next in Line
              </span>
              <p className="font-serif text-lg font-bold text-white">
                {nextToken.customer_name} ({nextToken.customer_phone})
              </p>
              <p className="text-xs text-[#ece3d3]/70">{nextToken.service_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpdateStatus(nextToken.id, 'called')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d9916b] text-[#122920] font-bold text-xs hover:bg-[#c87d55] text-white transition-all shadow"
            >
              <Volume2 className="w-4 h-4 text-white" />
              <span>Call Token #{nextToken.token_number}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tokens Table */}
      <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-sm overflow-hidden">
        {tokens.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#122920]/60 space-y-2">
            <Ticket className="w-8 h-8 text-[#b06942]/50 mx-auto" />
            <p className="font-serif text-base font-bold text-[#122920]">
              No Walk-In Tokens for Today
            </p>
            <p>Click &quot;Issue Walk-in Token&quot; to register a walk-in customer at the desk.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f1e8] text-[#122920] border-b border-[#e6ddce] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Token # & Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Assigned Stylist</th>
                  <th className="py-3.5 px-4">Est. Wait</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Queue Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4efe6]">
                {tokens.map((token) => (
                  <tr key={token.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#f6f1e8] text-[#122920] font-bold flex items-center justify-center font-serif text-sm border border-[#e6ddce]">
                          #{token.token_number}
                        </span>
                        <span className="font-mono text-[11px] text-[#b06942] font-semibold">
                          {token.reference}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-sm text-[#122920] block">{token.customer_name}</strong>
                      <span className="text-[11px] text-[#122920]/60">{token.customer_phone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#122920]">
                      {token.service_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={token.employee_id || ''}
                        onChange={(e) => handleUpdateStatus(token.id, token.status, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-[#e6ddce] text-xs bg-white focus:ring-2 focus:ring-[#c87d55] outline-none"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-[#122920]/75">
                      ~{token.estimated_wait_minutes} mins
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#f6f1e8] text-[#122920]">
                        {token.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {token.status === 'waiting' && (
                        <button
                          onClick={() => handleUpdateStatus(token.id, 'called')}
                          className="px-2.5 py-1 rounded-lg bg-[#b06942] text-white text-[11px] font-semibold hover:bg-[#935332]"
                        >
                          Call
                        </button>
                      )}
                      {(token.status === 'waiting' || token.status === 'called') && (
                        <button
                          onClick={() => handleUpdateStatus(token.id, 'checked_in')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700"
                        >
                          Check In
                        </button>
                      )}
                      {token.status === 'checked_in' && (
                        <button
                          onClick={() => handleUpdateStatus(token.id, 'in_service')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
                        >
                          Start Service
                        </button>
                      )}
                      {token.status === 'in_service' && (
                        <button
                          onClick={() => handleUpdateStatus(token.id, 'completed')}
                          className="px-2.5 py-1 rounded-lg bg-gray-800 text-white text-[11px] font-semibold hover:bg-black"
                        >
                          Complete
                        </button>
                      )}
                      {token.status === 'completed' && (
                        <Link
                          href={`/admin/sales?walk_in_token_id=${token.id}&service_id=${token.service_id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2f6954] text-white text-[11px] font-semibold hover:bg-[#235040]"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Bill</span>
                        </Link>
                      )}
                      {!['completed', 'cancelled', 'no_show'].includes(token.status) && (
                        <button
                          onClick={() => handleUpdateStatus(token.id, 'cancelled')}
                          className="px-2 py-1 rounded-lg border border-red-200 text-red-600 text-[11px] hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Walk-in Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e6ddce] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6ddce]">
              <h3 className="font-serif text-xl font-bold text-[#122920]">
                Issue Desk Walk-in Token
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
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

            <form onSubmit={handleCreateToken} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#122920]">Customer Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Balaji"
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] text-xs outline-none focus:ring-2 focus:ring-[#c87d55]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#122920]">Customer Phone</label>
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. 9486754402"
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] text-xs outline-none focus:ring-2 focus:ring-[#c87d55]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#122920]">Service</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] text-xs outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatINR(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#122920]">Assign Stylist (Optional)</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] text-xs outline-none focus:ring-2 focus:ring-[#c87d55] bg-white"
                >
                  <option value="">Any Available Barber</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#122920] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30] disabled:opacity-50 flex items-center gap-2"
                >
                  {createLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Generate Token</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
