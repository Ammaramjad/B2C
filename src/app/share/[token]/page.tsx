"use client";

import { useParams } from "next/navigation";
import { resolveBooking } from "@/lib/domain/booking";
import { useLive } from "@/lib/live/engine";
import { useStore } from "@/lib/store";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const { domain, bookings } = useStore();
  const { live } = useLive();
  const rec = domain.shares.find((s) => s.token === token);
  const b = resolveBooking(rec?.bookingId ?? live.bookingId, bookings, live);
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="kicker">Recipient-safe trip view</div>
      <h1 className="display mt-2 text-5xl">Shared movement</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">OTP, payment method, and SOS are hidden. This is not a driver contact channel.</p>
      <div className="zf-panel mt-6 space-y-2 p-4">
        <div className="kicker">{b?.id ?? "Unknown share"}</div>
        <div className="text-xl font-semibold">
          {b?.pickup ?? live.pickup} → {b?.dropoff ?? live.dropoff}
        </div>
        <div className="text-sm">{b?.flight ?? live.flight} · {live.phase.replaceAll("_", " ")}</div>
        <div className="text-sm">Driver {live.assignedId ?? "company matching"} · ETA {live.etaMin || "—"}</div>
        {!rec ? <p className="text-sm text-[var(--warn)]">Token not in this browser’s domain store. Live tape shown if ids match.</p> : null}
      </div>
    </div>
  );
}
