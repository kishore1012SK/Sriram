'use client';

import React, { useState, useEffect } from 'react';
import { Service, WalkInToken } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Users,
  RefreshCw,
  Loader2,
  ChevronRight,
  Ticket,
} from 'lucide-react';

interface QueueClientProps {
  services: Service[];
  initialTokens: Partial<WalkInToken>[];
  isOpen: boolean;
}

export function QueueClient({ services, initialTokens, isOpen }: QueueClientProps) {
  const [tokens, setTokens] = useState<Partial<WalkInToken>[]>(initialTokens);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchRef, setSearchRef] = useState<string>('');
  const [lookedUpToken, setLookedUpToken] = useState<any | null>(null);
  const [lookupError, setLookupError] = useState<string>('');
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>(services[0]?.id || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [newToken, setNewToken] = useState<WalkInToken | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.tokens) {
        setTokens(data.tokens);
      }
    } catch {
      // Silently keep current tokens
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(fetchQueue, 15000); // 15s poll
    return () => clearInterval(timer);
  }, []);

  const handleTakeToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setFormError('Please enter your name and phone number.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          service_id: serviceId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate token');
      }

      setNewToken(data.token);
      setName('');
      setPhone('');
      fetchQueue();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error taking token';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookupToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) return;

    setLookupLoading(true);
    setLookupError('');
    setLookedUpToken(null);

    try {
      const res = await fetch(`/api/queue/${searchRef.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Token not found');
      }
      setLookedUpToken(data.token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Token not found';
      setLookupError(msg);
    } finally {
      setLookupLoading(false);
    }
  };

  // Group tokens
  const currentlyServing = tokens.filter((t) => t.status === 'in_service');
  const calledTokens = tokens.filter((t) => t.status === 'called');
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');

  return (
    <div className="space-y-12">
      {/* 1. TOP LIVE STATUS HERO */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#122920] text-[#f6f1e8] border border-[#c87d55]/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a3c30] text-xs font-semibold text-[#d9916b] border border-[#c87d55]/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Salon Queue</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Walk-In Digital Token System
            </h1>
            <p className="text-xs sm:text-sm text-[#ece3d3]/80 max-w-xl leading-relaxed">
              Drop by without a prior booking. Grab your digital queue token to monitor your waiting time from your smartphone while relaxing in Pudukkottai.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchQueue}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a3c30] text-xs font-semibold text-[#f6f1e8] hover:bg-[#235040] border border-[#c87d55]/30 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#d9916b]' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Status'}</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#1a3c30]">
          <div className="p-4 rounded-2xl bg-[#0b1c15] border border-[#1a3c30]">
            <span className="text-[11px] uppercase tracking-wider text-[#d9916b] font-bold block">
              In Service Now
            </span>
            <span className="font-serif text-3xl font-bold text-white mt-1 block">
              {currentlyServing.length > 0
                ? `#${currentlyServing[0].token_number}`
                : 'None'}
            </span>
            <span className="text-[10px] text-[#ece3d3]/60">Currently on the stylist chair</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b1c15] border border-[#1a3c30]">
            <span className="text-[11px] uppercase tracking-wider text-[#d9916b] font-bold block">
              Called for Check-In
            </span>
            <span className="font-serif text-3xl font-bold text-[#d9916b] mt-1 block">
              {calledTokens.length > 0 ? `#${calledTokens[0].token_number}` : '—'}
            </span>
            <span className="text-[10px] text-[#ece3d3]/60">Next customer called</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b1c15] border border-[#1a3c30]">
            <span className="text-[11px] uppercase tracking-wider text-[#d9916b] font-bold block">
              Waiting in Queue
            </span>
            <span className="font-serif text-3xl font-bold text-white mt-1 block">
              {waitingTokens.length}
            </span>
            <span className="text-[10px] text-[#ece3d3]/60">Customers in line</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0b1c15] border border-[#1a3c30]">
            <span className="text-[11px] uppercase tracking-wider text-[#d9916b] font-bold block">
              Queue Status
            </span>
            <span className="font-serif text-2xl font-bold text-emerald-400 mt-1 block">
              {isOpen ? 'Open' : 'Closed'}
            </span>
            <span className="text-[10px] text-[#ece3d3]/60">
              {isOpen ? 'Tokens being issued' : 'Queue not accepting tokens'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TWO-COLUMN INTERACTIVE ZONE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Request a Token + Track Token */}
        <div className="lg:col-span-5 space-y-6">
          {/* New Token Result Modal / Card */}
          {newToken && (
            <div className="p-6 rounded-3xl bg-[#f2f7f4] border border-[#3e856c]/40 shadow-lg text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#3e856c] text-white flex items-center justify-center mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-[#2f6954] tracking-wider">
                  Token Issued Successfully
                </span>
                <p className="font-serif text-4xl font-bold text-[#122920] mt-1">
                  #{newToken.token_number}
                </p>
                <p className="font-mono text-xs text-[#b06942] font-semibold mt-1">
                  Ref: {newToken.reference}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#e6ddce] text-xs text-[#122920]/80 text-left space-y-2">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <strong>{newToken.customer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <strong>{newToken.service_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Est. Waiting Time:</span>
                  <strong className="text-[#b06942]">~{newToken.estimated_wait_minutes} mins</strong>
                </div>
              </div>

              <p className="text-[11px] text-[#122920]/70">
                Keep this reference to check your queue status at any time.
              </p>
              <button
                onClick={() => setNewToken(null)}
                className="w-full py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
              >
                Close & View Board
              </button>
            </div>
          )}

          {/* Request Token Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="font-serif text-xl font-bold text-[#122920]">
                Take a Walk-In Token
              </h2>
              <p className="text-xs text-[#122920]/70">
                Join the salon waiting line without an advance reservation.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleTakeToken} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#122920]">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:ring-2 focus:ring-[#c87d55] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#122920]">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9486754402"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:ring-2 focus:ring-[#c87d55] outline-none"
                />
                <span className="text-[10px] text-gray-500 block">
                  Your phone number will never be shown on public screens.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#122920]">Select Service</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ddce] text-sm focus:ring-2 focus:ring-[#c87d55] outline-none bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatINR(s.price)} ({s.duration_minutes}m)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] transition-colors flex items-center justify-center gap-2 shadow"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#d9916b]" />
                ) : (
                  <Ticket className="w-4 h-4 text-[#d9916b]" />
                )}
                <span>Request Digital Token</span>
              </button>
            </form>
          </div>

          {/* Check Specific Token Status */}
          <div className="p-6 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#122920]">
              Track Your Token Status
            </h3>
            <form onSubmit={handleLookupToken} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Token Ref (e.g. TK-...)"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#e6ddce] text-xs font-mono uppercase focus:ring-2 focus:ring-[#c87d55] outline-none"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-4 py-2 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30] shrink-0"
              >
                {lookupLoading ? 'Checking...' : 'Check'}
              </button>
            </form>

            {lookupError && (
              <p className="text-xs text-red-600">{lookupError}</p>
            )}

            {lookedUpToken && (
              <div className="p-4 rounded-xl bg-[#f6f1e8] border border-[#e6ddce] text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-[#e6ddce]">
                  <span className="font-bold text-base text-[#122920]">
                    Token #{lookedUpToken.token_number}
                  </span>
                  <span className="capitalize px-2 py-0.5 rounded font-bold text-xs bg-[#122920] text-white">
                    {lookedUpToken.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <strong>{lookedUpToken.customer_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <strong>{lookedUpToken.service_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Customers Ahead:</span>
                  <strong className="text-[#b06942]">{lookedUpToken.waiting_ahead}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Waiting Board */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#122920]">
                  Live Queue Waiting List
                </h2>
                <p className="text-xs text-[#122920]/70">
                  Showing tokens for today. Customer names are masked for privacy.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f6f1e8] text-[#122920]">
                {tokens.length} Total Today
              </span>
            </div>

            {tokens.length === 0 ? (
              <div className="py-16 text-center text-[#122920]/60 space-y-2">
                <Users className="w-10 h-10 mx-auto text-[#b06942]/50" />
                <p className="font-serif text-base font-bold text-[#122920]">
                  The Queue is Currently Clear
                </p>
                <p className="text-xs">
                  No walk-in tokens waiting. If you visit now, you can get served right away!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f4efe6] max-h-[500px] overflow-y-auto pr-1">
                {tokens.map((token) => {
                  const isServing = token.status === 'in_service';
                  const isCalled = token.status === 'called';
                  const isWaiting = token.status === 'waiting';

                  return (
                    <div
                      key={token.id}
                      className={`py-3.5 flex items-center justify-between gap-4 transition-colors ${
                        isServing ? 'bg-[#f2f7f4] px-3 rounded-xl' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0 ${
                            isServing
                              ? 'bg-[#2f6954] text-white shadow'
                              : isCalled
                              ? 'bg-[#b06942] text-white'
                              : 'bg-[#f6f1e8] text-[#122920] border border-[#e6ddce]'
                          }`}
                        >
                          #{token.token_number}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#122920]">
                            {token.customer_name}
                          </p>
                          <p className="text-xs text-[#122920]/60">
                            {token.service_name || 'Salon Grooming'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                            isServing
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCalled
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : isWaiting
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {token.status?.replace('_', ' ')}
                        </span>
                        {isWaiting && (
                          <span className="block text-[10px] text-[#122920]/60 mt-0.5">
                            ~{token.estimated_wait_minutes}m wait
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
