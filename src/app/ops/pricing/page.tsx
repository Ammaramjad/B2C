"use client";

import { extras, rentals, taxis, vehicles } from "@/lib/catalog";
import { policy } from "@/lib/domain/policy";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Alert, Field } from "@/components/system";

export default function PricingConfigPage() {
  const { locale, cancelMidPct, setCancelMidPct } = useStore();
  return (
    <div className="space-y-8">
      <div>
        <p className="label">{loc(locale, "Configuration", "設定")}</p>
        <h1 className="display text-4xl">{loc(locale, "Pricing and policy", "計價與政策")}</h1>
      </div>
      <Alert tone="info">{loc(locale, "Dynamic Pricing 2.0 is in shadow mode. Passenger totals still use Pricing 1.0 + optional surge flag.", "動態定價 2.0 為影子模式。旅客總價仍用定價 1.0。")}</Alert>
      <section className="grid gap-6 md:grid-cols-2">
        <Field label={loc(locale, "Partial cancel fee (6–24h)", "部分取消費（6–24 小時）")}>
          <input type="number" min={0} max={1} step={0.05} value={cancelMidPct} onChange={(e) => setCancelMidPct(Number(e.target.value))} />
        </Field>
        <div>
          <div className="label">{loc(locale, "Fixed policy (catalog)", "固定政策（目錄）")}</div>
          <ul className="mt-2 space-y-1 text-sm">
            <li>{loc(locale, "Night", "夜間")} {policy.night.startHour}:00–{String(policy.night.endHour).padStart(2, "0")}:00 · {Math.round(policy.night.surchargePct * 100)}%</li>
            <li>{loc(locale, "Airport free wait", "機場免費等候")} {policy.airportWait.freeMinutes} min</li>
            <li>{loc(locale, "Hourly", "包車")} NT${policy.hourly.rateTwd} × {policy.hourly.minHours}–{policy.hourly.maxHours}h</li>
            <li>{loc(locale, "Fleet priority", "車隊優先")} {policy.fleetPriority.join(" → ")}</li>
            <li>{loc(locale, "DP2 mode", "DP2 模式")} {policy.pricing2.mode}</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 className="display text-2xl">{loc(locale, "Transfer vehicles", "接送車型")}</h2>
        <table className="mt-3 w-full text-left text-sm">
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t border-[var(--border)]">
                <td className="py-2">{v.name} · {v.model}</td>
                <td>{v.seats}/{v.luggage}</td>
                <td className="metric">{money(v.base, "TWD")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="display text-2xl">Taxi</h2>
          {taxis.map((t) => (
            <div key={t.id} className="flex justify-between border-t border-[var(--border)] py-2 text-sm">
              <span>{t.name}</span><span className="metric">{money(t.base, "TWD")}</span>
            </div>
          ))}
        </div>
        <div>
          <h2 className="display text-2xl">{loc(locale, "Rental / extras", "租車／加購")}</h2>
          {rentals.map((r) => (
            <div key={r.id} className="flex justify-between border-t border-[var(--border)] py-2 text-sm">
              <span>{r.name}</span><span className="metric">{money(r.day, "TWD")}/d</span>
            </div>
          ))}
          {extras.map((e) => (
            <div key={e.id} className="flex justify-between border-t border-[var(--border)] py-2 text-sm">
              <span>{locale === "zh" ? e.nameZh : e.name}</span><span className="metric">{money(e.price, "TWD")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
