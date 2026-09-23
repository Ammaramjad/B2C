"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cities, extras, services } from "@/lib/catalog";
import { popularRoutes } from "@/lib/routes";
import { reviews, transfers } from "@/lib/transfers";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Chip } from "@/components/ui";

const how = [
  { n: "01", en: "Search a car", zh: "搜尋專車" },
  { n: "02", en: "Pick vehicle + extras", zh: "選車與加購" },
  { n: "03", en: "Pay NT$ · get OTP", zh: "NT$ 付款 · 取得 OTP" },
  { n: "04", en: "Live map to pickup", zh: "地圖追蹤接駕" },
];

export default function HomePage() {
  const { locale, currency, setDraft, draft } = useStore();
  const router = useRouter();
  const zh = locale === "zh";

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[28px]">
        <LiveMap locale={locale} mode="fleet" height={600} pickup={draft.pickup} dropoff={draft.dropoff} eta={zh ? "即時車隊" : "Live Taiwan fleet"} />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-8">
          <div className="elevated rise mx-auto max-w-4xl space-y-4 rounded-[24px] p-5 md:p-6">
            <Chip tone="live">{loc(locale, "Klook-style cars · Taiwan only · no hotels", "Klook 式專車 · 只做台灣 · 不含飯店")}</Chip>
            <h1 className="display text-4xl md:text-6xl">{loc(locale, "Airport, city, charter, taxi — one booking.", "接機、市區、包車、叫車 — 一次訂完。")}</h1>
            <form
              className="grid gap-2 md:grid-cols-2 lg:grid-cols-5"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/book");
              }}
            >
              <input value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} placeholder={zh ? "上車" : "Pickup"} />
              <input value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} placeholder={zh ? "下車" : "Drop-off"} />
              <input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
              <input type="number" min={1} value={draft.passengers} onChange={(e) => setDraft({ passengers: Number(e.target.value) })} />
              <Btn type="submit" className="pulse-cta">{loc(locale, "Search", "搜尋")}</Btn>
            </form>
            <div className="flex flex-wrap gap-2">
              {services.filter((s) => s.id !== "rental").map((s) => (
                <Link key={s.id} href={s.id === "instant" ? "/instant" : s.id === "hourly" ? "/charter" : "/cars"} className="rounded-xl hairline px-3 py-2 text-sm">
                  {zh ? s.zh : s.en}
                </Link>
              ))}
              <Link href="/rental" className="rounded-xl hairline px-3 py-2 text-sm">{zh ? "租車自駕" : "Self-drive"}</Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="display mb-4 text-3xl">{loc(locale, "How ZOUDIAN works", "走癲怎麼用")}</h2>
        <div className="stagger grid gap-4 md:grid-cols-4">
          {how.map((h) => (
            <div key={h.n}>
              <div className="label">{h.n}</div>
              <div className="display text-2xl">{zh ? h.zh : h.en}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex justify-between">
          <h2 className="display text-3xl">{loc(locale, "Popular airport routes", "熱門機場路線")}</h2>
          <Link href="/routes" className="text-sm text-[var(--muted)]">{loc(locale, "All routes", "全部路線")}</Link>
        </div>
        <div className="stagger grid gap-4 md:grid-cols-2">
          {popularRoutes.map((r) => (
            <button
              key={r.id}
              className="text-left"
              onClick={() => {
                setDraft({ pickup: r.from, dropoff: r.to, service: r.service });
                router.push("/book");
              }}
            >
              <div className="display text-xl">{zh ? `${r.fromZh} → ${r.toZh}` : `${r.from} → ${r.to}`}</div>
              <p className="text-sm text-[var(--muted)]">{r.mins} min · from {money(convert(r.price, currency), currency)}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex justify-between">
          <h2 className="display text-3xl">{loc(locale, "Featured cars", "精選專車")}</h2>
          <Link href="/cars" className="text-sm text-[var(--muted)]">{loc(locale, "Marketplace", "商城")}</Link>
        </div>
        <div className="stagger grid gap-6 md:grid-cols-3">
          {transfers.slice(0, 6).map((t) => (
            <Link key={t.id} href={`/cars/${t.id}`}>
              <div className="card-media h-40">
                <img src={t.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="mt-2 display text-xl">{zh ? t.titleZh : t.title}</div>
              <p className="text-sm text-[var(--muted)]">★ {t.rating} · {t.reviews} · {t.booked}</p>
              <div className="metric">{money(convert(t.price, currency), currency)}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-4 text-3xl">{loc(locale, "8 cities", "8 座城市")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {cities.map((c) => (
            <Link key={c.id} href={`/destinations/${c.id}`}>
              <div className="display text-2xl">{zh ? c.cityZh : c.city}</div>
              <div className="text-sm text-[var(--muted)]">{zh ? c.tagZh : c.tag}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-4 text-3xl">{loc(locale, "Add-ons (priced)", "加購（標價）")}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {extras.map((e) => (
            <div key={e.id}>
              <div>{zh ? e.nameZh : e.name}</div>
              <div className="text-[var(--muted)]">{money(e.price, "TWD")}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex justify-between">
          <h2 className="display text-3xl">{loc(locale, "Traveler reviews", "旅客評價")}</h2>
          <Link href="/reviews" className="text-sm text-[var(--muted)]">{loc(locale, "All", "全部")}</Link>
        </div>
        {reviews.map((r) => (
          <p key={r.id} className="mb-2 text-sm">
            <strong>{r.name}</strong> <span className="text-[var(--muted)]">· {r.route} · {"★".repeat(r.stars)} — {zh ? r.textZh : r.text}</span>
          </p>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/safety" className="rounded-[20px] hairline p-5">
          <div className="display text-2xl">{loc(locale, "Safety + SOS", "安全＋SOS")}</div>
          <p className="text-sm text-[var(--muted)]">OTP · share trip · 110/119 disclaimer</p>
        </Link>
        <Link href="/policies" className="rounded-[20px] hairline p-5">
          <div className="display text-2xl">{loc(locale, "Cancel & pay", "取消與付款")}</div>
          <p className="text-sm text-[var(--muted)]">card · LINE · Apple · cash</p>
        </Link>
        <Link href="/help" className="rounded-[20px] hairline p-5">
          <div className="display text-2xl">{loc(locale, "24h help", "24h 客服")}</div>
          <p className="text-sm text-[var(--muted)]">8 categories · AI L1</p>
        </Link>
      </section>
    </div>
  );
}
