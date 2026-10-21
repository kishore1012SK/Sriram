'use client';

import React, { useState } from 'react';
import { Employee, Service } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import {
  Users,
  Plus,
  Phone,
  CheckCircle2,
  XCircle,
  Scissors,
  Edit2,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

interface Props {
  initialEmployees: Employee[];
  services: Service[];
  isOwner: boolean;
}

export function EmployeesManagerClient({ initialEmployees, services, isOwner }: Props) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreateModal = () => {
    setEditingEmp(null);
    setName('');
    setPhone('');
    setIsActive(true);
    setSelectedServices(services.map((s) => s.id));
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setPhone(emp.phone);
    setIsActive(emp.is_active);
    setSelectedServices(emp.services || []);
    setErrorMsg('');
    setShowModal(true);
  };

  const toggleServiceSelection = (srvId: string) => {
    if (selectedServices.includes(srvId)) {
      setSelectedServices(selectedServices.filter((id) => id !== srvId));
    } else {
      setSelectedServices([...selectedServices, srvId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Stylist name is required');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (editingEmp) {
        const res = await fetch(`/api/admin/employees/${editingEmp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            is_active: isActive,
            services: selectedServices,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update employee');

        setEmployees((prev) =>
          prev.map((e) => (e.id === editingEmp.id ? data.employee : e))
        );
      } else {
        const res = await fetch('/api/admin/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            is_active: isActive,
            services: selectedServices,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add employee');

        setEmployees((prev) => [...prev, data.employee]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving employee';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (emp: Employee) => {
    try {
      const res = await fetch(`/api/admin/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !emp.is_active }),
      });
      const data = await res.json();
      if (data.employee) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === emp.id ? data.employee : e))
        );
      }
    } catch {
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Staff Roster
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Employee Management
          </h1>
          <p className="text-xs text-[#122920]/70">
            Manage barbers, assign services, configure active schedules, and review appointments.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#d9916b]" />
            <span>Add Barber / Stylist</span>
          </button>
        )}
      </div>

      {employees.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-[#e6ddce] text-center space-y-3">
          <Users className="w-10 h-10 text-[#b06942] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#122920]">
            No Stylists Configured
          </h3>
          <p className="text-xs text-[#122920]/70 max-w-md mx-auto">
            Add your first salon employee or master barber so customers can choose them when booking appointments.
          </p>
          {isOwner && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#122920] text-white text-xs font-semibold"
            >
              Add First Stylist
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className={`p-6 rounded-3xl border transition-all bg-white shadow-sm flex flex-col justify-between ${
                emp.is_active ? 'border-[#e6ddce]' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#f6f1e8] text-[#122920] font-serif text-xl font-bold flex items-center justify-center border border-[#e6ddce]">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#122920]">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-[#122920]/60 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#b06942]" />
                        <span>{emp.phone || 'No phone recorded'}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                      emp.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#f4efe6] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#122920]/70 uppercase tracking-wider block">
                    Qualified Services ({(emp.services || []).length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(emp.services || []).map((srvId) => {
                      const srv = services.find((s) => s.id === srvId);
                      return (
                        <span
                          key={srvId}
                          className="px-2 py-0.5 rounded-md bg-[#f6f1e8] text-[10px] text-[#122920] font-medium"
                        >
                          {srv ? srv.name : srvId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {isOwner && (
                <div className="pt-4 mt-6 border-t border-[#f4efe6] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(emp)}
                    className="text-xs font-semibold text-gray-500 hover:text-black"
                  >
                    {emp.is_active ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => openEditModal(emp)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e6ddce] text-xs font-semibold text-[#122920] hover:bg-[#f6f1e8]"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Details</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e6ddce] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#e6ddce]">
              <h3 className="font-serif text-xl font-bold text-[#122920]">
                {editingEmp ? `Edit ${editingEmp.name}` : 'Add New Stylist'}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Stylist Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sriram"
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9486754402"
                  className="w-full px-3 py-2 rounded-xl border border-[#e6ddce] outline-none focus:ring-2 focus:ring-[#c87d55]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#122920]">Active Status</label>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="empActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded accent-[#c87d55] w-4 h-4"
                  />
                  <label htmlFor="empActive">Available to receive customer appointments</label>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="font-bold text-[#122920]">Assign Qualified Services</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto p-1 border border-[#e6ddce] rounded-xl">
                  {services.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 p-1.5 hover:bg-[#faf8f5] rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.id)}
                        onChange={() => toggleServiceSelection(s.id)}
                        className="rounded accent-[#c87d55] w-3.5 h-3.5"
                      />
                      <span>{s.name} ({formatINR(s.price)})</span>
                    </label>
                  ))}
                </div>
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
                  <span>Save Staff Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
