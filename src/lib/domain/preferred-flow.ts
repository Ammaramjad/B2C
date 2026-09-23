/** Preferred-company workflow. Confirmation is never immediate. */

export const PREFERRED_STATES = [
  "pending",
  "under_review",
  "validated",
  "company_offered",
  "driver_offered",
  "confirmed",
  "rejected",
  "expired",
  "cancelled",
] as const;

export type PreferredWorkflow = (typeof PREFERRED_STATES)[number];

export const PREFERRED_ALIASES: Record<string, PreferredWorkflow> = {
  draft: "pending",
  requested: "pending",
  validating: "under_review",
  offered: "company_offered",
  declined: "rejected",
  unavailable: "expired",
};

export const PREFERRED_TRANSITIONS: Record<PreferredWorkflow, PreferredWorkflow[]> = {
  pending: ["under_review", "rejected", "cancelled", "expired"],
  under_review: ["validated", "company_offered", "rejected", "cancelled", "expired"],
  validated: ["company_offered", "rejected", "cancelled", "expired"],
  company_offered: ["driver_offered", "confirmed", "rejected", "expired", "cancelled"],
  driver_offered: ["confirmed", "rejected", "expired", "cancelled"],
  confirmed: [],
  rejected: [],
  expired: [],
  cancelled: [],
};

export function normalizePreferred(status: string | null | undefined): PreferredWorkflow | null {
  if (!status) return null;
  if ((PREFERRED_STATES as readonly string[]).includes(status)) return status as PreferredWorkflow;
  return PREFERRED_ALIASES[status] ?? null;
}

export function canPreferredTransition(from: string | null | undefined, to: string) {
  const a = normalizePreferred(from);
  const b = normalizePreferred(to);
  if (!b) return false;
  if (!a) return b === "pending";
  return PREFERRED_TRANSITIONS[a].includes(b);
}

export function preferredStepLabel(status: PreferredWorkflow) {
  const labels: Record<PreferredWorkflow, string> = {
    pending: "Request received by Zoufeng",
    under_review: "Ops reviewing availability / vehicle / schedule",
    validated: "Company validation passed",
    company_offered: "Official company offer issued",
    driver_offered: "Offer on the driver desk",
    confirmed: "Preferred driver confirmed",
    rejected: "Request rejected",
    expired: "Request expired",
    cancelled: "Request cancelled",
  };
  return labels[status];
}
