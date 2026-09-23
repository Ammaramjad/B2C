"use client";

import { useMemo, useState } from "react";
import { drivers, seedSettlements } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Stat, Status } from "@/components/ui";

export default function DriverPage() {
  const { user, login, bookings, advance, grab, currency, locale, settlements } = useStore();
  const me = drivers[0];
  const [work, setWork] = useState(me.work);
  const [tab, setTab] = useState<"duty" | "jobs" | "earnings" | "vehicle" | "ratings">("duty");
  const mine = bookings.filter((b) => b.driverId === me.id);
  const incoming = bookings.filter((b) => b.status === "new" || (!b.driverId && b.status === "payment_confirmed"));
  const active = mine.find((b) => !["completed", "cancelled"].includes(b.status));
  const primary = useMemo(() => {
    if (!active) return null;
    const map: Record<string, { next: typeof active.status; label: string }> = {
      assigned: { next: "accepted", label: loc(locale, "Accept", "接單") },
      accepted: { next: "arriving", label: loc(locale, "Go to pickup", "前往接駕") },
      arriving: { next: "onboard", label: loc(locale, "Passenger onboard", "乘客上車") },
      onboard: { next: "completed", label: loc(locale, "Complete trip", "完成行程") },
    };
    return map[active.status];
  }, [active, locale]);

  if (!user || user.role !== "driver") {
    return (
      <div className="space-y-4 py-10">
        <h1 className="display text-3xl">{loc(locale, "Driver panel", "司機中心")}</h1>
        <p className="text-[var(--muted)]">{loc(locale, "Separate from the passenger panel.", "與乘客中心分開。")}</p>
        <Btn onClick={() => login("kenji@zoudian.travel", "driver")}>Kenji Mori — {loc(locale, "Open panel", "開啟面板")}</Btn>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="label">{me.plate} · fleet {me.fleet} · {me.fuel}</div>
        <h1 className="display text-4xl">{me.name}</h1>
        <p className="text-[var(--muted)]">{me.vehicle} · ★ {me.rating} · {me.trips} trips · {me.languages.join(" / ")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["duty", "jobs", "earnings", "vehicle", "ratings"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-3 py-2 text-sm capitalize ${tab === t ? "bg-[var(--surface)]" : "text-[var(--muted)]"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "duty" && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {(["available", "busy", "offline"] as const).map((w) => (
              <Btn key={w} kind={work === w ? "primary" : "ghost"} onClick={() => setWork(w)}>
                {w}
              </Btn>
            ))}
          </div>
          <LiveMap locale={locale} mode="nav" height={380} focusDriverId={me.id} pickup={active?.pickup} dropoff={active?.dropoff} eta={work} />
          <div className="grid grid-cols-2 gap-6">
            <Stat k={loc(locale, "Today", "今日")} v={money(convert(me.earningsToday, currency), currency)} />
            <Stat k={loc(locale, "Accept rate", "接單率")} v={`${Math.round(me.acceptRate * 100)}%`} />
          </div>
          {incoming.length > 0 && (
            <section>
              <h2 className="display text-2xl">{loc(locale, "Incoming (grab)", "待搶單")}</h2>
              {incoming.map((b) => (
                <div key={b.id} className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
                    <div className="text-sm text-[var(--muted)]">{b.service} · {money(convert(b.driverNet, currency), currency)} net</div>
                  </div>
                  <Btn onClick={() => grab(b.id, me.id)}>{loc(locale, "Accept", "接單")}</Btn>
                </div>
              ))}
            </section>
          )}
          {active && primary && (
            <Btn className="w-full min-h-14 pulse-cta" onClick={() => advance(active.id, primary.next)}>
              {primary.label}
            </Btn>
          )}
        </div>
      )}

      {tab === "jobs" &&
        mine.map((b) => (
          <div key={b.id} className="border-b border-[var(--border)] py-3">
            <Status kind={b.status}>{b.status}</Status>
            <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
            <p className="text-sm text-[var(--muted)]">
              {b.id} · OTP {b.otp} · {b.passengerName} · {money(convert(b.driverNet, currency), currency)} net · {b.when}
            </p>
          </div>
        ))}

      {tab === "earnings" && (
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <Stat k={loc(locale, "Today", "今日")} v={money(convert(me.earningsToday, currency), currency)} />
            <Stat k={loc(locale, "Week", "本週")} v={money(convert(me.earningsWeek, currency), currency)} />
            <Stat k={loc(locale, "Month", "本月")} v={money(convert(me.earningsMonth, currency), currency)} />
            <Stat k={loc(locale, "YTD", "年累")} v={money(convert(me.earningsYtd, currency), currency)} />
          </div>
          <p className="text-sm text-[var(--muted)]">
            {loc(locale, "Commission", "抽成")} {Math.round(me.commissionRate * 100)}% · {loc(locale, "Pending payout", "待撥")} {money(convert(me.pendingPayout, currency), currency)}
          </p>
          {(settlements.length ? settlements : seedSettlements)
            .filter((s) => s.driverId === me.id)
            .map((s) => (
              <p key={s.id}>
                {s.week} · {s.rides} rides · {money(convert(s.net, currency), currency)} · {s.status}
              </p>
            ))}
        </div>
      )}

      {tab === "vehicle" && (
        <div className="space-y-2">
          <p>{me.vehicle} · {me.plate} · {me.vehicleClass}</p>
          <p>{loc(locale, "State", "狀態")}: {me.vehicleState} · {me.fuel}</p>
          <p>{loc(locale, "License", "駕照")}: {me.license}</p>
          <p>{loc(locale, "Joined", "加入")}: {me.joined} · {me.city}</p>
          <p>{loc(locale, "Docs: license + insurance — admin review (visual).", "證件：駕照＋保險 — 後台審核（視覺）。")}</p>
        </div>
      )}

      {tab === "ratings" && (
        <div className="space-y-2">
          <p>★ {me.rating} · {me.trips} {loc(locale, "trips", "趟")}</p>
          <p>{loc(locale, "Clean / on-time / comfort / safety / value / recommend — 6 dimensions.", "潔／準／舒／安／值／推 — 六維。")}</p>
          <p>{loc(locale, "Empty km this week", "本週空車")}: {me.emptyKmWeek} km</p>
        </div>
      )}
    </div>
  );
}
