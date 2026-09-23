import Link from "next/link";
import type { Metadata } from "next";
import { cities, services } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Airport and city transfers · Zoufeng Signal",
  description: "Airport pickup, city corridors, hourly charter, and self-drive across Taiwan. Book a company-dispatched car.",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-24">
      <div className="kicker">M22 · Destinations</div>
      <h1 className="display mt-2 text-5xl">Airport and city corridors.</h1>
      <p className="mt-3 max-w-xl text-[var(--ink-2)]">These pages are bookable service landings, not brochure tiles. Dispatch stays company-owned.</p>
      <h2 className="mt-8 text-xl font-semibold">Services</h2>
      <div className="mt-3 grid gap-2">
        {services.map((s) => (
          <Link key={s.id} href={`/book?service=${s.id}`} className="zf-panel p-4">
            <b>{s.en}</b>
            <div className="text-sm">{s.zh} · {s.formula}</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-8 text-xl font-semibold">Cities</h2>
      <div className="mt-3 grid gap-2">
        {cities.map((c) => (
          <Link key={c.id} href={`/destinations/${c.id}`} className="zf-panel p-4">
            <b>{c.city}</b>
            <div className="text-sm text-[var(--ink-2)]">{c.tag} · from NT${c.from}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
