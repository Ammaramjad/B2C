"use client";

import { useMemo, useState } from "react";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Chip, Status } from "@/components/ui";

export default function OpsPage() {
  const { user, login, locale, currency, bookings, assignDriver, switches, tickets, incidents, addIncident } = useStore();
  const [sel, setSel] = useState(bookings.find((b) => !b.driverId || b.status === "new")?.id ?? bookings[0]?.id);
  const live = bookings.filter((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status));
  const unassigned = bookings.filter((b) => !b.driverId && b.status !== "cancelled" && b.status !== "completed");
  const b = useMemo(() => bookings.find((x) => x.id === sel), [bookings, sel]);
  const zh = locale === "zh";

  if (!user || (user.role !== "ops" && user.role !== "dispatcher")) {
    return (
      <div className="space-y-3 py-10">
        <h1 className="display text-3xl">{loc(locale, "Operations", "調度")}</h1>
        <Btn onClick={() => login("desk@zoudian.travel", "dispatcher")}>Dispatcher</Btn>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="display text-3xl">{loc(locale, "Control center", "指揮中心")}</h1>
          <Chip tone="live">{live.length} live</Chip>
        </div>
        <LiveMap locale={locale} mode="fleet" height={480} pickup={zh ? "全市" : "City"} dropoff={`${unassigned.length} waiting`} />
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-[var(--danger)]">CRITICAL · SOS {incidents.filter((i) => i.level === "critical").length + tickets.filter((t) => t.status !== "resolved").length}</span>
          <span className="text-[var(--warning)]">ATTENTION · {unassigned.length} unassigned</span>
          <span className="text-[var(--muted)]">INFO · {switches.filter((s) => s.status === "open").length} switch</span>
        </div>
        <Btn kind="danger" onClick={() => addIncident({ level: "critical", kind: "SOS", note: "Ops flagged trip", bookingId: sel })}>
          Raise incident
        </Btn>
      </div>
      <aside className="space-y-4">
        <div className="label">{loc(locale, "Queue", "佇列")}</div>
        <div className="max-h-40 space-y-2 overflow-auto text-sm">
          {bookings.slice(0, 12).map((row) => (
            <button key={row.id} onClick={() => setSel(row.id)} className={`block w-full text-left ${row.id === sel ? "" : "text-[var(--muted)]"}`}>
              {row.id} · {row.status}
            </button>
          ))}
        </div>
        {b && (
          <div className="space-y-3">
            <Status kind={b.status}>{b.status}</Status>
            <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
            <p className="text-sm text-[var(--muted)]">{b.passengerName} · {money(convert(b.price, currency), currency)}</p>
            <div className="label">{loc(locale, "Recommended", "建議")}</div>
            {drivers
              .filter((d) => d.status === "approved")
              .slice()
              .sort((a, c) => (a.fleet === "A" ? 0 : 1) - (c.fleet === "A" ? 0 : 1))
              .map((d, i) => (
                <button key={d.id} onClick={() => assignDriver(b.id, d.id)} className="flex w-full items-center justify-between text-left">
                  <span>
                    {d.name}
                    {i === 0 && <Chip tone="ai">AI</Chip>}
                  </span>
                  <span className="text-xs text-[var(--muted)]">fleet {d.fleet} · {d.work}</span>
                </button>
              ))}
          </div>
        )}
      </aside>
    </div>
  );
}
