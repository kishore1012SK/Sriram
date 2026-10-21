import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/store';
import { formatINR } from '@/lib/utils';
import { Clock, Scissors, Calendar, Check, ArrowRight } from 'lucide-react';


export default async function ServicesPage() {
  const services = db.getServices(true);

  // Group by category
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="py-16 sm:py-24 bg-[#fbf9f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#b06942]">
            Menu of Services
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#122920]">
            Precision Grooming & Care
          </h1>
          <p className="text-base text-[#122920]/75 leading-relaxed">
            Every service at Sriram Salon includes individualized consultation, sanitization protocols, and attentive execution. Transparent prices in Indian Rupees (₹).
          </p>
        </div>

        {/* Categories Loop */}
        <div className="space-y-16">
          {categories.map((category) => {
            const categoryServices = services.filter((s) => s.category === category);

            return (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#e6ddce] pb-3">
                  <Scissors className="w-5 h-5 text-[#b06942]" />
                  <h2 className="font-serif text-2xl font-bold text-[#122920]">
                    {category}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f6f1e8] text-[#122920]/70 font-semibold">
                    {categoryServices.length} {categoryServices.length === 1 ? 'Service' : 'Services'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl p-7 border border-[#e6ddce] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#c87d55]"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-serif text-2xl font-bold text-[#122920] group-hover:text-[#b06942] transition-colors">
                            {service.name}
                          </h3>
                          <span className="font-serif text-2xl font-bold text-[#122920] shrink-0">
                            {formatINR(service.price)}
                          </span>
                        </div>

                        <p className="text-sm text-[#122920]/75 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-[#122920]/70 pt-2">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#b06942]" />
                            <span>Estimated {service.duration_minutes} Minutes</span>
                          </div>
                          <span>•</span>
                          <span className="text-[#3e856c] font-medium flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Sterilized Equipment
                          </span>
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-[#f4efe6] flex items-center justify-between">
                        <div className="text-[11px] text-[#122920]/60">
                          {service.allow_online_booking ? 'Online booking available' : 'Walk-in only'}
                        </div>

                        <Link
                          href={`/book?service=${service.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#122920] text-white hover:bg-[#1a3c30] transition-colors shadow-sm"
                        >
                          <Calendar className="w-4 h-4 text-[#d9916b]" />
                          <span>Book Appointment</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice Box */}
        <div className="mt-16 p-8 rounded-2xl bg-[#f6f1e8] border border-[#e6ddce] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-xl font-bold text-[#122920]">
              Planning a visit without an appointment?
            </h3>
            <p className="text-xs sm:text-sm text-[#122920]/70">
              You can request a walk-in token or check the real-time queue length before you arrive.
            </p>
          </div>
          <Link
            href="/queue"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white border border-[#c87d55] text-[#b06942] hover:bg-[#c87d55] hover:text-white transition-all shrink-0"
          >
            <span>Live Queue Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
