"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CarFront, Plane, Route, Sparkles, Timer, UserRound, Zap } from "lucide-react";
import { destinations, experiences, kpis } from "@/lib/data";
import { t } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
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
      <section className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Chip>
            <Sparkles className="h-3 w-3" /> 6+2 service architecture · Dispatch 2.0
          </Chip>
          <h1 className="display mt-5 text-5xl leading-[0.95] md:text-7xl">
            {d.hero}
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/65 md:text-lg">{d.heroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Btn href="/book">{d.ctaBook}</Btn>
            <Btn href="/planner" kind="ghost">{d.ctaPlan}</Btn>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.slice(0, 4).map((k) => (
              <div key={k.key} className="glass rounded-2xl p-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {locale === "zh" ? k.labelZh : k.label}
                </div>
                <div className="display text-lg">
                  {"twd" in k && k.twd != null ? money(convert(k.twd, currency), currency) : (k.value ?? "—")}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative scanline">
          <div className="spin-slow absolute -left-8 top-8 h-40 w-40 rounded-full border border-cyan-200/20" />
          <div className="spin-slow absolute -right-6 bottom-10 h-28 w-28 rounded-full border border-fuchsia-300/25" />
          <Panel className="relative overflow-hidden neon">
            <div className="text-[11px] uppercase tracking-[0.24em] text-cyan-100/70">{d.live}</div>
            <div className="display mt-2 text-3xl">Taipei mesh · TPE</div>
            <div className="relative mt-6 h-56 overflow-hidden rounded-[22px] bg-[#05001c]">
              <div className="absolute inset-0 opacity-60" style={{
                background:
                  "radial-gradient(circle at 30% 40%, rgba(78,242,255,0.35), transparent 28%), radial-gradient(circle at 70% 60%, rgba(255,79,216,0.28), transparent 26%)",
              }} />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 220">
                <path d="M20 180 C 80 40, 160 200, 240 80 S 360 40, 390 120" fill="none" stroke="rgba(78,242,255,0.55)" strokeWidth="1.4" />
                <path d="M30 40 C 120 90, 180 20, 260 110 S 340 180, 380 90" fill="none" stroke="rgba(176,140,255,0.5)" strokeWidth="1.2" />
                <circle cx="240" cy="80" r="5" fill="#4ef2ff" />
                <circle cx="120" cy="90" r="4" fill="#ff4fd8" />
                <circle cx="320" cy="140" r="4" fill="#c8ff6a" />
              </svg>
              <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-lime-300">
                18 vessels live
              </div>
              <div className="absolute bottom-4 right-4 rounded-2xl bg-black/45 px-3 py-2 text-xs text-white/80">
                CI101 · T1 · 14:35 · free-wait armed
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-white/60">
              <div>OTP boarding</div>
              <div>Share-link</div>
              <div>SOS L3</div>
            </div>
          </Panel>
        </div>
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
