"use client";

import { useState } from "react";
import { demandSlots, imports, zones } from "@/lib/catalog";
import { drivers, kpis, passengers, staffUsers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { AreaChart } from "@/components/charts";
import { Btn, Stat } from "@/components/ui";

const groups: Record<string, readonly string[]> = {
  Today: ["overview", "analytics"],
  Network: ["bookings", "customers", "drivers", "users"],
  Commerce: ["finance"],
  Care: ["tickets", "loyalty"],
  System: ["config"],
};

const roleModules: Record<string, string[]> = {
  ops: ["overview", "analytics", "bookings", "customers", "drivers", "users", "finance", "tickets", "loyalty", "config"],
  dispatcher: ["overview", "bookings", "drivers"],
  finance: ["overview", "finance", "bookings"],
  support: ["overview", "tickets", "customers", "bookings"],
  fleet_manager: ["overview", "drivers", "bookings"],
};

export default function AdminPage() {
  const { user, login, locale, currency, bookings, tickets, settlements, cancelMidPct, setCancelMidPct } = useStore();
  const [mod, setMod] = useState("overview");
  const [roles, setRoles] = useState(() => staffUsers.map((u) => ({ ...u })));
  const zh = locale === "zh";
  const allowed = user ? roleModules[user.role] ?? [] : [];

  if (!user || !allowed.length) {
    return (
      <div className="space-y-3 py-10">
        <h1 className="display text-3xl">Admin</h1>
        <Btn onClick={() => login("nova@zoudian.travel", "ops")}>Nova Lin</Btn>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <nav className="space-y-5 text-sm">
        {Object.entries(groups).map(([g, items]) => (
          <div key={g}>
            <div className="label mb-2">{g}</div>
            <div className="space-y-1">
              {items.filter((id) => allowed.includes(id)).map((id) => (
                <button key={id} onClick={() => setMod(id)} className={`block capitalize ${mod === id ? "" : "text-[var(--muted)]"}`}>
                  {id}
                </button>
              ))}
            </div>
          </div>
        ))}
        <a href="/ops" className="text-[var(--muted)]">{loc(locale, "Open operations map", "開啟調度地圖")}</a>
      </nav>
      <div className="space-y-6">
        {mod === "overview" && (
          <>
            <h1 className="display text-4xl">{loc(locale, "Today", "今日")}</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <Stat key={k.key} k={zh ? k.labelZh : k.label} v={"twd" in k && k.twd != null ? money(convert(k.twd, currency), currency) : (k.value ?? "—")} />
              ))}
            </div>
            <AreaChart label="Demand" values={demandSlots.map((s) => s.n)} />
          </>
        )}
        {mod === "analytics" && (
          <>
            <h1 className="display text-3xl">Analytics</h1>
            {zones.map((z) => (
              <p key={z.id} className="text-[var(--muted)]">{zh ? z.zh : z.en} · {z.load}%</p>
            ))}
          </>
        )}
        {mod === "bookings" &&
          bookings.map((b) => (
            <div key={b.id} className="flex justify-between border-b border-[var(--border)] py-3 text-sm">
              <span>{b.id} · {b.status} · {b.passengerName}</span>
              <span>{money(convert(b.price, currency), currency)}</span>
            </div>
          ))}
        {mod === "customers" &&
          passengers.map((p) => (
            <p key={p.id}>{p.name} · {p.rfm} · {p.trips}</p>
          ))}
        {mod === "drivers" &&
          drivers.map((d) => (
            <p key={d.id}>{d.name} · {d.work} · fleet {d.fleet} · {d.status}</p>
          ))}
        {mod === "users" && (
          <div className="space-y-3">
            <h1 className="display text-3xl">{loc(locale, "Staff roles", "內部角色")}</h1>
            <p className="text-sm text-[var(--muted)]">{loc(locale, "Multiple users. Role changes are demo-only on this device.", "多位使用者。角色變更僅在此裝置示範。")}</p>
            {roles.map((u, i) => (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] py-2">
                <span>{u.name}<span className="block text-xs text-[var(--muted)]">{u.email}</span></span>
                <select
                  className="w-auto"
                  value={u.role}
                  onChange={(e) => {
                    const next = [...roles];
                    next[i] = { ...u, role: e.target.value as typeof u.role };
                    setRoles(next);
                  }}
                >
                  {["ops", "dispatcher", "finance", "support", "fleet_manager"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            ))}
            <h2 className="display pt-4 text-xl">{loc(locale, "Customers", "旅客")}</h2>
            {passengers.map((p) => (
              <p key={p.id} className="text-sm">{p.name} · passenger · {p.trips} trips</p>
            ))}
            <h2 className="display pt-4 text-xl">{loc(locale, "Drivers", "司機")}</h2>
            {drivers.map((d) => (
              <p key={d.id} className="text-sm">{d.name} · driver · {d.work}</p>
            ))}
          </div>
        )}
        {mod === "finance" &&
          settlements.map((s) => (
            <p key={s.id}>{s.week} · {money(convert(s.net, currency), currency)}</p>
          ))}
        {mod === "tickets" && tickets.map((t) => <p key={t.id}>{t.id} · {t.category}</p>)}
        {mod === "loyalty" && <p>{loc(locale, "Membership tiers — visual only.", "會員層級 — 僅視覺。")}</p>}
        {mod === "config" && (
          <div>
            <p>{loc(locale, "Cancel 6–24h", "取消 6–24h")} {Math.round(cancelMidPct * 100)}%</p>
            <input type="range" min={0.2} max={0.8} step={0.1} value={cancelMidPct} onChange={(e) => setCancelMidPct(Number(e.target.value))} />
            <p className="mt-4 text-sm text-[var(--muted)]">{imports.join(" · ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
