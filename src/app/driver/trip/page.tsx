"use client";

import { drivers } from "@/lib/data";
import { nextOperational, statusLabel } from "@/lib/domain/state-machine";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Alert, Button, EmptyState } from "@/components/system";
import { OpsMap } from "@/components/ops-map";

export default function DriverTripPage() {
  const { user, bookings, advance, locale } = useStore();
  const me = drivers[0];
  const active = bookings.find((b) => b.driverId === me.id && !["completed", "cancelled"].includes(b.status));
  const next = active ? nextOperational(active.status) : undefined;

  if (!user || user.role !== "driver") {
    return <EmptyState title={loc(locale, "Driver only", "僅限司機")} body="" action={<Button href="/driver">{loc(locale, "Sign in", "登入")}</Button>} />;
  }
  if (!active) {
    return <EmptyState title={loc(locale, "No active trip", "沒有進行中任務")} body={loc(locale, "Accepted jobs appear here with one primary action.", "已接任務會顯示在這裡。")} action={<Button href="/driver">{loc(locale, "Today", "今日")}</Button>} />;
  }

  const action =
    active.status === "assigned"
      ? loc(locale, "Accept / start to pickup", "接單／前往")
      : active.status === "accepted"
        ? loc(locale, "Mark arrived", "標記到達")
        : active.status === "arriving"
          ? loc(locale, "Start trip (OTP with passenger)", "開始行程（與乘客核對 OTP）")
          : loc(locale, "Complete trip", "完成行程");

  return (
    <div className="space-y-5">
      <OpsMap locale={locale} height={240} pickup={active.pickup} dropoff={active.dropoff} />
      <p className="label">{locale === "zh" ? statusLabel[active.status].zh : statusLabel[active.status].en}</p>
      <h1 className="display text-3xl">{active.pickup} → {active.dropoff}</h1>
      <p className="text-[var(--text-secondary)]">OTP {active.otp}{active.flight ? ` · ${active.flight}` : ""}</p>
      <Alert tone="info">{loc(locale, "Navigation is a map adapter fallback — open an external nav app in production.", "導航為地圖後備。正式環境應開啟外部導航。")}</Alert>
      {next && (
        <Button className="min-h-14 w-full text-lg" onClick={() => advance(active.id, next)}>
          {action}
        </Button>
      )}
    </div>
  );
}
