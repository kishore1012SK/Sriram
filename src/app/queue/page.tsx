import React from 'react';
import { db } from '@/lib/db/store';
import { QueueClient } from './QueueClient';


export default async function QueuePage() {
  const services = db.getServices(true).filter((s) => s.allow_walk_in);
  const settings = db.getSettings();
  const todayTokens = db.getWalkInTokens();

  // Sanitize for initial render
  const sanitizedTokens = todayTokens.map((t) => ({
    id: t.id,
    token_number: t.token_number,
    token_date: t.token_date,
    reference: t.reference,
    customer_name: t.customer_name.charAt(0) + '***' + (t.customer_name.slice(-1) || ''),
    service_name: t.service_name,
    status: t.status,
    estimated_wait_minutes: t.estimated_wait_minutes,
    called_at: t.called_at,
    created_at: t.created_at,
  }));

  return (
    <div className="py-12 sm:py-20 bg-[#fbf9f5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <QueueClient
          services={services}
          initialTokens={sanitizedTokens}
          isOpen={settings.queue_settings.is_open}
        />
      </div>
    </div>
  );
}
