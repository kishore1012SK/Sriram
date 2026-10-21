import Link from 'next/link';
import { db } from '@/lib/db/store';
import { formatINR } from '@/lib/utils';
import {
  Scissors,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
} from 'lucide-react';


export default async function HomePage() {
  const services = db.getServices(true);
  const settings = db.getSettings();

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#122920] text-[#f6f1e8] py-20 lg:py-28 border-b border-[#c87d55]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c87d55_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a3c30] border border-[#c87d55]/40 text-xs font-semibold text-[#d9916b] tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pudukkottai&apos;s Signature Barber Experience</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#fcfbf8] leading-[1.15]">
                Refined Grooming, <br />
                <span className="copper-gradient-text font-serif italic">Masterful Detailing.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#ece3d3]/85 max-w-2xl leading-relaxed">
                Welcome to <strong>Sriram Salon</strong> on South 2nd Street, Pudukkottai. We honor the heritage of traditional barbering with sharp precision styling, hygienic blades, and individualized customer care.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-[#122920] bg-[#d9916b] hover:bg-[#c87d55] text-white shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  <Calendar className="w-5 h-5 text-white" />
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-[#f6f1e8] bg-[#1a3c30] hover:bg-[#235040] border border-[#c87d55]/30 transition-all"
                >
                  <Scissors className="w-4 h-4 text-[#d9916b]" />
                  <span>View Services & Rates</span>
                </Link>

                <Link
                  href="/queue"
                  className="inline-flex items-center gap-2 text-xs font-medium text-[#d9916b] hover:text-[#faeee7] px-3 py-2 underline underline-offset-4"
                >
                  <Clock className="w-4 h-4" />
                  <span>Take a Walk-In Token &rarr;</span>
                </Link>
              </div>

              {/* Key Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1a3c30]">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#c87d55]" />
                  <span className="text-xs text-[#ece3d3]/90 font-medium">100% Sanitized Tools</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#c87d55]" />
                  <span className="text-xs text-[#ece3d3]/90 font-medium">Exact Time Slot Booking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-[#c87d55]" />
                  <span className="text-xs text-[#ece3d3]/90 font-medium">Gentle Kids&apos; Stylists</span>
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-2xl bg-[#0b1c15] border border-[#c87d55]/30 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-[#1a3c30] pb-4">
                  <div>
                    <h2 className="text-xs uppercase tracking-widest text-[#d9916b] font-bold">
                      Business Overview
                    </h2>
                    <p className="font-serif text-xl font-bold text-white mt-1">Sriram Salon</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#1a3c30] text-[#d9916b] border border-[#c87d55]/30">
                    Open Today
                  </span>
                </div>

                <div className="space-y-4 text-sm text-[#ece3d3]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#c87d55] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">Salon Address</p>
                      <p className="text-xs text-[#ece3d3]/80 leading-relaxed">
                        South 2nd Street, Pudukkottai, Tamil Nadu, India — 622001
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#c87d55] shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Direct Phone</p>
                      <a href="tel:9486754402" className="text-xs text-[#d9916b] hover:underline font-mono">
                        +91 94867 54402
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2 border-t border-[#1a3c30]">
                    <Clock className="w-5 h-5 text-[#c87d55] shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-white">Daily Shifts (Asia/Kolkata)</p>
                      <p className="text-[#ece3d3]/80">Mon – Fri: 06:30–10:00 | 10:30–14:00 | 15:00–21:30</p>
                      <p className="text-[#ece3d3]/80">Sat – Sun: 06:00–22:00 (Continuous)</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/book"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-[#122920] bg-[#f6f1e8] hover:bg-white transition-colors"
                  >
                    Select Service & Book Online
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES & PRICES SECTION */}
      <section className="py-20 bg-[#fbf9f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase tracking-widest font-bold text-[#b06942]">
              Transparent Pricing & Services
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#122920]">
              Crafted Services for Every Generation
            </h2>
            <p className="text-sm sm:text-base text-[#122920]/70">
              Honest salon pricing with zero hidden charges. All services are performed with fresh sanitized blades and premium care products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-[#e6ddce] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-[#c87d55]"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#f6f1e8] text-[#122920]">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[#122920]/60">
                      <Clock className="w-3.5 h-3.5 text-[#b06942]" />
                      <span>{service.duration_minutes} mins</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#122920] group-hover:text-[#b06942] transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-xs text-[#122920]/70 mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#f4efe6] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#122920]/60 block">Price</span>
                    <span className="font-serif text-2xl font-bold text-[#122920]">
                      {formatINR(service.price)}
                    </span>
                  </div>

                  <Link
                    href={`/book?service=${service.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#122920] text-white hover:bg-[#1a3c30] transition-colors"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#b06942] hover:text-[#935332]"
            >
              <span>Explore all service categories and details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. BUSINESS HOURS & SCHEDULES */}
      <section className="py-16 bg-[#f4efe6] border-y border-[#e6ddce]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase tracking-widest font-bold text-[#b06942]">
                Operating Hours
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#122920]">
                Strict Adherence to Our Scheduled Shifts
              </h2>
              <p className="text-sm text-[#122920]/80 leading-relaxed">
                To guarantee optimal service quality and sanitation between appointments, Sriram Salon operates on defined shift intervals. Our automated booking system guarantees your slot starts on time.
              </p>

              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#122920] hover:text-[#b06942] underline underline-offset-4"
                >
                  View full location directions and contact info &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-[#e6ddce] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#122920]">
                    Monday to Friday
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#f6f1e8] text-[#b06942] font-semibold">
                    3 Working Shifts
                  </span>
                </div>
                <div className="space-y-2 text-xs text-[#122920]/80">
                  <div className="flex justify-between py-1 border-b border-[#f4efe6]">
                    <span className="font-medium text-[#122920]">Morning Shift</span>
                    <span className="font-mono">06:30 AM – 10:00 AM</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f4efe6]">
                    <span className="font-medium text-[#122920]">Midday Shift</span>
                    <span className="font-mono">10:30 AM – 02:00 PM</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium text-[#122920]">Evening Shift</span>
                    <span className="font-mono">03:00 PM – 09:30 PM</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e6ddce] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-[#122920]">
                    Saturday & Sunday
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#122920] text-[#f6f1e8] font-semibold">
                    Continuous
                  </span>
                </div>
                <div className="space-y-2 text-xs text-[#122920]/80">
                  <div className="py-2 border-b border-[#f4efe6]">
                    <span className="font-medium text-[#122920] block">Weekend Full Day:</span>
                    <span className="font-mono text-base font-bold text-[#b06942]">
                      06:00 AM – 10:00 PM
                    </span>
                  </div>
                  <p className="text-[11px] text-[#122920]/60 italic">
                    Walk-in tokens and online appointments are available all weekend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION & FOUNDER PORTRAIT */}
      <section className="py-20 bg-[#fbf9f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs uppercase tracking-widest font-bold text-[#b06942]">
                Our Philosophy & Heritage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#122920]">
                Authentic Craftsmanship in the Heart of Pudukkottai
              </h2>
              <p className="text-sm sm:text-base text-[#122920]/80 leading-relaxed">
                Located on South 2nd Street, Sriram Salon was founded on one steadfast commitment: treating grooming as an art form that demands patience, sterile equipment, and an eye for sharp lines.
              </p>
              <p className="text-sm text-[#122920]/80 leading-relaxed">
                Whether you need a quick beard touch-up before an important occasion, a patient haircut for your child, or a signature razor shave, our salon welcomes you with calm ambiance, comfortable seating, and prompt scheduling.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#e6ddce]">
                  <p className="font-serif text-2xl font-bold text-[#b06942]">Pudukkottai</p>
                  <p className="text-xs text-[#122920]/70 mt-1">Convenient South 2nd Street access</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e6ddce]">
                  <p className="font-serif text-2xl font-bold text-[#122920]">0 Overlaps</p>
                  <p className="text-xs text-[#122920]/70 mt-1">Guaranteed dedicated stylist time</p>
                </div>
              </div>

              {/* UPI Payment Accepted Trust Badge */}
              <div className="p-4 rounded-xl bg-[#f6f1e8] border border-[#e6ddce] flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#122920] block">UPI & Cash Accepted</span>
                  <span className="text-[#122920]/70 font-mono text-[11px]">UPI ID: kishoreramr2004@oksbi</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#122920] text-[#d9916b] text-[10px] font-bold">
                  GPay • PhonePe • Paytm
                </span>
              </div>
            </div>

            {/* Authentic Founder Portrait & Official Brand Emblem */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-3xl overflow-hidden border border-[#c87d55]/40 shadow-xl bg-white p-2">
                <div className="relative rounded-2xl overflow-hidden bg-[#122920]">
                  <img
                    src="/images/sriram-salon-brand.jpg"
                    alt="Sriram Salon Founder and Official Brand Emblem - South 2nd Street Pudukkottai"
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-4 bg-[#122920] text-[#f6f1e8] flex items-center justify-between text-xs border-t border-[#c87d55]/30">
                    <div>
                      <p className="font-serif font-bold text-white text-sm">Founder & Master Barber</p>
                      <p className="text-[#ece3d3]/80 text-[11px]">Sriram Salon • South 2nd Street, Pudukkottai</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#1a3c30] text-[#d9916b] border border-[#c87d55]/30 text-[10px] uppercase font-bold tracking-wider">
                      Verified Salon
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#122920] text-[#f6f1e8] border border-[#c87d55]/30 shadow-lg space-y-4">
                <h3 className="font-serif text-xl font-bold text-white">
                  Reserve in Advance or Take a Live Token
                </h3>
                <p className="text-xs text-[#ece3d3]/85 leading-relaxed">
                  We respect your time. Secure an exact slot online or track live token wait times on South 2nd Street.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link
                    href="/book"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#d9916b] hover:bg-[#c87d55] text-white text-xs font-semibold transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Slot</span>
                  </Link>
                  <Link
                    href="/queue"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1a3c30] hover:bg-[#235040] text-[#ece3d3] border border-[#c87d55]/30 text-xs font-semibold transition-colors"
                  >
                    <Clock className="w-4 h-4 text-[#d9916b]" />
                    <span>Check Live Queue</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
