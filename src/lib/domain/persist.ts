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
    refunds: [
      { id: "RF-1809", bookingId: "ZD-1809", paymentId: "sim-auth-ZD-1809", reason: "Cancelled >24h", policy: "full_refund", amount: 1680, approval: "approved", providerState: "simulation", at: "2026-09-16T14:05:00+08:00" },
    ],
    wallet: [],
    notifications: [
      { id: "N-1001", event: "booking.confirmed", audience: "passenger", channel: "in_app", language: "en", template: "Booking confirmed. The car is on the network.", status: "generated", at: "2026-09-23T12:01:00+08:00", providerConfirmed: false },
      { id: "N-1002", event: "driver.assigned", audience: "passenger", channel: "in_app", language: "zh", template: "公司已指派司機。", status: "generated", at: "2026-09-23T12:08:00+08:00", providerConfirmed: false },
      { id: "N-1003", event: "offer.accepted", audience: "ops", channel: "in_app", language: "en", template: "Driver accepted the company offer.", status: "generated", at: "2026-09-23T12:09:00+08:00", providerConfirmed: false },
      { id: "N-1004", event: "preferred.status", audience: "passenger", channel: "in_app", language: "en", template: "Preferred-driver request status changed.", status: "generated", at: "2026-09-22T18:40:00+08:00", providerConfirmed: false },
      { id: "N-1005", event: "payment.updated", audience: "finance", channel: "in_app", language: "en", template: "Payment state changed (demo ledger).", status: "generated", at: "2026-09-20T14:42:00+08:00", providerConfirmed: false },
      { id: "N-1006", event: "incident.update", audience: "ops", channel: "in_app", language: "zh", template: "進行中行程有事件更新。", status: "generated", at: "2026-09-23T19:10:00+08:00", providerConfirmed: false },
      { id: "N-1007", event: "booking.cancelled", audience: "passenger", channel: "in_app", language: "en", template: "Booking cancelled. Fee follows cancelFee().", status: "generated", at: "2026-09-16T13:20:00+08:00", providerConfirmed: false },
    ],
    audit: [
      { id: "AU-1001", at: "2026-09-23T12:00:00+08:00", actor: "passenger", action: "booking.placed", entity: "ZF-82041", detail: "Airport pickup BR156 · demo ledger" },
      { id: "AU-1002", at: "2026-09-23T12:08:00+08:00", actor: "ops", action: "dispatch.assign", entity: "D-118", detail: "Company assigned David Chen" },
      { id: "AU-1003", at: "2026-09-22T20:10:00+08:00", actor: "p4", action: "switch.requested", entity: "ZD-1805", detail: "Need MPV — company desk only" },
      { id: "AU-1004", at: "2026-09-20T14:50:00+08:00", actor: "ops", action: "ticket.resolved", entity: "TK-110", detail: "45-min free wait confirmed" },
      { id: "AU-1005", at: "2026-09-16T13:10:00+08:00", actor: "p5", action: "booking.cancelled", entity: "ZD-1809", detail: "cancelFee >24h · full refund" },
      { id: "AU-1006", at: "2026-09-22T18:30:00+08:00", actor: "ops", action: "preferred.validated", entity: "PF-01", detail: "Amara Chen → Kenji Mori under review→validated" },
    ],
    notes: [
      { id: "NT-1001", passengerId: "p1", body: "Champion · prefers English meet-and-greet at T1.", author: "Nova Lin", at: "2026-09-20T15:10:00+08:00" },
      { id: "NT-1002", passengerId: "p5", body: "Cancellation receipt requested — issued on TK-111.", author: "Nova Lin", at: "2026-09-16T14:30:00+08:00" },
      { id: "NT-1003", passengerId: "p-sarah", body: "Tape passenger · BR156 MPV + child seat. Do not privately reassign.", author: "ops", at: "2026-09-23T12:05:00+08:00" },
    ],
    translations: [
      { key: "home.headline", namespace: "passenger", source: "product", en: "The car is already on the network.", zh: "車已在網路上。", status: "approved", reviewer: "Nova", updated: "2026-09-20" },
      { key: "live.share", namespace: "passenger", source: "product", en: "Share trip", zh: "分享行程", status: "reviewed", updated: "2026-09-22" },
      { key: "ops.critical", namespace: "ops", source: "product", en: "CRITICAL", zh: "緊急", status: "draft", updated: "2026-09-21" },
      { key: "dest.tpe.faq1", namespace: "seo", source: "editorial", en: "", zh: "", status: "missing", updated: "2026-09-23" },
      { key: "nav.book", namespace: "passenger", source: "product", en: "Book", zh: "預訂", status: "approved", reviewer: "Nova", updated: "2026-09-23" },
      { key: "nav.live", namespace: "passenger", source: "product", en: "Live", zh: "即時", status: "approved", reviewer: "Nova", updated: "2026-09-23" },
      { key: "driver.duty", namespace: "driver", source: "product", en: "Duty", zh: "執勤", status: "reviewed", updated: "2026-09-23" },
      { key: "admin.crm", namespace: "admin", source: "product", en: "CRM 360", zh: "客戶 360", status: "approved", reviewer: "Nova", updated: "2026-09-23" },
      { key: "cancel.policy", namespace: "admin", source: "product", en: ">24h full refund · 6–24h partial · <6h no refund", zh: "＞24h 全退 · 6–24h 部分 · ＜6h 不退", status: "approved", reviewer: "Nova", updated: "2026-09-21" },
    ],
    preferredCases: [
      { id: "PF-01", customer: "Amara Chen", customerId: "p1", driverId: "d1", ridesTogether: 8, schedule: "weekday evenings", service: "p2p", vehicle: "premium", premiumPct: 18, status: "validated" },
      { id: "PF-02", customer: "Sarah Chen", customerId: "p-sarah", driverId: "D-118", ridesTogether: 12, schedule: "BR156 arrivals", service: "airport_pickup", vehicle: "mpv", premiumPct: 18, status: "pending" },
    ],
    incidents: [
      { id: "IN-01", bookingId: "ZF-82041", driverId: "D-118", category: "unable_to_continue", note: "Seed row — play scenario to open a live incident.", at: Date.parse("2026-09-23T19:10:00+08:00") },
    ],
    cancellations: [
      { id: "CX-1809", bookingId: "ZD-1809", hoursBefore: 28, fee: 0, refund: 1680, at: "2026-09-16T13:10:00+08:00" },
    ],
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
