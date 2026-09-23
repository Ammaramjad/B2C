"use client";

import Link from "next/link";

const inventory = [
  [1, "Passenger mobility home", "/"],
  [2, "Airport pickup booking", "/book"],
  [3, "Live airport pickup", "/live"],
  [4, "Passenger live trip", "/live"],
  [5, "Preferred driver selection", "/preferred"],
  [6, "Preferred request status", "/preferred"],
  [7, "Driver home", "/driver"],
  [8, "Incoming offer", "/driver/offer"],
  [9, "Going to pickup", "/driver/run"],
  [10, "Incident reporting", "/driver/incident"],
  [11, "Active trip", "/driver/run"],
  [12, "Driver performance", "/driver/performance"],
  [13, "Ops command center", "/ops"],
  [14, "Live dispatch", "/ops/dispatch"],
  [15, "Airport operations", "/ops/airport"],
  [16, "Incident command", "/ops/incident"],
  [17, "Replacement drivers", "/ops/replace"],
  [18, "Booking inspector", "/ops"],
  [19, "Driver 360", "/ops"],
  [20, "Fleet live map", "/ops/fleet"],
  [21, "Reassignment workflow", "/demo"],
  [22, "Critical notification", "/ops/incident"],
];

export function DesignGate() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="kicker">Design checkpoint · not production</div>
      <h1 className="display mt-2 text-6xl">Zoufeng Signal OS</h1>
      <p className="mt-4 max-w-2xl text-[var(--ink-2)]">
        Live mobility operating system. Map is the language. Events move the UI. Prototype GPS is simulated through the same event types production will publish.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/demo" className="zf-btn">
          Run ZF-82041
        </Link>
        <Link href="/" className="zf-btn ghost">
          Passenger
        </Link>
        <Link href="/ops" className="zf-btn ghost">
          Operations
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="display text-3xl">22 required prototypes</h2>
        <ol className="mt-4 space-y-1 text-sm">
          {inventory.map(([n, t, h]) => (
            <li key={String(n)}>
              <Link href={String(h)} className="underline">
                {n}. {t}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="zf-panel p-4">
          <div className="kicker">Realtime layer</div>
          <p className="mt-2 text-sm">
            driver.location.updated, flight.status.changed, driver.incident.reported, dispatch.offer.sent, dispatch.reassigned, eta.updated, notify.customer. Roles subscribe to their audience only.
          </p>
        </div>
        <div className="zf-panel p-4">
          <div className="kicker">Map approach</div>
          <p className="mt-2 text-sm">
            Leaflet + Carto basemap over real TPE–Taipei geography. Designed to swap the tile/routing provider (production maps/traffic) without changing event names. Markers interpolate. SIMULATED REALTIME is labeled.
          </p>
        </div>
        <div className="zf-panel p-4">
          <div className="kicker">Motion</div>
          <p className="mt-2 text-sm">
            GPS: marker lerp. Route: polyline replace on recalc. Price: live quote. Incident: critical banner persist. Stream: prepend without refresh. No decorative float.
          </p>
        </div>
        <div className="zf-panel p-4">
          <div className="kicker">Brand DNA</div>
          <p className="mt-2 text-sm">
            Signal red chevron markers, signal route stroke, steel ops field, daylight passenger canvas, IBM Plex Mono clocks/IDs. Recognizable without the wordmark.
          </p>
        </div>
      </section>
    </div>
  );
}

export function DemoDirector() {
  const steps = [
    "Confirm booking ZF-82041",
    "Monitor BR156",
    "Assign David Chen",
    "David prepares / drives",
    "Marker moves · ETA ticks",
    "Traffic + flight delay",
    "David reports unable to continue",
    "CRITICAL in Ops + candidates",
    "Offer to Jason Wu",
    "Jason accepts · passenger notified",
    "Map switches to Jason · new ETA",
    "Arrive / wait / start trip",
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">Connected demo</div>
      <h1 className="display mt-2 text-5xl">Scenario ZF-82041</h1>
      <p className="mt-3 text-[var(--ink-2)]">Sarah Chen · Airport pickup · BR156 · TPE T2 → Xinyi. Press Play in the header. Keep /live and /ops open in two windows to watch the same events.</p>
      <ol className="mt-6 space-y-2">
        {steps.map((s, i) => (
          <li key={s} className="zf-panel p-3">
            <span className="mono text-[var(--mute)]">{String(i + 1).padStart(2, "0")}</span> {s}
          </li>
        ))}
      </ol>
      <h2 className="display mt-10 text-3xl">Scenario 2 — Request David</h2>
      <p className="mt-2 text-sm">Switch the header to “Preferred David”, open /preferred, play. Request goes to the company, never to David directly.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/live" className="zf-btn">
          Passenger live
        </Link>
        <Link href="/ops" className="zf-btn ghost">
          Ops center
        </Link>
        <Link href="/driver/incident" className="zf-btn ghost">
          Driver incident
        </Link>
      </div>
    </div>
  );
}
