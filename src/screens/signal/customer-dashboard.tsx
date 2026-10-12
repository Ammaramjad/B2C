"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useLive } from "@/lib/live/engine";

const TripMap = dynamic(() => import("@/components/signal/trip-map"), {
  ssr: false, loading: () => <div className="zf-map-skel" role="status">Loading trip map…</div>,
});

export function CustomerDashboard() {
  const { live } = useLive();
  const driver = live.drivers.find((d) => d.id === live.assignedId);
  const events = live.events.filter((e) => (!e.bookingId || e.bookingId === live.bookingId) && (!e.driverId || e.driverId === live.assignedId));
  const accepted = events.find((e) => ["dispatch.offer.accepted", "preferred.offer.accepted"].includes(e.type));
  const departed = [...events].reverse().find((e) => e.type === "driver.location.updated");
  const started = events.find((e) => e.type === "trip.started");
  const completed = live.phase === "completed";
  return <div className="mx-auto max-w-[1600px] px-4 py-5 pb-24 md:pb-5">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><div className="kicker">Customer dashboard</div><h1 className="display text-3xl">{completed ? "Your completed trip" : "Your active trip"}</h1></div>
      <div className="flex gap-2"><Link className="zf-btn ghost" href="/trips">Trip history</Link><Link className="zf-btn" href="/book">Book another trip</Link></div>
    </div>
    {live.sim && <p className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">Demo trip · locations, ETA and timestamps are simulated. Real driver GPS is not connected.</p>}
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="relative min-h-[420px] overflow-hidden rounded-xl border border-[var(--line)] lg:min-h-[650px]" aria-label="Assigned vehicle map"><TripMap /></section>
      <aside className="space-y-4">
        <section className="zf-panel rounded-xl p-5">
          <div className="flex items-center justify-between"><b>{live.bookingId}</b><span className="zf-chip">{live.sim ? "DEMO" : "TRACKING"}</span></div>
          <h2 className="mt-3 text-xl font-semibold">{live.phase.replaceAll("_", " ")}</h2>
          <p className="mt-2 text-sm">{live.pickup} → {live.dropoff}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div><div className="kicker">Estimated arrival</div><div className="zf-metric text-3xl">{driver && !completed ? `${live.etaMin} min` : "—"}</div></div>
            <div><div className="kicker">Pickup delay</div><div className="text-sm">Not available</div><p className="text-xs text-[var(--mute)]">Scheduled pickup time required</p></div>
          </div>
          <p className="mt-3 text-sm">Flight delay: {live.delayMin} min</p>
          <p className="mt-2 text-xs text-[var(--mute)]">{live.trafficNote}</p>
        </section>
        <section className="zf-panel rounded-xl p-5">
          <h2 className="font-semibold">Your driver and vehicle</h2>
          <p className="mt-2 text-sm">Booked category: {live.bookedClass || "MPV"}</p>
          {driver ? <><p className="mt-3 text-lg">{driver.name}</p><p>{driver.vehicle} · {driver.klass}</p><p className="mono mt-1">{driver.plate} · ★ {driver.rating}</p><p className="mt-3 text-xs">Current coordinates: {driver.loc.lat.toFixed(5)}, {driver.loc.lng.toFixed(5)}</p><a className="zf-btn ghost mt-3" href={`https://www.google.com/maps/search/?api=1&query=${driver.loc.lat},${driver.loc.lng}`} target="_blank" rel="noopener noreferrer">Open position in Google Maps</a></> : <p className="mt-3 text-sm">Waiting for company dispatch to assign your vehicle.</p>}
          <Link href="/support" className="mt-3 block text-sm underline">Contact trip support</Link>
        </section>
        <section className="zf-panel rounded-xl p-5">
          <h2 className="font-semibold">Trip timeline</h2>
          <dl className="mt-3 space-y-3 text-sm">
            {[["Driver accepted", accepted?.clock], ["Driver en route", departed?.clock], ["Trip started", started?.clock]].map(([label, time]) => <div key={label} className="flex justify-between gap-3"><dt>{label}</dt><dd className="mono">{time || "Pending"}</dd></div>)}
          </dl>
          <p className="mt-4 text-xs text-[var(--mute)]">{live.sim ? `Scenario clock: ${live.clock} · GPS update time unavailable in demo` : "GPS update time unavailable"}</p>
        </section>
      </aside>
    </div>
  </div>;
}
