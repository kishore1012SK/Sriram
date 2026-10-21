import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/store';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Calendar,
  Mail,
  CheckCircle2,
} from 'lucide-react';


export default async function ContactPage() {
  const settings = db.getSettings();

  return (
    <div className="py-16 sm:py-24 bg-[#fbf9f5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-[#b06942]">
            Location & Inquiries
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#122920]">
            Visit Sriram Salon
          </h1>
          <p className="text-base text-[#122920]/75 leading-relaxed">
            Located conveniently on South 2nd Street in Pudukkottai. Drop in for our renowned styling experience or give us a call directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-white border border-[#e6ddce] shadow-sm space-y-6">
              <h2 className="font-serif text-2xl font-bold text-[#122920]">
                Contact Information
              </h2>

              <div className="space-y-5 text-sm text-[#122920]/85">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f6f1e8] text-[#b06942] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-[#122920] block">Address</strong>
                    <p className="text-xs text-[#122920]/80 leading-relaxed mt-0.5">
                      South 2nd Street, Pudukkottai,
                      <br />
                      Tamil Nadu, India — 622001
                    </p>
                    <a
                      href="https://maps.google.com/?q=South+2nd+Street+Pudukkottai+Tamil+Nadu+622001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b06942] hover:underline mt-2"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Google Maps Directions</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-4 border-t border-[#f4efe6]">
                  <div className="w-10 h-10 rounded-xl bg-[#f6f1e8] text-[#b06942] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-[#122920] block">Direct Phone Line</strong>
                    <a
                      href="tel:9486754402"
                      className="text-base font-mono font-bold text-[#122920] hover:text-[#b06942] transition-colors"
                    >
                      +91 94867 54402
                    </a>
                    <p className="text-xs text-[#122920]/60 mt-0.5">
                      Available during salon working shifts
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-4 border-t border-[#f4efe6]">
                  <div className="w-10 h-10 rounded-xl bg-[#f6f1e8] text-[#b06942] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-[#122920] block">Online Reservations</strong>
                    <p className="text-xs text-[#122920]/75 mt-0.5">
                      Reserve an exact appointment slot online with zero wait time.
                    </p>
                    <Link
                      href="/book"
                      className="inline-block mt-2 px-4 py-2 rounded-lg bg-[#122920] text-white text-xs font-semibold hover:bg-[#1a3c30]"
                    >
                      Book Online Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours Table */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-8 rounded-3xl bg-[#122920] text-[#f6f1e8] border border-[#c87d55]/30 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#1a3c30] pb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#d9916b] font-bold">
                    Salon Schedule
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white mt-1">
                    Opening Hours (Asia/Kolkata)
                  </h2>
                </div>
                <Clock className="w-6 h-6 text-[#d9916b]" />
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-[#0b1c15] border border-[#1a3c30] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">Monday to Friday</span>
                    <span className="px-2 py-0.5 rounded bg-[#1a3c30] text-[#d9916b] font-semibold text-xs">
                      Weekdays (3 Shifts)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-[#ece3d3]/85">
                    <div className="p-2.5 rounded-lg bg-[#122920] border border-[#1a3c30]">
                      <span className="text-[#d9916b] block text-[10px] uppercase font-bold">Shift 1</span>
                      <span className="font-mono font-semibold">06:30 AM – 10:00 AM</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#122920] border border-[#1a3c30]">
                      <span className="text-[#d9916b] block text-[10px] uppercase font-bold">Shift 2</span>
                      <span className="font-mono font-semibold">10:30 AM – 02:00 PM</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#122920] border border-[#1a3c30]">
                      <span className="text-[#d9916b] block text-[10px] uppercase font-bold">Shift 3</span>
                      <span className="font-mono font-semibold">03:00 PM – 09:30 PM</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0b1c15] border border-[#1a3c30] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">Saturday & Sunday</span>
                    <span className="px-2 py-0.5 rounded bg-[#2f6954] text-white font-semibold text-xs">
                      Continuous Weekend
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#122920] border border-[#1a3c30] flex items-center justify-between">
                    <span className="text-xs text-[#ece3d3]">Open Continuous All Day:</span>
                    <span className="font-mono text-base font-bold text-[#d9916b]">
                      06:00 AM – 10:00 PM
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1a3c30] text-xs text-[#ece3d3]/85 border border-[#c87d55]/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#d9916b] shrink-0 mt-0.5" />
                <p>
                  Appointments must fit completely within an available opening shift interval. Automated booking closes during interim break sanitization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
