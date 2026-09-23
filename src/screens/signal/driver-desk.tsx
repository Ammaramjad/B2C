"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { drivers, seedBookings, seedSettlements } from "@/lib/data";
import { formatMetric, mergeScorecards, scorecardFromCatalog, scorecardFromLive } from "@/lib/live/metrics";
import { useLive } from "@/lib/live/engine";
import { MapMount } from "@/components/signal/map-mount";
import { useStore } from "@/lib/store";

const me = drivers[0];

export function DriverDutyHome() {
  const { live, setDuty } = useLive();
  const d = live.drivers[0];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">{d.duty}</h1>
        <span className="zf-chip live">{d.state}</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {(["online", "busy", "break", "offline"] as const).map((x) => (
          <button key={x} type="button" className={`zf-btn ${d.duty === x ? "" : "ghost"}`} style={{ minHeight: 40, fontSize: 12 }} onClick={() => setDuty(d.id, x)}>
            {x}
          </button>
        ))}
      </div>
      <div className="zf-panel p-4">
        <div className="kicker">Current / next</div>
        <div className="mt-1 text-xl font-semibold">
          {live.bookingId} · {live.pickup}
        </div>
        <p className="text-sm text-[var(--ink-2)]">
          {live.flight} · {live.passenger} · {live.phase.replaceAll("_", " ")}
        </p>
        <Link href="/driver/run" className="zf-btn wide mt-3">
          Open assignment
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <Link href="/driver/history" className="zf-panel p-3">History</Link>
          <Link href="/driver/settlement" className="zf-panel p-3">Settlement</Link>
          <Link href="/driver/documents" className="zf-panel p-3">Vehicle / docs</Link>
          <Link href="/driver/safety" className="zf-panel p-3">Safety</Link>
          <Link href="/driver/inbox" className="zf-panel p-3">Inbox</Link>
          <Link href="/driver/support" className="zf-panel p-3">Support</Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Today", `NT$${me.earningsToday.toLocaleString()}`],
          ["Week trips", String(me.completedWeek)],
          ["Accept", formatMetric(me.acceptRate, "pct")],
        ].map(([k, v]) => (
          <div key={k} className="zf-panel p-3">
            <div className="kicker">{k}</div>
            <div className="zf-metric">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DriverJobFlow() {
  const { live, markArrived, verifyOtp, completeTrip } = useLive();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const d = live.drivers.find((x) => x.id === live.assignedId) ?? live.drivers[0];
  function act() {
    if (live.phase === "arrived" || live.phase === "waiting") {
      if (!verifyOtp(otp)) setErr("OTP does not match the booking.");
      else {
        setErr("");
        router.push("/driver/trip");
      }
      return;
    }
    if (live.phase === "trip_started" || live.phase === "en_route_dest") {
      completeTrip();
      router.push("/driver/performance");
      return;
    }
    markArrived();
  }
  const cta =
    live.phase === "arrived" || live.phase === "waiting"
      ? "Verify OTP"
      : live.phase === "trip_started" || live.phase === "en_route_dest"
        ? "Complete trip"
        : "Arrived at Door 8";
  return (
    <div className="-mx-4">
      <div className="h-[320px]">
        <MapMount mode="night" height="320px" showFleet={false} />
      </div>
      <div className="space-y-3 px-4 pt-3">
        <div className="kicker">{live.phase.replaceAll("_", " ")}</div>
        <h1 className="display text-3xl">{live.pickup}</h1>
        <p className="text-sm">
          {live.flight} · {live.flightStatus} · {d.name}
        </p>
        <div className="zf-metric text-4xl">
          {live.etaMin} min · {live.distanceKm} km
        </div>
        {live.phase === "arrived" || live.phase === "waiting" ? (
          <label className="zf-field">
            <span>Passenger OTP</span>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={live.otp} />
          </label>
        ) : null}
        {err ? <p className="text-sm text-[var(--signal)]">{err}</p> : null}
        <button type="button" className="zf-btn wide" data-testid="driver-job-cta" onClick={act}>
          {cta}
        </button>
      </div>
    </div>
  );
}

export function DriverHistory() {
  const mine = seedBookings.filter((b) => b.driverId === "d1" || b.driverId === "D-118");
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Trip history</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Corridor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mine.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>
                {b.pickup} → {b.dropoff}
              </td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverMoney() {
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Earnings</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Window</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Today</td>
            <td>NT${me.earningsToday.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Week</td>
            <td>NT${me.earningsWeek.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Month</td>
            <td>NT${me.earningsMonth.toLocaleString()}</td>
          </tr>
          <tr>
            <td>YTD</td>
            <td>NT${me.earningsYtd.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Pending payout</td>
            <td>NT${me.pendingPayout.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function DriverSettle() {
  const rows = seedSettlements.filter((s) => s.driverId === "d1");
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Settlement</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Statement</th>
            <th>Week</th>
            <th>Net</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.week}</td>
              <td>NT${s.net.toLocaleString()}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverDocs() {
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Documents / vehicle</h1>
      <div className="zf-panel p-4 text-sm">
        License {me.license} · {me.vehicle} · {me.plate} · {me.fuel} · {me.vehicleState} · fleet {me.fleet}
      </div>
    </div>
  );
}

export function DriverScore() {
  const { live } = useLive();
  const { bookings, domain } = useStore();
  const liveD = live.drivers[0];
  const extras = {
    rejects: live.rejects[liveD.id] ?? domain.rejects.filter((r) => r.driverId === liveD.id).length,
    punctuality: domain.punctuality,
    offersSent: live.events.filter((e) => e.type === "dispatch.offer.sent").length || undefined,
  };
  const card = mergeScorecards(
    scorecardFromCatalog(me, bookings, live.counters.incidents, extras),
    scorecardFromLive(liveD, live.incident && live.incident.driverId === liveD.id ? 1 : live.counters.incidents, extras),
  );
  const rows: [string, string][] = [
    ["Total rides", formatMetric(card.totalRides)],
    ["Completed", formatMetric(card.completedRides)],
    ["Cancelled", formatMetric(card.cancelledRides)],
    ["Rejected offers", formatMetric(card.rejectedOffers)],
    ["On-time pickups", formatMetric(card.onTimePickups)],
    ["Late pickups", formatMetric(card.latePickups)],
    ["Total late minutes", formatMetric(card.totalLateMinutes, "min")],
    ["Average late minutes", formatMetric(card.averageLateMinutes, "min")],
    ["Acceptance", formatMetric(card.acceptanceRate, "pct")],
    ["Completion", formatMetric(card.completionRate, "pct")],
    ["Cancellation", formatMetric(card.cancellationRate, "pct")],
    ["Rating", card.rating != null ? String(card.rating) : "—"],
    ["Incidents", formatMetric(card.incidentCount)],
  ];
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Performance</h1>
      <p className="text-sm text-[var(--mute)]">Dashes are fields the domain does not store. Nothing is invented.</p>
      <table className="zf-table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td className="zf-metric">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverSafety() {
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Safety</h1>
      <Link href="/driver/incident" className="zf-btn wide">
        Report incident
      </Link>
      <p className="text-sm">SOS is opened from the passenger live sheet and lands on the ops tape.</p>
    </div>
  );
}

export function DriverHelp() {
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Support</h1>
      <p className="text-sm">Dispatch-owned offers only. Preferred bookings cannot be accepted as a private job.</p>
    </div>
  );
}

export function DriverInbox() {
  const { live } = useLive();
  const rows = live.events.filter((e) => e.audience.includes("driver")).slice(0, 16);
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">Notifications</h1>
      <ul className="zf-stream">
        {rows.map((e) => (
          <li key={e.id}>
            {e.clock} · {e.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
