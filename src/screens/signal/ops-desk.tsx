"use client";

import { useMemo, useState } from "react";
import { drivers, flights, passengers, seedSettlements, seedTickets } from "@/lib/data";
import { formatMetric, scorecardFromCatalog } from "@/lib/live/metrics";
import { useLive } from "@/lib/live/engine";
import { MapMount } from "@/components/signal/map-mount";
import { EventStream } from "./ops";
import { useStore } from "@/lib/store";

export function BookingQueue() {
  const { bookings } = useStore();
  const { live } = useLive();
  const [sel, setSel] = useState(live.bookingId);
  const b = bookings.find((x) => x.id === sel) ?? bookings[0];
  return (
    <div className="grid h-[calc(100vh-96px)] lg:grid-cols-[1fr_360px]">
      <MapMount mode="night" height="100%" />
      <aside className="overflow-auto">
        {bookings.map((row) => (
          <button key={row.id} type="button" onClick={() => setSel(row.id)} className={`block w-full border-b border-[var(--line)] p-3 text-left ${sel === row.id ? "text-[var(--signal)]" : ""}`}>
            <div className="kicker">{row.id}</div>
            <div className="text-sm">
              {row.pickup} → {row.dropoff}
            </div>
            <div className="text-[11px]">{row.status}</div>
          </button>
        ))}
        {b ? (
          <div className="p-3 text-sm">
            Inspector · {b.passengerName} · {b.flight ?? "—"} · {b.driverId ?? "unassigned"}
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export function FlightOps() {
  const { live } = useLive();
  const rows = Object.entries(flights);
  return (
    <div className="grid h-[calc(100vh-96px)] lg:grid-cols-[1fr_400px]">
      <MapMount mode="night" height="100%" />
      <aside className="overflow-auto p-4">
        <h1 className="display text-3xl">Flight board</h1>
        <div className="zf-panel mt-3 p-3 text-sm">
          Live {live.flight} · {live.flightStatus} · delay {live.delayMin || 0}m · {live.bookingId} · driver {live.assignedId ?? "—"} · ETA {live.etaMin || "—"}
        </div>
        <table className="zf-table mt-4">
          <thead>
            <tr>
              <th>Flight</th>
              <th>ETA</th>
              <th>Status</th>
              <th>T</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([id, f]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>{f.eta}</td>
                <td>{f.status}</td>
                <td>{f.terminal}</td>
              </tr>
            ))}
            <tr>
              <td>{live.flight}</td>
              <td>{live.clock}</td>
              <td>{live.flightStatus}</td>
              <td>{live.terminal}</td>
            </tr>
          </tbody>
        </table>
      </aside>
    </div>
  );
}

export function Driver360Page({ id }: { id?: string }) {
  const { live } = useLive();
  const { bookings } = useStore();
  const liveD = live.drivers.find((d) => d.id === (id ?? live.assignedId ?? "D-118")) ?? live.drivers[0];
  const catalog = drivers.find((d) => d.name === liveD.name) ?? drivers[0];
  const card = scorecardFromCatalog(catalog, bookings, live.incident?.driverId === liveD.id ? 1 : 0);
  const mine = bookings.filter((b) => b.driverId === catalog.id);
  return (
    <div className="grid min-h-[calc(100vh-96px)] lg:grid-cols-[1.1fr_0.9fr]">
      <MapMount mode="night" height="100%" />
      <aside className="overflow-auto p-4 space-y-4">
        <div className="kicker">Driver 360</div>
        <h1 className="display text-4xl">{liveD.name}</h1>
        <div className="text-sm">
          {liveD.id} · {liveD.duty} · {liveD.state} · Fleet {liveD.fleet} · {liveD.vehicle} · {liveD.plate}
        </div>
        <div className="text-sm">
          GPS {liveD.loc.lat.toFixed(4)}, {liveD.loc.lng.toFixed(4)} · assignment {live.bookingId} · next {live.offerTo ?? "—"}
        </div>
        <table className="zf-table">
          <tbody>
            {[
              ["Rides", formatMetric(card.totalRides)],
              ["Completed", formatMetric(card.completedRides)],
              ["Cancelled", formatMetric(card.cancelledRides)],
              ["Rejected", formatMetric(card.rejectedOffers)],
              ["Accept", formatMetric(card.acceptanceRate, "pct")],
              ["Completion", formatMetric(card.completionRate, "pct")],
              ["On-time rate (live)", formatMetric(liveD.onTime, "pct")],
              ["Late count", formatMetric(card.latePickups)],
              ["Avg delay", formatMetric(card.averageLateMinutes, "min")],
              ["Total delay", formatMetric(card.totalLateMinutes, "min")],
              ["Rating", String(liveD.rating)],
              ["Incidents", formatMetric(card.incidentCount)],
            ].map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td className="zf-metric">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="kicker">History</div>
        <ul className="zf-stream">
          {mine.map((b) => (
            <li key={b.id}>
              {b.id} · {b.status} · {b.pickup}
            </li>
          ))}
        </ul>
        <div className="kicker">Financial (catalog)</div>
        <div className="text-sm">
          Week NT${catalog.earningsWeek.toLocaleString()} · pending NT${catalog.pendingPayout.toLocaleString()} ·{" "}
          {seedSettlements.find((s) => s.driverId === catalog.id)?.status ?? "—"}
        </div>
      </aside>
    </div>
  );
}

export function AirportCommand() {
  const { live } = useLive();
  const d = live.drivers.find((x) => x.id === live.assignedId);
  return (
    <div className="grid h-[calc(100vh-96px)] grid-rows-[auto_1fr]">
      <div className="grid grid-cols-2 gap-px bg-[var(--line)] text-[12px] lg:grid-cols-4">
        {[
          ["Airport", "TPE"],
          ["Terminal", live.terminal],
          ["Flight", live.flight],
          ["Status", live.flightStatus],
          ["Delay", `${live.delayMin || 0}m`],
          ["Booking", live.bookingId],
          ["Passenger", live.passenger],
          ["Driver", live.assignedId ?? "unassigned"],
          ["Distance", `${live.distanceKm || "—"} km`],
          ["ETA", `${live.etaMin || "—"} min`],
          ["Wait", "45:00 free"],
          ["Zone", "T2 Door 8"],
          ["Incident", live.incident?.id ?? "none"],
          ["Reassign", live.phase],
        ].map(([k, v]) => (
          <div key={k} className="bg-[var(--paper)] px-3 py-2">
            <div className="kicker">{k}</div>
            {v}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 lg:grid-cols-[1fr_320px]">
        <MapMount mode="night" height="100%" />
        <div>
          <div className="p-3 text-sm">
            {d ? `${d.name} · ${d.km} km · ${d.etaMin} min` : "No assigned car"}
          </div>
          <EventStream />
        </div>
      </div>
    </div>
  );
}

export function ManualDesk() {
  const { placeBooking } = useStore();
  const [name, setName] = useState("Walk-up guest");
  return (
    <div className="p-4">
      <h1 className="display text-3xl">Manual order</h1>
      <p className="mt-2 text-sm">Company-entered booking. Still not a private driver deal.</p>
      <label className="zf-field mt-4 max-w-sm">
        <span>Passenger</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button type="button" className="zf-btn mt-3" onClick={() => placeBooking({ name, service: "airport_pickup", flight: "CI101" })}>
        Place on the tape
      </button>
    </div>
  );
}

export function SupportDesk() {
  const { tickets } = useStore();
  return (
    <div className="p-4">
      <h1 className="display text-3xl">Customer support</h1>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Booking</th>
            <th>Category</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {[...tickets, ...seedTickets].filter((t, i, xs) => xs.findIndex((y) => y.id === t.id) === i).map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.bookingId}</td>
              <td>{t.category}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SafetyDeskLive() {
  const { live } = useLive();
  return (
    <div className="grid h-[calc(100vh-96px)] lg:grid-cols-[1fr_360px]">
      <MapMount mode="night" height="100%" />
      <aside className="p-4">
        <h1 className="display text-3xl">Safety / SOS</h1>
        <div className="zf-panel mt-3 p-3">SOS count {live.counters.sos}</div>
        <ul className="zf-stream mt-3">
          {live.events
            .filter((e) => e.type === "sos.triggered" || e.type === "driver.incident.reported")
            .map((e) => (
              <li key={e.id}>
                {e.clock} · {e.title}
              </li>
            ))}
        </ul>
      </aside>
    </div>
  );
}

export function FleetCompaniesLive() {
  const groups = useMemo(() => {
    const g: Record<string, number> = { A: 0, B: 0, C: 0 };
    drivers.forEach((d) => {
      g[d.fleet] += 1;
    });
    return g;
  }, []);
  return (
    <div className="p-4">
      <h1 className="display text-3xl">Fleet companies</h1>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Fleet</th>
            <th>Drivers in catalog</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groups).map(([k, n]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{n}</td>
              <td>{k === "A" ? "First" : k === "B" ? "Second" : "Fill"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PaymentExceptions() {
  const { bookings } = useStore();
  const rows = bookings.filter((b) => b.status === "payment_pending" || b.status === "cancelled");
  return (
    <div className="p-4">
      <h1 className="display text-3xl">Payment / refund exceptions</h1>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.status}</td>
              <td>NT${b.price.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OpsInbox() {
  return (
    <div className="flex h-[calc(100vh-96px)] flex-col">
      <div className="p-3">
        <h1 className="display text-3xl">Notifications</h1>
        <p className="text-sm">{passengers.length} passenger profiles on file</p>
      </div>
      <EventStream />
    </div>
  );
}

export function VehicleDesk() {
  return (
    <div className="grid h-[calc(100vh-96px)] lg:grid-cols-[1fr_360px]">
      <MapMount mode="night" height="100%" />
      <aside className="overflow-auto p-3">
        <h1 className="display text-3xl">Vehicles</h1>
        <table className="zf-table mt-3">
          <thead>
            <tr>
              <th>Plate</th>
              <th>Class</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td>{d.plate}</td>
                <td>{d.vehicleClass}</td>
                <td>{d.vehicleState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </aside>
    </div>
  );
}

