"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { transfers } from "@/lib/transfers";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { ServiceType } from "@/lib/types";

export default function CarsPage() {
  const { locale, currency, saved, toggleSaved } = useStore();
  const zh = locale === "zh";
  const [svc, setSvc] = useState<ServiceType | "all">("all");
  const [sort, setSort] = useState<"price" | "rate">("rate");
  const rows = useMemo(() => {
    let list = svc === "all" ? transfers : transfers.filter((t) => t.service === svc);
    list = [...list].sort((a, b) => (sort === "price" ? a.price - b.price : b.rating - a.rating));
    return list;
  }, [svc, sort]);

  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Private cars in Taiwan", "台灣專車")}</h1>
      <p className="text-[var(--muted)]">{loc(locale, "Airport, city, hourly charter, taxi. Hotels are not sold here.", "接送、包車、計程車。不販售飯店。")}</p>
      <div className="flex flex-wrap gap-2">
        {(["all", "airport_pickup", "airport_drop", "p2p", "hourly"] as const).map((s) => (
          <button key={s} onClick={() => setSvc(s)} className={`rounded-xl px-3 py-2 text-sm ${svc === s ? "bg-[var(--primary)] text-[var(--primary-ink)]" : "hairline"}`}>
            {s}
          </button>
        ))}
        <button onClick={() => setSort(sort === "price" ? "rate" : "price")} className="rounded-xl hairline px-3 py-2 text-sm">
          {sort === "price" ? loc(locale, "Price", "價格") : loc(locale, "Rating", "評分")}
        </button>
      </div>
      <div className="stagger space-y-6">
        {rows.map((t) => (
          <div key={t.id} className="grid gap-4 md:grid-cols-[280px_1fr_auto]">
            <Link href={`/cars/${t.id}`} className="card-media h-40">
              <img src={t.image} alt="" className="h-full w-full object-cover" />
            </Link>
            <div>
              <Link href={`/cars/${t.id}`} className="display text-2xl">{zh ? t.titleZh : t.title}</Link>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {zh ? t.fromZh : t.from} → {zh ? t.toZh : t.to} · {t.duration} · {t.seats}/{t.luggage} · ★ {t.rating} ({t.reviews}) · {t.booked}
              </p>
              <p className="mt-2 text-sm">{zh ? t.cancelZh : t.cancel}</p>
              <button className="mt-2 text-sm text-[var(--ai)]" onClick={() => toggleSaved(t.id)}>
                {saved.includes(t.id) ? loc(locale, "Saved", "已收藏") : loc(locale, "Save", "收藏")}
              </button>
            </div>
            <div className="text-right">
              <div className="metric text-2xl">{money(convert(t.price, currency), currency)}</div>
              <Link href={`/cars/${t.id}`} className="mt-2 inline-block rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-ink)]">
                {loc(locale, "Select", "選擇")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
