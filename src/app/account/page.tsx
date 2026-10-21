import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { User, Phone, Mail, Calendar, Clock, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { AccountSignOutButton } from './SignOutButton';


export default async function AccountPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const appointments = db.getAppointments({ customer_id: session.id });
  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(
    (a) => a.appointment_date >= today && !['completed', 'cancelled', 'no_show'].includes(a.status)
  );

  return (
    <div className="py-12 sm:py-20 bg-[#fbf9f5] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-[#122920] text-[#f6f1e8] border-b border-[#c87d55]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-[#d9916b]">
                Customer Account
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                {session.full_name}
              </h1>
              <p className="text-xs text-[#ece3d3]/80">
                Member of Sriram Salon, Pudukkottai
              </p>
            </div>

            <AccountSignOutButton />
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Profile Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#f6f1e8] border border-[#e6ddce] space-y-1">
                <span className="text-[11px] uppercase font-bold text-[#122920]/60">
                  Phone Number
                </span>
                <p className="text-sm font-bold text-[#122920]">{session.phone}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#f6f1e8] border border-[#e6ddce] space-y-1">
                <span className="text-[11px] uppercase font-bold text-[#122920]/60">
                  Email Address
                </span>
                <p className="text-sm font-bold text-[#122920] truncate">{session.email}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#f6f1e8] border border-[#e6ddce] space-y-1">
                <span className="text-[11px] uppercase font-bold text-[#122920]/60">
                  Total Bookings
                </span>
                <p className="font-serif text-2xl font-bold text-[#b06942]">
                  {appointments.length}
                </p>
              </div>
            </div>

            {/* Upcoming Appointments section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-[#122920]">
                  Upcoming Appointments
                </h2>
                <Link
                  href="/account/bookings"
                  className="text-xs font-semibold text-[#b06942] hover:underline"
                >
                  View All History &rarr;
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#fcfbf9] border border-[#e6ddce] text-center space-y-3">
                  <Calendar className="w-8 h-8 text-[#b06942] mx-auto" />
                  <p className="text-sm font-semibold text-[#122920]">
                    No Upcoming Appointments Scheduled
                  </p>
                  <p className="text-xs text-[#122920]/70 max-w-sm mx-auto">
                    Ready for a sharp haircut or beard trim? Pick an available opening slot today.
                  </p>
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold"
                  >
                    <span>Book New Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-white border border-[#e6ddce] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#c87d55] transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#b06942]">
                          Ref: {app.reference}
                        </span>
                        <p className="font-serif text-base font-bold text-[#122920]">
                          {app.service_name}
                        </p>
                        <p className="text-xs text-[#122920]/75">
                          {app.appointment_date} at {app.start_time} with {app.employee_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 capitalize">
                          {app.status}
                        </span>
                        <Link
                          href={`/booking/${app.reference}`}
                          className="px-3.5 py-1.5 rounded-lg bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
