"use client";

import { useState } from "react";
import Link from "next/link";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Stat } from "@/components/ui";

export default function DriverDashboard() {
  const { user, login, bookings, currency, locale } = useStore();
  const me = drivers[0];
  const [work, setWork] = useState(me.work);
  const mine = bookings.filter((b) => b.driverId === me.id);
  const incoming = bookings.find((b) => b.status === "new" || (!b.driverId && b.status === "payment_confirmed"));
  const active = mine.find((b) => !["completed", "cancelled"].includes(b.status));

  if (!user || user.role !== "driver") {
    return (
      <div className="space-y-4 py-10">
        <h1 className="display text-3xl">{loc(locale, "Driver dashboard", "司機後台")}</h1>
        <p className="text-[var(--muted)]">{loc(locale, "Separate from the customer app. Jobs and pay only.", "與旅客 App 分開。只處理任務與收入。")}</p>
        <Btn onClick={() => login("kenji@zoudian.travel", "driver")}>Kenji Mori</Btn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="label">{work}</div>
        <h1 className="display text-4xl">{me.name}</h1>
        <p className="text-[var(--muted)]">{me.vehicle} · {me.plate} · fleet {me.fleet}</p>
      </header>
      <div className="flex gap-2">
        {(["available", "busy", "offline"] as const).map((w) => (
          <Btn key={w} kind={work === w ? "primary" : "ghost"} onClick={() => setWork(w)}>{w}</Btn>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Stat k={loc(locale, "Today", "今日")} v={money(convert(me.earningsToday, currency), currency)} />
        <Stat k={loc(locale, "Trips this week", "本週趟次")} v={String(me.completedWeek)} />
        <Stat k={loc(locale, "Accept rate", "接單率")} v={`${Math.round(me.acceptRate * 100)}%`} />
        <Stat k={loc(locale, "Pending", "待撥")} v={money(convert(me.pendingPayout, currency), currency)} />
      </div>
      {incoming && (
        <section className="elevated rounded-2xl p-5">
          <div className="label">{loc(locale, "New offer", "新派遣")}</div>
          <div className="display text-2xl">{incoming.pickup} → {incoming.dropoff}</div>
          <Btn href="/driver/jobs" className="mt-3 w-full">{loc(locale, "Open jobs panel", "開啟任務面板")}</Btn>
        </section>
      )}
      {active && (
        <Link href="/driver/jobs" className="block">
          <div className="label">{loc(locale, "Active job", "進行中")}</div>
          <div className="display text-2xl">{active.pickup} → {active.dropoff}</div>
        </Link>
      )}
      <div className="flex gap-3 text-sm">
        <Link href="/driver/jobs">{loc(locale, "All jobs", "全部任務")}</Link>
        <Link href="/driver/pay">{loc(locale, "Settlement", "結算")}</Link>
      </div>
    </div>
  );
}
