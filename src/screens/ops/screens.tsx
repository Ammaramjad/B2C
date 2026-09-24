"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { drivers, flights, seedBookings, seedTickets } from "@/lib/data";
import { useStore } from "@/lib/store";
import { AtlasMap } from "@/components/atlas/map";
import { Btn, Kicker, Stamp, StatusMark, Ticket } from "@/components/atlas/primitives";
import { serviceCopy } from "@/lib/atlas";

const filters = [
  "All",
  "New",
  "Unassigned",
  "Searching",
  "Assigned",
  "En Route",
  "Arrived",
  "In Progress",
  "Completed",
  "Cancelled",
  "Exception",
  "Airport",
  "Delayed Flight",
];

export function CommandCenter() {
  const params = useSearchParams();
  const { bookings, assignDriver } = useStore();
  const [sel, setSel] = useState(params.get("inspect") ?? "ZD-1805");
  const b = bookings.find((x) => x.id === sel) ?? bookings[0];
  return (
    <div className="grid min-h-[calc(100vh-48px)] grid-rows-[1fr_200px] lg:grid-cols-[1fr_380px] lg:grid-rows-1">
      <div className="relative">
        <AtlasMap
          pickup={b.pickup}
          dropoff={b.dropoff}
          height={640}
          live
          markers={[
            { x: 22, y: 50, kind: "free" },
            { x: 40, y: 38, kind: "busy" },
            { x: 58, y: 46, kind: "enroute" },
            { x: 70, y: 62, kind: "off" },
            { x: 34, y: 70, kind: "sos" },
          ]}
        />
        <div className="absolute left-3 top-3 flex gap-2 text-[11px]">
          <Stamp tone="pine">64 available</Stamp>
          <Stamp tone="warn">18 busy</Stamp>
          <Stamp tone="alert">1 SOS</Stamp>
          <Stamp>3 delayed flights</Stamp>
        </div>
      </div>
      <aside className="overflow-auto border-t border-[var(--rule)] lg:border-l lg:border-t-0">
        <Inspector bookingId={b.id} onAssign={(d) => assignDriver(b.id, d)} />
      </aside>
      <div className="col-span-full border-t border-[var(--rule)] lg:col-span-2">
        <QueueStrip selected={sel} onSelect={setSel} />
      </div>
    </div>
  );
}

function QueueStrip({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  const { bookings } = useStore();
  return (
    <div className="flex gap-2 overflow-x-auto p-2">
      {bookings.slice(0, 8).map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b.id)}
          className={`min-w-[220px] ticket text-left ${selected === b.id ? "outline outline-1 outline-[var(--copper)]" : ""}`}
        >
          <div className="kicker">{b.id}</div>
          <div className="text-sm font-semibold">
            {b.pickup} → {b.dropoff}
          </div>
          <StatusMark status={b.status} />
        </button>
      ))}
    </div>
  );
}

function Inspector({ bookingId, onAssign }: { bookingId: string; onAssign: (id: string) => void }) {
  const { bookings } = useStore();
  const b = bookings.find((x) => x.id === bookingId) ?? seedBookings[0];
  const tabs = ["Overview", "Route", "Schedule", "Passenger", "Vehicle", "Driver", "Pricing", "Payment", "Dispatch", "Safety", "Refund", "Timeline", "Audit"];
  const [tab, setTab] = useState("Overview");
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <Kicker>Inspector · {b.id}</Kicker>
        <StatusMark status={b.status} />
      </div>
      <h2 className="serif mt-2 text-3xl">{serviceCopy[b.service].en}</h2>
      <div className="mt-3 flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-2 py-1 text-[11px] ${tab === t ? "bg-[var(--copper)] text-[var(--copper-ink)]" : "text-[var(--mute)]"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div>
          {b.pickup} → {b.dropoff}
        </div>
        <div>
          {b.passengerName} · {b.passengers} pax · {b.luggage} bags
        </div>
        <div>
          {b.when.replace("T", " ")} · {b.flight ?? "No flight"}
        </div>
        <div className="metric text-2xl">NT${b.price.toLocaleString()}</div>
        {tab === "Dispatch" ? (
          <div className="space-y-2">
            {drivers.slice(0, 3).map((d) => (
              <button key={d.id} onClick={() => onAssign(d.id)} className="ticket w-full text-left">
                <div className="font-semibold">{d.name}</div>
                <div className="text-xs text-[var(--mute)]">
                  Fleet {d.fleet} · {d.work} · why: distance 6.2 km, empty-km low, A priority
                </div>
              </button>
            ))}
          </div>
        ) : null}
        {tab === "Safety" ? <Stamp tone="pine">No open incident</Stamp> : null}
      </div>
    </div>
  );
}

export function QueuePage() {
  const { bookings } = useStore();
  const [f, setF] = useState("All");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    return bookings.filter((b) => {
      const hay = `${b.id} ${b.passengerName} ${b.passengerPhone} ${b.flight ?? ""} ${b.driverId ?? ""}`.toLowerCase();
      if (q && !hay.includes(q.toLowerCase())) return false;
      if (f === "Airport") return b.service.startsWith("airport");
      if (f === "Unassigned") return !b.driverId && b.status !== "cancelled";
      if (f === "All") return true;
      return b.status.replace("_", " ").includes(f.toLowerCase().split(" ")[0].toLowerCase()) || true;
    });
  }, [bookings, f, q]);
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`px-2 py-1 text-xs ${f === x ? "border-b border-[var(--copper)]" : "text-[var(--mute)]"}`}>
            {x}
          </button>
        ))}
      </div>
      <input className="atlas-input mt-3 max-w-lg" placeholder="Booking, passenger, phone, driver, vehicle, flight" value={q} onChange={(e) => setQ(e.target.value)} />
      <table className="dense mt-4 w-full">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Service</th>
            <th>Route</th>
            <th>When</th>
            <th>Status</th>
            <th>Fare</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td className="mono">{b.id}</td>
              <td>{b.service}</td>
              <td>
                {b.pickup} → {b.dropoff}
              </td>
              <td>{b.when.replace("T", " ")}</td>
              <td>
                <StatusMark status={b.status} />
              </td>
              <td className="metric">{b.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DispatchBoard() {
  const { bookings, assignDriver } = useStore();
  const open = bookings.filter((b) => !b.driverId || b.status === "new");
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      <div>
        <h1 className="serif text-3xl">Unassigned</h1>
        {open.map((b) => (
          <Ticket key={b.id} className="mt-3">
            <div className="kicker">{b.id}</div>
            <div className="font-semibold">
              {b.pickup} → {b.dropoff}
            </div>
          </Ticket>
        ))}
      </div>
      <div>
        <h1 className="serif text-3xl">Eligible drivers</h1>
        <p className="text-sm text-[var(--mute)]">Explainable rank · M18. Never opaque scores alone.</p>
        {drivers
          .filter((d) => d.work !== "offline")
          .map((d, i) => (
            <Ticket key={d.id} className="mt-3">
              <div className="flex justify-between">
                <div className="font-semibold">
                  #{i + 1} {d.name}
                </div>
                <Stamp tone="copper">score {92 - i * 4}</Stamp>
              </div>
              <ul className="mt-2 text-xs text-[var(--ink-soft)]">
                <li>Eligible for airport sedan</li>
                <li>Distance 6.{i} km · empty mileage low</li>
                <li>Fleet {d.fleet} priority · accept {Math.round(d.acceptRate * 100)}%</li>
              </ul>
              <Btn className="mt-3" onClick={() => open[0] && assignDriver(open[0].id, d.id)}>
                Assign
              </Btn>
            </Ticket>
          ))}
      </div>
    </div>
  );
}

export function FleetMapPage() {
  return (
    <div className="p-4">
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {["Fleet A", "Fleet B", "Fleet C", "Sedan", "MPV", "Taipei", "Available"].map((f) => (
          <button key={f} className="border border-[var(--rule)] px-2 py-1">
            {f}
          </button>
        ))}
      </div>
      <AtlasMap
        height={560}
        markers={[
          { x: 20, y: 40, kind: "free" },
          { x: 33, y: 55, kind: "busy" },
          { x: 48, y: 36, kind: "enroute" },
          { x: 62, y: 60, kind: "off" },
          { x: 74, y: 42, kind: "sos" },
        ]}
      />
    </div>
  );
}

export function FlightBoard() {
  return (
    <div className="p-4">
      <h1 className="serif text-3xl">Flight board</h1>
      <div className="mt-3 flex gap-3 text-xs">
        {["Arriving", "Departing", "Delayed", "Affected", "Today"].map((f) => (
          <Stamp key={f}>{f}</Stamp>
        ))}
      </div>
      <table className="dense mt-4 w-full">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Airport</th>
            <th>Sched / Est</th>
            <th>Delay</th>
            <th>Booking</th>
            <th>Driver</th>
            <th>Wait</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(flights).map(([id, f]) => (
            <tr key={id}>
              <td className="mono">{id}</td>
              <td>TPE {f.terminal}</td>
              <td>{f.eta}</td>
              <td>{f.status}</td>
              <td>ZD-1805</td>
              <td>Kenji Mori</td>
              <td>45:00 policy</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverDirectory() {
  return (
    <div className="p-4">
      <h1 className="serif text-3xl">Drivers</h1>
      <table className="dense mt-4 w-full">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Status</th>
            <th>Fleet</th>
            <th>Vehicle</th>
            <th>Accept</th>
            <th>Docs</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td>
                {d.name}
                <div className="text-[11px] text-[var(--mute)]">{d.city}</div>
              </td>
              <td>{d.work}</td>
              <td>{d.fleet}</td>
              <td>
                {d.vehicle} · {d.plate}
              </td>
              <td>{Math.round(d.acceptRate * 100)}%</td>
              <td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FleetCompanies() {
  const fleets = [
    ["Company fleet A", "42 vehicles · 91% util"],
    ["Franchise B", "38 vehicles · 74% util"],
    ["Partner C", "32 vehicles · 61% util"],
  ];
  return (
    <div className="grid gap-3 p-4 md:grid-cols-3">
      {fleets.map(([n, d]) => (
        <Ticket key={n}>
          <h2 className="serif text-3xl">{n}</h2>
          <p className="mt-2 text-sm">{d}</p>
        </Ticket>
      ))}
    </div>
  );
}

export function ManualOrder() {
  return (
    <div className="max-w-3xl p-6">
      <Kicker>Manual order entry</Kicker>
      <h1 className="serif mt-2 text-4xl">Phone · corporate · support</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <label className="text-sm">
          Customer lookup
          <input className="atlas-input mt-1" placeholder="Name, phone, company" />
        </label>
        <label className="text-sm">
          Service
          <select className="atlas-select mt-1">
            <option>Airport pickup</option>
            <option>Airport drop-off</option>
            <option>Point-to-point</option>
            <option>Hourly</option>
          </select>
        </label>
        <label className="text-sm">
          Pickup
          <input className="atlas-input mt-1" />
        </label>
        <label className="text-sm">
          Flight
          <input className="atlas-input mt-1" />
        </label>
        <label className="text-sm">
          Discount
          <input className="atlas-input mt-1" placeholder="Manual override reason required" />
        </label>
        <label className="text-sm">
          Assignment
          <input className="atlas-input mt-1" placeholder="Leave empty for auto-dispatch" />
        </label>
      </div>
      <Btn className="mt-4">Create booking</Btn>
    </div>
  );
}

export function SafetyDesk() {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="serif text-4xl">Active safety incidents</h1>
        <Ticket className="mt-4">
          <Stamp tone="alert">SOS · Critical</Stamp>
          <div className="serif mt-2 text-3xl">ZD-1804 · Daan → Neihu</div>
          <p className="mt-2 text-sm">Passenger triggered SOS 2 min ago. Last point 25.04, 121.56. Driver Aisha Rahman. Trip is onboard.</p>
          <div className="mt-3 flex gap-2">
            <Btn kind="alert">Call passenger</Btn>
            <Btn kind="ghost">Call driver</Btn>
            <Btn kind="ghost">Escalate police</Btn>
          </div>
        </Ticket>
      </div>
      <Ticket>
        <Kicker>Timeline</Kicker>
        <ol className="mt-3 space-y-2 text-sm">
          <li>10:21 SOS opened</li>
          <li>10:21 Location locked</li>
          <li>10:22 Ops acknowledged</li>
        </ol>
      </Ticket>
    </div>
  );
}

export function SupportWorkspace() {
  const t = seedTickets[1];
  return (
    <div className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-[1fr_320px]">
      <div className="border-r border-[var(--rule)] p-4">
        <Kicker>{t.id}</Kicker>
        <h1 className="serif text-3xl">{t.category}</h1>
        <p className="mt-4">{t.message}</p>
        <textarea className="atlas-area mt-6 min-h-32" placeholder="Reply…" />
        <div className="mt-2 flex gap-2">
          <Btn>Send</Btn>
          <Btn kind="ghost">Escalate L2</Btn>
        </div>
      </div>
      <aside className="space-y-3 p-4 text-sm">
        <Ticket>Customer Mei-ling Kao · risk RFM</Ticket>
        <Ticket>Booking ZD-1809 · cancelled</Ticket>
        <Ticket>AI summary: refund receipt requested; policy already zero-fee.</Ticket>
        <Ticket>Knowledge: cancellation &gt;24h full refund</Ticket>
      </aside>
    </div>
  );
}
