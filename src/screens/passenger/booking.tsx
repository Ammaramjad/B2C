"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { extras, rentals, taxis, vehicles } from "@/lib/catalog";
import { serviceCopy } from "@/lib/atlas";
import { flights } from "@/lib/data";
import { money, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { AtlasMap } from "@/components/atlas/map";
import { FareSheet } from "@/components/atlas/fare";
import { Btn, Field, Kicker, Stamp } from "@/components/atlas/primitives";
import type { ExtraId, ServiceType } from "@/lib/types";

const STEPS = [
  { id: 1, en: "Journey", zh: "行程" },
  { id: 2, en: "Ride", zh: "車型" },
  { id: 3, en: "Confirm", zh: "確認" },
];

function fits(seats: number, bags: number, pax: number, lug: number) {
  return seats >= pax && bags >= lug;
}

export function BookingStudio() {
  const params = useSearchParams();
  const router = useRouter();
  const { locale, currency, draft, setDraft, placeBooking } = useStore();
  const zh = locale === "zh";
  const service = (params.get("service") as ServiceType) || draft.service;
  const step = Number(params.get("step") || "1");
  const copy = serviceCopy[service];

  useEffect(() => {
    if (draft.service !== service) setDraft({ service });
  }, [draft.service, service, setDraft]);

  const q = useMemo(
    () =>
      quote({
        service,
        vehicle: draft.vehicle,
        extras: draft.extras,
        promo: draft.promo,
        when: draft.when,
        hours: draft.hours,
        days: draft.days,
      }),
    [service, draft],
  );

  const flight = flights[draft.flight];

  function go(n: number) {
    router.push(`/book?service=${service}&step=${n}`);
  }

  function confirm() {
    const b = placeBooking();
    router.push(`/trips/${b.id}/success`);
  }

  return (
    <div className="mx-auto grid max-w-[1440px] gap-0 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="px-4 py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Kicker>M02 · Three movements</Kicker>
            <h1 className="serif mt-2 text-5xl">{zh ? copy.zh : copy.en}</h1>
            <p className="mt-2 text-[var(--ink-soft)]">{zh ? copy.hintZh : copy.hint}</p>
          </div>
          <ol className="flex gap-4 text-sm">
            {STEPS.map((s) => (
              <li key={s.id} className={step === s.id ? "border-b border-[var(--copper)]" : "text-[var(--mute)]"}>
                0{s.id} {zh ? s.zh : s.en}
              </li>
            ))}
          </ol>
        </div>

        {step === 1 ? <Journey service={service} /> : null}
        {step === 2 ? <Ride service={service} pax={draft.passengers} lug={draft.luggage} vehicle={draft.vehicle} onPick={(id) => setDraft({ vehicle: id })} /> : null}
        {step === 3 ? <Confirm /> : null}

        <div className="mt-8 flex gap-2">
          {step > 1 ? (
            <Btn kind="ghost" onClick={() => go(step - 1)}>
              Back
            </Btn>
          ) : null}
          {step < 3 ? (
            <Btn onClick={() => go(step + 1)} className="ml-auto">
              Continue
            </Btn>
          ) : (
            <Btn onClick={confirm} className="ml-auto">
              Book & pay {money(q.total, currency)}
            </Btn>
          )}
        </div>
      </div>

      <aside className="border-t border-[var(--rule)] lg:border-l lg:border-t-0">
        <AtlasMap pickup={draft.pickup} dropoff={draft.dropoff} eta={service === "instant" ? "4 min" : "38 min"} height={280} />
        <div className="space-y-4 p-5">
          {flight && service.startsWith("airport") ? (
            <div className="ticket">
              <div className="flex items-center justify-between">
                <Kicker>Flight intelligence</Kicker>
                <Stamp tone={flight.status.includes("Delay") ? "warn" : "pine"}>{flight.status}</Stamp>
              </div>
              <div className="mt-2 font-semibold">
                {draft.flight} · {flight.origin} → TPE {flight.terminal}
              </div>
              <div className="metric mt-1 text-2xl">{flight.eta}</div>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Driver waits 45 minutes after actual arrival. Terminal updates follow the flight.</p>
            </div>
          ) : null}
          <FareSheet quote={q} currency={currency} compact={step !== 3} />
          <div className="text-xs text-[var(--mute)]">
            Settlement currency TWD. Display {currency}. Rates shown at checkout when they differ.
          </div>
        </div>
      </aside>
    </div>
  );
}

function Journey({ service }: { service: ServiceType }) {
  const { draft, setDraft } = useStore();
  const extraOpts = extras.filter((e) => !e.only || e.only.includes(service));

  return (
    <div className="mt-8 space-y-5">
      {service === "airport_pickup" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Airport">
            <select className="atlas-select" value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })}>
              <option>TPE T1 Arrivals</option>
              <option>TPE T2 Arrivals</option>
              <option>TSA Songshan</option>
              <option>KHH Xiaogang</option>
            </select>
          </Field>
          <Field label="Flight number">
            <input className="atlas-input" value={draft.flight} onChange={(e) => setDraft({ flight: e.target.value.toUpperCase() })} />
          </Field>
          <Field label="Arrival">
            <input className="atlas-input" type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
          </Field>
          <Field label="Destination">
            <input className="atlas-input" value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} />
          </Field>
        </div>
      ) : null}

      {service === "airport_drop" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Pickup">
            <input className="atlas-input" value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} />
          </Field>
          <Field label="Airport / terminal">
            <input className="atlas-input" value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} />
          </Field>
          <Field label="Flight departure">
            <input className="atlas-input" value={draft.flight} onChange={(e) => setDraft({ flight: e.target.value })} />
          </Field>
          <Field label="Recommended leave" hint="Includes 90 min buffer + traffic">
            <input className="atlas-input" type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
          </Field>
        </div>
      ) : null}

      {service === "p2p" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Pickup">
            <input className="atlas-input" value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} />
          </Field>
          <Field label="Destination">
            <input className="atlas-input" value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} />
          </Field>
          <Field label="Stops" hint="Add mid-points">
            <input className="atlas-input" placeholder="Jiufen Old Street (optional)" />
          </Field>
          <Field label="Date / time">
            <input className="atlas-input" type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
          </Field>
        </div>
      ) : null}

      {service === "hourly" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Start location">
            <input className="atlas-input" value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} />
          </Field>
          <Field label="Start time">
            <input className="atlas-input" type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
          </Field>
          <Field label="Duration" hint="Baseline 4–12 hours">
            <input
              className="atlas-input"
              type="number"
              min={4}
              max={12}
              value={draft.hours}
              onChange={(e) => setDraft({ hours: Number(e.target.value) })}
            />
          </Field>
          <Field label="Estimated loop">
            <input className="atlas-input" value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} />
          </Field>
          <div className="ticket md:col-span-2 text-sm text-[var(--ink-soft)]">
            Overtime billed in 30-minute increments. Over-distance beyond 180 km/day is itemized before the trip ends.
          </div>
        </div>
      ) : null}

      {service === "rental" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Pickup depot">
            <input className="atlas-input" value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} />
          </Field>
          <Field label="Return depot">
            <input className="atlas-input" value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} />
          </Field>
          <Field label="Start">
            <input className="atlas-input" type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
          </Field>
          <Field label="Days">
            <input className="atlas-input" type="number" min={1} value={draft.days} onChange={(e) => setDraft({ days: Number(e.target.value) })} />
          </Field>
          <div className="ticket md:col-span-2 text-sm">
            Deposit held as a pre-authorization. License and local ID required. Fuel policy: return at the same level.
          </div>
        </div>
      ) : null}

      {service === "instant" ? (
        <div className="grid gap-4">
          <Field label="Current pickup">
            <input className="atlas-input" value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} />
          </Field>
          <Field label="Destination">
            <input className="atlas-input" value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} />
          </Field>
          <div className="ticket text-sm">3 Plus vehicles nearby · matching starts after you confirm fare.</div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Passengers">
          <input className="atlas-input" type="number" min={1} value={draft.passengers} onChange={(e) => setDraft({ passengers: Number(e.target.value) })} />
        </Field>
        <Field label="Luggage">
          <input className="atlas-input" type="number" min={0} value={draft.luggage} onChange={(e) => setDraft({ luggage: Number(e.target.value) })} />
        </Field>
      </div>

      <div>
        <Kicker>Contextual add-ons</Kicker>
        <div className="mt-3 flex flex-wrap gap-2">
          {extraOpts.map((e) => {
            const on = draft.extras.includes(e.id);
            return (
              <button
                key={e.id}
                type="button"
                className={`border px-3 py-2 text-sm ${on ? "border-[var(--copper)]" : "border-[var(--rule)]"}`}
                onClick={() =>
                  setDraft({
                    extras: on ? draft.extras.filter((x) => x !== e.id) : [...draft.extras, e.id as ExtraId],
                  })
                }
              >
                {e.name} · NT${e.price}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Ride({
  service,
  pax,
  lug,
  vehicle,
  onPick,
}: {
  service: ServiceType;
  pax: number;
  lug: number;
  vehicle: string;
  onPick: (id: string) => void;
}) {
  if (service === "instant") {
    return (
      <div className="mt-8 grid gap-3">
        {taxis.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className={`ticket flex items-center justify-between text-left ${vehicle === t.id ? "outline outline-1 outline-[var(--copper)]" : ""}`}
          >
            <div>
              <div className="serif text-2xl">{t.name}</div>
              <div className="text-sm text-[var(--ink-soft)]">ETA {t.eta} min · live matching</div>
            </div>
            <div className="metric text-2xl">NT${t.base}</div>
          </button>
        ))}
      </div>
    );
  }
  if (service === "rental") {
    return (
      <div className="mt-8 grid gap-3">
        {rentals.map((r) => (
          <button
            key={r.id}
            onClick={() => onPick(r.id)}
            className={`ticket flex items-center justify-between text-left ${vehicle === r.id ? "outline outline-1 outline-[var(--copper)]" : ""}`}
          >
            <div>
              <div className="serif text-2xl">{r.name}</div>
              <div className="text-sm text-[var(--ink-soft)]">{r.seats} seats · daily rate</div>
            </div>
            <div className="metric text-2xl">NT${r.day}/day</div>
          </button>
        ))}
      </div>
    );
  }

  const labels: Record<string, string> = {
    sedan: "Best value",
    premium: "Premium",
    suv: "Best for luggage",
    mpv: "Recommended · families",
    van: "Best for groups",
    shuttle: "Shared",
  };

  return (
    <div className="mt-8 space-y-3">
      {vehicles.map((v) => {
        const ok = fits(v.seats, v.luggage, pax, lug);
        return (
          <button
            key={v.id}
            onClick={() => onPick(v.id)}
            className={`ticket w-full text-left ${vehicle === v.id ? "outline outline-1 outline-[var(--copper)]" : ""}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="serif text-3xl">{v.name}</div>
                  <Stamp tone={ok ? "copper" : "warn"}>{labels[v.id]}</Stamp>
                </div>
                <div className="mt-1 text-sm text-[var(--ink-soft)]">
                  {v.model} · {v.seats} passengers · {v.luggage} bags
                </div>
                {!ok ? (
                  <p className="mt-2 text-sm text-[var(--warn)]">
                    {v.name} supports up to {v.seats} passengers and {v.luggage} standard bags. For {pax} passengers and {lug} bags, Atlas recommends MPV or Van.
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">Meet & greet capable · climate control · bottled water.</p>
                )}
              </div>
              <div className="metric text-3xl">NT${v.base.toLocaleString()}</div>
            </div>
          </button>
        );
      })}
      <div className="ticket">
        <Kicker>Designated options · M25</Kicker>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
          <label className="border border-[var(--rule)] p-3">
            <input type="checkbox" className="mr-2" /> Preferred driver +18%
          </label>
          <label className="border border-[var(--rule)] p-3">
            <input type="checkbox" className="mr-2" /> Time-slot driver +12%
          </label>
          <label className="border border-[var(--rule)] p-3">
            <input type="checkbox" className="mr-2" /> Premium vehicle +25%
          </label>
        </div>
        <p className="mt-2 text-xs text-[var(--mute)]">Fallback: if the named driver is unavailable 90 minutes prior, Atlas reassigns and refunds the premium.</p>
      </div>
    </div>
  );
}

function Confirm() {
  const { draft, setDraft } = useStore();
  return (
    <div className="mt-8 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Passenger name">
          <input className="atlas-input" value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} />
        </Field>
        <Field label="Contact">
          <input className="atlas-input" value={draft.phone} onChange={(e) => setDraft({ phone: e.target.value })} />
        </Field>
      </div>
      <Field label="Promo / referral">
        <input className="atlas-input" value={draft.promo} onChange={(e) => setDraft({ promo: e.target.value.toUpperCase() })} placeholder="TPE200 / ZOUFENG-88" />
      </Field>
      <div>
        <Kicker>Payment</Kicker>
        <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
          {(["card", "apple", "line", "cash"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDraft({ payment: p })}
              className={`border px-3 py-3 text-sm ${draft.payment === p ? "border-[var(--copper)]" : "border-[var(--rule)]"}`}
            >
              {p === "card" ? "Card" : p === "apple" ? "Apple Pay" : p === "line" ? "LINE Pay" : "Cash / invoice"}
            </button>
          ))}
        </div>
      </div>
      <div className="ticket text-sm text-[var(--ink-soft)]">
        Cancel free until 24 hours before pickup. 6–24 hours: partial fee. Under 6 hours: fare retained. Consequence is confirmed again if you cancel later.
      </div>
    </div>
  );
}
