"use client";

import { useMemo, useState } from "react";
import { drivers } from "@/lib/data";
import { explainDispatch } from "@/lib/domain/matching";
import { statusLabel } from "@/lib/domain/state-machine";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Alert, Button, EmptyState } from "@/components/system";
import { OpsMap } from "@/components/ops-map";
import type { Booking } from "@/lib/types";

function actionFor(b: Booking, locale: "en" | "zh") {
  if (!b.driverId || b.status === "new") return loc(locale, "Assign driver", "指派司機");
  if (b.status === "assigned") return loc(locale, "Reassign", "改派");
  if (b.status === "cancelled") return loc(locale, "Review cancellation", "檢視取消");
  if (b.status === "payment_pending") return loc(locale, "Review payment", "檢視付款");
  return loc(locale, "Resolve / inspect", "處理／檢視");
}

export default function OpsCanvasPage() {
  const { bookings, locale, assignDriver, user, login } = useStore();
  const [q, setQ] = useState("");
  const [id, setId] = useState(bookings[0]?.id ?? "");
  const [filter, setFilter] = useState<"all" | "unassigned" | "active" | "airport">("all");
  const zh = locale === "zh";

  const rows = useMemo(() => {
    return bookings.filter((b) => {
      if (filter === "unassigned" && b.driverId) return false;
      if (filter === "active" && !["assigned", "accepted", "arriving", "onboard"].includes(b.status)) return false;
      if (filter === "airport" && !b.service.startsWith("airport")) return false;
      if (q && !`${b.id} ${b.passengerName} ${b.pickup} ${b.dropoff}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [bookings, filter, q]);

  const selected = bookings.find((b) => b.id === id) ?? rows[0];
  const driver = drivers.find((d) => d.id === selected?.driverId);

  if (user && user.role === "driver") {
    return <EmptyState title={loc(locale, "Operations requires a dispatcher role", "營運台需要調度角色")} body="" action={<Button href="/driver">{loc(locale, "Driver home", "司機首頁")}</Button>} />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_340px]">
      <aside className="space-y-4 border-r border-[var(--border)] pr-3">
        <p className="label">{loc(locale, "Views", "檢視")}</p>
        {(["all", "unassigned", "active", "airport"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`block w-full py-2 text-left text-sm ${filter === f ? "font-semibold" : "text-[var(--text-secondary)]"}`}>
            {f}
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={loc(locale, "Search booking / guest", "搜尋訂單／旅客")} />
        {!user && <Button kind="ghost" onClick={() => login("nova@zoudian.travel", "ops")}>{loc(locale, "Demo as Nova Lin", "以 Nova Lin 示範")}</Button>}
      </aside>

      <section className="space-y-3">
        <OpsMap
          locale={locale}
          height={380}
          pickup={selected?.pickup}
          dropoff={selected?.dropoff}
          markers={rows.slice(0, 8).map((b, i) => ({
            x: 80 + (i % 4) * 110,
            y: 80 + Math.floor(i / 4) * 120,
            label: b.id.slice(-4),
            kind: b.driverId ? "job" : "pickup",
          }))}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--text-secondary)]">
              <tr>
                <th className="py-2 font-medium">ID</th>
                <th className="font-medium">{loc(locale, "Route", "路線")}</th>
                <th className="font-medium">{loc(locale, "Status", "狀態")}</th>
                <th className="font-medium">{loc(locale, "Driver", "司機")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className={`cursor-pointer border-t border-[var(--border)] ${selected?.id === b.id ? "bg-[var(--surface)]" : ""}`} onClick={() => setId(b.id)}>
                  <td className="py-2 metric">{b.id}</td>
                  <td>{b.pickup} → {b.dropoff}</td>
                  <td>{zh ? statusLabel[b.status].zh : statusLabel[b.status].en}</td>
                  <td>{drivers.find((d) => d.id === b.driverId)?.name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-4 border-l border-[var(--border)] pl-4">
        {!selected ? (
          <p className="text-[var(--text-secondary)]">{loc(locale, "Select a booking.", "選擇一筆訂單。")}</p>
        ) : (
          <>
            <div>
              <p className="label">{selected.id}</p>
              <h2 className="display text-2xl">{selected.passengerName}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{selected.service} · {zh ? statusLabel[selected.status].zh : statusLabel[selected.status].en}</p>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="label">{loc(locale, "Route", "路線")}</dt><dd>{selected.pickup} → {selected.dropoff}</dd></div>
              <div><dt className="label">{loc(locale, "When", "時間")}</dt><dd>{selected.when}</dd></div>
              {selected.flight && <div><dt className="label">{loc(locale, "Flight", "航班")}</dt><dd>{selected.flight}</dd></div>}
              <div><dt className="label">{loc(locale, "Vehicle / party", "車型／人數")}</dt><dd>{selected.vehicle} · {selected.passengers} / {selected.luggage}</dd></div>
              <div><dt className="label">{loc(locale, "Price", "價格")}</dt><dd className="metric">{money(selected.price, "TWD")}</dd></div>
              <div><dt className="label">{loc(locale, "Payment", "付款")}</dt><dd>{selected.payment} · sandbox</dd></div>
            </dl>
            {driver && <Alert tone="info">{explainDispatch({ fleet: driver.fleet, rating: driver.rating, name: driver.name, locale })}</Alert>}
            <div className="flex flex-col gap-2">
              {(!selected.driverId || selected.status === "new" || selected.status === "assigned") &&
                drivers.filter((d) => d.status === "approved").slice(0, 3).map((d) => (
                  <Button key={d.id} kind="ghost" onClick={() => assignDriver(selected.id, d.id)}>
                    {actionFor(selected, locale)} · {d.name} ({d.fleet})
                  </Button>
                ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
