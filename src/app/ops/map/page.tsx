"use client";

import { useMemo, useState } from "react";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Chip, Status } from "@/components/ui";

export default function OpsMapPage() {
  const { user, locale, currency, bookings, assignDriver, tickets, switches } = useStore();
  const [sel, setSel] = useState(bookings[0]?.id);
  const live = bookings.filter((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status));
  const unassigned = bookings.filter((b) => !b.driverId && b.status !== "cancelled" && b.status !== "completed");
  const b = useMemo(() => bookings.find((x) => x.id === sel), [bookings, sel]);

  if (!user || !["ops", "dispatcher", "fleet_manager", "support"].includes(user.role)) {
    return <p><a className="underline" href="/ops">{loc(locale, "Open dispatch board", "開啟派遣看板")}</a></p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="display text-3xl">{loc(locale, "Live map", "即時地圖")}</h1>
          <Chip tone="live">{live.length} live</Chip>
        </div>
        <LiveMap locale={locale} mode="fleet" height={480} pickup={locale === "zh" ? "全市" : "City"} dropoff={`${unassigned.length} waiting`} />
        <div className="text-sm text-[var(--muted)]">
          SOS {tickets.filter((t) => t.status !== "resolved").length} · {loc(locale, "switches", "換司")} {switches.filter((s) => s.status === "open").length}
        </div>
      </div>
      <aside className="space-y-3">
        {bookings.slice(0, 12).map((row) => (
          <button key={row.id} onClick={() => setSel(row.id)} className={`block w-full text-left text-sm ${row.id === sel ? "" : "text-[var(--muted)]"}`}>
            {row.id} · {row.status}
          </button>
        ))}
        {b && (
          <div className="space-y-2 pt-3">
            <Status kind={b.status}>{b.status}</Status>
            <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
            <p className="text-sm">{b.passengerName} · {money(convert(b.price, currency), currency)}</p>
            {drivers.filter((d) => d.status === "approved").map((d) => (
              <Btn key={d.id} kind="ghost" className="w-full" onClick={() => assignDriver(b.id, d.id)}>
                {d.name} · {d.fleet}
              </Btn>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
