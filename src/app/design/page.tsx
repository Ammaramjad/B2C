"use client";

import Link from "next/link";
import { extraRoutes, screens } from "@/lib/atlas";
import { Btn, Empty, Kicker, Skeleton, Stamp, Ticket } from "@/components/atlas/primitives";
import { FareSheet } from "@/components/atlas/fare";
import { quote } from "@/lib/pricing";

const q = quote({ service: "airport_pickup", vehicle: "sedan", extras: ["meet"], when: "2026-09-23T23:40" });

export default function DesignFoundation() {
  return (
    <div className="mx-auto max-w-6xl">
      <Kicker>Review gate · BP / BQ</Kicker>
      <h1 className="serif mt-2 text-6xl">Zoufeng Atlas</h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)]">
        Design foundation only. Three operating systems, one language. Not a reskin of the rejected HUD. Human approval required before full development.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Stamp tone="copper">Passenger · travel commerce</Stamp>
        <Stamp>Driver · task OS</Stamp>
        <Stamp>Ops · command room</Stamp>
        <Stamp>Admin · ledgers</Stamp>
      </div>

      <section className="mt-14">
        <h2 className="serif text-4xl">Tokens</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Canvas", "var(--canvas)"],
            ["Paper", "var(--paper)"],
            ["Ink", "var(--ink)"],
            ["Copper", "var(--copper)"],
            ["Pine", "var(--pine)"],
            ["Brass", "var(--brass)"],
            ["Alert", "var(--alert)"],
            ["Rule", "var(--rule)"],
          ].map(([n, c]) => (
            <div key={n} className="ticket">
              <div className="h-12 border border-[var(--rule)]" style={{ background: c }} />
              <div className="mt-2 text-sm">{n}</div>
              <div className="mono text-[11px] text-[var(--mute)]">{c}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-[var(--ink-soft)]">
          Type: Instrument Serif + Source Sans 3 + IBM Plex Mono + Noto TC. Radius 2/4/8. Space 4–72. Elevation 0–3. No glass stacks, no neon.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="serif text-4xl">Components</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn>Solid</Btn>
          <Btn kind="ghost">Ghost</Btn>
          <Btn kind="pine">Pine</Btn>
          <Btn kind="alert">SOS</Btn>
          <Stamp tone="pine">Paid</Stamp>
          <Stamp tone="warn">Delay</Stamp>
        </div>
        <div className="mt-4 max-w-md">
          <FareSheet quote={q} currency="TWD" compact />
        </div>
        <div className="mt-4">
          <Empty title="No driver in range" body="Keep searching, or switch to a scheduled transfer." action={<Btn href="/book">Schedule instead</Btn>} />
        </div>
        <Skeleton className="mt-4 h-10 w-1/2" />
      </section>

      <section className="mt-14">
        <h2 className="serif text-4xl">47 representative screens</h2>
        <table className="dense mt-6 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Screen</th>
              <th>Role</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {screens.map((s) => (
              <tr key={s.id}>
                <td className="metric">{s.n}</td>
                <td className="mono">{s.id}</td>
                <td>
                  <Link href={s.href} className="underline decoration-[var(--rule)]">
                    {s.title}
                  </Link>
                </td>
                <td>{s.role}</td>
                <td>{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-14">
        <h2 className="serif text-4xl">Extended routes</h2>
        <ul className="mt-4 space-y-1 text-sm">
          {extraRoutes.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="underline">
                {r.href}
              </Link>{" "}
              — {r.title}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <Ticket>
          <Kicker>Responsive</Kicker>
          <p className="mt-2 text-sm">Passenger: marketplace + sticky book. Driver: 430px handset. Ops: map + inspector, not a mobile control room. Admin: table + filter.</p>
        </Ticket>
        <Ticket>
          <Kicker>States</Kicker>
          <p className="mt-2 text-sm">Loading skeletons, empty trays, capacity mismatch copy, payment fail, flight unavailable, no driver, SOS, permission, expired session.</p>
        </Ticket>
      </section>
    </div>
  );
}
