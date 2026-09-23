/** Typed payment and wallet records. Totals are always derived. */

export const PAYMENT_STATES = [
  "authorized",
  "captured",
  "failed",
  "refunded",
  "partially_refunded",
  "voided",
] as const;
export type PaymentState = (typeof PAYMENT_STATES)[number];

export type PaymentRecord = {
  id: string;
  bookingId: string;
  customer: string;
  method: string;
  provider: "simulation" | "production";
  amount: number;
  currency: string;
  status: PaymentState;
  source: "demo" | "live" | "seed";
  timestamp: string;
  reference?: string;
};

export type WalletTx = {
  id: string;
  passengerId: string;
  bookingId?: string;
  type: "credit" | "debit" | "refund" | "reward" | "expiry" | "adjustment";
  amount: number;
  currency: string;
  timestamp: string;
  status: "posted" | "pending" | "failed";
  source: "demo" | "live" | "seed";
  reference: string;
};

const PAY_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  authorized: ["captured", "voided", "failed"],
  captured: ["refunded", "partially_refunded"],
  failed: [],
  refunded: [],
  partially_refunded: ["refunded"],
  voided: [],
};

export function canPaymentTransition(from: PaymentState, to: PaymentState) {
  return PAY_TRANSITIONS[from].includes(to);
}

export function financeTotals(payments: PaymentRecord[], wallet: WalletTx[]) {
  const by = (status: PaymentState) =>
    payments.filter((p) => p.status === status).reduce((s, p) => s + p.amount, 0);
  const walletPosted = wallet.filter((w) => w.status === "posted");
  return {
    authorized: by("authorized"),
    captured: by("captured"),
    failed: by("failed"),
    refunded: by("refunded") + by("partially_refunded"),
    voided: by("voided"),
    walletBalance: walletPosted.reduce((s, w) => {
      if (w.type === "debit" || w.type === "expiry") return s - Math.abs(w.amount);
      return s + w.amount;
    }, 0),
    paymentCount: payments.length,
    walletCount: wallet.length,
  };
}

export function paymentFromBooking(input: {
  bookingId: string;
  customer: string;
  method: string;
  amount: number;
  status: PaymentState;
  source?: PaymentRecord["source"];
}): PaymentRecord {
  return {
    id: `pay_${input.bookingId}`,
    bookingId: input.bookingId,
    customer: input.customer,
    method: input.method,
    provider: "simulation",
    amount: input.amount,
    currency: "TWD",
    status: input.status,
    source: input.source ?? "demo",
    timestamp: new Date().toISOString(),
    reference: input.bookingId,
  };
}
