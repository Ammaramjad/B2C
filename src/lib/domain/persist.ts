/** Persistence boundary. Demo adapter holds operational state. Production adapter is unconfigured. */

export type PersistMode = "demo" | "production";

export type DispatchOffer = {
  id: string;
  bookingId: string;
  driverId: string;
  kind: "assignment" | "replacement" | "preferred";
  status: "open" | "accepted" | "rejected" | "expired";
  createdAt: number;
  expiresAt: number;
};

export type ShareRecord = {
  token: string;
  bookingId: string;
  createdAt: number;
  createdBy: "passenger";
};

export type RejectRecord = {
  id: string;
  driverId: string;
  bookingId: string;
  at: number;
};

export type PunctualityRecord = {
  id: string;
  driverId: string;
  bookingId: string;
  scheduledAt: string;
  arrivedAt: string;
  lateMin: number;
};

export type PaymentTx = {
  id: string;
  bookingId: string;
  customer: string;
  method: string;
  provider: "simulation" | "production";
  authorization: "authorized" | "none";
  capture: "captured" | "pending" | "voided";
  amount: number;
  currency: string;
  status: "ok" | "failed" | "refunded";
  at: string;
};

export type RefundTx = {
  id: string;
  bookingId: string;
  paymentId: string;
  reason: string;
  policy: string;
  amount: number;
  approval: "pending" | "approved" | "denied";
  providerState: "simulation";
  at: string;
};

export type WalletEntry = {
  id: string;
  passengerId: string;
  type: "credit" | "debit" | "refund" | "reward" | "expiry" | "adjustment";
  amount: number;
  ref: string;
  at: string;
  expires?: string;
};

export type NotificationLog = {
  id: string;
  event: string;
  audience: string;
  channel: "in_app" | "push" | "sms" | "email";
  language: "en" | "zh";
  template: string;
  status: "sent" | "delivered" | "failed" | "retry";
  at: string;
};

export type AuditRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
};

export type CrmNote = {
  id: string;
  passengerId: string;
  body: string;
  author: string;
  at: string;
};

export type TranslationRow = {
  key: string;
  namespace: string;
  source: string;
  en: string;
  zh: string;
  status: "MISSING" | "DRAFT" | "NEEDS REVIEW" | "APPROVED";
  reviewer?: string;
  updated: string;
};

export type PreferredCase = {
  id: string;
  customer: string;
  customerId: string;
  driverId: string;
  ridesTogether: number;
  schedule: string;
  service: string;
  vehicle: string;
  premiumPct: number;
  status: "requested" | "validating" | "offered" | "confirmed" | "declined" | "unavailable";
};

export type DomainState = {
  mode: PersistMode;
  offers: DispatchOffer[];
  shares: ShareRecord[];
  rejects: RejectRecord[];
  punctuality: PunctualityRecord[];
  payments: PaymentTx[];
  refunds: RefundTx[];
  wallet: WalletEntry[];
  notifications: NotificationLog[];
  audit: AuditRow[];
  notes: CrmNote[];
  translations: TranslationRow[];
  preferredCases: PreferredCase[];
};

export function emptyDomain(): DomainState {
  return {
    mode: "demo",
    offers: [],
    shares: [],
    rejects: [],
    punctuality: [
      { id: "PU-1", driverId: "D-118", bookingId: "ZD-1801", scheduledAt: "2026-09-20T14:40", arrivedAt: "2026-09-20T14:41", lateMin: 1 },
      { id: "PU-2", driverId: "D-118", bookingId: "ZD-1802", scheduledAt: "2026-09-15T08:10", arrivedAt: "2026-09-15T08:10", lateMin: 0 },
      { id: "PU-3", driverId: "d1", bookingId: "ZD-1805", scheduledAt: "2026-09-23T16:30", arrivedAt: "2026-09-23T16:37", lateMin: 7 },
    ],
    payments: [],
    refunds: [],
    wallet: [],
    notifications: [],
    audit: [],
    notes: [],
    translations: [
      { key: "home.headline", namespace: "passenger", source: "product", en: "The car is already on the network.", zh: "車已在網路上。", status: "APPROVED", reviewer: "Nova", updated: "2026-09-20" },
      { key: "live.share", namespace: "passenger", source: "product", en: "Share trip", zh: "分享行程", status: "NEEDS REVIEW", updated: "2026-09-22" },
      { key: "ops.critical", namespace: "ops", source: "product", en: "CRITICAL", zh: "緊急", status: "DRAFT", updated: "2026-09-21" },
      { key: "dest.tpe.faq1", namespace: "seo", source: "editorial", en: "", zh: "", status: "MISSING", updated: "2026-09-23" },
    ],
    preferredCases: [],
  };
}

export const productionPersist = {
  id: "production" as const,
  async write() {
    throw new Error("Production persistence is not configured");
  },
};
