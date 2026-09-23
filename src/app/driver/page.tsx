"use client";

import { drivers } from "@/lib/data";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Panel, Stat } from "@/components/ui";
import { useState } from "react";

export default function DriverPage() {
  const { user, login, bookings, advance, currency } = useStore();
  const me = drivers[0];
  const [online, setOnline] = useState(true);
  const mine = bookings.filter((b) => b.driverId === me.id || !b.driverId);

  if (!user || user.role === "passenger") {
    return (
      <Panel className="space-y-4">
        <h1 className="display text-3xl">Driver gate</h1>
        <Btn onClick={() => login("kenji@zoufeng.travel", "driver")}>Enter as Kenji Mori</Btn>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">Driver OS</div>
          <h1 className="display text-4xl">{me.name}</h1>
        </div>
        <Btn kind={online ? "primary" : "ghost"} onClick={() => setOnline((v) => !v)}>
          {online ? "Online · receiving" : "Offline"}
        </Btn>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat k="Week earnings" v={money(convert(me.earningsWeek, currency), currency)} d="Settlement export ready" />
        <Stat k="Rating" v={String(me.rating)} d={`${me.trips} trips`} />
        <Stat k="Vessel" v={me.plate} d={me.vehicle} />
      </div>
      <div className="space-y-3">
        {mine.length === 0 && <Panel>No inbound jobs. Stay online for round-robin + weighted dispatch.</Panel>}
        {mine.map((b) => (
          <Panel key={b.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                {b.id} · {b.status}
              </div>
              <div className="display text-xl">
                {b.pickup} → {b.dropoff}
              </div>
              <div className="text-sm text-white/50">OTP from passenger · {b.when}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn kind="ghost" href={`https://maps.google.com/?q=${encodeURIComponent(b.dropoff)}`}>
                Navigate
              </Btn>
              <Btn onClick={() => advance(b.id)}>Accept / next</Btn>
            </div>
          </Panel>
        ))}
      </div>
      <a href="/" className="text-sm text-cyan-200">
        ← Passenger mesh
      </a>
    </div>
  );
}
