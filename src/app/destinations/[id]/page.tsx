"use client";

import { use } from "react";
import Link from "next/link";
import { cities } from "@/lib/catalog";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Panel } from "@/components/ui";

export default function CityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const city = cities.find((d) => d.id === id) ?? cities[0];
  const { currency, setDraft, locale } = useStore();
  return (
    <div className="space-y-6">
      <div className="relative h-64 overflow-hidden rounded-[32px]">
        <img src={city.image} alt={city.city} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] to-transparent" />
        <div className="absolute bottom-6 left-6">
          <h1 className="display text-5xl">{locale === "zh" ? city.cityZh : city.city}</h1>
          <p className="text-white/70">{locale === "zh" ? city.tagZh : city.tag}</p>
        </div>
      </div>
      <Panel>
        <div className="display text-xl">TPE → {locale === "zh" ? city.cityZh : city.city}</div>
        <div className="mt-2 text-sm text-white/50">{money(convert(city.from, currency), currency)}</div>
        <Btn className="mt-4" href="/book" onClick={() => setDraft({ pickup: "TPE T1", dropoff: city.city, service: "airport_pickup" })}>
          {locale === "zh" ? "預訂接機" : "Book pickup"}
        </Btn>
      </Panel>
      <Link href="/destinations" className="text-sm text-cyan-200">←</Link>
    </div>
  );
}
