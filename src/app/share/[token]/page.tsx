"use client";

import { useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { resolveBooking } from "@/lib/domain/booking";
import { publicShareView, resolveShare } from "@/lib/domain/share";
import { useLive } from "@/lib/live/engine";
import { useStore } from "@/lib/store";

function subscribe() {
  return () => {};
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const { domain, bookings } = useStore();
  const { live } = useLive();
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  if (!ready) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm">Resolving share token…</p>
      </div>
    );
  }
  const resolved = resolveShare(typeof token === "string" ? token : undefined, domain.shares);
  if (resolved.status === "unknown") {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="kicker">Share link</div>
        <h1 className="display mt-2 text-5xl">Invalid token</h1>
        <p className="mt-3 text-sm" data-testid="share-invalid">This token does not resolve a trip. Internal booking ids are not accepted as share tokens.</p>
      </div>
    );
  }
  if (resolved.status === "expired") {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="kicker">Share link</div>
        <h1 className="display mt-2 text-5xl">Link expired</h1>
        <p className="mt-3 text-sm" data-testid="share-expired">Recipient access ended. Ask the passenger to mint a new share link.</p>
      </div>
    );
  }
  const rec = resolved.record;
  const b = rec ? resolveBooking(rec.bookingId, bookings, live) : null;
  const view = publicShareView(b, rec && live.bookingId === rec.bookingId ? live : null, rec?.bookingId ?? "");
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="kicker">Recipient-safe trip view</div>
      <h1 className="display mt-2 text-5xl">Shared movement</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">OTP, SOS, payment, phone numbers, and dispatch controls are hidden.</p>
      <div className="zf-panel mt-6 space-y-2 p-4">
        <div className="kicker">Company movement</div>
        <div className="text-xl font-semibold">
          {view.pickup} → {view.dropoff}
        </div>
        <div className="text-sm">{view.flight} · {view.phase}</div>
        <div className="text-sm">{view.driverLabel}{view.etaMin != null ? ` · ETA ${view.etaMin}` : ""}</div>
      </div>
    </div>
  );
}
