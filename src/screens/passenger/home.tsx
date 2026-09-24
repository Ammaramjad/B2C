"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cities, services } from "@/lib/catalog";
import { serviceCopy } from "@/lib/atlas";
import { useStore } from "@/lib/store";
import { Btn, Kicker, Stamp } from "@/components/atlas/primitives";
import type { ServiceType } from "@/lib/types";

export function PassengerHome() {
  const { locale, draft, setDraft, bookings } = useStore();
  const zh = locale === "zh";
  const router = useRouter();
  const next = bookings.find((b) => ["arriving", "onboard", "accepted", "assigned"].includes(b.status));

  function start(id: ServiceType) {
    setDraft({ service: id, channel: id === "instant" ? "taxi" : "web" });
    router.push(`/book?service=${id}`);
  }

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden border-b border-[var(--rule)]">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=2000&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,23,18,0.18),rgba(28,23,18,0.55))]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-8 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="text-[#f7f1e6]">
            <Kicker>Zoufeng International · East Asia corridors</Kicker>
            <h1 className="serif mt-4 max-w-xl text-5xl leading-[1.02] md:text-7xl">Where should the car meet you?</h1>
            <p className="mt-5 max-w-md text-lg text-[#efe6d6]/85">
              {zh
                ? "接機、送機、包車、即時叫車與自駕——同一套行程語言，各自專屬預訂流程。"
                : "Airport, private transfer, charter, taxi, and self-drive. One booking language. Six distinct journeys."}
            </p>
          </div>
          <form
            className="ticket bg-[#f7f1e6] text-[#1c1712]"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/book?service=${draft.service}`);
            }}
          >
            <div className="flex items-center justify-between">
              <Kicker>Book a movement</Kicker>
              <Stamp tone="copper">M02 · Journey</Stamp>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setDraft({ service: s.id })}
                  className={`border px-2 py-2 text-left text-[13px] ${
                    draft.service === s.id ? "border-[var(--copper)] bg-[#f3e6d4]" : "border-[var(--rule)]"
                  }`}
                >
                  <div className="font-semibold">{zh ? s.zh : serviceCopy[s.id].en}</div>
                  <div className="text-[11px] text-[var(--mute)]">{serviceCopy[s.id].hint}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-semibold">{zh ? "要去哪裡？" : "Where are you going?"}</span>
                <input
                  className="atlas-input"
                  value={draft.dropoff}
                  onChange={(e) => setDraft({ dropoff: e.target.value })}
                  placeholder={zh ? "台北 101、飯店、航廈…" : "Taipei 101, hotel, terminal…"}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block font-semibold">{zh ? "何時" : "When"}</span>
                  <input className="atlas-input" type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-semibold">{zh ? "人數 / 行李" : "People / bags"}</span>
                  <input
                    className="atlas-input"
                    value={`${draft.passengers} pax · ${draft.luggage} bags`}
                    readOnly
                  />
                </label>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Btn type="submit" className="flex-1">
                {zh ? "開始規劃行程" : "Plan this journey"}
              </Btn>
              <Btn href="/planner" kind="ghost">
                {zh ? "AI 行程" : "Ask Atlas"}
              </Btn>
            </div>
          </form>
        </div>
      </section>

      {next ? (
        <div className="border-b border-[var(--rule)] bg-[var(--paper)]">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
            <div>
              <Kicker>Upcoming movement</Kicker>
              <div className="mt-1 font-semibold">
                {next.id} · {next.pickup} → {next.dropoff}
              </div>
            </div>
            <Btn href={`/live?id=${next.id}`} kind="ghost">
              Open live
            </Btn>
          </div>
        </div>
      ) : null}

      <section className="mx-auto max-w-[1440px] px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <Kicker>Service architecture</Kicker>
            <h2 className="serif mt-2 text-4xl">Six ways to move. None share a form.</h2>
          </div>
          <Link href="/design" className="text-sm text-[var(--mute)]">
            Screen inventory
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <button key={s.id} onClick={() => start(s.id)} className="ticket text-left">
              <Kicker>{s.id.replace("_", " ")}</Kicker>
              <div className="serif mt-2 text-3xl">{zh ? s.zh : serviceCopy[s.id].en}</div>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{zh ? serviceCopy[s.id].hintZh : serviceCopy[s.id].hint}</p>
              <div className="mt-6 text-sm text-[var(--copper)]">{zh ? serviceCopy[s.id].verbZh : serviceCopy[s.id].verb} →</div>
            </button>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--rule)] bg-[var(--paper)]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 lg:px-8">
          <Kicker>Corridors</Kicker>
          <h2 className="serif mt-2 text-4xl">Routes people actually book</h2>
          <div className="mt-8 grid gap-px bg-[var(--rule)] sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((c) => (
              <Link key={c.id} href={`/destinations/${c.id}`} className="relative min-h-[240px] overflow-hidden bg-[var(--canvas)]">
                <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(28,23,18,0.72))]" />
                <div className="absolute bottom-0 p-4 text-[#f7f1e6]">
                  <div className="serif text-3xl">{zh ? c.cityZh : c.city}</div>
                  <div className="text-sm opacity-80">{zh ? c.tagZh : c.tag}</div>
                  <div className="metric mt-2 text-sm">from NT${c.from.toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-4 py-16 lg:grid-cols-3 lg:px-8">
        <div className="ticket">
          <Kicker>Trust</Kicker>
          <h3 className="serif mt-2 text-3xl">Named drivers. Visible vehicles. 45-minute airport wait.</h3>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">OTP boarding, trip share, and SOS sit on the live trip — not in Settings.</p>
        </div>
        <div className="ticket">
          <Kicker>Membership</Kicker>
          <h3 className="serif mt-2 text-3xl">Atlas Circle</h3>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">Points, preferred drivers, and corridor credits. Benefits appear at checkout, not as a banner wall.</p>
          <Btn href="/account" kind="ghost" className="mt-4">
            Open profile
          </Btn>
        </div>
        <div className="ticket">
          <Kicker>Inspiration</Kicker>
          <h3 className="serif mt-2 text-3xl">A family weekend that already has cars.</h3>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">Atlas plans days. You review transportation. Nothing books itself.</p>
          <Btn href="/planner" className="mt-4">
            Open planner
          </Btn>
        </div>
      </section>
    </div>
  );
}
