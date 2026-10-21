import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-24 bg-[#fbf9f5] min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#122920] hover:text-[#b06942]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-3xl border border-[#e6ddce] p-8 sm:p-12 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-[#e6ddce] pb-6">
            <span className="text-xs uppercase font-bold tracking-wider text-[#b06942]">
              Legal & Terms
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#122920]">
              Terms of Service & Booking Policy
            </h1>
            <p className="text-xs text-[#122920]/60">
              Effective Date: 21 October 2026 • Sriram Salon, Pudukkottai
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#122920]/80 leading-relaxed">
            <h2 className="font-serif text-lg font-bold text-[#122920]">1. Appointment Scheduling</h2>
            <p>
              Appointments can be scheduled up to 14 days in advance. Appointment slots are strictly reserved within established salon opening hours and shifts. Please arrive 5 minutes before your scheduled start time.
            </p>

            <h2 className="font-serif text-lg font-bold text-[#122920] pt-4">2. Cancellation Policy</h2>
            <p>
              Appointments may be cancelled up to 2 hours prior to the scheduled start time without any cancellation penalty. If you are unable to make your slot, please cancel through your account or notify us promptly.
            </p>

            <h2 className="font-serif text-lg font-bold text-[#122920] pt-4">3. Pricing & Payments</h2>
            <p>
              All prices are listed in Indian Rupees (₹) and include full consultation and standard styling care. Payment is accepted in Cash or via UPI upon completion of service at the salon counter.
            </p>

            <h2 className="font-serif text-lg font-bold text-[#122920] pt-4">4. Walk-In Queue Rules</h2>
            <p>
              Walk-in tokens are valid only on the date of issue. Tokens are served sequentially. If a token number is called multiple times without response, the customer may be marked as a no-show.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
