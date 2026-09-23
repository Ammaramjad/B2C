"use client";

import Link from "next/link";
import { destinations } from "@/lib/data";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export default function DestinationsPage() {
  const { currency } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">Cities in the mesh</h1>
      <p className="max-w-2xl text-white/55">
        Dynamic landing nodes for airport orbits and popular routes — Schema.org ready, built for AEO.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {destinations.map((c) => (
          <Link key={c.id} href={`/destinations/${c.id}`} className="group relative h-64 overflow-hidden rounded-[28px]">
            <img src={c.image} alt={c.city} className="h-full w-full object-cover transition group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-5 left-5">
              <div className="display text-3xl">{c.city}</div>
              <div className="text-sm text-white/70">
                {c.tag} · from {money(convert(c.from, currency), currency)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
