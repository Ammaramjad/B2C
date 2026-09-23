"use client";

import { useState } from "react";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Button } from "@/components/system";
import { statusLabel } from "@/lib/domain/state-machine";

export default function DriverHomePage() {
  const { user, login, bookings, currency, locale } = useStore();
  const me = drivers[0];
  const [work, setWork] = useState(me.work);
  const mine = bookings.filter((b) => b.driverId === me.id);
  const next = mine.find((b) => !["completed", "cancelled"].includes(b.status));
  const incoming = bookings.find((b) => b.status === "new" || (!b.driverId && b.status === "payment_confirmed"));

  if (!user || user.role !== "driver") {
    return (
      <div className="space-y-4 py-8">
        <h1 className="display text-3xl">{loc(locale, "Driver workspace", "司機工作臺")}</h1>
        <p className="text-[var(--text-secondary)]">{loc(locale, "Demo sign-in as Kenji Mori.", "示範登入 Kenji Mori。")}</p>
        <Button onClick={() => login("kenji@zoudian.travel", "driver")}>Kenji Mori</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="label">{work === "available" ? loc(locale, "Online", "上線") : work === "busy" ? loc(locale, "Busy", "忙碌") : loc(locale, "Offline", "離線")}</p>
        <h1 className="display text-4xl">{me.name}</h1>
      </div>
      <div className="flex gap-2">
        {(["available", "busy", "offline"] as const).map((w) => (
          <Button key={w} kind={work === w ? "primary" : "ghost"} onClick={() => setWork(w)}>
            {w}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="label">{loc(locale, "Today", "今日")}</div>
          <div className="metric text-3xl">{money(convert(me.earningsToday, currency), currency)}</div>
        </div>
        <div>
          <div className="label">{loc(locale, "Completed this week", "本週完成")}</div>
          <div className="metric text-3xl">{me.completedWeek}</div>
        </div>
      </div>
      {incoming && work === "available" && (
        <div className="border-t border-[var(--border)] pt-4">
          <div className="label">{loc(locale, "Incoming offer", "新派遣")}</div>
          <p className="display text-2xl">{incoming.pickup} → {incoming.dropoff}</p>
          <Button href="/driver/offer" className="mt-3 w-full">{loc(locale, "Review offer", "查看派遣")}</Button>
        </div>
      )}
      {next && (
        <div className="border-t border-[var(--border)] pt-4">
          <div className="label">{loc(locale, "Next job", "下一趟")}</div>
          <p className="display text-2xl">{next.pickup} → {next.dropoff}</p>
          <p className="text-sm text-[var(--text-secondary)]">{locale === "zh" ? statusLabel[next.status].zh : statusLabel[next.status].en} · {next.when}</p>
          <Button href="/driver/trip" kind="ghost" className="mt-3">{loc(locale, "Open active trip", "開啟進行中任務")}</Button>
        </div>
      )}
      {!next && !incoming && <p className="text-[var(--text-secondary)]">{loc(locale, "No assignment. Stay online.", "目前沒有任務。保持上線。")}</p>}
    </div>
  );
}
