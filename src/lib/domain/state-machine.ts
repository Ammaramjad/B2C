import type { BookingStatus, Role } from "@/lib/types";

export const timelineOrder: BookingStatus[] = [
  "payment_pending",
  "payment_confirmed",
  "new",
  "assigned",
  "accepted",
  "arriving",
  "onboard",
  "completed",
];

export const statusLabel: Record<BookingStatus, { en: string; zh: string }> = {
  payment_pending: { en: "Pending payment", zh: "待付款" },
  payment_confirmed: { en: "Confirmed", zh: "已確認" },
  new: { en: "Searching driver", zh: "尋找司機" },
  assigned: { en: "Assigned", zh: "已指派" },
  accepted: { en: "En route", zh: "前往中" },
  arriving: { en: "Arrived", zh: "已到達" },
  onboard: { en: "In progress", zh: "行程中" },
  completed: { en: "Completed", zh: "已完成" },
  cancelled: { en: "Cancelled", zh: "已取消" },
};

const allowed: Partial<Record<BookingStatus, BookingStatus[]>> = {
  payment_pending: ["payment_confirmed", "cancelled"],
  payment_confirmed: ["new", "assigned", "cancelled"],
  new: ["assigned", "cancelled"],
  assigned: ["accepted", "new", "cancelled"],
  accepted: ["arriving", "cancelled"],
  arriving: ["onboard", "cancelled"],
  onboard: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus, role: Role | "system" = "system") {
  if (from === to) return true;
  if (to === "cancelled" && ["completed", "cancelled"].includes(from)) return false;
  if (role === "driver" && to === "cancelled") return false;
  if (role === "passenger" && ["assigned", "accepted", "arriving"].includes(to)) return false;
  return (allowed[from] ?? []).includes(to);
}

export function nextOperational(status: BookingStatus): BookingStatus | undefined {
  const i = timelineOrder.indexOf(status);
  if (i < 0 || i >= timelineOrder.length - 1) return undefined;
  return timelineOrder[i + 1];
}

export type AuditEvent = {
  at: string;
  actor: string;
  from: BookingStatus;
  to: BookingStatus;
};
