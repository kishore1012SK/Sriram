'use client';

import React, { useState } from 'react';
import { Service } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  Scissors,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  DollarSign,
} from 'lucide-react';

interface Props {
  initialServices: Service[];
  canEdit: boolean;
}

export function ServicesManagerClient({ initialServices, canEdit }: Props) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Haircuts');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('150');
  const [duration, setDuration] = useState('30');
  const [isActive, setIsActive] = useState(true);
  const [allowOnline, setAllowOnline] = useState(true);
  const [allowWalkIn, setAllowWalkIn] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Haircuts');
    setDescription('');
    setPrice('150');
    setDuration('30');
    setIsActive(true);
    setAllowOnline(true);
    setAllowWalkIn(true);
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category);
    setDescription(service.description);
    setPrice(String(service.price));
    setDuration(String(service.duration_minutes));
    setIsActive(service.is_active);
    setAllowOnline(service.allow_online_booking);
    setAllowWalkIn(service.allow_walk_in);
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Service name is required');
      return;
    }
    const numPrice = Number(price);
    const numDuration = Number(duration);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Price must be a valid positive amount in ₹');
      return;
    }
    if (isNaN(numDuration) || numDuration <= 0) {
      setErrorMsg('Duration must be greater than zero minutes');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (editingService) {
        // Update
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            description,
            price: numPrice,
            duration_minutes: numDuration,
            is_active: isActive,
            allow_online_booking: allowOnline,
            allow_walk_in: allowWalkIn,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update service');

        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? data.service : s))
        );
      } else {
        // Create
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            description,
            price: numPrice,
            duration_minutes: numDuration,
            is_active: isActive,
            allow_online_booking: allowOnline,
            allow_walk_in: allowWalkIn,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add service');

        setServices((prev) => [...prev, data.service]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving service';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !service.is_active }),
      });
      const data = await res.json();
      if (data.service) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? data.service : s))
        );
      }
    } catch {
      alert('Failed to toggle service status');
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Catalog
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Salon Services & Pricing
          </h1>
          <p className="text-xs text-[#122920]/70">
            Configure haircut rates, beard trimming prices, durations, and booking channels.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#d9916b]" />
            <span>Add New Service</span>
          </button>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className={`p-6 rounded-3xl border transition-all bg-white shadow-sm flex flex-col justify-between ${
              service.is_active ? 'border-[#e6ddce]' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#f6f1e8] text-[#122920]">
                  {service.category}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    service.is_active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {service.is_active ? 'Active' : 'Deactivated'}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-[#122920]">
                  {service.name}
                </h3>
                <p className="text-xs text-[#122920]/75 mt-1 leading-relaxed">
                  {service.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <div>
                  <span className="text-[#122920]/60 text-[11px] block">Price</span>
                  <span className="font-serif text-2xl font-bold text-[#b06942]">
                    {formatINR(service.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#122920]/60 text-[11px] block">Duration</span>
                  <span className="font-bold text-[#122920] flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5 text-[#b06942]" />
                    {service.duration_minutes} Mins
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#f4efe6] flex items-center justify-between text-[11px] text-[#122920]/70">
                <span>Online Booking: {service.allow_online_booking ? '✓ Yes' : '✕ No'}</span>
                <span>Walk-in: {service.allow_walk_in ? '✓ Yes' : '✕ No'}</span>
              </div>
            </div>

            {canEdit && (
              <div className="pt-4 mt-4 border-t border-[#f4efe6] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(service)}
                  className="text-xs font-semibold text-gray-500 hover:text-black"
                >
                  {service.is_active ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => openEditModal(service)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e6ddce] text-xs font-semibold text-[#122920] hover:bg-[#f6f1e8]"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Rate & Details</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#e6ddce] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6ddce]">
              <h3 className="font-serif text-xl font-bold text-[#122920]">
                {editingService ? `Edit ${editingService.name}` : 'Add New Salon Service'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Service Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Haircut & Wash"
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Category *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Haircuts, Beard & Shave"
                    className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Price (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#122920]">Active Status</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded accent-[#c87d55] w-4 h-4"
                    />
                    <label htmlFor="isActive" className="text-gray-700">
                      Available for bookings
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding tools, style consultation, or skin care used..."
                  className="w-full p-2.5 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowOnline}
                    onChange={(e) => setAllowOnline(e.target.checked)}
                    className="rounded accent-[#c87d55] w-4 h-4"
                  />
                  <span>Allow Online Booking</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowWalkIn}
                    onChange={(e) => setAllowWalkIn(e.target.checked)}
                    className="rounded accent-[#c87d55] w-4 h-4"
                  />
                  <span>Allow Walk-Ins</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f4efe6]">
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
                  <span>{editingService ? 'Save Price Changes' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
