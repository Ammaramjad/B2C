"use client";

import Link from "next/link";
import { CustomerDashboard } from "./customer-dashboard";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLive } from "@/lib/live/engine";
import { MapMount } from "@/components/signal/map-mount";

export function PassengerHome() {
  const { live } = useLive();
  const { user } = useStore();
  if (user?.role === "passenger") return <CustomerDashboard />;
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
  const { live, createBooking } = useLive();
  const router = useRouter();
  const { user } = useStore();
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
          <button disabled={fit || pax < 1 || bags < 0 || !flight.trim()} className="zf-btn disabled:opacity-40" onClick={() => {
            createBooking(flight, klass, fare);
            router.push(user?.role === "passenger" ? "/dashboard" : "/login");
          }}>Confirm booking</button>
        </div>
      </div>
    </div>
  );
}

export function PassengerLive() { return <CustomerDashboard />; }

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

