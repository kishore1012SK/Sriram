import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { formatDateDDMMYYYY, formatTime12h, formatINR } from '@/lib/utils';
import { Calendar, Clock, ArrowLeft, ArrowRight, Scissors } from 'lucide-react';


export default async function AccountBookingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const appointments = db.getAppointments({ customer_id: session.id });

  return (
    <div className="py-12 sm:py-20 bg-[#fbf9f5] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122920] hover:text-[#b06942]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>

          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
          >
            <Calendar className="w-3.5 h-3.5 text-[#d9916b]" />
            <span>Book Another Service</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-[#e6ddce] shadow-xl overflow-hidden p-6 sm:p-10 space-y-6">
          <div className="border-b border-[#e6ddce] pb-4">
            <span className="text-xs uppercase tracking-wider font-bold text-[#b06942]">
              Booking History
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#122920] mt-1">
              Your Appointments
            </h1>
            <p className="text-xs text-[#122920]/70">
              Complete record of all your appointments scheduled at Sriram Salon.
            </p>
          </div>

          {appointments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-10 h-10 text-[#b06942]/60 mx-auto" />
              <p className="font-serif text-lg font-bold text-[#122920]">
                No Appointments on Record
              </p>
              <p className="text-xs text-[#122920]/70 max-w-sm mx-auto">
                You haven&apos;t booked an appointment yet. Browse our service menu and reserve your first haircut or shave.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold"
              >
                Book Appointment Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f4efe6]">
              {appointments.map((app) => (
                <div
                  key={app.id}
                  className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#b06942]">
                        {app.reference}
                      </span>
                      <span className="capitalize text-[10px] px-2 py-0.5 rounded font-bold bg-[#f6f1e8] text-[#122920]">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-serif text-lg font-bold text-[#122920]">
                      {app.service_name}
                    </p>
                    <p className="text-xs text-[#122920]/75">
                      {formatDateDDMMYYYY(app.appointment_date)} • {formatTime12h(app.start_time)} to {formatTime12h(app.end_time)} • Stylist: {app.employee_name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="font-serif text-base font-bold text-[#122920]">
                      {formatINR(app.price_snapshot)}
                    </span>
                    <Link
                      href={`/booking/${app.reference}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
