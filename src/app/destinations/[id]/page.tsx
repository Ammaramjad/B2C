"use client";

import { use } from "react";
import { cities } from "@/lib/catalog";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn } from "@/components/ui";

export default function CityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const city = cities.find((d) => d.id === id) ?? cities[0];
  const { currency, setDraft, locale } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="display text-5xl">{locale === "zh" ? city.cityZh : city.city}</h1>
      <p className="text-[var(--muted)]">{locale === "zh" ? city.tagZh : city.tag} · {money(convert(city.from, currency), currency)}</p>
      <Btn href="/book" onClick={() => setDraft({ pickup: "TPE T1", dropoff: city.city, service: "airport_pickup" })}>
        {locale === "zh" ? "預訂接機" : "Book pickup"}
      </Btn>
    </div>
  );
}
