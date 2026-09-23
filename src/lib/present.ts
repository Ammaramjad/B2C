import { extras, services, taxis, vehicles } from "./catalog";
import type { Booking, BookingStatus, ExtraId, Locale, ServiceType } from "./types";

export function tx(locale: Locale, en: string, zh: string) {
  return locale === "zh" ? zh : en;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatWhen(when: string) {
  const m = when.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return when || "—";
  return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]} · ${m[4]}:${m[5]}`;
}

export function serviceLabel(id: ServiceType, locale: Locale) {
  const s = services.find((x) => x.id === id);
  return locale === "zh" ? (s?.zh ?? id) : (s?.en ?? id);
}

const statusEn: Record<BookingStatus, string> = {
  payment_pending: "Payment pending",
  payment_confirmed: "Payment confirmed",
  new: "New",
  assigned: "Assigned",
  accepted: "Accepted",
  arriving: "Driver en route",
  onboard: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusZh: Record<BookingStatus, string> = {
  payment_pending: "待付款",
  payment_confirmed: "已付款",
  new: "新訂單",
  assigned: "已指派",
  accepted: "司機已接單",
  arriving: "司機前往中",
  onboard: "行程中",
  completed: "已完成",
  cancelled: "已取消",
};

export function statusLabel(status: BookingStatus, locale: Locale) {
  return locale === "zh" ? statusZh[status] : statusEn[status];
}

export type TripBucket = "upcoming" | "active" | "completed" | "cancelled";

export function tripBucket(status: BookingStatus): TripBucket {
  if (status === "cancelled") return "cancelled";
  if (status === "completed") return "completed";
  if (status === "onboard" || status === "arriving") return "active";
  return "upcoming";
}

export function vehicleLabel(id: string, locale: Locale) {
  const v = vehicles.find((x) => x.id === id);
  if (v) return locale === "zh" ? v.nameZh : v.name;
  const taxi = taxis.find((x) => x.id === id);
  if (taxi) return locale === "zh" ? taxi.nameZh : taxi.name;
  if (id === "yaris") return "Toyota Yaris";
  if (id === "cross") return "Corolla Cross";
  if (id === "sienta") return "Toyota Sienta";
  return id;
}

export function extraName(id: ExtraId, locale: Locale) {
  const e = extras.find((x) => x.id === id);
  return locale === "zh" ? (e?.nameZh ?? id) : (e?.name ?? id);
}

export function channelLabel(channel: Booking["channel"], locale: Locale) {
  const map: Record<Booking["channel"], [string, string]> = {
    web: ["Website", "官網"],
    app: ["Traveler app", "旅客 App"],
    dispatch: ["Manual dispatch", "人工調度"],
    taxi: ["Instant taxi", "即時叫車"],
    hourly: ["Charter desk", "包車"],
    rental: ["Self-drive desk", "自駕"],
  };
  const pair = map[channel];
  return locale === "zh" ? pair[1] : pair[0];
}

export const places = [
  "TPE Terminal 1 Arrivals",
  "TPE Terminal 2 Arrivals",
  "TPE Terminal 1 Departures",
  "TPE Terminal 2 Departures",
  "Taipei Songshan TSA",
  "Taipei 101",
  "Taipei Main Station",
  "Da'an",
  "Da'an Park",
  "Beitou",
  "Banqiao",
  "Xinyi",
  "Jiufen",
  "Tamsui",
  "Kaohsiung Airport KHH",
  "Kenting",
  "Nangang depot",
  "Taichung RMQ",
];

export const designateRules = [
  { id: "standard" as const, en: "Company dispatch", zh: "公司調度", note: "Fleet priority A, then B, then C.", pct: 0 },
  { id: "preferred" as const, en: "Preferred driver", zh: "指定司機", note: "Configurable premium, baseline +15–20%.", pct: 0.18 },
  { id: "timeslot" as const, en: "Time-slot driver", zh: "時段指定", note: "Configurable premium, baseline +10–15%.", pct: 0.12 },
  { id: "premium" as const, en: "Premium vehicle hold", zh: "指定高級車", note: "Configurable premium, baseline +20–30%.", pct: 0.25 },
];
