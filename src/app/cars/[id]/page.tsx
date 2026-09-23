"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { reviews, transfers } from "@/lib/transfers";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn } from "@/components/ui";

export default function CarProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = transfers.find((x) => x.id === id) ?? transfers[0];
  const { locale, currency, setDraft } = useStore();
  const router = useRouter();
  const zh = locale === "zh";
  const rs = reviews.filter((r) => r.product === t.id);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <div className="card-media h-72">
          <img src={t.image} alt="" className="h-full w-full object-cover" />
        </div>
        <h1 className="display text-4xl">{zh ? t.titleZh : t.title}</h1>
        <p className="text-[var(--muted)]">
          ★ {t.rating} · {t.reviews} reviews · {t.booked} booked · {t.seats} seats · {t.luggage} luggage · {t.hours}
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {(zh ? t.includesZh : t.includes).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="text-sm">{zh ? t.cancelZh : t.cancel} · {loc(locale, "6–24h partial · <6h none", "6–24h 部分 · ＜6h 不退")}</p>
        <h2 className="display text-2xl">{loc(locale, "Reviews", "評價")}</h2>
        {rs.length === 0 && <p className="text-sm text-[var(--muted)]">{loc(locale, "Be the first after your trip.", "行程後可評價。")}</p>}
        {rs.map((r) => (
          <p key={r.id} className="text-sm">
            {r.name} · {"★".repeat(r.stars)} — {zh ? r.textZh : r.text}
          </p>
        ))}
      </div>
      <aside className="space-y-4">
        <LiveMap locale={locale} mode="trip" height={260} pickup={t.from} dropoff={t.to} />
        <div className="display metric text-4xl">{money(convert(t.price, currency), currency)}</div>
        <p className="text-sm text-[var(--muted)]">{zh ? t.fromZh : t.from} → {zh ? t.toZh : t.to}</p>
        <Btn
          className="w-full pulse-cta"
          onClick={() => {
            setDraft({
              service: t.service,
              vehicle: t.vehicle,
              pickup: t.from,
              dropoff: t.to,
              extras: t.service.startsWith("airport") ? ["meet"] : [],
              hours: t.service === "hourly" ? 8 : 4,
            });
            router.push("/book");
          }}
        >
          {loc(locale, "Continue to book", "前往預訂")}
        </Btn>
      </aside>
    </div>
  );
}
