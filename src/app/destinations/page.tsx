"use client";

import Link from "next/link";
import { cities } from "@/lib/catalog";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export default function DestinationsPage() {
  const { currency, locale } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{locale === "zh" ? "8 座城市" : "Cities"}</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {cities.map((c) => (
          <Link key={c.id} href={`/destinations/${c.id}`} className="block">
            <div className="display text-3xl">{locale === "zh" ? c.cityZh : c.city}</div>
            <div className="text-sm text-[var(--muted)]">{locale === "zh" ? c.tagZh : c.tag} · {money(convert(c.from, currency), currency)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
