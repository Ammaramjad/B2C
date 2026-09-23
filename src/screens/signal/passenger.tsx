"use client";

import Link from "next/link";
import { useState } from "react";
import { useLive } from "@/lib/live/engine";
import { MapMount } from "@/components/signal/map-mount";

const phases: { id: string; label: string }[] = [
  { id: "booked", label: "Booked" },
  { id: "flight_monitoring", label: "Flight monitoring" },
  { id: "driver_assigned", label: "Driver assigned" },
  { id: "driver_preparing", label: "Preparing" },
  { id: "en_route_airport", label: "En route to airport" },
  { id: "near_airport", label: "Near airport" },
  { id: "arrived", label: "Arrived" },
  { id: "waiting", label: "Waiting" },
  { id: "verified", label: "Verified" },
  { id: "trip_started", label: "Trip started" },
  { id: "en_route_dest", label: "En route" },
  { id: "arriving", label: "Arriving" },
  { id: "completed", label: "Completed" },
  { id: "disrupted", label: "Operational issue" },
  { id: "reassigning", label: "Reassigning" },
  { id: "reassigned", label: "New driver" },
];

export function PassengerHome() {
  const { live } = useLive();
  return (
    <div className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative min-h-[52vh]">
        <MapMount mode="day" height="100%" />
      </div>
      <div className="flex flex-col justify-between p-6 lg:p-10">
        <div>
          <div className="kicker">Live mobility · Taiwan corridors</div>
          <h1 className="display mt-3 text-5xl md:text-6xl">The car is already on the network.</h1>
          <p className="mt-4 max-w-md text-[var(--ink-2)]">Airport, private transfer, charter, taxi. Once you book, this becomes a live pickup — not a confirmation email.</p>
        </div>
        <div className="mt-8 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {["Airport pickup", "Airport drop-off", "Private transfer", "Hourly", "Instant", "Self-drive"].map((s) => (
              <Link key={s} href="/book" className="zf-panel px-3 py-3 text-sm font-semibold">
                {s}
              </Link>
            ))}
          </div>
          <Link href="/book" className="zf-btn wide">
            Start airport pickup
          </Link>
          {live.assignedId ? (
            <Link href="/live" className="zf-btn ghost wide">
              Open live pickup · {live.bookingId}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function AirportBook() {
  const { live } = useLive();
  const [pax, setPax] = useState(5);
  const [bags, setBags] = useState(4);
  const [flight, setFlight] = useState("BR156");
  const [klass, setKlass] = useState("MPV");
  const [child, setChild] = useState(true);
  const fare = 2280 + (klass === "Van" ? 200 : 0) + (child ? 200 : 0) + (pax > 6 ? 300 : 0);
  const fit = klass === "Sedan" && (pax > 3 || bags > 3);
  return (
    <div className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[1fr_420px]">
      <div className="min-h-[360px]">
        <MapMount mode="day" height="100%" />
      </div>
      <div className="space-y-4 overflow-auto p-5">
        <div className="kicker">Airport pickup · reacts as you decide</div>
        <h1 className="display text-4xl">BR156 into TPE</h1>
        <label className="zf-field">
          <span>Flight</span>
          <input value={flight} onChange={(e) => setFlight(e.target.value.toUpperCase())} />
        </label>
        <p className="text-sm text-[var(--ink-2)]">
          {flight === "BR156" ? live.flightStatus : "Flight lookup pending"} · Terminal {live.terminal} · Door 8
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="zf-field">
            <span>Passengers</span>
            <input type="number" value={pax} onChange={(e) => setPax(Number(e.target.value))} />
          </label>
          <label className="zf-field">
            <span>Bags</span>
            <input type="number" value={bags} onChange={(e) => setBags(Number(e.target.value))} />
          </label>
        </div>
        <div className="grid gap-2">
          {["Sedan", "MPV", "Van"].map((k) => (
            <button
              key={k}
              onClick={() => setKlass(k)}
              className={`zf-panel p-3 text-left ${klass === k ? "outline outline-1 outline-[var(--signal)]" : ""}`}
            >
              <b>{k}</b>
              {k === "Sedan" && fit ? (
                <p className="mt-1 text-sm text-[var(--warn)]">Sedan supports 3 pax / 3 bags. For {pax}/{bags}, MPV is required.</p>
              ) : (
                <p className="mt-1 text-sm text-[var(--ink-2)]">Compatible with this party.</p>
              )}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={child} onChange={(e) => setChild(e.target.checked)} />
          Child seat · +NT$200
        </label>
        <Link href="/preferred" className="block text-sm text-[var(--signal)]">
          Request a preferred driver →
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <div className="kicker">Quote updates live</div>
            <div className="zf-metric text-3xl">NT${fare.toLocaleString()}</div>
          </div>
          <Link href="/live" className="zf-btn">
            Confirm ZF-82041
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PassengerLive() {
  const { live } = useLive();
  const d = live.drivers.find((x) => x.id === live.assignedId);
  const idx = phases.findIndex((p) => p.id === live.phase);
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <MapMount mode="day" height="100%" showFleet={false} />
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-between px-4">
        <span className="zf-chip live">LIVE PICKUP</span>
        <div className="pointer-events-auto flex gap-2">
          <button className="zf-btn ghost">Share trip</button>
          <button className="zf-btn">SOS</button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-16 md:bottom-4">
        <div className="mx-auto max-w-xl zf-panel p-4">
          <div className="flex justify-between gap-4">
            <div>
              <div className="kicker">{live.bookingId} · {live.flight}</div>
              <div className="mt-1 text-lg font-semibold">{phases[Math.max(0, idx)]?.label}</div>
              <p className="text-sm text-[var(--ink-2)]">
                {live.pickup} → {live.dropoff}
              </p>
            </div>
            <div className="text-right">
              <div className="kicker">ETA</div>
              <div className="zf-metric text-4xl">{live.etaMin || "—"}</div>
              <div className="text-xs">{live.distanceKm ? `${live.distanceKm} km` : ""}</div>
            </div>
          </div>
          {d ? (
            <div className="mt-3 flex justify-between text-sm">
              <div>
                <b>{d.name}</b>
                <div>
                  {d.vehicle} · {d.plate} · {d.rating}
                </div>
              </div>
              <div className="mono text-2xl tracking-[0.18em]">{live.otp}</div>
            </div>
          ) : (
            <p className="mt-3 text-sm">Flight monitoring. Driver assignment follows company dispatch — not a private handshake.</p>
          )}
          <p className="mt-2 text-xs text-[var(--mute)]">{live.trafficNote}</p>
          <ol className="mt-3 flex gap-1 overflow-x-auto">
            {phases.slice(0, 12).map((p, i) => (
              <li key={p.id} className={`h-1 min-w-6 flex-1 ${i <= idx ? "bg-[var(--signal)]" : "bg-[var(--line)]"}`} />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function PreferredDrivers() {
  const { live, requestPreferred, validatePreferred, offerPreferred, acceptPreferred } = useLive();
  const david = live.drivers[0];
  const st = live.preferred?.status;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">Company-mediated preference · M25</div>
      <h1 className="display mt-2 text-5xl">My previous drivers</h1>
      <p className="mt-3 max-w-xl text-[var(--ink-2)]">Driver preference is a request and is subject to availability and company confirmation. You never book a driver privately.</p>
      <div className="zf-panel mt-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">{david.name}</div>
            <div className="text-sm text-[var(--ink-2)]">
              {david.rating} ★ · {david.ridesWithSarah} rides with you · last {david.lastRide} · {david.klass} · {Math.round(david.onTime * 100)}% on-time
            </div>
          </div>
          <button className="zf-btn" onClick={() => requestPreferred(david.id)}>
            Request this driver
          </button>
        </div>
        <p className="mt-3 text-sm">Preferred Driver premium +18% (configurable 15–20%). Fallback: nearest similar class if David is unavailable.</p>
      </div>
      <div className="zf-panel mt-4 p-5">
        <div className="kicker">Request status</div>
        <ol className="mt-3 space-y-2 text-sm">
          {[
            ["requested", "Request received by Zoufeng"],
            ["validating", "Availability / vehicle / schedule / rules"],
            ["offered", "Official company offer sent to David"],
            ["confirmed", "Preferred driver confirmed"],
          ].map(([k, l]) => (
            <li key={k} className={st === k || (st === "confirmed" && k !== "unavailable") ? "text-[var(--signal)]" : "text-[var(--mute)]"}>
              {l}
            </li>
          ))}
        </ol>
        {st === "requested" ? (
          <button className="zf-btn mt-3" onClick={validatePreferred}>
            Company validate
          </button>
        ) : null}
        {st === "validating" ? (
          <button className="zf-btn mt-3" onClick={offerPreferred}>
            Issue company offer
          </button>
        ) : null}
        {st === "offered" ? (
          <button className="zf-btn mt-3" onClick={acceptPreferred}>
            David accepts (driver app)
          </button>
        ) : null}
        {st === "confirmed" ? <p className="mt-3 font-semibold">{live.customerNotice}</p> : null}
      </div>
    </div>
  );
}

