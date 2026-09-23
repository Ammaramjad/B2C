"use client";

import { drivers, kpis } from "@/lib/data";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Panel, Stat } from "@/components/ui";
import { useMemo, useState } from "react";

export default function OpsPage() {
  const { user, login, bookings, assignDriver, advance, cancel, currency } = useStore();
  const [q, setQ] = useState("");
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
        <h1 className="display text-3xl">Operations console 1.0</h1>
        <Btn onClick={() => login("nova@zoufeng.travel", "ops")}>Enter as Nova Lin</Btn>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">Ops · RBAC admin</div>
          <h1 className="display text-4xl">Dispatch cathedral</h1>
        </div>
        <a href="/" className="text-sm text-cyan-200">
          Exit to passenger
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Stat key={k.key} k={k.label} v={k.value} d={k.delta} />
        ))}
      </div>
      <Panel>
        <input placeholder="Search order / passenger / node" value={q} onChange={(e) => setQ(e.target.value)} />
      </Panel>
      <div className="space-y-3">
        {rows.length === 0 && <Panel>No bookings in the local mesh. Seed via passenger checkout.</Panel>}
        {rows.map((b) => (
          <Panel key={b.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {b.id} · {b.status} · {b.service}
                </div>
                <div className="display text-xl">
                  {b.pickup} → {b.dropoff}
                </div>
                <div className="text-sm text-white/50">
                  {b.passengerName} · {money(convert(b.price, currency), currency)} · driver{" "}
                  {drivers.find((d) => d.id === b.driverId)?.name ?? "unassigned"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {drivers
                  .filter((d) => d.online)
                  .map((d) => (
                    <Btn key={d.id} kind="ghost" onClick={() => assignDriver(b.id, d.id)}>
                      Assign {d.name.split(" ")[0]}
                    </Btn>
                  ))}
                <Btn kind="ghost" onClick={() => advance(b.id)}>
                  Status+
                </Btn>
                <Btn kind="danger" onClick={() => cancel(b.id)}>
                  Refund
                </Btn>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
