"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Alert, Button, EmptyState } from "@/components/system";

export default function DriverOfferPage() {
  const { user, bookings, grab, locale, currency } = useStore();
  const router = useRouter();
  const me = drivers[0];
  const incoming = bookings.find((b) => b.status === "new" || (!b.driverId && b.status === "payment_confirmed"));
  const [left, setLeft] = useState(45);

  useEffect(() => {
    if (!incoming) return;
    const t = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(t);
  }, [incoming]);

  if (!user || user.role !== "driver") {
    return <EmptyState title={loc(locale, "Driver only", "僅限司機")} body={loc(locale, "Sign in from Driver home.", "請從司機首頁登入。")} action={<Button href="/driver">{loc(locale, "Driver home", "司機首頁")}</Button>} />;
  }

  if (!incoming) {
    return <EmptyState title={loc(locale, "No open offer", "沒有待接派遣")} body={loc(locale, "New jobs appear here with a countdown. Timeout returns the booking to dispatch.", "新任務會倒數出現。逾時退回調度。")} action={<Button href="/driver">{loc(locale, "Back", "返回")}</Button>} />;
  }

  return (
    <div className="space-y-6">
      <p className="label">{loc(locale, "Offer expires", "派遣倒數")} · {left}s</p>
      <h1 className="display text-4xl">{incoming.pickup} → {incoming.dropoff}</h1>
      <p className="text-[var(--text-secondary)]">
        {incoming.service} · {incoming.when} · {money(convert(incoming.driverNet, currency), currency)} {loc(locale, "driver net (demo)", "司機淨收（示範）")}
      </p>
      {incoming.flight && <Alert tone="info">{loc(locale, "Flight", "航班")} {incoming.flight}</Alert>}
      <Alert tone="info">{loc(locale, "Countdown is a demo timer, not a production offer clock.", "倒數為示範計時，非正式要約時鐘。")}</Alert>
      <div className="flex flex-col gap-3">
        <Button
          className="min-h-14 w-full text-lg"
          disabled={left === 0}
          title={left === 0 ? loc(locale, "Offer timed out", "派遣已逾時") : undefined}
          onClick={() => {
            grab(incoming.id, me.id);
            router.push("/driver/trip");
          }}
        >
          {loc(locale, "Accept", "接單")}
        </Button>
        <Button kind="ghost" className="w-full" href="/driver">{loc(locale, "Decline — return to dispatch", "拒絕 — 退回調度")}</Button>
      </div>
    </div>
  );
}
