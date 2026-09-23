"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { convert, money } from "@/lib/pricing";
import { Panel } from "@/components/ui";

export default function TripsPage() {
  const { bookings, currency } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">Trip constellation</h1>
      {bookings.length === 0 ? (
        <Panel>
          <p className="text-white/60">No orbits yet. Launch a booking to light this sky.</p>
          <a href="/book" className="mt-3 inline-block text-cyan-200">Open booking →</a>
        </Panel>
      ) : (
        <div className="grid gap-4">
          {bookings.map((b) => (
            <Link key={b.id} href={`/trips/${b.id}`}>
              <Panel className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">
                    {b.id} · {b.service} · {b.status.replace("_", " ")}
                  </div>
                  <div className="display mt-1 text-2xl">
                    {b.pickup} → {b.dropoff}
                  </div>
                  <div className="text-sm text-white/50">{b.when.replace("T", " · ")}</div>
                </div>
                <div className="text-right">
                  <div className="display text-xl">{money(convert(b.price, currency), currency)}</div>
                  <div className="text-xs text-white/40">OTP {b.otp}</div>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
