export type PayResult = {
  id: string;
  status: "authorized" | "captured" | "voided" | "refunded" | "failed";
  amount: number;
  source: "simulation" | "production";
};

export type PaymentProvider = {
  id: "simulation" | "production";
  authorize(amount: number, bookingId: string): Promise<PayResult>;
  capture(id: string, amount: number): Promise<PayResult>;
  cancelAuthorization(id: string): Promise<PayResult>;
  refund(id: string, amount: number): Promise<PayResult>;
  status(id: string): Promise<PayResult>;
};

export const simulationPaymentProvider: PaymentProvider = {
  id: "simulation",
  async authorize(amount, bookingId) {
    return { id: `sim-auth-${bookingId}`, status: "authorized", amount, source: "simulation" };
  },
  async capture(id, amount) {
    return { id, status: "captured", amount, source: "simulation" };
  },
  async cancelAuthorization(id) {
    return { id, status: "voided", amount: 0, source: "simulation" };
  },
  async refund(id, amount) {
    return { id, status: "refunded", amount, source: "simulation" };
  },
  async status(id) {
    return { id, status: "captured", amount: 0, source: "simulation" };
  },
};

export const productionPaymentProvider: PaymentProvider = {
  id: "production",
  async authorize() {
    throw new Error("Production payments are not configured — no card secrets stored");
  },
  async capture() {
    throw new Error("Production payments are not configured");
  },
  async cancelAuthorization() {
    throw new Error("Production payments are not configured");
  },
  async refund() {
    throw new Error("Production payments are not configured");
  },
  async status() {
    throw new Error("Production payments are not configured");
  },
};

export function resolvePaymentProvider(id = process.env.NEXT_PUBLIC_PAY_PROVIDER ?? "simulation"): PaymentProvider {
  return id === "production" ? productionPaymentProvider : simulationPaymentProvider;
}
