"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { drivers, flights, vehicles } from "@/lib/data";
import { convert, money, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { LiveMap } from "@/components/live-map";
import { Btn, Field, Panel } from "@/components/ui";
import type { ServiceType } from "@/lib/types";

const services: { id: ServiceType; label: string }[] = [
  { id: "airport", label: "Airport" },
  { id: "point", label: "Point" },
  { id: "charter", label: "Charter" },
  { id: "taxi", label: "Taxi" },
  { id: "rental", label: "Self-drive" },
  { id: "designated", label: "Designated" },
  { id: "experience", label: "Experience" },
];

export default function BookPage() {
  const { draft, setDraft, currency, placeBooking, locale, lastDriverId } = useStore();
  const lastId = lastDriverId();
  const last = drivers.find((x) => x.id === lastId);
  const d = t(locale);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const q = useMemo(
    () =>
      quote({
        service: draft.service,
        vehicle: draft.vehicle,
        airport: draft.service === "airport",
        hours: draft.hours,
        preferredDriver: draft.driverMode === "same",
        night: draft.when?.includes("T22") || draft.when?.includes("T23"),
      }),
    [draft],
  );
  const flight = flights[draft.flight];
  const v = vehicles.find((x) => x.id === draft.vehicle)!;
  const over = draft.luggage > v.luggage || draft.passengers > v.seats;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className={`rounded-full px-3 py-1 ${step === n ? "bg-white/15 text-white" : ""}`}
            >
              0{n} {n === 1 ? d.step1 : n === 2 ? d.step2 : d.step3}
            </button>
          ))}
        </div>

        {step === 1 && (
          <Panel className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setDraft({ service: s.id })}
                  className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] ${
                    draft.service === s.id ? "bg-cyan-300 text-[#070014]" : "bg-white/5 text-white/60"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Field label={d.pickup}>
              <input value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} />
            </Field>
            <Field label={d.drop}>
              <input value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={d.when}>
                <input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
              </Field>
              {draft.service === "airport" && (
                <Field label="Flight vector">
                  <input
                    value={draft.flight}
                    onChange={(e) => setDraft({ flight: e.target.value.toUpperCase() })}
                    placeholder="CI101"
                  />
                </Field>
              )}
              {(draft.service === "charter" || draft.service === "designated" || draft.service === "rental") && (
                <Field label="Hours in orbit">
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={draft.hours}
                    onChange={(e) => setDraft({ hours: Number(e.target.value) })}
                  />
                </Field>
              )}
            </div>
            {flight && draft.service === "airport" && (
              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-300/5 p-4 text-sm text-cyan-50">
                {draft.flight} · {flight.origin} → TPE · {flight.status} · ETA {flight.eta} · {flight.terminal}
              </div>
            )}
            <Btn onClick={() => setStep(2)}>Lock vector</Btn>
          </Panel>
        )}

        {step === 2 && (
          <Panel className="space-y-5">
            <div className="grid gap-3">
              {vehicles.map((car) => (
                <button
                  key={car.id}
                  onClick={() => setDraft({ vehicle: car.id })}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left ${
                    draft.vehicle === car.id ? "border-cyan-200/50 bg-cyan-300/10" : "border-white/10 bg-white/3"
                  }`}
                >
                  <div>
                    <div className="display text-lg">{car.name}</div>
                    <div className="text-xs text-white/50">
                      {car.seats} seats · {car.luggage} × 28&quot; · {car.tag}
                    </div>
                  </div>
                  <div className="text-sm text-white/70">×{car.multiplier}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Passengers">
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={draft.passengers}
                  onChange={(e) => setDraft({ passengers: Number(e.target.value) })}
                />
              </Field>
              <Field label="28-inch luggage">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={draft.luggage}
                  onChange={(e) => setDraft({ luggage: Number(e.target.value) })}
                />
              </Field>
            </div>
            {over && (
              <div className="rounded-2xl border border-amber-200/30 bg-amber-300/10 p-3 text-sm text-amber-50">
                Capacity exceeded. Halo recommends upgrading to MPV or Van.
              </div>
            )}
            <div className="space-y-3 rounded-2xl border border-cyan-200/20 bg-cyan-300/5 p-4">
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">{d.lastCaptain}</div>
              <p className="text-sm text-white/70">{d.switchPolicy}</p>
              {last && (
                <p className="text-sm text-white/80">
                  {locale === "zh" ? last.nameZh : last.name} · {last.plate} · {d.maskedPhone}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDraft({ driverMode: "same" })}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    draft.driverMode === "same" ? "bg-cyan-300 text-[#070014]" : "bg-white/10"
                  }`}
                >
                  {d.sameDriver}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ driverMode: "company" })}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    draft.driverMode === "company" ? "bg-cyan-300 text-[#070014]" : "bg-white/10"
                  }`}
                >
                  {d.anyDriver}
                </button>
              </div>
              <a href="/account" className="block text-xs text-cyan-200">
                {d.requestSwitch} →
              </a>
            </div>
            <div className="flex gap-3">
              <Btn kind="ghost" onClick={() => setStep(1)}>Back</Btn>
              <Btn onClick={() => setStep(3)}>Confirm vessel</Btn>
            </div>
          </Panel>
        )}

        {step === 3 && (
          <Panel className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Passenger">
                <input value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} />
              </Field>
              <Field label="Signal / phone">
                <input value={draft.phone} onChange={(e) => setDraft({ phone: e.target.value })} />
              </Field>
            </div>
            <div className="rounded-2xl bg-white/4 p-4 text-sm text-white/65">
              Card pre-authorization is simulated. Apple Pay / Google Pay / local rails are stubbed for the demo mesh.
            </div>
            <div className="flex gap-3">
              <Btn kind="ghost" onClick={() => setStep(2)}>Back</Btn>
              <Btn
                onClick={() => {
                  const b = placeBooking();
                  router.push(`/trips/${b.id}`);
                }}
              >
                {d.pay} · {money(convert(q.total, currency), currency)}
              </Btn>
            </div>
          </Panel>
        )}
      </div>

      <aside className="space-y-4">
        <LiveMap
          locale={locale}
          mode="trip"
          height={280}
          focusDriverId={last?.id}
          pickup={draft.pickup}
          dropoff={draft.dropoff}
          eta={locale === "zh" ? "路線預覽" : "Route preview"}
        />
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Transparent quote</div>
          <div className="display mt-2 text-3xl">{money(convert(q.total, currency), currency)}</div>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            {q.items.map((i) => (
              <li key={i.label} className="flex justify-between gap-4">
                <span>{locale === "zh" ? i.labelZh : i.label}</span>
                <span>{money(convert(i.amount, currency), currency)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Canonical booking</div>
          <p className="mt-2 text-sm text-white/60">
            One object for airport, P2P, charter, taxi, rental and designated. States: Draft → Confirmed → Assigned → En
            route → Arrived → In progress → Completed.
          </p>
        </Panel>
      </aside>
    </div>
  );
}
