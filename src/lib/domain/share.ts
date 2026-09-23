import type { ShareRecord } from "./persist.ts";

export function mintShareToken(bookingId: string): ShareRecord {
  const token = `sh_${bookingId.replace(/[^A-Za-z0-9]/g, "")}_${Math.random().toString(36).slice(2, 8)}`;
  return { token, bookingId, createdAt: Date.now(), createdBy: "passenger" };
}

export function sharePath(token: string) {
  return `/share/${token}`;
}
