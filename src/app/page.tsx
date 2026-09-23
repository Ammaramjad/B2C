"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cities, entries, extras, services } from "@/lib/catalog";
import { loc, t } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { AreaChart } from "@/components/charts";
import { LiveMap } from "@/components/live-map";
import { Btn, Chip, Panel } from "@/components/ui";
import type { ServiceType } from "@/lib/types";

export default function HomePage() {
  const { locale, currency, setDraft, recent, pushRecent } = useStore();
  const d = t(locale);
  const router = useRouter();
  const zh = locale === "zh";

  function go(id: ServiceType) {
    setDraft({ service: id, channel: id === "instant" ? "taxi" : "web" });
    pushRecent(id);
    router.push(id === "instant" ? "/instant" : "/book");
  }

  return (
    <div className="space-y-12">
      <section className="rise space-y-5">
        <div className="relative overflow-hidden rounded-[36px]">
          <LiveMap locale={locale} mode="fleet" height={500} pickup="TPE T1" dropoff="Taipei 101" eta={zh ? "45 分免費等候" : "45-min free wait"} />
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#030014]/75 to-transparent p-6 md:p-10">
            <Chip>走癲派車 B2C · v10.0 · {zh ? "漠北文創規劃" : "Mobei design"}</Chip>
            <h1 className="display mt-4 max-w-3xl text-4xl md:text-6xl">{d.hero}</h1>
            <p className="mt-3 max-w-xl text-sm text-white/75">{d.heroSub}</p>
            <div className="pointer-events-auto mt-5 flex flex-wrap gap-3">
              <Btn href="/book">{d.ctaBook}</Btn>
              <Btn href="/instant" kind="ghost">{d.ctaPlan}</Btn>
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-white/40">{zh ? "最近搜尋" : "Recent"}</span>
          {recent.map((r) => (
            <button key={r} onClick={() => go(r as ServiceType)} className="glass-chip">
              {r}
            </button>
          ))}
        </div>
      )}

      <section>
        <h2 className="display mb-4 text-3xl">{d.services}</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <button key={s.id} onClick={() => go(s.id)} className="glass rise rounded-[26px] p-5 text-left">
              <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/70">{s.id}</div>
              <div className="display mt-1 text-2xl">{zh ? s.zh : s.en}</div>
              <p className="mt-2 text-xs text-white/50">{s.formula}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-4 text-3xl">{zh ? "6 入口" : "6 entries"}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {entries.map((e) => (
            <Panel key={e.id}>
              <div className="text-[10px] uppercase text-white/40">{e.phase}</div>
              <div className="display text-xl">{zh ? e.zh : e.en}</div>
            </Panel>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-4 text-3xl">{d.destinations}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {cities.map((c) => (
            <Link key={c.id} href={`/destinations/${c.id}`} className="group relative h-52 overflow-hidden rounded-[24px]">
              <img src={c.image} alt={c.city} className="h-full w-full object-cover transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <div className="display text-2xl">{zh ? c.cityZh : c.city}</div>
                <div className="text-xs text-white/70">{zh ? c.tagZh : c.tag} · {money(convert(c.from, currency), currency)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel className="neon">
          <AreaChart label={zh ? "18:00 產能高峰" : "Demand pulse"} values={[18, 22, 31, 14, 19, 24, 28]} />
        </Panel>
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">{zh ? "6 加購 · NT$" : "6 extras · NT$"}</div>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {extras.map((e) => (
              <li key={e.id} className="flex justify-between">
                <span>{zh ? e.nameZh : e.name}</span>
                <span>{money(e.price, "TWD")}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <Panel>
        <div className="display text-xl">{loc(locale, "How live map runs on the web", "網頁上的即時地圖怎麼跑")}</div>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          {loc(
            locale,
            "The traveler site is 100% web (RWD + PWA). Driver GPS is pushed about every 10 seconds. The browser draws an animated map (OSRM / HERE / Google can be swapped in admin). No native app is required — Live tab and trip pages stream the same mesh. This demo uses a 2030 HUD map so it works without map-API keys; production plugs the same component to a real tile + WebSocket feed.",
            "旅客端全網頁（RWD＋PWA）。司機 GPS 約每 10 秒推播。瀏覽器畫出動畫地圖（後台可切 OSRM／HERE／Google）。不必裝原生 App——即時頁與行程頁共用同一網格。本展示用 2030 HUD 地圖，無需金鑰；上線時同一元件接真實圖磚＋WebSocket。",
          )}
        </p>
      </Panel>
    </div>
  );
}
