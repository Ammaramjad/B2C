"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { resolveBooking } from "@/lib/domain/booking";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live/engine";

export function SignalTrips() {
  const { bookings } = useStore();
  const [tab, setTab] = useState("Upcoming");
  const groups: Record<string, string[]> = {
    Upcoming: ["payment_confirmed", "new", "assigned", "accepted"],
    Active: ["arriving", "onboard"],
    Completed: ["completed"],
    Cancelled: ["cancelled"],
  };
  const rows = bookings.filter((b) => groups[tab].includes(b.status));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">Movements</div>
      <h1 className="display mt-2 text-5xl">My trips</h1>
      <div className="mt-6 flex gap-4 text-sm">
        {Object.keys(groups).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "text-[var(--signal)]" : "text-[var(--mute)]"}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((b) => (
          <Link key={b.id} href={`/trips/${b.id}`} className="zf-panel flex justify-between p-4">
            <div>
              <div className="kicker">{b.id}</div>
              <div className="font-semibold">
                {b.pickup} → {b.dropoff}
              </div>
              <div className="text-sm text-[var(--ink-2)]">
                {b.when.replace("T", " ")} · {b.vehicle} · {b.status}
              </div>
            </div>
            <div className="zf-metric">{money(b.price, b.currency)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SignalSuccess() {
  const { id } = useParams<{ id: string }>();
  const { bookings } = useStore();
  const { live } = useLive();
  const b = resolveBooking(id, bookings, live);
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="zf-chip ok">Paid</div>
      <h1 className="display mt-3 text-5xl">On the network.</h1>
      <p className="mt-3 text-[var(--ink-2)]">
        {b?.id ?? id} is confirmed. Flight and driver states will move on the live map — you do not refresh.
      </p>
      <div className="zf-panel mt-6 p-4">
        <div className="font-semibold">
          {b?.pickup ?? live.pickup} → {b?.dropoff ?? live.dropoff}
        </div>
        <div className="text-sm">
          {(b?.flight ?? live.flight) || "—"} · {b?.vehicle ?? "mpv"} · {b ? money(b.price, b.currency) : `NT$${live.fare.toLocaleString()}`}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href="/live" className="zf-btn">
          Open live pickup
        </Link>
        <Link href="/trips" className="zf-btn ghost">
          All trips
        </Link>
      </div>
    </div>
  );
}

export function SignalTripDetail() {
  const { id } = useParams<{ id: string }>();
  const { bookings, cancel } = useStore();
  const { live } = useLive();
  const b = resolveBooking(id, bookings, live);
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">{b?.id ?? id}</div>
      <h1 className="display mt-2 text-5xl">{b?.pickup ?? live.pickup}</h1>
      <p className="mt-2 text-[var(--ink-2)]">→ {b?.dropoff ?? live.dropoff}</p>
      <div className="zf-panel mt-6 space-y-2 p-4 text-sm">
        <div>Status · {b?.status ?? live.phase}</div>
        <div>Flight · {b?.flight ?? live.flight}</div>
        <div>Vehicle · {b?.vehicle ?? "mpv"}</div>
        <div>Driver · {live.assignedId ?? b?.driverId ?? "company matching"}</div>
        <div>OTP · {live.otp}</div>
        <div className="zf-metric text-2xl">{b ? money(b.price, b.currency) : `NT$${live.fare.toLocaleString()}`}</div>
      </div>
      <Link href="/live" className="zf-btn wide mt-4">
        Open live pickup
      </Link>
      {b && b.status !== "completed" && b.status !== "cancelled" ? (
        <button type="button" className="zf-btn ghost wide mt-2" data-testid="cancel-booking" onClick={() => cancel(b.id)}>
          Cancel · policy calculator
        </button>
      ) : null}
      {b?.status === "cancelled" ? <p className="mt-2 text-sm">Cancelled. Refundable amount follows cancellation policy (see admin studio).</p> : null}
    </div>
  );
}

export function SignalAccount() {
  const { user } = useStore();
  const { live } = useLive();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">You</div>
      <h1 className="display mt-2 text-5xl">{user?.name ?? "Sarah Chen"}</h1>
      <div className="mt-6 grid gap-2">
        {[
          ["/preferred", "Preferred drivers · company-mediated"],
          ["/wallet", "Wallet"],
          ["/loyalty", "Points"],
          ["/referral", "Referral"],
          ["/inbox", "Notifications"],
          ["/support", "Support"],
          ["/planner", "Planner"],
          ["/live", `Live pickup ${live.bookingId}`],
        ].map(([h, l]) => (
          <Link key={h} href={h} className="zf-panel p-4">
            {l}
          </Link>
        ))}
      </div>
    </div>
  );
}
