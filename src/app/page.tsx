"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { reviews, transfers } from "@/lib/transfers";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Chip } from "@/components/ui";

export default function HomePage() {
  const { locale, currency, setDraft, draft } = useStore();
  const router = useRouter();
  const zh = locale === "zh";

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px]">
        <LiveMap locale={locale} mode="fleet" height={560} pickup={draft.pickup} dropoff={draft.dropoff} eta={zh ? "即時車隊" : "Live cars"} />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-7">
          <div className="elevated rise mx-auto max-w-3xl space-y-4 rounded-[24px] p-5">
            <Chip tone="live">{loc(locale, "Taiwan car transfer · no hotels", "台灣專車 · 不含飯店")}</Chip>
            <h1 className="display text-4xl md:text-5xl">{loc(locale, "Book a private car in Taiwan", "預訂台灣專車接送")}</h1>
            <form
              className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/cars");
              }}
            >
              <input value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} placeholder={zh ? "上車 — 桃園機場" : "Pickup — TPE"} />
              <input value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} placeholder={zh ? "下車 — 台北 101" : "Drop-off — Taipei 101"} />
              <Btn type="submit" className="pulse-cta">{loc(locale, "Search cars", "搜尋專車")}</Btn>
            </form>
            <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
              {["airport_pickup", "airport_drop", "p2p", "hourly", "instant"].map((s) => (
                <Link key={s} href="/cars" className="underline-offset-4 hover:underline">
                  {s.replace("_", " ")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="display text-3xl">{loc(locale, "Top car transfers", "熱門專車")}</h2>
          <Link href="/cars" className="text-sm text-[var(--muted)]">{loc(locale, "See all", "全部")}</Link>
        </div>
        <div className="stagger grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {transfers.map((t) => (
            <Link key={t.id} href={`/cars/${t.id}`} className="block">
              <div className="card-media h-44">
                <img src={t.image} alt={t.title} className="h-full w-full object-cover" />
              </div>
              <div className="mt-3 display text-xl">{zh ? t.titleZh : t.title}</div>
              <p className="text-sm text-[var(--muted)]">
                ★ {t.rating} ({t.reviews}) · {t.booked} · {t.duration} · {t.seats} seats
              </p>
              <div className="metric mt-1 text-lg">{money(convert(t.price, currency), currency)}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="display text-2xl">{loc(locale, "Recent reviews", "最新評價")}</h2>
        {reviews.slice(0, 3).map((r) => (
          <p key={r.id} className="text-sm">
            <span className="font-medium">{r.name}</span>
            <span className="text-[var(--muted)]"> · {r.route} · {"★".repeat(r.stars)} — {zh ? r.textZh : r.text}</span>
          </p>
        ))}
      </section>
    </div>
  );
}
