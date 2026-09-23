export type NotifyDelivery = "generated" | "queued" | "sent" | "delivered" | "failed";

export type NotifyTemplate = {
  event: string;
  audience: "passenger" | "driver" | "ops" | "finance";
  channel: "in_app" | "push" | "sms" | "email";
  en: string;
  zh: string;
};

export const NOTIFY_TEMPLATES: NotifyTemplate[] = [
  { event: "booking.confirmed", audience: "passenger", channel: "in_app", en: "Booking confirmed. The car is on the network.", zh: "訂單已確認，車輛已在網路上。" },
  { event: "driver.assigned", audience: "passenger", channel: "in_app", en: "A company driver has been assigned.", zh: "公司已指派司機。" },
  { event: "driver.changed", audience: "passenger", channel: "push", en: "Your assigned vehicle has changed due to an operational issue.", zh: "因營運因素，指派車輛已更換。" },
  { event: "offer.accepted", audience: "ops", channel: "in_app", en: "Driver accepted the company offer.", zh: "司機已接受公司指派。" },
  { event: "incident.update", audience: "ops", channel: "in_app", en: "Incident update on an active movement.", zh: "進行中行程有事件更新。" },
  { event: "preferred.status", audience: "passenger", channel: "in_app", en: "Preferred-driver request status changed.", zh: "指定司機申請狀態已更新。" },
  { event: "payment.updated", audience: "finance", channel: "in_app", en: "Payment state changed (demo ledger).", zh: "付款狀態已變更（示範帳本）。" },
  { event: "booking.cancelled", audience: "passenger", channel: "in_app", en: "Booking cancelled. Fee follows cancelFee().", zh: "訂單已取消，費用依 cancelFee()。" },
  { event: "trip.shared", audience: "passenger", channel: "in_app", en: "A recipient-safe share link was created.", zh: "已建立可分享的行程連結。" },
];

export function templateFor(event: string) {
  return NOTIFY_TEMPLATES.find((t) => t.event === event) ?? null;
}

export function previewNotification(event: string, locale: "en" | "zh") {
  const t = templateFor(event);
  if (!t) return null;
  return {
    event,
    channel: t.channel,
    audience: t.audience,
    body: locale === "zh" ? t.zh : t.en,
    status: "generated" as NotifyDelivery,
    note: "Demo preview only. No SMS/email/push was delivered.",
  };
}
