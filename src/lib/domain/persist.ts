/** Persistence boundary. Demo adapter holds operational state. Production adapter is unconfigured. */

import type { PaymentRecord, WalletTx } from "./payments.ts";
import type { NotifyDelivery } from "./notify.ts";
import type { PreferredWorkflow } from "./preferred-flow.ts";
import type { OfferState } from "./offer.ts";

export type PersistMode = "demo" | "production";

export type DispatchOffer = {
  id: string;
  bookingId: string;
  driverId: string;
  kind: "assignment" | "replacement" | "preferred";
  status: OfferState;
  createdAt: number;
  expiresAt: number;
  viewedAt?: number;
};

export type ShareRecord = {
  token: string;
  bookingId: string;
  createdAt: number;
  expiresAt: number;
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

export type PaymentTx = PaymentRecord;

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

export type WalletEntry = WalletTx;

export type NotificationLog = {
  id: string;
  event: string;
  audience: string;
  channel: "in_app" | "push" | "sms" | "email";
  language: "en" | "zh";
  template: string;
  status: NotifyDelivery;
  at: string;
  providerConfirmed: boolean;
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
  status: "missing" | "draft" | "reviewed" | "approved" | "MISSING" | "DRAFT" | "NEEDS REVIEW" | "APPROVED";
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
  status: PreferredWorkflow;
};

export type IncidentRecord = {
  id: string;
  bookingId: string;
  driverId: string;
  category: string;
  note: string;
  at: number;
};

export type CancellationRecord = {
  id: string;
  bookingId: string;
  hoursBefore: number;
  fee: number;
  refund: number;
  at: string;
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
  incidents: IncidentRecord[];
  cancellations: CancellationRecord[];
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
      { key: "home.headline", namespace: "passenger", source: "product", en: "The car is already on the network.", zh: "車已在網路上。", status: "approved", reviewer: "Nova", updated: "2026-09-20" },
      { key: "live.share", namespace: "passenger", source: "product", en: "Share trip", zh: "分享行程", status: "reviewed", updated: "2026-09-22" },
      { key: "ops.critical", namespace: "ops", source: "product", en: "CRITICAL", zh: "緊急", status: "draft", updated: "2026-09-21" },
      { key: "dest.tpe.faq1", namespace: "seo", source: "editorial", en: "", zh: "", status: "missing", updated: "2026-09-23" },
    ],
    preferredCases: [],
    incidents: [],
    cancellations: [],
  };
}

export type PersistAdapter = {
  id: PersistMode;
  load(): Promise<DomainState | null>;
  save(state: DomainState): Promise<void>;
};

export const demoPersist: PersistAdapter = {
  id: "demo",
  async load() {
    return null;
  },
  async save() {
    /* browser store writes DomainState through StoreProvider */
  },
};

export const productionPersist: PersistAdapter = {
  id: "production",
  async load() {
    throw new Error("Production persistence is not configured");
  },
  async save() {
    throw new Error("Production persistence is not configured");
  },
  async write() {
    throw new Error("Production persistence is not configured");
  },
} as PersistAdapter & { write(): Promise<never> };
