import type { Booking } from "../types.ts";
import { paymentFromBooking, type PaymentRecord, type WalletTx } from "./payments.ts";

export function seedPaymentsFromBookings(bookings: Booking[], existing: PaymentRecord[]): PaymentRecord[] {
  const have = new Set(existing.map((p) => p.bookingId));
  const derived = bookings
    .filter((b) => !have.has(b.id))
    .map((b) =>
      paymentFromBooking({
        bookingId: b.id,
        customer: b.passengerName,
        method: b.payment,
        amount: b.price,
        status: b.status === "cancelled" ? "voided" : b.status === "payment_pending" ? "authorized" : "captured",
        source: b.id === "ZF-82041" || b.id.startsWith("ZD-") ? "seed" : "demo",
      }),
    );
  return [...existing, ...derived];
}

export function seedWalletFromBookings(bookings: Booking[], existing: WalletTx[]): WalletTx[] {
  if (existing.length) return existing;
  return bookings.slice(0, 12).map((b) => ({
    id: `wlt_${b.id}`,
    passengerId: b.passengerId,
    bookingId: b.id,
    type: b.status === "cancelled" ? "refund" : "debit",
    amount: b.price,
    currency: b.currency,
    timestamp: b.createdAt,
    status: "posted" as const,
    source: "seed" as const,
    reference: b.id,
  }));
}
