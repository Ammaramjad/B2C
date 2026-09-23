"use client";

import { useState } from "react";
import { extras, imports, vehicles, zones } from "@/lib/catalog";
import { drivers, kpis, passengers } from "@/lib/data";
import { ROLE_PERMS, orgPeople } from "@/lib/platform";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { AreaChart } from "@/components/charts";
import { Btn, Stat, Status } from "@/components/ui";

const groups: Record<string, string[]> = {
  Today: ["overview", "analytics"],
  Network: ["bookings", "customers", "drivers", "vehicles", "fleets", "partners"],
  Commerce: ["pricing", "payments", "settlements", "coupons", "wallet"],
  Care: ["support", "loyalty", "flights", "incidents"],
  System: ["users", "rbac", "policies", "regions", "notify", "cms", "audit"],
};

export default function AdminPage() {
  const store = useStore();
  const { user, login, locale, currency, bookings, tickets, settlements, rules, setRules, audit, incidents, addIncident } = store;
  const [mod, setMod] = useState("overview");
  const zh = locale === "zh";

  if (!user || (user.role !== "ops" && user.role !== "dispatcher")) {
    return (
      <div className="space-y-3 py-10">
        <h1 className="display text-3xl">Admin</h1>
        <Btn onClick={() => login("nova@zoudian.travel", "ops")}>Nova Lin — SUPER ADMIN</Btn>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <nav className="space-y-4 text-sm">
        {Object.entries(groups).map(([g, items]) => (
          <div key={g}>
            <div className="label mb-1">{g}</div>
            {items.map((id) => (
              <button key={id} onClick={() => setMod(id)} className={`block capitalize ${mod === id ? "" : "text-[var(--muted)]"}`}>
                {id}
              </button>
            ))}
          </div>
        ))}
        <a href="/ops" className="text-[var(--muted)]">{loc(locale, "Operations map", "調度地圖")}</a>
      </nav>
      <div className="space-y-5 min-w-0">
        {mod === "overview" && (
          <>
            <h1 className="display text-4xl">{loc(locale, "Today", "今日")}</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {kpis.map((k) => (
                <Stat key={k.key} k={zh ? k.labelZh : k.label} v={"twd" in k && k.twd != null ? money(convert(k.twd, currency), currency) : (k.value ?? "—")} />
              ))}
            </div>
            <AreaChart label="GMV pulse" values={[12, 18, 22, 31, 14, 19, 24]} />
          </>
        )}
        {mod === "analytics" && (
          <>
            <h1 className="display text-3xl">Analytics</h1>
            <p className="text-sm text-[var(--muted)]">GMV · conversion · dispatch success · AOV · cancel · refund · accept · empty km · NPS</p>
            {zones.map((z) => (
              <p key={z.id}>{zh ? z.zh : z.en} · load {z.load}% · empty {z.empty} km</p>
            ))}
          </>
        )}
        {mod === "bookings" &&
          bookings.map((b) => (
            <div key={b.id} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border)] py-3 text-sm">
              <span>{b.id} · {b.service} · {b.passengerName}</span>
              <Status kind={b.status}>{b.status}</Status>
              <span>{money(convert(b.price, currency), currency)}</span>
            </div>
          ))}
        {mod === "customers" && passengers.map((p) => <p key={p.id}>{p.name} · {p.email} · RFM {p.rfm} · {p.trips} trips · {money(p.spendTwd, "TWD")}</p>)}
        {mod === "drivers" && drivers.map((d) => <p key={d.id}>{d.name} · {d.status} · {d.work} · fleet {d.fleet} · ★ {d.rating} · {d.license}</p>)}
        {mod === "vehicles" && vehicles.map((v) => <p key={v.id}>{v.name} · {v.model} · {v.seats}/{v.luggage} · {money(v.base, "TWD")}</p>)}
        {mod === "fleets" && <p>Owned A · Franchise B · Partner C — {rules.fleetOrder}</p>}
        {mod === "partners" && <p>{imports.join(" · ")}</p>}
        {mod === "pricing" && (
          <div className="space-y-3">
            <h1 className="display text-3xl">{loc(locale, "Pricing rules (owner-configurable)", "計價規則（業主可調）")}</h1>
            {(["nightPct", "surgePct", "hourlyRate", "meet", "waitMinutes", "commission"] as const).map((k) => (
              <label key={k} className="block text-sm">
                {k}
                <input
                  type="number"
                  value={rules[k]}
                  onChange={(e) => setRules({ [k]: Number(e.target.value) })}
                />
              </label>
            ))}
            {extras.map((e) => (
              <p key={e.id} className="text-sm text-[var(--muted)]">{e.id} default {money(e.price, "TWD")}</p>
            ))}
          </div>
        )}
        {mod === "payments" && <p>card · LINE Pay · Apple Pay · cash — tokens only, no PAN. Idempotent capture (design).</p>}
        {mod === "settlements" && settlements.map((s) => <p key={s.id}>{s.week} · {s.driverId} · {money(convert(s.net, currency), currency)} · {s.status}</p>)}
        {mod === "coupons" && <p>WELCOME NT$100 · TPE200 NT$200 · FAMILY 10% — GET /api/promo/:code</p>}
        {mod === "wallet" && <p>{loc(locale, "Ledger credits: promo / refund / referral. Not a silent balance overwrite.", "折價金分類帳：活動／退款／推薦。")}</p>}
        {mod === "support" && tickets.map((t) => <p key={t.id}>{t.id} · {t.category} · {t.message}</p>)}
        {mod === "loyalty" && <p>Points + Pulse/Orbit tiers + RFM. 1-star auto CS.</p>}
        {mod === "flights" && <p>CI101 / BR856 / JL809 · wait {rules.waitMinutes} min · ops can override.</p>}
        {mod === "incidents" && (
          <div className="space-y-3">
            <Btn
              kind="danger"
              onClick={() => addIncident({ level: "critical", kind: "SOS", note: "Ops drill", bookingId: bookings[0]?.id })}
            >
              Log SOS drill
            </Btn>
            {incidents.length === 0 && <p className="text-[var(--muted)]">No incidents.</p>}
            {incidents.map((i) => (
              <p key={i.id}>{i.level} · {i.kind} · {i.note} · {i.bookingId}</p>
            ))}
          </div>
        )}
        {mod === "users" && orgPeople.map((p) => <p key={p.email}>{p.role} · {p.name} · {p.email}</p>)}
        {mod === "rbac" &&
          Object.entries(ROLE_PERMS).map(([role, perms]) => (
            <p key={role} className="text-sm">
              <strong>{role}</strong> — {perms.join(", ")}
            </p>
          ))}
        {mod === "policies" && (
          <p>
            Free &gt;{rules.cancelFreeHours}h · mid {rules.cancelMidHours}h {rules.cancelMidPct}% · no-show 0. Owner-configurable — not hard-coded forever.
          </p>
        )}
        {mod === "regions" && <p>Taipei · New Taipei · Taoyuan · Taichung · Tainan · Kaohsiung · Hualien · Kenting</p>}
        {mod === "notify" && <p>Templates: confirmed, assigned, arriving, delayed, cancelled, refunded — EN / 繁中.</p>}
        {mod === "cms" && <p>Landing: Airport→City, City→Airport. Schema.org TravelAgency (later).</p>}
        {mod === "audit" &&
          audit.map((a) => (
            <p key={a.id} className="text-xs text-[var(--muted)]">
              {a.at.slice(11, 19)} · {a.actor} · {a.action} · {a.entity} · {a.detail}
            </p>
          ))}
      </div>
    </div>
  );
}
