"use client";

import { useMemo, useState } from "react";
import { demandSlots, imports, zones } from "@/lib/catalog";
import { drivers, kpis, passengers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { AreaChart, Bars } from "@/components/charts";
import { LiveMap } from "@/components/live-map";
import { Btn, Panel, Stat } from "@/components/ui";

const tabs = [
  ["overview", "Overview", "總覽"],
  ["orders", "Orders", "訂單"],
  ["drivers", "Drivers", "司機"],
  ["passengers", "Users", "乘客"],
  ["switches", "Switch", "代換"],
  ["finance", "Finance", "財務"],
  ["tickets", "Tickets", "工單"],
  ["config", "Rules", "規則"],
] as const;

export default function OpsPage() {
  const { user, login, locale, currency, bookings, assignDriver, advance, cancel, switches, decideSwitch, tickets, settlements, cancelMidPct, setCancelMidPct } = useStore();
  const zh = locale === "zh";
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("overview");
  const [q, setQ] = useState("");
  const live = bookings.filter((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status));
  const rows = useMemo(() => bookings.filter((b) => (b.id + b.pickup + b.passengerName).toLowerCase().includes(q.toLowerCase())), [bookings, q]);

  if (!user || (user.role !== "ops" && user.role !== "dispatcher")) {
    return (
      <Panel className="space-y-3">
        <h1 className="display text-3xl">{loc(locale, "Admin / dispatcher", "管理／調度")}</h1>
        <div className="flex gap-2">
          <Btn onClick={() => login("nova@zoudian.travel", "ops")}>Admin Nova Lin</Btn>
          <Btn kind="ghost" onClick={() => login("desk@zoudian.travel", "dispatcher")}>Dispatcher</Btn>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <h1 className="display text-4xl">{loc(locale, "Admin deck", "管理甲板")}</h1>
        <a href="/" className="text-sm text-cyan-200">{zh ? "乘客端" : "User site"}</a>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, en, z]) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-full px-3 py-1.5 text-xs ${tab === id ? "bg-cyan-300 text-[#070014]" : "bg-white/8"}`}>
            {zh ? z : en}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <LiveMap locale={locale} mode="fleet" height={420} pickup={zh ? "全市調度" : "City dispatch"} dropoff={`${live.length} live`} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((k) => (
              <Stat key={k.key} k={zh ? k.labelZh : k.label} v={"twd" in k && k.twd != null ? money(convert(k.twd, currency), currency) : (k.value ?? "—")} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="neon"><AreaChart label="18:00 demand" values={demandSlots.map((s) => s.n)} /></Panel>
            <Panel>
              {zones.map((z) => (
                <div key={z.id} className="mb-2 text-sm text-white/70">
                  {zh ? z.zh : z.en} · {z.load}% · empty {z.empty} km
                </div>
              ))}
              <Bars items={drivers.map((d) => ({ name: d.name, value: bookings.filter((b) => b.driverId === d.id).length }))} />
            </Panel>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          <input placeholder="search" value={q} onChange={(e) => setQ(e.target.value)} />
          {rows.map((b) => (
            <Panel key={b.id}>
              <div className="text-xs text-white/40">{b.id} · {b.status} · {b.service} · {b.channel} · {b.payment}</div>
              <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
              <div className="text-sm text-white/50">{b.passengerName} · {money(convert(b.price, currency), currency)}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {drivers.filter((d) => d.status === "approved").map((d) => (
                  <Btn key={d.id} kind="ghost" onClick={() => assignDriver(b.id, d.id)}>{d.name.split(" ")[0]}</Btn>
                ))}
                <Btn kind="ghost" onClick={() => advance(b.id)}>+</Btn>
                <Btn kind="danger" onClick={() => cancel(b.id)}>{zh ? "退款" : "Refund"}</Btn>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {tab === "drivers" && (
        <div className="space-y-3">
          {drivers.map((d) => (
            <Panel key={d.id} className="flex justify-between">
              <div>
                <div className="display text-2xl">{d.name}</div>
                <div className="text-sm text-white/50">{d.plate} · {d.vehicle} · {d.work} · fleet {d.fleet} · {d.fuel}</div>
              </div>
              <div className="text-right">
                <div>{money(convert(d.earningsWeek, currency), currency)}</div>
                <div className="text-xs text-white/40">{bookings.filter((b) => b.driverId === d.id).length} rides</div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {tab === "passengers" && (
        <div className="space-y-3">
          {passengers.map((p) => (
            <Panel key={p.id}>
              <div className="display text-xl">{p.name}</div>
              <div className="text-sm text-white/55">{p.email} · RFM {p.rfm} · last {drivers.find((d) => d.id === p.lastDriverId)?.name}</div>
            </Panel>
          ))}
        </div>
      )}

      {tab === "switches" &&
        switches.map((s) => (
          <Panel key={s.id} className="mb-3 space-y-2">
            <div>{s.id} · {s.status} · {s.bookingId}</div>
            <p className="text-sm text-white/60">{zh ? s.reasonZh : s.reason}</p>
            {s.status === "open" && (
              <div className="flex flex-wrap gap-2">
                {drivers.filter((d) => d.id !== s.fromDriverId).map((d) => (
                  <Btn key={d.id} onClick={() => decideSwitch(s.id, "approved", d.id)}>{d.name.split(" ")[0]}</Btn>
                ))}
                <Btn kind="danger" onClick={() => decideSwitch(s.id, "declined")}>X</Btn>
              </div>
            )}
          </Panel>
        ))}

      {tab === "finance" &&
        settlements.map((s) => (
          <Panel key={s.id} className="mb-3 flex justify-between">
            <span>{s.week} · {drivers.find((d) => d.id === s.driverId)?.name}</span>
            <span>{money(convert(s.net, currency), currency)}</span>
          </Panel>
        ))}

      {tab === "tickets" &&
        tickets.map((tk) => (
          <Panel key={tk.id} className="mb-3">
            {tk.id} · {tk.category} · {tk.message}
          </Panel>
        ))}

      {tab === "config" && (
        <div className="space-y-4">
          <Panel>
            <div className="display text-xl">{zh ? "取消政策（可調）" : "Cancel policy (admin)"}</div>
            <p className="text-sm text-white/60">&gt;24h 100% · 6–24h {Math.round(cancelMidPct * 100)}% · &lt;6h 0%</p>
            <input type="range" min={0.2} max={0.8} step={0.1} value={cancelMidPct} onChange={(e) => setCancelMidPct(Number(e.target.value))} />
          </Panel>
          <Panel>
            <div className="display text-xl">{zh ? "訂單來源" : "Import channels"}</div>
            <p className="text-sm text-white/60">{imports.join(" · ")}</p>
          </Panel>
          <Panel>
            <div className="display text-xl">score = 100×(0.45 dist + 0.25 veh + 0.15 lang + 0.15 rating)</div>
            <p className="text-sm text-white/55">Fleet A &gt; B &gt; C · night 20% · surge 1.15 · wait 45 min</p>
          </Panel>
        </div>
      )}
    </div>
  );
}
