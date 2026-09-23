"use client";

import { useState } from "react";
import Link from "next/link";
import { deriveCounters } from "@/lib/domain/booking";
import { formatMetric, scorecardFromCatalog } from "@/lib/live/metrics";
import { useLive } from "@/lib/live/engine";
import { MapMount } from "@/components/signal/map-mount";
import { drivers } from "@/lib/data";
import { useStore } from "@/lib/store";

function Counters() {
  const { live } = useLive();
  const { bookings } = useStore();
  const c = deriveCounters(live, bookings);
  const items = [
    ["Active", c.active],
    ["Unassigned", c.unassigned],
    ["Available", c.available],
    ["Busy", c.busy],
    ["Arrivals", c.arrivals],
    ["Delayed", c.delayed],
    ["Incidents", c.incidents],
    ["SOS", c.sos],
  ];
  return (
    <div className="grid grid-cols-4 gap-px bg-[var(--line)] text-center text-[11px] lg:grid-cols-8">
      {items.map(([k, v]) => (
        <div key={k} className="bg-[var(--paper)] px-2 py-2">
          <div className="kicker">{k}</div>
          <div className="zf-metric text-lg">{v}</div>
        </div>
      ))}
    </div>
  );
}

export function CommandCenter() {
  const { live } = useLive();
  const [sel, setSel] = useState<"booking" | "driver" | "incident" | "airport">("booking");
  return (
    <div className="grid h-[calc(100vh-96px)] grid-rows-[auto_1fr_180px]">
      <Counters />
      <div className="grid min-h-0 lg:grid-cols-[1fr_340px]">
        <MapMount mode="night" height="100%" />
        <aside className="overflow-auto border-l border-[var(--line)] bg-[var(--paper)] p-3">
          <div className="flex gap-2 text-[11px]">
            {(["booking", "driver", "incident", "airport"] as const).map((t) => (
              <button key={t} onClick={() => setSel(t)} className={sel === t ? "text-[var(--signal)]" : "text-[var(--mute)]"}>
                {t}
              </button>
            ))}
          </div>
          {sel === "booking" ? <BookingInspector /> : null}
          {sel === "driver" ? <Driver360 id={live.assignedId ?? "D-118"} /> : null}
          {sel === "incident" ? <IncidentBody /> : null}
          {sel === "airport" ? <AirportBody /> : null}
        </aside>
      </div>
      <EventStream />
    </div>
  );
}

export function BookingInspector() {
  const { live } = useLive();
  const d = live.drivers.find((x) => x.id === live.assignedId);
  return (
    <div className="space-y-2 text-sm">
      <div className="kicker">Booking inspector</div>
      <div className="mono text-xl">{live.bookingId}</div>
      <div>Sarah Chen · airport pickup · {live.phase.replaceAll("_", " ")}</div>
      <div>
        {live.pickup} → {live.dropoff}
      </div>
      <div>
        {live.flight} · {live.flightStatus} · {live.terminal}
      </div>
      <div>
        Vehicle {d?.klass ?? "MPV"} · {d?.plate ?? "—"}
      </div>
      <div className="zf-metric text-2xl">NT${live.fare.toLocaleString()}</div>
      <div>OTP {live.otp} · dispatch company-owned</div>
    </div>
  );
}

export function Driver360({ id }: { id: string }) {
  const { live } = useLive();
  const { bookings, domain } = useStore();
  const d = live.drivers.find((x) => x.id === id) ?? live.drivers[0];
  const catalog = drivers.find((x) => x.name === d.name) ?? drivers[0];
  const card = scorecardFromCatalog(catalog, bookings, live.incident?.driverId === d.id ? 1 : live.counters.incidents, {
    rejects: live.rejects[d.id] ?? domain.rejects.filter((r) => r.driverId === d.id).length,
    punctuality: domain.punctuality,
  });
  return (
    <div className="space-y-2 text-sm">
      <div className="kicker">Driver 360</div>
      <div className="text-xl font-semibold">{d.name}</div>
      <div>
        {d.id} · Fleet {d.fleet} · {d.vehicle} · {d.plate}
      </div>
      <div>
        {d.state} · {d.duty} · {d.loc.lat.toFixed(4)}, {d.loc.lng.toFixed(4)}
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2">
        {[
          ["Ledger rides", formatMetric(card.totalRides)],
          ["On-time", formatMetric(card.onTimePickups)],
          ["Late", formatMetric(card.latePickups)],
          ["Avg delay", formatMetric(card.averageLateMinutes, "min")],
          ["Accept", formatMetric(card.acceptanceRate, "pct")],
          ["Rating", d.rating],
        ].map(([k, v]) => (
          <div key={k} className="zf-panel p-2">
            <div className="kicker">{k}</div>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

function IncidentBody() {
  const { live, ackIncident } = useLive();
  if (!live.incident) return <p className="text-sm text-[var(--mute)]">No open incident. Play ZF-82041 to inject INC-441.</p>;
  return (
    <div className="space-y-2 text-sm">
      <span className="zf-chip crit">{live.incident.id}</span>
      <div className="font-semibold">{live.incident.category}</div>
      <div>{live.incident.note}</div>
      <div>
        {live.passenger} · {live.bookingId} · {live.incident.driverId}
      </div>
      <div>
        GPS {live.incident.loc.lat.toFixed(4)}, {live.incident.loc.lng.toFixed(4)} · {live.incident.clock}
      </div>
      <div className="flex gap-2">
        <button className="zf-btn ghost" onClick={ackIncident}>
          Acknowledge
        </button>
        <Link href="/ops/replace" className="zf-btn">
          Nearby replacements
        </Link>
      </div>
    </div>
  );
}

function AirportBody() {
  const { live } = useLive();
  return (
    <div className="space-y-2 text-sm">
      <div className="kicker">TPE airport operations</div>
      <div className="text-lg font-semibold">BR156 · {live.flightStatus}</div>
      <div>T2 Door 8 · Sarah Chen · {live.bookingId}</div>
      <div>Drivers approaching: {live.assignedId ?? "none"}</div>
      <div>Free-wait 45:00 starts at actual arrival</div>
      <div>Pickup exceptions: {live.incident ? 1 : 0}</div>
    </div>
  );
}

export function EventStream() {
  const { live } = useLive();
  const [f, setF] = useState("all");
  const rows = live.events.filter((e) => {
    if (f === "all") return true;
    return e.type.includes(f);
  });
  return (
    <div className="border-t border-[var(--line)] bg-[var(--paper)]">
      <div className="flex gap-3 px-3 pt-2 text-[11px]">
        {["all", "dispatch", "flight", "incident", "traffic", "preferred", "notify"].map((x) => (
          <button key={x} onClick={() => setF(x)} className={f === x ? "text-[var(--signal)]" : "text-[var(--mute)]"}>
            {x}
          </button>
        ))}
      </div>
      <ul className="zf-stream max-h-[132px] overflow-auto px-3">
        {rows.map((e) => (
          <li key={e.id} className="flex gap-3">
            <span className="mono text-[var(--mute)]">{e.clock}</span>
            <span className={e.severity === "critical" ? "text-[var(--signal)]" : ""}>
              {e.title} — {e.body}
            </span>
          </li>
        ))}
        {rows.length === 0 ? <li className="text-[var(--mute)]">Waiting for events… press Play scenario</li> : null}
      </ul>
    </div>
  );
}

export function DispatchBoard() {
  const { live, sendReplacement } = useLive();
  return (
    <div className="grid h-[calc(100vh-96px)] lg:grid-cols-[1fr_380px]">
      <MapMount mode="night" height="100%" />
      <aside className="overflow-auto p-4">
        <h1 className="display text-3xl">Live dispatch</h1>
        <p className="mt-2 text-sm text-[var(--ink-2)]">Offers are company-issued. No auto-assign unless a rule allows it.</p>
        {live.candidates.map((c, i) => (
          <div key={c.id} className="zf-panel mt-3 p-3">
            <div className="flex justify-between">
              <b>
                {i + 1}. {c.name}
              </b>
              <span className="mono">{c.km} km · {c.etaMin} min</span>
            </div>
            <div className="text-sm">
              {c.klass} · {c.rating} · accept {Math.round(c.accept * 100)}%
            </div>
            <ul className="mt-1 text-xs text-[var(--mute)]">
              {c.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <button type="button" className="zf-btn mt-2" data-testid={`send-offer-${c.id}`} onClick={() => sendReplacement(c.id)}>
              Send replacement offer
            </button>
          </div>
        ))}
      </aside>
    </div>
  );
}

export function AirportOps() {
  const { live } = useLive();
  return (
    <div className="grid h-[calc(100vh-96px)] lg:grid-cols-[1fr_360px]">
      <MapMount mode="night" height="100%" />
      <aside className="space-y-3 overflow-auto p-4">
        <h1 className="display text-3xl">TPE control</h1>
        <div className="zf-panel p-3">
          <div className="kicker">Arriving</div>
          <div className="text-xl">BR156 · {live.delayMin ? `+${live.delayMin}m` : "on time"}</div>
          <div className="text-sm">T2 · Sarah Chen · {live.bookingId}</div>
          <div className="text-sm">Driver {live.assignedId ?? "unassigned"} · wait 45:00</div>
        </div>
        <div className="zf-panel p-3 text-sm">Pickup zone Door 8 · 2 cars waiting · 1 approaching</div>
        <AirportBody />
      </aside>
    </div>
  );
}

export function IncidentCommand() {
  return (
    <div className="grid h-[calc(100vh-96px)] lg:grid-cols-[1fr_400px]">
      <MapMount mode="night" height="100%" />
      <aside className="overflow-auto p-4">
        <h1 className="display text-3xl">Incident command</h1>
        <IncidentBody />
        <div className="mt-4 text-sm">
          <div className="kicker">Recommended actions</div>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Acknowledge CRITICAL (stays visible until resolved)</li>
            <li>Hold passenger message until replacement accepted</li>
            <li>Send offer to ranked nearby compatible driver</li>
            <li>Do not auto-assign</li>
            <li>Keep INC-441 on the booking audit</li>
          </ol>
        </div>
        <Link href="/ops/replace" className="zf-btn wide mt-4">
          Open replacement board
        </Link>
      </aside>
    </div>
  );
}

export function ReplaceBoard() {
  return <DispatchBoard />;
}

export function FleetLive() {
  return (
    <div className="h-[calc(100vh-96px)]">
      <Counters />
      <div className="h-[calc(100%-52px)]">
        <MapMount mode="night" height="100%" />
      </div>
    </div>
  );
}

export function DriverDirectory() {
  const { live } = useLive();
  return (
    <div className="p-4">
      <h1 className="display text-3xl">Drivers</h1>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase text-[var(--mute)]">
            <th className="py-2">Driver</th>
            <th>State</th>
            <th>Vehicle</th>
            <th>Accept</th>
            <th>On-time</th>
          </tr>
        </thead>
        <tbody>
          {live.drivers.map((d) => (
            <tr key={d.id} className="border-t border-[var(--line)]">
              <td className="py-2">
                <Link href={`/ops/drivers/${d.id}`} className="underline">
                  {d.name}
                </Link>
                <div className="text-[11px] text-[var(--mute)]">{d.id}</div>
              </td>
              <td>{d.state}</td>
              <td>
                {d.klass} · {d.plate}
              </td>
              <td>{Math.round(d.accept * 100)}%</td>
              <td>{Math.round(d.onTime * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
