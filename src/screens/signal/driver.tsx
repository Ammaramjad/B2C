"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLive } from "@/lib/live/engine";
import { MapMount } from "@/components/signal/map-mount";

export function DriverHome() {
  const { live } = useLive();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">On duty</h1>
        <span className="zf-chip live">ONLINE</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Completed", "7"],
          ["On-time", "6"],
          ["Earnings", "NT$6,240"],
        ].map(([k, v]) => (
          <div key={k} className="zf-panel p-3">
            <div className="kicker">{k}</div>
            <div className="zf-metric text-xl">{v}</div>
          </div>
        ))}
      </div>
      <div className="zf-panel p-4">
        <div className="kicker">Current / next</div>
        <div className="mt-1 text-xl font-semibold">
          {live.bookingId} · {live.pickup}
        </div>
        <p className="text-sm text-[var(--ink-2)]">
          {live.flight} · {live.passenger} · 5 pax / 4 bags
        </p>
      </div>
      <div className="zf-panel p-4 text-sm">
        Today: 1 rejected · 0 late · 6.4h online · 4.1h driving
      </div>
    </div>
  );
}

function formatRemain(sec: number | null) {
  if (sec == null) return "—";
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function DriverOffer() {
  const { live, acceptReplacement, acceptPreferred, rejectOffer } = useLive();
  const urgent = live.phase === "reassigning" || live.offerKind === "replacement";
  const preferred = live.offerKind === "preferred" || live.preferred?.status === "offered";
  const router = useRouter();
  const remain = live.offerRemainSec;
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <div className="kicker">{urgent ? "Urgent replacement" : preferred ? "Preferred company offer" : "Incoming offer"}</div>
        <div className="zf-metric text-5xl text-[var(--signal)]">{formatRemain(remain)}</div>
      </div>
      <div className="zf-panel p-4">
        <div className="zf-chip crit">{live.bookingId}</div>
        <h1 className="display mt-2 text-4xl">TPE T2 → Xinyi</h1>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><dt>Distance</dt><dd>{urgent ? "1.2 km" : "14 km"}</dd></div>
          <div className="flex justify-between"><dt>Flight</dt><dd>BR156 · delayed +18m</dd></div>
          <div className="flex justify-between"><dt>Party</dt><dd>5 pax · 4 bags · MPV</dd></div>
          <div className="flex justify-between"><dt>Est. net</dt><dd className="mono">NT$1,824</dd></div>
        </dl>
      </div>
      <div className="grid grid-cols-[1fr_1.3fr] gap-2">
        <button
          type="button"
          className="zf-btn ghost"
          data-testid="reject-offer"
          style={{ minHeight: 72 }}
          onClick={() => {
            rejectOffer();
            router.push("/driver");
          }}
        >
          Reject
        </button>
        <button
          type="button"
          className="zf-btn"
          data-testid="accept-offer"
          style={{ minHeight: 72, fontSize: 20 }}
          onClick={() => {
            if (preferred) acceptPreferred();
            else if (urgent || live.offerTo) acceptReplacement();
            router.push("/driver/run");
          }}
        >
          ACCEPT
        </button>
      </div>
    </div>
  );
}

export function DriverRun() {
  const { live } = useLive();
  const router = useRouter();
  const d = live.drivers.find((x) => x.id === live.assignedId) ?? live.drivers[0];
  const cta =
    live.phase === "arrived" || live.phase === "waiting"
      ? "Verify OTP"
      : live.phase === "trip_started" || live.phase === "en_route_dest"
        ? "Complete trip"
        : "Arrived at Door 8";
  return (
    <div className="-mx-4">
      <div className="h-[360px]">
        <MapMount mode="night" height="360px" showFleet={false} />
      </div>
      <div className="space-y-3 px-4 pt-3">
        <div className="kicker">{live.phase.replaceAll("_", " ")}</div>
        <h1 className="display text-3xl">{live.pickup}</h1>
        <p className="text-sm">
          {live.flight} · {live.flightStatus} · {d.name}
        </p>
        <div className="zf-metric text-4xl">{live.etaMin} min · {live.distanceKm} km</div>
        <button
          type="button"
          className="zf-btn wide"
          style={{ minHeight: 56 }}
          onClick={() => router.push("/driver/run")}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

const cats = [
  "Vehicle problem",
  "Accident / collision",
  "Medical issue",
  "Passenger issue",
  "Road blocked",
  "Unable to continue trip",
  "Safety concern",
  "Other",
];

export function DriverIncident() {
  const { reportIncident } = useLive();
  const [cat, setCat] = useState("Unable to continue trip");
  const [note, setNote] = useState("Warning light · not safe to continue");
  const [armed, setArmed] = useState(false);
  const router = useRouter();
  const timer = useRef<number>(0);
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Report incident</h1>
      <p className="text-sm text-[var(--ink-2)]">Fast, but not accidental. Hold confirm for 1 second. Ops is notified immediately.</p>
      <div className="grid gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`zf-panel p-3 text-left ${cat === c ? "outline outline-1 outline-[var(--signal)]" : ""}`}>
            {c}
          </button>
        ))}
      </div>
      <textarea className="w-full border border-[var(--line)] bg-[var(--paper)] p-3" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      <button
        type="button"
        className="zf-btn wide"
        data-testid="report-incident"
        style={{ minHeight: 56 }}
        onPointerDown={() => {
          setArmed(true);
          timer.current = window.setTimeout(() => {
            reportIncident(cat, note);
            router.push("/ops/incident");
          }, 1000);
        }}
        onPointerUp={() => {
          window.clearTimeout(timer.current);
          setArmed(false);
        }}
        onPointerLeave={() => {
          window.clearTimeout(timer.current);
          setArmed(false);
        }}
      >
        {armed ? "Hold…" : "Hold to send to Operations"}
      </button>
    </div>
  );
}

export function DriverPerformance() {
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Performance</h1>
      <p className="text-sm text-[var(--mute)]">Operational, not theatrical.</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Lifetime rides", "2,140"],
          ["30-day", "84"],
          ["On time", "76"],
          ["Late", "8"],
          ["Avg delay", "5.4 min"],
          ["Total late", "43 min"],
          ["Accept", "96%"],
          ["Cancel", "1.2%"],
          ["Rating", "4.92"],
          ["Incidents", "1"],
        ].map(([k, v]) => (
          <div key={k} className="zf-panel p-3">
            <div className="kicker">{k}</div>
            <div className="zf-metric text-2xl">{v}</div>
          </div>
        ))}
      </div>
      <div className="zf-panel p-3 text-sm">
        Last trip ZF-81990 · Scheduled 18:00 · Arrived 18:07 · Late 7 min · NT$1,824
      </div>
    </div>
  );
}
