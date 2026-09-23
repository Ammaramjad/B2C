"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CarFront, Plane, Route, Sparkles, Timer, UserRound, Zap } from "lucide-react";
import { destinations, experiences, kpis } from "@/lib/data";
import { t } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { AreaChart } from "@/components/charts";
import { Btn, Chip, Panel } from "@/components/ui";
import type { ServiceType } from "@/lib/types";

const services: { id: ServiceType; icon: typeof Plane; title: string; copy: string }[] = [
  { id: "airport", icon: Plane, title: "Airport orbit", copy: "Flight-aware meet, 60-min free wait, OTP boarding." },
  { id: "point", icon: Route, title: "Point to point", copy: "City vectors with live quote and capacity match." },
  { id: "charter", icon: Timer, title: "Charter hours", copy: "Half / full day, overtime and extra-mile pulses." },
  { id: "taxi", icon: Zap, title: "On-demand taxi", copy: "Instant hail inside the same booking object." },
  { id: "rental", icon: CarFront, title: "Self-drive", copy: "Unlock a vessel, keep the wallet ledger." },
  { id: "designated", icon: UserRound, title: "Designated driver", copy: "Lock a preferred captain for +18%." },
];

export default function HomePage() {
  const { locale, currency, setDraft } = useStore();
  const router = useRouter();
  const d = t(locale);

  function launch(id: ServiceType) {
    setDraft({ service: id });
    router.push("/book");
  }

  return (
    <div className="space-y-16">
      <section className="rise space-y-6">
        <div className="relative overflow-hidden rounded-[36px]">
          <LiveMap
            locale={locale}
            mode="fleet"
            height={520}
            pickup={locale === "zh" ? "桃園機場 T1" : "TPE T1 Arrivals"}
            dropoff={locale === "zh" ? "信義／臺北 101" : "Xinyi / Taipei 101"}
            eta={locale === "zh" ? "ETA 9 分 · 4.2 km" : "ETA 9 min · 4.2 km"}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-[#030014]/70 via-[#030014]/20 to-transparent p-6 md:p-10">
            <Chip>
              <Sparkles className="h-3 w-3" /> {d.live} · M15
            </Chip>
            <h1 className="display mt-4 max-w-3xl text-4xl leading-[0.95] text-white drop-shadow md:text-6xl">
              {d.hero}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/75 md:text-base">{d.heroSub}</p>
            <div className="pointer-events-auto mt-5 flex flex-wrap gap-3">
              <Btn href="/book">{d.ctaBook}</Btn>
              <Btn href="/planner" kind="ghost">{d.ctaPlan}</Btn>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.slice(0, 4).map((k) => (
            <div key={k.key} className="glass rise rounded-2xl p-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                {locale === "zh" ? k.labelZh : k.label}
              </div>
              <div className="display text-lg">
                {"twd" in k && k.twd != null ? money(convert(k.twd, currency), currency) : (k.value ?? "—")}
              </div>
            </div>
          ))}
        </div>
        <Panel className="neon">
          <AreaChart
            label={locale === "zh" ? "7 日 GMV 脈衝" : "7-day GMV pulse"}
            values={[12.1, 13.4, 12.8, 15.2, 16.1, 17.4, 18.4]}
          />
        </Panel>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="display text-3xl">{d.services}</h2>
          <Link href="/book" className="text-sm text-cyan-200">All orbits →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => launch(s.id)}
              className="glass group rounded-[26px] p-5 text-left transition hover:-translate-y-1"
            >
              <s.icon className="h-5 w-5 text-cyan-200" />
              <div className="display mt-3 text-xl">{s.title}</div>
              <p className="mt-2 text-sm text-white/55">{s.copy}</p>
              <div className="mt-4 flex items-center text-xs uppercase tracking-[0.18em] text-white/40 group-hover:text-cyan-200">
                Launch <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-5 text-3xl">{d.destinations}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {destinations.map((c) => (
            <Link key={c.id} href={`/destinations/${c.id}`} className="group relative h-72 overflow-hidden rounded-[28px]">
              <img src={c.image} alt={c.city} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/20 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/80">
                  {locale === "zh" ? c.countryZh : c.country}
                </div>
                <div className="display text-3xl">{locale === "zh" ? c.cityZh : c.city}</div>
                <div className="mt-1 text-sm text-white/70">
                  {c.routes} routes · from {money(convert(c.from, currency), currency)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="display mb-5 text-3xl">{d.experiences}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {experiences.map((e) => (
            <Panel key={e.id} className="overflow-hidden p-0">
              <img src={e.image} alt={e.title} className="h-40 w-full object-cover" />
              <div className="p-5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-200/70">{e.category} · {e.city}</div>
                <div className="display mt-1 text-xl">{e.title}</div>
                <div className="mt-3 flex items-center justify-between text-sm text-white/60">
                  <span>{e.hours}h · ★ {e.rating}</span>
                  <span>{money(convert(e.price, currency), currency)}</span>
                </div>
                <Btn
                  className="mt-4 w-full"
                  href="/book"
                  kind="ghost"
                >
                  Inject into booking
                </Btn>
              </div>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
