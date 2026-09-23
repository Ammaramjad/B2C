"use client";

import { useState } from "react";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Stat } from "@/components/ui";

export default function DriverPage() {
  const { user, login, bookings, advance, grab, currency, locale } = useStore();
  const me = drivers[0];
  const [work, setWork] = useState(me.work);
  const [tab, setTab] = useState<"duty" | "job" | "pay">("duty");
  const mine = bookings.filter((b) => b.driverId === me.id);
  const incoming = bookings.find((b) => b.status === "new" || (!b.driverId && b.status === "payment_confirmed"));
  const active = mine.find((b) => !["completed", "cancelled"].includes(b.status));
  const primaryStatus = active?.status;
  const primaryActions: Record<string, { next: "accepted" | "arriving" | "onboard" | "completed"; label: string }> = {
    assigned: { next: "accepted", label: loc(locale, "Accept", "接單") },
    accepted: { next: "arriving", label: loc(locale, "Start to pickup", "前往接駕") },
    arriving: { next: "onboard", label: loc(locale, "Arrived", "已到達") },
    onboard: { next: "completed", label: loc(locale, "Complete", "完成") },
  };
  const primary = primaryStatus ? primaryActions[primaryStatus] : null;

  if (!user || user.role !== "driver") {
    return (
      <div className="space-y-4 py-10">
        <h1 className="display text-3xl">{loc(locale, "Driver", "司機")}</h1>
        <Btn onClick={() => login("kenji@zoudian.travel", "driver")}>Kenji Mori</Btn>
      </div>
    );
  }

  if (incoming && work === "available" && tab !== "pay") {
    return (
      <div className="space-y-6">
        <div className="label">{loc(locale, "New dispatch", "新派遣")}</div>
        <h1 className="display text-4xl">{incoming.pickup} → {incoming.dropoff}</h1>
        <p className="text-[var(--muted)]">{incoming.service} · {money(convert(incoming.driverNet, currency), currency)}</p>
        <Btn className="w-full min-h-14 text-lg" onClick={() => grab(incoming.id, me.id)}>
          {loc(locale, "Accept", "接單")}
        </Btn>
        <Btn kind="ghost" className="w-full" onClick={() => setTab("duty")}>
          {loc(locale, "Decline", "拒絕")}
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["duty", "job", "pay"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-3 py-2 text-sm capitalize ${tab === t ? "bg-[var(--surface)]" : "text-[var(--muted)]"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "duty" && (
        <>
          <div className="flex gap-2">
            {(["available", "busy", "offline"] as const).map((w) => (
              <Btn key={w} kind={work === w ? "primary" : "ghost"} onClick={() => setWork(w)}>
                {w}
              </Btn>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Stat k={loc(locale, "Today", "今日")} v={money(convert(me.earningsToday, currency), currency)} />
            <Stat k={loc(locale, "Trips", "趟次")} v={String(mine.filter((b) => b.status === "completed").length)} />
          </div>
          {active && (
            <button className="text-left" onClick={() => setTab("job")}>
              <div className="label">{loc(locale, "Next", "下一趟")}</div>
              <div className="display text-2xl">{active.pickup} → {active.dropoff}</div>
            </button>
          )}
        </>
      )}
      {tab === "job" && active && (
        <>
          <LiveMap locale={locale} mode="nav" height={360} focusDriverId={me.id} pickup={active.pickup} dropoff={active.dropoff} />
          <div className="display text-2xl">{active.pickup} → {active.dropoff}</div>
          <p className="text-[var(--muted)]">OTP {active.otp} · {active.status}</p>
          {primary?.next && (
            <Btn className="w-full min-h-14" onClick={() => advance(active.id, primary.next)}>
              {primary.label}
            </Btn>
          )}
        </>
      )}
      {tab === "job" && !active && <p className="text-[var(--muted)]">{loc(locale, "No active job.", "沒有進行中任務。")}</p>}
      {tab === "pay" && (
        <div className="space-y-4">
          <Stat k={loc(locale, "Week", "本週")} v={money(convert(me.earningsWeek, currency), currency)} />
          <Stat k={loc(locale, "Pending", "待撥")} v={money(convert(me.pendingPayout, currency), currency)} />
        </div>
      )}
    </div>
  );
}
