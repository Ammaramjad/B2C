"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { extras as extraCat, promos, rentals, services, taxis, vehicles } from "@/lib/catalog";
import { flights as flightDb } from "@/lib/data";
import { t } from "@/lib/i18n";
import { convert, money, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Field, Panel } from "@/components/ui";

export default function BookPage() {
  const { draft, setDraft, currency, placeBooking, locale, lastDriverId } = useStore();
  const d = t(locale);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const zh = locale === "zh";

  const q = useMemo(
    () =>
      quote({
        service: draft.service,
        vehicle: draft.vehicle,
        extras: draft.extras,
        promo: draft.promo,
        when: draft.when,
        hours: draft.hours,
        days: draft.days,
      }),
    [draft],
  );

  const fleet =
    draft.service === "instant" ? taxis.map((x) => ({ id: x.id, title: zh ? x.nameZh : x.name, sub: `${x.eta} min`, price: x.base })) :
    draft.service === "rental" ? rentals.map((x) => ({ id: x.id, title: x.name, sub: `${x.seats} ${zh ? "人" : "seats"}`, price: x.day })) :
    vehicles.map((x) => ({ id: x.id, title: `${x.name} · ${x.model}`, sub: `${x.seats}/${x.luggage}`, price: x.base }));

  const extraOk = extraCat.filter((e) => !e.only || e.only.includes(draft.service));
  const flight = flightDb[draft.flight];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setDraft({ service: s.id, vehicle: s.id === "instant" ? "taxi" : s.id === "rental" ? "yaris" : "sedan" })}
              className={`rounded-full px-3 py-1.5 text-xs ${draft.service === s.id ? "bg-cyan-300 text-[#070014]" : "bg-white/8 text-white/60"}`}
            >
              {zh ? s.zh : s.en}
            </button>
          ))}
        </div>
        <div className="mb-5 flex gap-2 text-[11px] uppercase tracking-[0.18em] text-white/40">
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => setStep(n)} className={`rounded-full px-3 py-1 ${step === n ? "bg-white/15 text-white" : ""}`}>
              0{n} {n === 1 ? d.step1 : n === 2 ? d.step2 : d.step3}
            </button>
          ))}
        </div>

        {step === 1 && (
          <Panel className="space-y-4">
            <Field label={d.pickup}><input value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} /></Field>
            <Field label={d.drop}><input value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={d.when}><input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} /></Field>
              {draft.service.startsWith("airport") && (
                <Field label={zh ? "航班" : "Flight"}><input value={draft.flight} onChange={(e) => setDraft({ flight: e.target.value.toUpperCase() })} /></Field>
              )}
              {draft.service === "hourly" && (
                <Field label={zh ? "小時 4–12" : "Hours 4–12"}>
                  <input type="number" min={4} max={12} value={draft.hours} onChange={(e) => setDraft({ hours: Number(e.target.value) })} />
                </Field>
              )}
              {draft.service === "rental" && (
                <Field label={zh ? "天數 1–14" : "Days 1–14"}>
                  <input type="number" min={1} max={14} value={draft.days} onChange={(e) => setDraft({ days: Number(e.target.value) })} />
                </Field>
              )}
            </div>
            {flight && <div className="rounded-2xl bg-cyan-300/10 p-3 text-sm">{draft.flight} · {flight.origin} → TPE · {zh ? flight.statusZh : flight.status} · {flight.eta} {flight.terminal}</div>}
            <Btn onClick={() => setStep(2)}>{zh ? "選車款" : "Choose vehicle"}</Btn>
          </Panel>
        )}

        {step === 2 && (
          <Panel className="space-y-4">
            {fleet.map((car) => (
              <button key={car.id} onClick={() => setDraft({ vehicle: car.id })} className={`flex w-full justify-between rounded-2xl border p-4 text-left ${draft.vehicle === car.id ? "border-cyan-200/50 bg-cyan-300/10" : "border-white/10"}`}>
                <div>
                  <div className="display text-lg">{car.title}</div>
                  <div className="text-xs text-white/50">{car.sub}</div>
                </div>
                <div>{money(car.price, "TWD")}</div>
              </button>
            ))}
            <div className="flex flex-wrap gap-2">
              {extraOk.map((e) => {
                const on = draft.extras.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() =>
                      setDraft({ extras: on ? draft.extras.filter((x) => x !== e.id) : [...draft.extras, e.id] })
                    }
                    className={`rounded-full px-3 py-1 text-xs ${on ? "bg-cyan-300 text-[#070014]" : "bg-white/8"}`}
                  >
                    {zh ? e.nameZh : e.name} · {money(e.price, "TWD")}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-white/45">{d.switchPolicy}</p>
            <div className="flex gap-2">
              <Btn kind="ghost" onClick={() => setStep(1)}>{zh ? "返回" : "Back"}</Btn>
              <Btn onClick={() => setStep(3)}>{zh ? "付款" : "Pay"}</Btn>
            </div>
          </Panel>
        )}

        {step === 3 && (
          <Panel className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={zh ? "乘客（英文姓名不翻譯）" : "Passenger (English name kept)"}>
                <input value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} />
              </Field>
              <Field label={zh ? "電話" : "Phone"}><input value={draft.phone} onChange={(e) => setDraft({ phone: e.target.value })} /></Field>
            </div>
            <Field label={zh ? "促銷碼 WELCOME / TPE200 / FAMILY" : "Promo WELCOME / TPE200 / FAMILY"}>
              <input value={draft.promo} onChange={(e) => setDraft({ promo: e.target.value.toUpperCase() })} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {(["card", "line", "apple", "cash"] as const).map((p) => (
                <button key={p} onClick={() => setDraft({ payment: p })} className={`rounded-full px-3 py-1 text-xs ${draft.payment === p ? "bg-cyan-300 text-[#070014]" : "bg-white/8"}`}>
                  {p === "card" ? "Visa/Master" : p === "line" ? "LINE Pay" : p === "apple" ? "Apple Pay" : zh ? "現金" : "Cash"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Btn kind="ghost" onClick={() => setStep(2)}>{zh ? "返回" : "Back"}</Btn>
              <Btn onClick={() => router.push(`/trips/${placeBooking().id}`)}>
                {d.pay} · {money(convert(q.total, currency), currency)}
              </Btn>
            </div>
          </Panel>
        )}
      </div>
      <aside className="space-y-4">
        <LiveMap locale={locale} mode="trip" height={260} focusDriverId={lastDriverId()} pickup={draft.pickup} dropoff={draft.dropoff} />
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">{zh ? "9 項明細" : "9-line breakdown"}</div>
          <div className="display mt-2 text-3xl">{money(convert(q.total, currency), currency)}</div>
          <ul className="mt-3 space-y-1 text-sm text-white/60">
            {q.items.map((i) => (
              <li key={i.label} className="flex justify-between gap-3">
                <span>{zh ? i.labelZh : i.label}</span>
                <span>{money(convert(i.amount, currency), currency)}</span>
              </li>
            ))}
          </ul>
          {draft.promo && promos[draft.promo as keyof typeof promos] && (
            <p className="mt-2 text-xs text-lime-300">{zh ? promos[draft.promo as keyof typeof promos].zh : promos[draft.promo as keyof typeof promos].en}</p>
          )}
        </Panel>
      </aside>
    </div>
  );
}
