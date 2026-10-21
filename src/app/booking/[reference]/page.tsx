import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/store';
import { formatINR, formatTime12h, formatDateDDMMYYYY } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { BookingDetailsClient } from './BookingDetailsClient';


export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const appointment = db.getAppointmentByReference(reference);

  if (!appointment) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h1 className="font-serif text-2xl font-bold text-[#122920]">
          Booking Reference Not Found
        </h1>
        <p className="text-xs text-[#122920]/70">
          The reference code &quot;{reference}&quot; does not match any appointment on record. Please verify the code or check your customer account.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#122920] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  const settings = db.getSettings();

  return (
    <div className="py-12 sm:py-20 bg-[#fbf9f5] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <BookingDetailsClient
          appointment={appointment}
          cancellationLeadHours={settings.booking_rules.cancellation_lead_hours}
          cancellationPolicy={settings.booking_rules.cancellation_policy}
        />
      </div>
    </div>
  );
}
