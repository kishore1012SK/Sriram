'use client';

import React, { useState } from 'react';
import { SalonSettings, BusinessHourInterval } from '@/lib/types';
import {
  Settings,
  Store,
  Clock,
  Calendar,
  Ticket,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Props {
  initialSettings: SalonSettings;
  initialHours: BusinessHourInterval[];
}

export function SettingsClient({ initialSettings, initialHours }: Props) {
  const [settings, setSettings] = useState<SalonSettings>(initialSettings);
  const [hours, setHours] = useState<BusinessHourInterval[]>(initialHours);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleHourTimeChange = (id: string, field: 'open_time' | 'close_time', val: string) => {
    setHours((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleHourClosedToggle = (id: string, isClosed: boolean) => {
    setHours((prev) =>
      prev.map((h) => (h.id === id ? { ...h, is_closed: isClosed } : h))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, businessHours: hours }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving settings';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto">
      <div>
        <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
          Configuration
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#122920]">
          Salon Settings & Operating Hours
        </h1>
        <p className="text-xs text-[#122920]/70">
          Owner-only controls for salon identity, booking boundaries, cancellation policies, and daily schedules.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Salon configuration and opening hours saved successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. BUSINESS PROFILE INFORMATION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#e6ddce] pb-3">
            <Store className="w-5 h-5 text-[#b06942]" />
            <h2 className="font-serif text-lg font-bold text-[#122920]">
              Business Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Salon Name</label>
              <input
                type="text"
                required
                value={settings.business_info.name}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_info: { ...settings.business_info, name: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Official Phone Number</label>
              <input
                type="tel"
                required
                value={settings.business_info.phone}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_info: { ...settings.business_info, phone: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-[#122920]">Physical Address</label>
              <input
                type="text"
                required
                value={settings.business_info.address}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    business_info: { ...settings.business_info, address: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Currency & Timezone</label>
              <p className="p-2 rounded-lg bg-[#f6f1e8] text-[#122920] font-mono">
                {settings.business_info.currency} ({settings.business_info.currency_symbol}) •{' '}
                {settings.business_info.timezone}
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Date Format</label>
              <p className="p-2 rounded-lg bg-[#f6f1e8] text-[#122920] font-mono">
                {settings.business_info.date_format}
              </p>
            </div>
          </div>
        </div>

        {/* 2. BOOKING RULES & CANCELLATION POLICY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#e6ddce] pb-3">
            <Calendar className="w-5 h-5 text-[#b06942]" />
            <h2 className="font-serif text-lg font-bold text-[#122920]">
              Booking Rules & Cancellation Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Max Advance Days</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.booking_rules.max_advance_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking_rules: {
                      ...settings.booking_rules,
                      max_advance_days: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Cancellation Lead Hours</label>
              <input
                type="number"
                min="0"
                max="48"
                value={settings.booking_rules.cancellation_lead_hours}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking_rules: {
                      ...settings.booking_rules,
                      cancellation_lead_hours: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-[#122920]">Cancellation Policy Statement</label>
              <textarea
                value={settings.booking_rules.cancellation_policy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    booking_rules: {
                      ...settings.booking_rules,
                      cancellation_policy: e.target.value,
                    },
                  })
                }
                rows={2}
                className="w-full p-2.5 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
              />
            </div>
          </div>
        </div>

        {/* 3. BUSINESS OPENING HOURS INTERVALS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#e6ddce] pb-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#b06942]" />
              <div>
                <h2 className="font-serif text-lg font-bold text-[#122920]">
                  Operating Shifts & Hours
                </h2>
                <p className="text-[11px] text-[#122920]/60">
                  Multiple intervals per day supported. Bookings are rejected outside these exact intervals.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {hours.map((interval) => (
              <div
                key={interval.id}
                className="p-3.5 rounded-2xl bg-[#fcfbf9] border border-[#e6ddce] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="w-48 font-semibold text-[#122920]">
                  {daysMap[interval.day_of_week]} (Shift {interval.interval_index})
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    disabled={interval.is_closed}
                    value={interval.open_time}
                    onChange={(e) => handleHourTimeChange(interval.id, 'open_time', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[#e6ddce] bg-white font-mono text-xs disabled:opacity-40"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    disabled={interval.is_closed}
                    value={interval.close_time}
                    onChange={(e) => handleHourTimeChange(interval.id, 'close_time', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-[#e6ddce] bg-white font-mono text-xs disabled:opacity-40"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={interval.is_closed}
                    onChange={(e) => handleHourClosedToggle(interval.id, e.target.checked)}
                    className="rounded accent-red-600 w-3.5 h-3.5"
                  />
                  <span>Closed</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 4. QUEUE CONTROLS */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#e6ddce] pb-3">
            <Ticket className="w-5 h-5 text-[#b06942]" />
            <h2 className="font-serif text-lg font-bold text-[#122920]">
              Walk-In Queue Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Accepting Walk-In Tokens</label>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="queueOpen"
                  checked={settings.queue_settings.is_open}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      queue_settings: {
                        ...settings.queue_settings,
                        is_open: e.target.checked,
                      },
                    })
                  }
                  className="rounded accent-[#c87d55] w-4 h-4"
                />
                <label htmlFor="queueOpen" className="text-gray-700">
                  Queue is actively accepting tokens today
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#122920]">Max Daily Tokens Limit</label>
              <input
                type="number"
                min="10"
                max="500"
                value={settings.queue_settings.max_daily_tokens}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    queue_settings: {
                      ...settings.queue_settings,
                      max_daily_tokens: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#122920] text-white text-sm font-semibold hover:bg-[#1a3c30] disabled:opacity-50 transition-all shadow-md"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#d9916b]" />
            ) : (
              <Save className="w-4 h-4 text-[#d9916b]" />
            )}
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
