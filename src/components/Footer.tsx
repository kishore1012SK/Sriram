'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { MapPin, Phone, Clock, Shield, Award, Calendar } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0b1c15] text-[#f6f1e8] border-t border-[#c87d55]/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo isDark />
            <p className="text-sm text-[#ece3d3]/80 leading-relaxed">
              Pudukkottai&apos;s premier grooming destination. Delivering classic mastery, sharp beard styling, and modern haircutting with authentic Tamil hospitality and meticulous precision.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[#d9916b]">
              <Award className="w-4 h-4" />
              <span>South 2nd Street, Pudukkottai Landmark</span>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d9916b] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Salon Schedule
            </h3>
            <div className="space-y-2.5 text-xs text-[#ece3d3]/90">
              <div className="pb-2 border-b border-[#1a3c30]">
                <p className="font-semibold text-white">Monday to Friday:</p>
                <p className="text-[#ece3d3]/80">Morning: 06:30 AM – 10:00 AM</p>
                <p className="text-[#ece3d3]/80">Midday: 10:30 AM – 02:00 PM</p>
                <p className="text-[#ece3d3]/80">Evening: 03:00 PM – 09:30 PM</p>
              </div>
              <div>
                <p className="font-semibold text-white">Saturday & Sunday:</p>
                <p className="text-[#ece3d3]/80">Continuous: 06:00 AM – 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d9916b]">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-sm text-[#ece3d3]/80">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Our Services & Rates
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link href="/queue" className="hover:text-white transition-colors">
                  Check Walk-in Queue
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Location & Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d9916b]">
              Salon Location
            </h3>
            <div className="space-y-3 text-sm text-[#ece3d3]/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-[#c87d55] shrink-0 mt-0.5" />
                <address className="not-italic text-xs leading-relaxed text-[#ece3d3]/80">
                  South 2nd Street, Pudukkottai,
                  <br />
                  Tamil Nadu, India — 622001
                </address>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c87d55] shrink-0" />
                <a href="tel:9486754402" className="text-sm hover:text-white transition-colors font-medium">
                  +91 94867 54402
                </a>
              </div>
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=South+2nd+Street+Pudukkottai+Tamil+Nadu+622001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#d9916b] hover:underline"
                >
                  <span>Open in Google Maps &rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a3c30] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#ece3d3]/60">
          <p>© 2026 Sriram Salon. All rights reserved. Pudukkottai, Tamil Nadu.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="hover:text-[#d9916b] transition-colors">
              Staff & Admin Portal
            </Link>
            <span>•</span>
            <span>Currency: INR (₹)</span>
            <span>•</span>
            <span>Asia/Kolkata</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
