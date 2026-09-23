"use client";

import { useState } from "react";
import { AtlasMap, fleetMarkers } from "@/components/zf/map";
import { BookingFacts, Status, Timeline } from "@/components/zf/ui";
import { flightBoard } from "@/design/fixtures";
import { drivers, passengers } from "@/lib/data";
import { formatWhen, serviceLabel, statusLabel } from "@/lib/present";
import { useStore } from "@/lib/store";
import type { Booking } from "@/lib/types";

const filters = ["All", "New", "Unassigned", "Searching", "Assigned", "En route", "Arrived", "In progress", "Completed", "Cancelled", "Exception", "Airport", "Delayed flight"] as const;

function matches(booking: Booking, filter: (typeof filters)[number], q: string) {
  const driver = drivers.find((d) => d.id === booking.driverId);
  const blob = `${booking.id} ${booking.passengerName} ${booking.passengerPhone} ${driver?.name ?? ""} ${driver?.plate ?? ""} ${booking.flight ?? ""}`.toLowerCase();
  if (q && !blob.includes(q.toLowerCase())) return false;
  if (filter === "All") return true;
  if (filter === "New") return booking.status === "new";
  if (filter === "Unassigned") return !booking.driverId && booking.status !== "cancelled";
  if (filter === "Searching") return booking.status === "new" || booking.status === "payment_confirmed";
  if (filter === "Assigned") return booking.status === "assigned" || booking.status === "accepted";
  if (filter === "En route") return booking.status === "arriving";
  if (filter === "Arrived") return booking.status === "arriving";
  if (filter === "In progress") return booking.status === "onboard";
  if (filter === "Completed") return booking.status === "completed";
  if (filter === "Cancelled") return booking.status === "cancelled";
  if (filter === "Airport") return booking.service.startsWith("airport");
  if (filter === "Delayed flight") return booking.flight === "BR856" || booking.flight === "CX494";
  if (filter === "Exception") return booking.status === "cancelled" || booking.flight === "BR856";
  return true;
}

export function CommandCenter({ initial }: { initial?: string }) {
  const { bookings, assignDriver } = useStore();
  const [selected, setSelected] = useState(initial ?? "ZD-1808");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");
  const booking = bookings.find((b) => b.id === selected) ?? bookings[0];
  const rows = bookings.filter((b) => matches(b, filter, q));
  return (
    <div className="zf-command">
      <AtlasMap
        markers={fleetMarkers}
        selected={booking?.driverId}
        showRoute
        onSelect={(id) => {
          const hit = bookings.find((b) => b.driverId === id);
          if (hit) setSelected(hit.id);
        }}
      />
      <aside className="zf-inspector">
        {booking && (
          <>
            <p className="zf-kicker">Inspector</p>
            <h2 style={{ margin: "0 0 8px" }}>{booking.id}</h2>
            <Status status={booking.status} />
            <BookingFacts booking={booking} dense />
            <Timeline booking={booking} />
            {!booking.driverId && (
              <button type="button" className="zf-btn zf-btn-primary" onClick={() => assignDriver(booking.id, "d3")}>
                Assign Wei Chen
              </button>
            )}
          </>
        )}
      </aside>
      <div className="zf-queue">
        <div className="zf-inline" style={{ padding: 8 }}>
          <input className="zf-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Booking, passenger, phone, driver, vehicle, flight" aria-label="Queue search" />
        </div>
        <div className="zf-filters" style={{ padding: "0 8px" }}>
          {filters.map((item) => (
            <button key={item} type="button" data-on={filter === item} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <table className="zf-qrow">
          <tbody>
            {rows.map((b) => (
              <tr key={b.id} data-on={b.id === booking?.id}>
                <td>
                  <button type="button" className="zf-rowbtn" onClick={() => setSelected(b.id)}>
                    <strong>{b.id}</strong> · {serviceLabel(b.service, "en")} · {b.pickup} → {b.dropoff}
                    <span className="zf-note"> {statusLabel(b.status, "en")} {b.flight ? `· ${b.flight}` : ""}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QueuePage() {
  return <CommandCenter />;
}

export function InspectorPage() {
  const { bookings } = useStore();
  const [id, setId] = useState("ZD-1812");
  const booking = bookings.find((b) => b.id === id) ?? bookings[0];
  return (
    <div className="zf-split" style={{ minHeight: "calc(100vh - 48px)" }}>
      <div>
        <p className="zf-kicker">Queue stays in place</p>
        <h1>Booking inspector</h1>
        <table className="zf-table">
          <tbody>
            {bookings.slice(0, 8).map((b) => (
              <tr key={b.id} data-on={b.id === id}>
                <td>
                  <button type="button" className="zf-rowbtn" onClick={() => setId(b.id)}>
                    {b.id} · {b.passengerName} · {statusLabel(b.status, "en")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="zf-inspector">
        <InspectorBody booking={booking} />
      </aside>
    </div>
  );
}

function InspectorBody({ booking }: { booking: Booking }) {
  const sections = ["Overview", "Route", "Schedule", "Passenger", "Vehicle", "Driver", "Fleet", "Pricing", "Payment", "Dispatch", "Safety", "Cancellation", "Timeline", "Audit"];
  const [open, setOpen] = useState("Overview");
  return (
    <div>
      <h2>{booking.id}</h2>
      {sections.map((section) => (
        <div key={section}>
          <button type="button" className="zf-btn zf-btn-quiet" onClick={() => setOpen(section)}>
            {section}
          </button>
          {open === section && (
            <div>
              {section === "Timeline" ? <Timeline booking={booking} /> : <BookingFacts booking={booking} dense />}
              {section === "Audit" && <p className="zf-note">Created on the website. No manual override on this record.</p>}
              {section === "Dispatch" && <p className="zf-note">{booking.driverId ? "Offer accepted." : "Waiting for an eligible driver."}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function scoreDriver(driverId: string, passengers: number) {
  const driver = drivers.find((d) => d.id === driverId)!;
  const distance = { d1: 8.2, d2: 3.1, d3: 6.4, d4: 2.4, d5: 18, d6: 46 }[driverId] ?? 10;
  const capacityOk = driver.vehicleClass === "sedan" || driver.vehicleClass === "premium" ? passengers <= 3 : driver.vehicleClass === "suv" ? passengers <= 4 : true;
  const eligible = driver.status === "approved" && driver.vehicleState === "active" && driver.work !== "offline" && capacityOk;
  const reasons = [
    eligible ? "Eligible for this party and service" : "Not eligible",
    `Rating ${driver.rating}`,
    `${distance} km empty`,
    `Fleet ${driver.fleet} priority`,
    `Accepts ${Math.round(driver.acceptRate * 100)}%`,
  ];
  const score = eligible ? Math.round(driver.fleet === "A" ? 86 : driver.fleet === "B" ? 74 : 69) - Math.round(distance) : 0;
  return { driver, distance, eligible, reasons, score };
}

export function DispatchBoard() {
  const { bookings, assignDriver } = useStore();
  const openJobs = bookings.filter((b) => !b.driverId && b.status !== "cancelled" && b.status !== "completed");
  const [jobId, setJobId] = useState(openJobs[0]?.id ?? "ZD-1808");
  const job = bookings.find((b) => b.id === jobId) ?? openJobs[0];
  const ranked = drivers.map((d) => scoreDriver(d.id, job?.passengers ?? 2)).sort((a, b) => b.score - a.score);
  const [why, setWhy] = useState(ranked[0]?.driver.id ?? "d3");
  const focus = ranked.find((r) => r.driver.id === why);
  if (!job) return <p className="zf-page">No unassigned bookings.</p>;
  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">Unassigned</p>
        <h1>Dispatch</h1>
        {openJobs.map((b) => (
          <button key={b.id} type="button" className="zf-ride-row" data-on={b.id === job.id} onClick={() => setJobId(b.id)}>
            <span>
              <strong>{b.id}</strong> {b.pickup} → {b.dropoff}
              <span className="zf-note"> {b.passengers} pax · {serviceLabel(b.service, "en")}</span>
            </span>
            <span>{formatWhen(b.when)}</span>
          </button>
        ))}
      </div>
      <div>
        <p className="zf-kicker">Why this driver?</p>
        {focus && (
          <div className="zf-alert">
            <strong>{focus.driver.name}</strong>
            <p>{focus.reasons.join(" · ")}</p>
          </div>
        )}
        <table className="zf-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Eligible</th>
              <th>km</th>
              <th>Fleet</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((row) => (
              <tr key={row.driver.id}>
                <td>
                  <button type="button" className="zf-rowbtn" onClick={() => setWhy(row.driver.id)}>
                    {row.driver.name}
                    <span className="zf-note"> {row.driver.vehicle}</span>
                  </button>
                </td>
                <td>{row.eligible ? "Yes" : "No"}</td>
                <td className="zf-mono">{row.distance}</td>
                <td>{row.driver.fleet}</td>
                <td className="zf-mono">{row.score}</td>
                <td>
                  {row.eligible && (
                    <button type="button" className="zf-btn zf-btn-primary" onClick={() => assignDriver(job.id, row.driver.id)}>
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FleetMapPage() {
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState("d3");
  const markers = fleetMarkers.filter((m) => kind === "all" || m.kind === kind || (kind === "exception" && m.kind === "exception"));
  const driver = drivers.find((d) => d.id === selected);
  return (
    <div className="zf-command" style={{ gridTemplateRows: "1fr" }}>
      <div>
        <div className="zf-filters" style={{ padding: 8 }}>
          {["all", "available", "busy", "enroute", "offline", "exception"].map((item) => (
            <button key={item} type="button" data-on={kind === item} onClick={() => setKind(item)}>
              {item}
            </button>
          ))}
        </div>
        <AtlasMap markers={markers} selected={selected} onSelect={setSelected} tall />
      </div>
      <aside className="zf-inspector">
        <h2>{driver?.name ?? "Exception"}</h2>
        {driver ? (
          <dl className="zf-dl">
            <dt>Status</dt>
            <dd>{driver.work}</dd>
            <dt>Vehicle</dt>
            <dd>
              {driver.vehicle} · {driver.plate}
            </dd>
            <dt>Fleet</dt>
            <dd>{driver.fleet}</dd>
            <dt>Service</dt>
            <dd>{driver.city}</dd>
          </dl>
        ) : (
          <p>SOS-204 is open near Neihu. Open the safety desk.</p>
        )}
      </aside>
    </div>
  );
}

export function FlightBoard() {
  const [dir, setDir] = useState("All");
  const rows = flightBoard.filter((f) => dir === "All" || f.dir === dir || (dir === "Delayed" && f.delay.startsWith("Delayed")) || (dir === "Affected" && f.status !== "Watch"));
  return (
    <div className="zf-page">
      <p className="zf-kicker">TPE today</p>
      <h1>Flights</h1>
      <div className="zf-filters">
        {["All", "Arriving", "Departing", "Delayed", "Affected"].map((item) => (
          <button key={item} type="button" data-on={dir === item} onClick={() => setDir(item)}>
            {item}
          </button>
        ))}
      </div>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Flight</th>
            <th>Terminal</th>
            <th>Sched</th>
            <th>Est</th>
            <th>Delay</th>
            <th>Booking</th>
            <th>Passenger</th>
            <th>Driver</th>
            <th>Pickup</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((f) => (
            <tr key={f.flight}>
              <td className="zf-mono">{f.flight}</td>
              <td>{f.terminal}</td>
              <td className="zf-mono">{f.sched}</td>
              <td className="zf-mono">{f.est}</td>
              <td>{f.delay}</td>
              <td>{f.booking}</td>
              <td>{f.passenger}</td>
              <td>{f.driver}</td>
              <td>{f.adjust}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverAdmin() {
  const [id, setId] = useState("d1");
  const driver = drivers.find((d) => d.id === id);
  return (
    <div className="zf-page">
      <h1>Drivers</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Driver</th>
            <th>Status</th>
            <th>Fleet</th>
            <th>Vehicle</th>
            <th>Region</th>
            <th>Accept</th>
            <th>Documents</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td>
                <button type="button" className="zf-rowbtn" onClick={() => setId(d.id)}>
                  {d.name}
                </button>
              </td>
              <td>{d.work}</td>
              <td>{d.fleet}</td>
              <td>{d.plate}</td>
              <td>{d.city}</td>
              <td className="zf-mono">{Math.round(d.acceptRate * 100)}%</td>
              <td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {driver && (
        <aside className="zf-panel" style={{ padding: 12, marginTop: 12 }}>
          <h2>{driver.name}</h2>
          <dl className="zf-dl">
            <dt>Phone</dt>
            <dd>{driver.phone}</dd>
            <dt>License</dt>
            <dd>{driver.license}</dd>
            <dt>Vehicle</dt>
            <dd>
              {driver.vehicle} · {driver.fuel} · {driver.vehicleState}
            </dd>
            <dt>Rating</dt>
            <dd>
              {driver.rating} · {driver.trips} trips
            </dd>
            <dt>Week</dt>
            <dd>
              {driver.completedWeek} done · {driver.cancelledWeek} cancelled · {driver.emptyKmWeek} empty km
            </dd>
            <dt>Settlement</dt>
            <dd>Pending NT${driver.pendingPayout.toLocaleString()}</dd>
          </dl>
        </aside>
      )}
    </div>
  );
}

export function FleetAdmin() {
  const groups = [
    { name: "Company fleet", tier: "A", note: "Owned vehicles, airport permits, first dispatch priority." },
    { name: "Franchise", tier: "B", note: "Affiliated operators in Taichung and Kaohsiung." },
    { name: "Partner drivers", tier: "C", note: "Approved owner-drivers on sedan and taxi work." },
  ];
  return (
    <div className="zf-page">
      <h1>Fleets</h1>
      <div className="zf-days">
        {groups.map((group) => {
          const list = drivers.filter((d) => d.fleet === group.tier);
          return (
            <section key={group.name} className="zf-day">
              <h2>{group.name}</h2>
              <p className="zf-note">{group.note}</p>
              {list.map((d) => (
                <p key={d.id}>
                  {d.name} · {d.work} · {d.vehicle}
                </p>
              ))}
              <p className="zf-note">{list.filter((d) => d.work === "available").length} available</p>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ManualOrder() {
  const { setDraft, placeBooking } = useStore();
  const [made, setMade] = useState<string | null>(null);
  const [who, setWho] = useState(passengers[1]);
  return (
    <div className="zf-page zf-page-narrow">
      <p className="zf-kicker">Phone · corporate · support</p>
      <h1>Manual order</h1>
      <label className="zf-field">
        <span>Customer</span>
        <input defaultValue={who.name} list="people" onChange={(e) => setWho(passengers.find((p) => p.name === e.target.value) ?? who)} />
        <datalist id="people">
          {passengers.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
      </label>
      <p className="zf-note">
        {who.phone} · {who.city} · {who.trips} trips
      </p>
      <label className="zf-field">
        <span>Service</span>
        <select defaultValue="airport_pickup" onChange={(e) => setDraft({ service: e.target.value as never, channel: "dispatch", name: who.name, phone: who.phone })}>
          <option value="airport_pickup">Airport pickup</option>
          <option value="p2p">Point to point</option>
          <option value="hourly">Charter</option>
        </select>
      </label>
      <label className="zf-field">
        <span>Flight</span>
        <input defaultValue="BR856" onChange={(e) => setDraft({ flight: e.target.value })} />
      </label>
      <label className="zf-field">
        <span>Notes for dispatch</span>
        <textarea rows={3} placeholder="Corporate cost center NT-44. Guest speaks Japanese." onChange={(e) => setDraft({ notes: e.target.value })} />
      </label>
      <button
        type="button"
        className="zf-btn zf-btn-primary"
        onClick={() => {
          setDraft({ channel: "dispatch", name: who.name, phone: who.phone });
          const booking = placeBooking();
          setMade(booking.id);
        }}
      >
        Create and leave unassigned
      </button>
      {made && <p className="zf-alert">Created {made}. It is in the unassigned queue.</p>}
    </div>
  );
}

export function SafetyDesk() {
  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">High · open</p>
        <h1>SOS-204</h1>
        <p>Sophie Tan · Aisha Rahman · ZD-1804 · Neihu</p>
        <AtlasMap markers={[{ id: "sos", x: 66, y: 34, kind: "exception", label: "SOS-204" }]} />
        <ol className="zf-timeline">
          <li>
            <i />
            <span>12:14 Passenger triggered SOS</span>
          </li>
          <li>
            <i />
            <span>12:14 Desk joined the trip</span>
          </li>
          <li data-wait="true">
            <i />
            <span>Voice call not yet connected</span>
          </li>
        </ol>
      </div>
      <aside className="zf-action">
        <button type="button" className="zf-btn zf-btn-danger zf-btn-block">
          Call passenger
        </button>
        <button type="button" className="zf-btn zf-btn-ink zf-btn-block">
          Call driver
        </button>
        <button type="button" className="zf-btn zf-btn-line zf-btn-block">
          Escalate to emergency services
        </button>
        <p className="zf-note">Location, booking, vehicle plate TPE-2209, and the last GPS fix are attached to the incident.</p>
      </aside>
    </div>
  );
}

export function SupportDesk() {
  return (
    <div className="zf-three">
      <aside className="zf-page">
        <p className="zf-kicker">Queue</p>
        <p>
          <strong>TK-111</strong> Mei-ling Kao · refund receipt
        </p>
        <p>TK-110 Amara Chen · resolved</p>
      </aside>
      <section className="zf-page">
        <h1>TK-111</h1>
        <p>Guest: I cancelled ZD-1809 and need the refund receipt.</p>
        <p>
          <strong>Summary</strong> Cancelled more than 24 hours ahead. Fee NT$0. Refund NT$1,680 to LINE Pay. Receipt not sent because email bounced.
        </p>
        <textarea className="zf-input" rows={4} defaultValue="Resending the receipt to ml.kao@example.com." />
        <button type="button" className="zf-btn zf-btn-primary">
          Reply and resolve
        </button>
      </section>
      <aside className="zf-inspector">
        <p className="zf-kicker">Context</p>
        <p>ZD-1809 · airport pickup · cancelled</p>
        <p>Payment LINE Pay · refunded</p>
        <p className="zf-note">Knowledge: cancellation bands, receipt template EN/繁中.</p>
      </aside>
    </div>
  );
}
