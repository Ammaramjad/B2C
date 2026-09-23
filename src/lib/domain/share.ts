import type { Booking } from "../types.ts";
import type { LiveSnapshot } from "../live/types.ts";
import type { ShareRecord } from "./persist.ts";

export const SHARE_TTL_MS = 24 * 60 * 60 * 1000;

export function mintShareToken(bookingId: string, now = Date.now()): ShareRecord {
  const token = `sh_${bookingId.replace(/[^A-Za-z0-9]/g, "")}_${Math.random().toString(36).slice(2, 10)}`;
  return { token, bookingId, createdAt: now, expiresAt: now + SHARE_TTL_MS, createdBy: "passenger" };
}

export function sharePath(token: string) {
  return `/share/${token}`;
}

export type ShareResolution = "ok" | "unknown" | "expired";

export function resolveShare(token: string | undefined, shares: ShareRecord[], now = Date.now()) {
  if (!token) return { status: "unknown" as ShareResolution, record: null };
  const record = shares.find((s) => s.token === token) ?? null;
  if (!record) return { status: "unknown" as ShareResolution, record: null };
  if (record.expiresAt && record.expiresAt <= now) return { status: "expired" as ShareResolution, record };
  return { status: "ok" as ShareResolution, record };
}

export function publicShareView(booking: Booking | null, live: LiveSnapshot | null, bookingId: string) {
  return {
    bookingId,
    pickup: booking?.pickup ?? live?.pickup ?? "—",
    dropoff: booking?.dropoff ?? live?.dropoff ?? "—",
    flight: booking?.flight ?? live?.flight ?? "—",
    phase: live?.phase?.replaceAll("_", " ") ?? booking?.status ?? "—",
    driverLabel: live?.assignedId || booking?.driverId ? "Company driver assigned" : "Company matching",
    etaMin: live?.etaMin ?? null,
  };
}
