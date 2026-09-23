"use client";

import { use } from "react";
import Link from "next/link";
import { destinations, popularRoutes } from "@/lib/data";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Panel } from "@/components/ui";

export default function CityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const city = destinations.find((d) => d.id === id) ?? destinations[0];
  const { currency, setDraft } = useStore();
  return (
    <div className="space-y-8">
      <div className="relative h-72 overflow-hidden rounded-[32px]">
        <img src={city.image} alt={city.city} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] to-transparent" />
        <div className="absolute bottom-6 left-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-100">{city.country}</div>
          <h1 className="display text-5xl">{city.city}</h1>
          <p className="text-white/70">{city.tag}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {popularRoutes.map((r) => (
          <Panel key={r.from + r.to}>
            <div className="display text-xl">
              {r.from} → {r.to}
            </div>
            <div className="mt-2 text-sm text-white/50">
              {r.km} km · {r.mins} min · {money(convert(r.price, currency), currency)}
            </div>
            <Btn
              className="mt-4"
              kind="ghost"
              onClick={() => {
                setDraft({ pickup: r.from, dropoff: r.to, service: "airport" });
              }}
              href="/book"
            >
              Book this vector
            </Btn>
          </Panel>
        ))}
      </div>
      <Link href="/destinations" className="text-sm text-cyan-200">
        ← All cities
      </Link>
    </div>
  );
}
