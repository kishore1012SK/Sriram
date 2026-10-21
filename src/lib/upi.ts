export const SALON_UPI_CONFIG = {
  name: 'Sriram Salon',
  upiId: 'kishoreramr2004@oksbi',
  contactPhone: '9486754402',
  currency: 'INR',
};

/**
 * Generates a standard UPI deep link for mobile apps (Google Pay, PhonePe, Paytm, BHIM).
 * Spec: upi://pay?pa={upiId}&pn={name}&am={amount}&tr={transactionRef}&cu=INR&tn={note}
 */
export function generateUpiLink(params: {
  amount: number;
  reference: string;
  note?: string;
}): string {
  const { amount, reference, note } = params;
  const noteText = note || `Sriram Salon Booking ${reference}`;

  const query = new URLSearchParams({
    pa: SALON_UPI_CONFIG.upiId,
    pn: SALON_UPI_CONFIG.name,
    am: amount.toFixed(2),
    tr: reference,
    cu: 'INR',
    tn: noteText,
  });

  return `upi://pay?${query.toString()}`;
}

/**
 * Validates customer-entered UTR (Unique Transaction Reference) / UPI Ref Number.
 * Standard Indian bank UPI UTRs are 12 digits (or 8-16 alphanumeric chars for some wallets).
 */
export function isValidUpiReference(ref: string): boolean {
  if (!ref) return false;
  const clean = ref.trim();
  return clean.length >= 6 && clean.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(clean);
}
