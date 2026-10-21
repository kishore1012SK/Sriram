import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              Legal & Privacy
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#122920]">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#122920]/60">
              Effective Date: 21 October 2026 • Sriram Salon, South 2nd Street, Pudukkottai, Tamil Nadu
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#122920]/80 leading-relaxed">
            <h2 className="font-serif text-lg font-bold text-[#122920]">1. Information We Collect</h2>
            <p>
              When booking an appointment or requesting a walk-in token at Sriram Salon, we collect only necessary personal contact information:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full Name</li>
              <li>Mobile Phone Number (used for booking references and queue notifications)</li>
              <li>Email Address (optional)</li>
              <li>Requested grooming service and optional styling preferences</li>
            </ul>

            <h2 className="font-serif text-lg font-bold text-[#122920] pt-4">2. Public Queue Privacy</h2>
            <p>
              We prioritize your privacy. Customer phone numbers and email addresses are <strong>never</strong> displayed on public queue monitors or public tracking links. Customer names on public queue boards are anonymized or masked.
            </p>

            <h2 className="font-serif text-lg font-bold text-[#122920] pt-4">3. Data Retention & Security</h2>
            <p>
              Your booking records and price snapshots are stored securely. We do not sell, rent, or distribute customer details to third-party marketing companies.
            </p>

            <h2 className="font-serif text-lg font-bold text-[#122920] pt-4">4. Contacting the Business Owner</h2>
            <p>
              For any questions regarding your personal information, please visit us at South 2nd Street, Pudukkottai, Tamil Nadu - 622001, or call +91 94867 54402.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
