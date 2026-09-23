"use client";

import { useMemo, useState } from "react";
import {
  drivers,
  flights,
  kpis,
  passengers,
} from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Panel, Stat } from "@/components/ui";

const tabs = [
  ["overview", "Overview", "總覽"],
  ["orders", "Orders", "訂單"],
  ["drivers", "Drivers", "司機"],
  ["passengers", "Users", "乘客"],
  ["switches", "Driver switch", "代換司機"],
  ["finance", "Finance", "財務"],
  ["tickets", "Tickets", "工單"],
  ["flights", "Flights", "航班"],
] as const;

export default function OpsPage() {
  const {
    user,
    login,
    locale,
    currency,
    bookings,
    assignDriver,
    advance,
    cancel,
    switches,
    decideSwitch,
    tickets,
    settlements,
  } = useStore();
  const zh = locale === "zh";
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("overview");
  const [q, setQ] = useState("");
  const [driverId, setDriverId] = useState<string | null>(null);

  const live = bookings.filter((b) => !["completed", "cancelled", "draft"].includes(b.status));
  const gmv = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.price, 0);
  const rows = useMemo(
    () =>
      bookings.filter((b) =>
        (b.id + b.pickup + b.dropoff + b.passengerName).toLowerCase().includes(q.toLowerCase()),
      ),
    [bookings, q],
  );

  if (!user || user.role !== "ops") {
    return (
      <Panel className="space-y-4">
        <h1 className="display text-3xl">{loc(locale, "Admin console", "管理後台")}</h1>
        <p className="text-white/55">
          {loc(locale, "RBAC · dispatch · finance · company driver-switch desk", "權限 · 調度 · 財務 · 公司代換司機櫃檯")}
        </p>
        <Btn onClick={() => login("nova@zoufeng.travel", "ops")}>
          {loc(locale, "Enter as Nova Lin (ops)", "以 Nova Lin（營運）進入")}
        </Btn>
      </Panel>
    );
  }

  const focus = drivers.find((d) => d.id === driverId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">
            {loc(locale, "Admin · complete operations mesh", "管理 · 完整營運儀表板")}
          </div>
          <h1 className="display text-4xl">{loc(locale, "Command deck", "指揮甲板")}</h1>
        </div>
        <a href="/" className="text-sm text-cyan-200">
          {loc(locale, "Exit to passenger", "返回乘客端")}
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, en, zhl]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
              tab === id ? "bg-cyan-300 text-[#070014]" : "bg-white/5 text-white/55"
            }`}
          >
            {zh ? zhl : en}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Stat
                key={k.key}
                k={zh ? k.labelZh : k.label}
                v={"twd" in k && k.twd != null ? money(convert(k.twd, currency), currency) : (k.value ?? "—")}
                d={k.delta}
              />
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Stat k={loc(locale, "Bookings in mesh", "網格訂單")} v={String(bookings.length)} />
            <Stat k={loc(locale, "Live trips", "進行中")} v={String(live.length)} />
            <Stat k={loc(locale, "Ledger GMV", "帳本 GMV")} v={money(convert(gmv, currency), currency)} />
          </div>
          <Panel>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              {loc(locale, "Live assignments", "即時派遣")}
            </div>
            <div className="mt-3 space-y-2">
              {live.slice(0, 6).map((b) => (
                <div key={b.id} className="flex justify-between gap-3 text-sm text-white/70">
                  <span>
                    {b.id} · {b.status} · {zh ? b.pickupZh : b.pickup} → {zh ? b.dropoffZh : b.dropoff}
                  </span>
                  <span>{drivers.find((d) => d.id === b.driverId)?.[zh ? "nameZh" : "name"] ?? "—"}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          <Panel>
            <input
              placeholder={loc(locale, "Search order / passenger / node", "搜尋訂單／乘客／節點")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Panel>
          {rows.map((b) => (
            <Panel key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                    {b.id} · {b.status} · {b.service} · {b.channel}
                  </div>
                  <div className="display text-xl">
                    {zh ? b.pickupZh : b.pickup} → {zh ? b.dropoffZh : b.dropoff}
                  </div>
                  <div className="text-sm text-white/50">
                    {b.passengerName} · {money(convert(b.price, currency), currency)} ·{" "}
                    {loc(locale, "driver net", "司機淨收")} {money(convert(b.driverNet, currency), currency)} ·{" "}
                    {drivers.find((d) => d.id === b.driverId)?.[zh ? "nameZh" : "name"] ?? loc(locale, "unassigned", "未指派")}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {drivers
                    .filter((d) => d.status === "approved")
                    .map((d) => (
                      <Btn key={d.id} kind="ghost" onClick={() => assignDriver(b.id, d.id)}>
                        {loc(locale, "Assign", "指派")} {zh ? d.nameZh : d.name.split(" ")[0]}
                      </Btn>
                    ))}
                  <Btn kind="ghost" onClick={() => advance(b.id)}>
                    {loc(locale, "Status+", "狀態＋")}
                  </Btn>
                  <Btn kind="danger" onClick={() => cancel(b.id)}>
                    {loc(locale, "Refund", "退款")}
                  </Btn>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {tab === "drivers" && (
        <div className="space-y-3">
          {focus ? (
            <DriverDetail
              locale={locale}
              currency={currency}
              driverId={focus.id}
              onBack={() => setDriverId(null)}
            />
          ) : (
            drivers.map((d) => {
              const rides = bookings.filter((b) => b.driverId === d.id);
              const done = rides.filter((b) => b.status === "completed");
              const gross = done.reduce((s, b) => s + b.price, 0);
              return (
                <button key={d.id} className="block w-full text-left" onClick={() => setDriverId(d.id)}>
                  <Panel className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                        {d.plate} · {d.fleet} · {d.status} · {d.online ? loc(locale, "online", "上線") : loc(locale, "offline", "離線")}
                      </div>
                      <div className="display text-2xl">{zh ? d.nameZh : d.name}</div>
                      <div className="text-sm text-white/50">
                        {loc(locale, "Rides in ledger", "帳本趟次")} {rides.length} · {loc(locale, "completed", "完成")} {done.length} ·{" "}
                        {loc(locale, "week", "本週")} {d.completedWeek} · ★ {d.rating}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="display text-xl">{money(convert(d.earningsWeek, currency), currency)}</div>
                      <div className="text-xs text-white/40">{loc(locale, "week gross", "本週營收")}</div>
                      <div className="text-xs text-white/50">
                        {loc(locale, "ledger completed", "帳本完成額")} {money(convert(gross, currency), currency)}
                      </div>
                    </div>
                  </Panel>
                </button>
              );
            })
          )}
        </div>
      )}

      {tab === "passengers" && (
        <div className="space-y-3">
          {passengers.map((p) => {
            const last = drivers.find((d) => d.id === p.lastDriverId);
            const rides = bookings.filter((b) => b.passengerId === p.id);
            return (
              <Panel key={p.id}>
                <div className="display text-2xl">{zh ? p.nameZh : p.name}</div>
                <div className="mt-1 text-sm text-white/55">
                  {p.email} · {p.phone} · {p.city} · RFM {p.rfm} · {p.points} pts
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {loc(locale, "Trips", "趟次")} {rides.length} · {loc(locale, "lifetime spend", "累計消費")}{" "}
                  {money(convert(p.spendTwd, currency), currency)} · {loc(locale, "last captain", "上次司機")}{" "}
                  {last ? (zh ? last.nameZh : last.name) : "—"}
                </div>
                <p className="mt-2 text-xs text-cyan-100/70">
                  {loc(
                    locale,
                    "Next different driver must be requested through ZOUFENG — private contact is blocked.",
                    "下次若要換司機必須透過 ZOUFENG 申請 — 禁止私下聯絡。",
                  )}
                </p>
              </Panel>
            );
          })}
        </div>
      )}

      {tab === "switches" && (
        <div className="space-y-3">
          <Panel>
            <p className="text-sm text-white/65">
              {loc(
                locale,
                "M25 desk: passengers who already contacted a driver cannot privately pick another. Approve a company reassignment here.",
                "M25 櫃檯：已接觸過司機的乘客不得私下另選。由此核准公司改派。",
              )}
            </p>
          </Panel>
          {switches.map((s) => (
            <Panel key={s.id} className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                {s.id} · {s.status} · {s.bookingId ?? "next trip"}
              </div>
              <div className="text-sm text-white/70">
                {passengers.find((p) => p.id === s.passengerId)?.[zh ? "nameZh" : "name"]} ·{" "}
                {loc(locale, "from", "原司機")} {drivers.find((d) => d.id === s.fromDriverId)?.[zh ? "nameZh" : "name"]}
              </div>
              <p className="text-sm text-white/60">{zh ? s.reasonZh : s.reason}</p>
              {s.status === "open" && (
                <div className="flex flex-wrap gap-2">
                  {drivers
                    .filter((d) => d.id !== s.fromDriverId && d.status === "approved")
                    .map((d) => (
                      <Btn key={d.id} onClick={() => decideSwitch(s.id, "approved", d.id, "Company reassignment")}>
                        {loc(locale, "Reassign to", "改派")} {zh ? d.nameZh : d.name.split(" ")[0]}
                      </Btn>
                    ))}
                  <Btn kind="danger" onClick={() => decideSwitch(s.id, "declined", undefined, "Kept original captain")}>
                    {loc(locale, "Decline", "駁回")}
                  </Btn>
                </div>
              )}
              {s.note && <div className="text-xs text-white/40">{s.note}</div>}
            </Panel>
          ))}
        </div>
      )}

      {tab === "finance" && (
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Stat
              k={loc(locale, "Pending payouts", "待撥款")}
              v={money(convert(settlements.filter((s) => s.status === "pending").reduce((n, s) => n + s.net, 0), currency), currency)}
            />
            <Stat
              k={loc(locale, "Commission held", "公司抽成")}
              v={money(convert(settlements.reduce((n, s) => n + s.commission, 0), currency), currency)}
            />
            <Stat k={loc(locale, "FX pair", "匯率對")} v="TWD / USD" d="1 USD ≈ NT$32.26" />
          </div>
          {settlements.map((s) => {
            const d = drivers.find((x) => x.id === s.driverId);
            return (
              <Panel key={s.id} className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="display text-xl">
                    {d ? (zh ? d.nameZh : d.name) : s.driverId} · {s.week}
                  </div>
                  <div className="text-sm text-white/50">
                    {s.rides} {loc(locale, "rides", "趟")} · {s.status}
                  </div>
                </div>
                <div className="text-right text-sm text-white/70">
                  <div>
                    {loc(locale, "Gross", "總額")} {money(convert(s.gross, currency), currency)}
                  </div>
                  <div>
                    {loc(locale, "Commission 20%", "抽成 20%")} {money(convert(s.commission, currency), currency)}
                  </div>
                  <div className="display text-lg">
                    {loc(locale, "Net", "淨收")} {money(convert(s.net, currency), currency)}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      {tab === "tickets" && (
        <div className="space-y-3">
          {tickets.map((tk) => (
            <Panel key={tk.id}>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                {tk.id} · {tk.level} · {tk.status}
              </div>
              <div className="display text-xl">{zh ? tk.topicZh : tk.topic}</div>
              <div className="text-sm text-white/50">
                {passengers.find((p) => p.id === tk.passengerId)?.[zh ? "nameZh" : "name"]} · {tk.bookingId}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {tab === "flights" && (
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(flights).map(([code, f]) => (
            <Panel key={code}>
              <div className="display text-2xl">{code}</div>
              <div className="text-sm text-white/60">
                {f.origin} → TPE · {f.terminal} · ETA {f.eta} · {zh ? f.statusZh : f.status}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

function DriverDetail({
  locale,
  currency,
  driverId,
  onBack,
}: {
  locale: "en" | "zh";
  currency: "TWD" | "USD";
  driverId: string;
  onBack: () => void;
}) {
  const { bookings, settlements } = useStore();
  const d = drivers.find((x) => x.id === driverId)!;
  const zh = locale === "zh";
  const rides = bookings.filter((b) => b.driverId === d.id);
  const done = rides.filter((b) => b.status === "completed");
  const mine = settlements.filter((s) => s.driverId === d.id);
  return (
    <div className="space-y-4">
      <Btn kind="ghost" onClick={onBack}>
        ← {loc(locale, "All drivers", "全部司機")}
      </Btn>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat k={loc(locale, "Today", "今日")} v={money(convert(d.earningsToday, currency), currency)} />
        <Stat k={loc(locale, "This week", "本週")} v={money(convert(d.earningsWeek, currency), currency)} d={`${d.completedWeek} ${loc(locale, "rides", "趟")}`} />
        <Stat k={loc(locale, "This month", "本月")} v={money(convert(d.earningsMonth, currency), currency)} />
        <Stat k={loc(locale, "YTD", "今年")} v={money(convert(d.earningsYtd, currency), currency)} />
      </div>
      <Panel>
        <div className="display text-3xl">{zh ? d.nameZh : d.name}</div>
        <div className="mt-2 grid gap-2 text-sm text-white/65 md:grid-cols-2">
          <div>{loc(locale, "Plate", "車牌")} {d.plate} · {d.vehicle}</div>
          <div>{loc(locale, "License", "駕照")} {d.license}</div>
          <div>{loc(locale, "Phone (ops only)", "電話（僅後台）")} {d.phone}</div>
          <div>{loc(locale, "Fleet", "車隊")} {d.fleet} · {d.status}</div>
          <div>{loc(locale, "Accept / reject", "接單／拒單")} {(d.acceptRate * 100).toFixed(0)}% / {(d.rejectRate * 100).toFixed(0)}%</div>
          <div>{loc(locale, "Empty km / week", "空駛公里／週")} {d.emptyKmWeek}</div>
          <div>{loc(locale, "Lifetime trips", "歷史趟次")} {d.trips}</div>
          <div>{loc(locale, "Pending payout", "待撥")} {money(convert(d.pendingPayout, currency), currency)}</div>
        </div>
      </Panel>
      <Panel>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{loc(locale, "Ride ledger", "趟次帳本")}</div>
        <div className="mt-3 space-y-2">
          {rides.map((b) => (
            <div key={b.id} className="flex justify-between gap-3 text-sm text-white/70">
              <span>
                {b.id} · {b.status} · {zh ? b.pickupZh : b.pickup} → {zh ? b.dropoffZh : b.dropoff}
              </span>
              <span>
                {money(convert(b.price, currency), currency)} / {loc(locale, "net", "淨")}{" "}
                {money(convert(b.driverNet, currency), currency)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-white/40">
          {loc(locale, "Completed in ledger", "帳本已完成")} {done.length}
        </div>
      </Panel>
      <Panel>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{loc(locale, "Weekly settlement", "週結")}</div>
        {mine.map((s) => (
          <div key={s.id} className="mt-2 flex justify-between text-sm text-white/70">
            <span>
              {s.week} · {s.rides} · {s.status}
            </span>
            <span>{money(convert(s.net, currency), currency)}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}
