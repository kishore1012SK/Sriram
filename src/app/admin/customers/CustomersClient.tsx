'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalBookings: number;
  lastBookingDate?: string;
}

interface Props {
  initialCustomers: CustomerRecord[];
}

export function CustomersClient({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async (query = search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch {
      // Keep
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <div className="p-6 sm:p-10 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
            Directory
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#122920]">
            Customer Management
          </h1>
          <p className="text-xs text-[#122920]/70">
            Search customer records, track repeat visits, and examine historical bookings.
          </p>
        </div>

        <button
          onClick={() => fetchCustomers(search)}
          disabled={loading}
          className="p-2.5 rounded-xl border border-[#e6ddce] bg-white text-[#122920] hover:bg-[#f6f1e8] self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#b06942]' : ''}`} />
        </button>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by customer name, mobile phone number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e6ddce] text-xs focus:ring-2 focus:ring-[#c87d55] outline-none bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
        >
          Search
        </button>
      </form>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#122920]/60 space-y-2">
            <Users className="w-8 h-8 text-[#b06942]/50 mx-auto" />
            <p className="font-serif text-base font-bold text-[#122920]">
              No Customers Found
            </p>
            <p>Customers are automatically recorded when appointments or registrations occur.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f1e8] text-[#122920] border-b border-[#e6ddce] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Mobile Phone</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Total Appointments</th>
                  <th className="py-3.5 px-4">Last Visit</th>
                  <th className="py-3.5 px-4 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4efe6]">
                {customers.map((c) => (
                  <tr key={c.phone} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5 px-4">
                      <strong className="text-sm text-[#122920] block">{c.name}</strong>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[#122920]">
                      {c.phone}
                    </td>
                    <td className="py-3.5 px-4 text-[#122920]/75">
                      {c.email || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sm text-[#122920]">
                        {c.totalBookings}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#122920]/70">
                      {c.lastBookingDate || 'No visits yet'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/appointments?search=${encodeURIComponent(c.phone)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#e6ddce] text-xs font-semibold text-[#122920] hover:bg-[#f6f1e8]"
                      >
                        <span>View Bookings</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
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
