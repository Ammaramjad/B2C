"use client";

import Link from "next/link";
import { airports } from "@/lib/routes";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function AirportsPage() {
  const { locale } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Airport transfers", "機場接送")}</h1>
      <p className="text-[var(--muted)]">{loc(locale, "Meet & greet, flight track, free wait. No hotels.", "舉牌、航班追蹤、免費等候。不含飯店。")}</p>
      <div className="stagger grid gap-6 md:grid-cols-2">
        {airports.map((a) => (
          <Link key={a.id} href={`/airports/${a.id}`} className="block">
            <div className="label">{a.code}</div>
            <div className="display text-3xl">{locale === "zh" ? a.nameZh : a.name}</div>
            <p className="text-sm text-[var(--muted)]">{a.city} · {loc(locale, "free wait", "免費等候")} {a.wait} min</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
