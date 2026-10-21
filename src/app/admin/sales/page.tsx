import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/store';
import { SalesManagerClient } from './SalesManagerClient';
import { Loader2 } from 'lucide-react';


export default async function AdminSalesPage() {
  const session = await getSession();
  if (!session || !['owner', 'manager', 'staff'].includes(session.role)) {
    redirect('/admin/login');
  }

  const sales = db.getSales();
  const services = db.getServices(true);
  const payments = db.getPayments();

  return (
    <Suspense
      fallback={
        <div className="p-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#b06942]" />
        </div>
      }
    >
      <SalesManagerClient
        initialSales={sales}
        services={services}
        initialPayments={payments}
      />
    </Suspense>
  );
}
