"use client";

import { useState } from "react";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Chip } from "@/components/ui";

export default function DispatchBoardPage() {
  const { user, login, locale, currency, bookings, assignDriver } = useStore();
  const [over, setOver] = useState<string | null>(null);
  const unassigned = bookings.filter((b) => !b.driverId && !["cancelled", "completed"].includes(b.status));
  const online = drivers.filter((d) => d.status === "approved");

  if (!user || !["ops", "dispatcher", "fleet_manager"].includes(user.role)) {
    return (
      <div className="space-y-3 py-10">
        <h1 className="display text-3xl">{loc(locale, "Dispatch board", "派遣看板")}</h1>
        <Btn onClick={() => login("desk@zoudian.travel", "dispatcher")}>Rico Tan</Btn>
      </div>
    );
  }

  function dropOn(driverId: string, e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/booking-id");
    if (id) assignDriver(id, driverId);
    setOver(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="label">{loc(locale, "Staff · drag a booking onto a driver", "內部 · 把訂單拖到司機")}</div>
          <h1 className="display text-3xl">{loc(locale, "Dispatch board", "派遣看板")}</h1>
        </div>
        <Chip tone="live">{unassigned.length} {loc(locale, "waiting", "待指派")}</Chip>
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <section className="elevated rounded-2xl p-4">
          <div className="label mb-3">{loc(locale, "Unassigned", "未指派")}</div>
          <div className="space-y-2">
            {unassigned.map((b) => (
              <article
                key={b.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/booking-id", b.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                className="cursor-grab rounded-xl hairline p-3 active:cursor-grabbing"
              >
                <div className="text-sm font-semibold">{b.id}</div>
                <div>{b.pickup} → {b.dropoff}</div>
                <div className="text-xs text-[var(--muted)]">{b.passengerName} · {money(convert(b.price, currency), currency)}</div>
              </article>
            ))}
            {unassigned.length === 0 && <p className="text-sm text-[var(--muted)]">{loc(locale, "Queue empty.", "佇列是空的。")}</p>}
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {online.map((d) => {
            const jobs = bookings.filter((b) => b.driverId === d.id && !["completed", "cancelled"].includes(b.status));
            return (
              <div
                key={d.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(d.id);
                }}
                onDragLeave={() => setOver((x) => (x === d.id ? null : x))}
                onDrop={(e) => dropOn(d.id, e)}
                className={`elevated min-h-40 rounded-2xl p-4 ${over === d.id ? "ring-2 ring-[var(--primary)]" : ""}`}
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-[var(--muted)]">fleet {d.fleet} · {d.work} · {d.plate}</div>
                  </div>
                  <span className="text-xs">{jobs.length}</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {jobs.map((b) => (
                    <li key={b.id} className="hairline rounded-lg px-2 py-1">
                      {b.id} · {b.status}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
