"use client";

import Link from "next/link";
import { cities } from "@/lib/catalog";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export default function DestinationsPage() {
  const { currency, locale } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{locale === "zh" ? "8 座城市" : "8 cities"}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {cities.map((c) => (
          <Link key={c.id} href={`/destinations/${c.id}`} className="group relative h-56 overflow-hidden rounded-[28px]">
            <img src={c.image} alt={c.city} className="h-full w-full object-cover transition group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-5 left-5">
              <div className="display text-3xl">{locale === "zh" ? c.cityZh : c.city}</div>
              <div className="text-sm text-white/70">{locale === "zh" ? c.tagZh : c.tag} · {money(convert(c.from, currency), currency)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
