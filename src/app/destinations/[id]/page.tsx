import Link from "next/link";
import type { Metadata } from "next";
import { cities } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = cities.find((x) => x.id === id) ?? cities[0];
  return {
    title: `${c.city} transfers · Zoufeng`,
    description: `${c.tag}. Airport and city cars dispatched by Zoufeng — never a private driver handshake.`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = cities.find((x) => x.id === id) ?? cities[0];
  return (
    <div className="mx-auto max-w-xl px-4 py-10 pb-24">
      <div className="kicker">{c.tag}</div>
      <h1 className="display mt-2 text-5xl">{c.city}</h1>
      <p className="mt-3 text-[var(--ink-2)]">
        Corridor cars are quoted by service, vehicle, night, and extras. Preferred drivers are a company request, not a side channel.
      </p>
      <ul className="zf-stream mt-6">
        <li>Airport pickup reacts to flight status on the live tape (simulated until a flight vendor is wired).</li>
        <li>Point-to-point is a private transfer with capacity matching.</li>
        <li>Hourly keeps the driver with the party.</li>
        <li>Self-drive is depot-based — no chauffeur marker.</li>
      </ul>
      <h2 className="mt-8 text-lg font-semibold">FAQ</h2>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-semibold">How long is free airport wait?</dt>
          <dd>45 minutes after actual arrival on airport pickup.</dd>
        </div>
        <div>
          <dt className="font-semibold">Can I book a named driver?</dt>
          <dd>You can request a preferred driver. Zoufeng validates and issues the offer.</dd>
        </div>
        <div>
          <dt className="font-semibold">What if the flight is delayed?</dt>
          <dd>The live tape updates ETA. Production flight feeds are not connected yet.</dd>
        </div>
      </dl>
      <Link href="/book?service=airport_pickup" className="zf-btn mt-6">
        Book airport pickup
      </Link>
      <Link href="/book?service=p2p" className="zf-btn ghost mt-2">
        Book a city transfer
      </Link>
    </div>
  );
}
