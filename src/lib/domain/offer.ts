/** Formal driver-offer state machine. Countdown must derive from offerExpiresAt. */

export const OFFER_STATES = ["created", "offered", "viewed", "accepted", "rejected", "expired", "withdrawn"] as const;
export type OfferState = (typeof OFFER_STATES)[number];

const TERMINAL: OfferState[] = ["accepted", "rejected", "expired", "withdrawn"];

export const OFFER_TRANSITIONS: Record<OfferState, OfferState[]> = {
  created: ["offered", "withdrawn"],
  offered: ["viewed", "accepted", "rejected", "expired", "withdrawn"],
  viewed: ["accepted", "rejected", "expired", "withdrawn"],
  accepted: [],
  rejected: [],
  expired: [],
  withdrawn: [],
};

export function canOfferTransition(from: OfferState | null | undefined, to: OfferState) {
  if (!from) return to === "created" || to === "offered";
  return OFFER_TRANSITIONS[from].includes(to);
}

export function isTerminalOffer(state: OfferState | null | undefined) {
  return !!state && TERMINAL.includes(state);
}

export function remainSec(expiresAt: number | null | undefined, now = Date.now()) {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}

export function isOfferExpired(expiresAt: number | null | undefined, now = Date.now()) {
  return !!expiresAt && expiresAt <= now;
}

export function assertOfferTransition(from: OfferState | null | undefined, to: OfferState) {
  if (!canOfferTransition(from, to)) {
    throw new Error(`Invalid offer transition: ${from ?? "none"} → ${to}`);
  }
}

export function nextOfferState(
  from: OfferState | null | undefined,
  to: OfferState,
  expiresAt: number | null | undefined,
  now = Date.now(),
): OfferState | null {
  if (to === "accepted" && isOfferExpired(expiresAt, now)) return null;
  if (to === "expired" && from && TERMINAL.includes(from) && from !== "expired") return null;
  if (!canOfferTransition(from, to)) return null;
  return to;
}
