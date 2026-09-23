"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mismatchCopy, vehicleFits } from "@/lib/live/capacity";
import { useLive } from "@/lib/live/engine";
import { quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { MapMount } from "@/components/signal/map-mount";
import type { ExtraId, ServiceType } from "@/lib/types";

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
            {[
              ["/book?service=airport_pickup", "Airport pickup"],
              ["/book?service=airport_drop", "Airport drop-off"],
              ["/book?service=p2p", "Private transfer"],
              ["/book?service=hourly", "Hourly"],
              ["/book?service=instant", "Instant"],
              ["/book?service=rental", "Self-drive"],
            ].map(([href, s]) => (
              <Link key={s} href={href} className="zf-panel px-3 py-3 text-sm font-semibold">
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

const klassToId: Record<string, string> = { Sedan: "sedan", MPV: "mpv", Van: "van" };

export function AirportBook() {
  const { live, confirmAirport } = useLive();
  const { setDraft, placeBooking } = useStore();
  const router = useRouter();
  const [pax, setPax] = useState(5);
  const [bags, setBags] = useState(4);
  const [flight, setFlight] = useState("BR156");
  const [klass, setKlass] = useState("MPV");
  const [child, setChild] = useState(true);
  const extras: ExtraId[] = child ? ["child_seat", "meet"] : ["meet"];
  const q = useMemo(
    () =>
      quote({
        service: "airport_pickup" as ServiceType,
        vehicle: klassToId[klass],
        extras: child ? ["child_seat", "meet"] : ["meet"],
        when: "2026-09-23T16:40",
      }),
    [klass, child],
  );
  const fare = q.total;
  const fit = vehicleFits(klass, pax, bags);

  function confirm() {
    const payload = {
      service: "airport_pickup" as const,
      flight,
      passengers: pax,
      luggage: bags,
      vehicle: klassToId[klass],
      extras,
      pickup: "TPE T2 Arrivals · Door 8",
      dropoff: "Taipei 101 / Xinyi",
      name: "Sarah Chen",
    };
    setDraft(payload);
    const b = placeBooking(payload);
    confirmAirport({ flight, pax, bags, vehicle: klass, fare, bookingId: b.id, name: "Sarah Chen" });
    router.push(`/trips/${b.id}/success`);
  }

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
              {!vehicleFits(k, pax, bags) ? (
                <p className="mt-1 text-sm text-[var(--warn)]" data-testid="capacity-mismatch">{mismatchCopy(k, pax, bags)}</p>
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
          <div>
            {!fit ? (
              <p className="mb-2 text-sm text-[var(--warn)]" data-testid="capacity-block">
                Confirm is disabled. {mismatchCopy(klass, pax, bags)}
              </p>
            ) : null}
            <button type="button" className="zf-btn" disabled={!fit} data-testid="confirm-airport" onClick={confirm}>
              Confirm & pay NT${fare.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PassengerLive() {
  const { live, triggerSos, shareTrip } = useLive();
  const [shareMsg, setShareMsg] = useState("");
  const d = live.drivers.find((x) => x.id === live.assignedId);
  const idx = phases.findIndex((p) => p.id === live.phase);
  async function onShare() {
    const token = shareTrip();
    const url = `${window.location.origin}/share/${token}`;
    try {
      if (navigator.share) await navigator.share({ title: "Zoufeng trip", url });
      else await navigator.clipboard.writeText(url);
      setShareMsg(`Share link ready · ${url}`);
    } catch {
      setShareMsg(url);
    }
  }
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <div className="absolute inset-0">
        <MapMount mode="day" height="100%" showFleet={false} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-14 z-[2000] flex justify-between px-4 md:top-3">
        <span className="zf-chip live">LIVE PICKUP</span>
        <div className="pointer-events-auto flex gap-2">
          <button type="button" className="zf-btn ghost" data-testid="share-trip" onClick={() => void onShare()}>
            Share trip
          </button>
          <button className="zf-btn" onClick={triggerSos}>
            SOS
          </button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-20 z-[2000] md:bottom-4">
        <div className="mx-auto max-w-xl zf-panel p-4">
          {shareMsg ? <p className="mb-2 text-xs text-[var(--signal)]" data-testid="share-url">{shareMsg}</p> : null}
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
          {live.customerNotice ? <p className="mt-3 text-sm font-semibold text-[var(--signal)]">{live.customerNotice}</p> : null}
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
  const { live, requestPreferred } = useLive();
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
          <button type="button" className="zf-btn" data-testid="request-preferred" onClick={() => requestPreferred(david.id)}>
            Request this driver
          </button>
        </div>
        <p className="mt-3 text-sm">Preferred Driver premium +18% (configurable 15–20%). Fallback: nearest similar class if David is unavailable.</p>
      </div>
      <div className="zf-panel mt-4 p-5">
        <div className="kicker">Request status</div>
        <ol className="mt-3 space-y-2 text-sm">
          {[
            ["pending", "Request received by Zoufeng"],
            ["under_review", "Ops reviewing availability / vehicle / schedule"],
            ["validated", "Company validation passed"],
            ["company_offered", "Official company offer issued"],
            ["driver_offered", "Offer on the driver desk"],
            ["confirmed", "Preferred driver confirmed"],
            ["rejected", "Rejected / cancelled"],
          ].map(([k, l]) => (
            <li key={k} className={st === k ? "text-[var(--signal)]" : "text-[var(--mute)]"}>
              {l}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-[var(--ink-2)]">Company validation and the official offer happen on the operations preferred queue — not on this passenger screen.</p>
        <Link href="/ops/preferred" className="zf-btn ghost mt-3" data-testid="preferred-ops-link">
          Open company queue
        </Link>
        {st === "confirmed" ? <p className="mt-3 font-semibold">{live.customerNotice}</p> : null}
      </div>
    </div>
  );
}

