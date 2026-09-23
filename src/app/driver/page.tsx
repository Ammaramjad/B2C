"use client";

import { useState } from "react";
import { drivers, seedSettlements } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { AreaChart } from "@/components/charts";
import { LiveMap } from "@/components/live-map";
import { Btn, Panel, Stat } from "@/components/ui";

export default function DriverPage() {
  const { user, login, bookings, advance, currency, locale, settlements } = useStore();
  const me = drivers[0];
  const [online, setOnline] = useState(true);
  const zh = locale === "zh";
  const mine = bookings.filter((b) => b.driverId === me.id);
  const incoming = mine.filter((b) => ["confirmed", "assigned"].includes(b.status));
  const active = mine.filter((b) => ["en_route", "arrived", "in_progress"].includes(b.status));
  const done = mine.filter((b) => b.status === "completed");
  const week = settlements.length ? settlements : seedSettlements;
  const mySettle = week.filter((s) => s.driverId === me.id);

  if (!user || user.role !== "driver") {
    return (
      <Panel className="space-y-4">
        <h1 className="display text-3xl">{loc(locale, "Driver gate", "司機入口")}</h1>
        <Btn onClick={() => login("kenji@zoufeng.travel", "driver")}>
          {loc(locale, "Enter as Kenji Mori", "以森 健司進入")}
        </Btn>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">
            {loc(locale, "Driver dashboard", "司機儀表板")}
          </div>
          <h1 className="display text-4xl">{zh ? me.nameZh : me.name}</h1>
          <p className="text-sm text-white/50">
            {me.plate} · {me.vehicle} · ★ {me.rating} · {me.trips} {loc(locale, "lifetime rides", "歷史趟次")}
          </p>
        </div>
        <Btn kind={online ? "primary" : "ghost"} onClick={() => setOnline((v) => !v)}>
          {online ? loc(locale, "Online · receiving", "上線 · 接單中") : loc(locale, "Offline", "離線")}
        </Btn>
      </div>

      <LiveMap
        locale={locale}
        mode="nav"
        height={380}
        focusDriverId={me.id}
        pickup={loc(locale, "Your live nav", "即時導航")}
        dropoff={active[0] ? (zh ? active[0].dropoffZh : active[0].dropoff) : loc(locale, "Awaiting job", "等待任務")}
        eta={online ? loc(locale, "Receiving · GPS locked", "接單中 · GPS 鎖定") : loc(locale, "Offline", "離線")}
      />

      <Panel className="neon">
        <AreaChart
          label={loc(locale, "7-day earnings pulse", "7 日收入曲線")}
          values={[4.1, 5.2, 4.8, 6.1, 5.6, 6.8, 6.2]}
        />
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat k={loc(locale, "Today earned", "今日收入")} v={money(convert(me.earningsToday, currency), currency)} />
        <Stat
          k={loc(locale, "Week earned", "本週收入")}
          v={money(convert(me.earningsWeek, currency), currency)}
          d={`${me.completedWeek} ${loc(locale, "rides", "趟")} · ${me.cancelledWeek} ${loc(locale, "cancel", "取消")}`}
        />
        <Stat k={loc(locale, "Month", "本月")} v={money(convert(me.earningsMonth, currency), currency)} />
        <Stat
          k={loc(locale, "Pending payout", "待撥款")}
          v={money(convert(me.pendingPayout, currency), currency)}
          d={loc(locale, "Weekly settlement", "週結")}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat k={loc(locale, "Inbound now", "待接")} v={String(incoming.length)} />
        <Stat k={loc(locale, "Active", "進行中")} v={String(active.length)} />
        <Stat k={loc(locale, "Completed in ledger", "帳本完成")} v={String(done.length)} />
        <Stat k={loc(locale, "YTD", "今年")} v={money(convert(me.earningsYtd, currency), currency)} />
      </div>

      <Panel>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
          {loc(locale, "Accept / empty miles / commission", "接單／空駛／抽成")}
        </div>
        <div className="mt-2 grid gap-2 text-sm text-white/65 md:grid-cols-3">
          <div>{loc(locale, "Accept rate", "接單率")} {(me.acceptRate * 100).toFixed(0)}%</div>
          <div>{loc(locale, "Empty km this week", "本週空駛")} {me.emptyKmWeek} km</div>
          <div>{loc(locale, "Company commission", "公司抽成")} {(me.commissionRate * 100).toFixed(0)}%</div>
        </div>
      </Panel>

      <section className="space-y-3">
        <h2 className="display text-2xl">{loc(locale, "Jobs", "任務")}</h2>
        {mine.length === 0 && <Panel>{loc(locale, "No jobs in ledger.", "帳本尚無任務。")}</Panel>}
        {mine.map((b) => (
          <Panel key={b.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                {b.id} · {b.status} · OTP {b.otp}
              </div>
              <div className="display text-xl">
                {zh ? b.pickupZh : b.pickup} → {zh ? b.dropoffZh : b.dropoff}
              </div>
              <div className="text-sm text-white/50">
                {b.when.replace("T", " · ")} · {loc(locale, "gross", "總額")} {money(convert(b.price, currency), currency)} ·{" "}
                {loc(locale, "your net", "你的淨收")} {money(convert(b.driverNet, currency), currency)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn kind="ghost" href={`https://maps.google.com/?q=${encodeURIComponent(b.dropoff)}`}>
                {loc(locale, "Navigate", "導航")}
              </Btn>
              {b.status !== "completed" && b.status !== "cancelled" && (
                <Btn onClick={() => advance(b.id)}>{loc(locale, "Accept / next", "接單／下一步")}</Btn>
              )}
            </div>
          </Panel>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="display text-2xl">{loc(locale, "Weekly statements", "週結單")}</h2>
        {mySettle.map((s) => (
          <Panel key={s.id} className="flex justify-between">
            <div>
              <div className="display text-xl">{s.week}</div>
              <div className="text-sm text-white/50">
                {s.rides} {loc(locale, "rides", "趟")} · {s.status}
              </div>
            </div>
            <div className="text-right text-sm">
              <div>
                {loc(locale, "Gross", "總額")} {money(convert(s.gross, currency), currency)}
              </div>
              <div>
                {loc(locale, "Fee", "抽成")} {money(convert(s.commission, currency), currency)}
              </div>
              <div className="display text-lg">{money(convert(s.net, currency), currency)}</div>
            </div>
          </Panel>
        ))}
      </section>

      <a href="/" className="text-sm text-cyan-200">
        ← {loc(locale, "Passenger app", "乘客端")}
      </a>
    </div>
  );
}
