export type Perm =
  | "booking.view"
  | "booking.create"
  | "booking.modify"
  | "booking.cancel"
  | "booking.refund"
  | "booking.assign"
  | "driver.approve"
  | "driver.suspend"
  | "dispatch.manual"
  | "dispatch.override"
  | "pricing.manage"
  | "payment.refund"
  | "settlement.manage"
  | "customer.manage"
  | "complaint.manage"
  | "analytics.view"
  | "system.configure";

export type OrgRole =
  | "super_admin"
  | "admin"
  | "operations"
  | "dispatcher"
  | "cs"
  | "finance"
  | "fleet"
  | "driver"
  | "partner"
  | "customer";

export const ROLE_PERMS: Record<OrgRole, Perm[]> = {
  super_admin: [
    "booking.view", "booking.create", "booking.modify", "booking.cancel", "booking.refund", "booking.assign",
    "driver.approve", "driver.suspend", "dispatch.manual", "dispatch.override", "pricing.manage",
    "payment.refund", "settlement.manage", "customer.manage", "complaint.manage", "analytics.view", "system.configure",
  ],
  admin: [
    "booking.view", "booking.modify", "booking.cancel", "booking.refund", "booking.assign",
    "driver.approve", "driver.suspend", "dispatch.manual", "dispatch.override", "pricing.manage",
    "payment.refund", "settlement.manage", "customer.manage", "complaint.manage", "analytics.view", "system.configure",
  ],
  operations: ["booking.view", "booking.modify", "booking.assign", "dispatch.manual", "dispatch.override", "analytics.view"],
  dispatcher: ["booking.view", "booking.assign", "dispatch.manual"],
  cs: ["booking.view", "complaint.manage", "customer.manage"],
  finance: ["booking.view", "payment.refund", "settlement.manage", "analytics.view"],
  fleet: ["booking.view", "driver.approve", "driver.suspend"],
  driver: ["booking.view"],
  partner: ["booking.view"],
  customer: ["booking.create", "booking.cancel", "booking.view"],
};

export interface PricingRules {
  nightPct: number;
  surgePct: number;
  hourlyRate: number;
  meet: number;
  childSeat: number;
  english: number;
  pet: number;
  waitMinutes: number;
  cancelFreeHours: number;
  cancelMidHours: number;
  cancelMidPct: number;
  commission: number;
  fleetOrder: string;
}

export const defaultRules: PricingRules = {
  nightPct: 20,
  surgePct: 15,
  hourlyRate: 880,
  meet: 150,
  childSeat: 200,
  english: 120,
  pet: 200,
  waitMinutes: 45,
  cancelFreeHours: 24,
  cancelMidHours: 6,
  cancelMidPct: 50,
  commission: 20,
  fleetOrder: "A > B > C",
};

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
}

export interface Incident {
  id: string;
  bookingId?: string;
  level: "critical" | "attention" | "info";
  kind: string;
  note: string;
  at: string;
}

export const BOOKING_FLOW = ["payment_pending", "payment_confirmed", "new", "assigned", "accepted", "arriving", "onboard", "completed"] as const;

export const orgPeople: { role: OrgRole; name: string; email: string }[] = [
  { role: "super_admin", name: "Nova Lin", email: "nova@zoudian.travel" },
  { role: "dispatcher", name: "Desk Chen", email: "desk@zoudian.travel" },
  { role: "cs", name: "Halo CS", email: "cs@zoudian.travel" },
  { role: "finance", name: "Mei Finance", email: "fin@zoudian.travel" },
  { role: "fleet", name: "Wei Fleet", email: "fleet@zoudian.travel" },
  { role: "driver", name: "Kenji Mori", email: "kenji@zoudian.travel" },
  { role: "customer", name: "Amara Chen", email: "amara@zoudian.travel" },
];
