"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { resolveBooking } from "@/lib/domain/booking";
import { cancelFee, money } from "@/lib/pricing";
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
  if (!b) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="zf-chip">Unknown booking</div>
        <h1 className="display mt-3 text-5xl">This itinerary is not on the domain.</h1>
        <p className="mt-3 text-sm" data-testid="unknown-booking">
          {id} does not resolve. ZF-82041 is only the seed/demo tape booking — it is not used as a fallback.
        </p>
        <Link href="/trips" className="zf-btn mt-4">All trips</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="zf-chip ok">Paid</div>
      <h1 className="display mt-3 text-5xl">On the network.</h1>
      <p className="mt-3 text-[var(--ink-2)]">
        {b.id} is confirmed. Flight and driver states will move on the live map — you do not refresh.
      </p>
      <div className="zf-panel mt-6 p-4">
        <div className="font-semibold">
          {b.pickup} → {b.dropoff}
        </div>
        <div className="text-sm">
          {b.flight || "—"} · {b.vehicle} · {money(b.price, b.currency)}
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
  const { bookings, cancel, cancelMidPct, domain } = useStore();
  const { live } = useLive();
  const [now] = useState(() => Date.now());
  const b = resolveBooking(id, bookings, live);
  if (!b) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="kicker">Unknown booking</div>
        <h1 className="display mt-2 text-5xl">No such movement</h1>
        <p className="mt-3 text-sm" data-testid="unknown-booking">
          {id} is not a persisted or seed booking. It does not resolve to ZF-82041.
        </p>
      </div>
    );
  }
  const hours = Math.max(0, (new Date(b.when).getTime() - now) / 36e5);
  const fee = cancelFee(hours, b.price, cancelMidPct);
  const cx = domain.cancellations.find((c) => c.bookingId === b.id);
  const bound = live.bookingId === b.id;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">{b.id}</div>
      <h1 className="display mt-2 text-5xl">{b.pickup}</h1>
      <p className="mt-2 text-[var(--ink-2)]">→ {b.dropoff}</p>
      <div className="zf-panel mt-6 space-y-2 p-4 text-sm">
        <div>Status · {b.status}</div>
        <div>Flight · {b.flight || "—"}</div>
        <div>Vehicle · {b.vehicle}</div>
        <div>Driver · {(bound ? live.assignedId : null) ?? b.driverId ?? "company matching"}</div>
        {bound ? <div>OTP · {live.otp}</div> : <div>OTP · held on the live assignment</div>}
        <div className="zf-metric text-2xl">{money(b.price, b.currency)}</div>
        {b.status !== "cancelled" && b.status !== "completed" ? (
          <div data-testid="cancel-fee-preview">Cancel fee now (cancelFee) · NT${fee.toLocaleString()} · {hours.toFixed(1)}h before pickup</div>
        ) : null}
      </div>
      {b.service !== "rental" ? (
        <Link href="/live" className="zf-btn wide mt-4">
          Open live pickup
        </Link>
      ) : (
        <p className="mt-4 text-sm">Self-drive — no chauffeur live map.</p>
      )}
      {b.status !== "completed" && b.status !== "cancelled" ? (
        <button type="button" className="zf-btn ghost wide mt-2" data-testid="cancel-booking" onClick={() => cancel(b.id)}>
          Cancel · fee NT${fee.toLocaleString()}
        </button>
      ) : null}
      {b.status === "cancelled" ? (
        <p className="mt-2 text-sm" data-testid="cancel-result">
          Cancelled. Derived fee NT${(cx?.fee ?? b.price).toLocaleString()} · refund NT${(cx?.refund ?? 0).toLocaleString()}.
        </p>
      ) : null}
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
