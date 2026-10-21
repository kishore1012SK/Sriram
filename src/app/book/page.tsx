import React, { Suspense } from 'react';
import { db } from '@/lib/db/store';
import { BookingFlow } from './BookingFlow';
import { Loader2 } from 'lucide-react';


export default async function BookPage() {
  const services = db.getServices(true);
  const employees = db.getEmployees(true);

  return (
    <div className="py-12 sm:py-20 bg-[#fbf9f5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-24 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#b06942]" />
            </div>
          }
        >
          <BookingFlow initialServices={services} initialEmployees={employees} />
        </Suspense>
      </div>
    </div>
  );
}
