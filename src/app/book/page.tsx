"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { extras as extraCat, promos, rentals, services, taxis, vehicles } from "@/lib/catalog";
import { flights as flightDb } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Field, Status } from "@/components/ui";

export default function BookPage() {
  const { draft, setDraft, currency, placeBooking, locale, lastDriverId } = useStore();
  const [step, setStep] = useState(1);
  const router = useRouter();
  const zh = locale === "zh";
  const q = useMemo(
    () => quote({ service: draft.service, vehicle: draft.vehicle, extras: draft.extras, promo: draft.promo, when: draft.when, hours: draft.hours, days: draft.days }),
    [draft],
  );
  const fleet =
    draft.service === "instant"
      ? taxis.map((x) => ({ id: x.id, title: zh ? x.nameZh : x.name, sub: `ETA ${x.eta} min`, price: x.base, seats: 3, luggage: 2 }))
      : draft.service === "rental"
        ? rentals.map((x) => ({ id: x.id, title: x.name, sub: `${x.seats} seats`, price: x.day, seats: x.seats, luggage: 3 }))
        : vehicles.map((x) => ({ id: x.id, title: `${x.name} · ${x.model}`, sub: `${x.seats} / ${x.luggage}`, price: x.base, seats: x.seats, luggage: x.luggage }));
  const extraOk = extraCat.filter((e) => !e.only || e.only.includes(draft.service));
  const flight = flightDb[draft.flight];
  const tight = fleet.find((c) => c.id === draft.vehicle && (draft.passengers > c.seats || draft.luggage > c.luggage));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <div className="flex gap-2 text-sm text-[var(--muted)]">
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => setStep(n)} className={step === n ? "text-[var(--fg)]" : ""}>
              {n === 1 ? loc(locale, "Trip", "行程") : n === 2 ? loc(locale, "Ride", "車款") : loc(locale, "Confirm", "確認")}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setDraft({ service: s.id, vehicle: s.id === "instant" ? "taxi" : s.id === "rental" ? "yaris" : "sedan" })}
              className={`rounded-xl px-3 py-2 text-sm ${draft.service === s.id ? "bg-[var(--primary)] text-[var(--primary-ink)]" : "hairline"}`}
            >
              {zh ? s.zh : s.en}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Field label={loc(locale, "Pickup", "上車")}><input value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} /></Field>
            <Field label={loc(locale, "Destination", "下車")}><input value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} /></Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={loc(locale, "When", "時間")}><input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} /></Field>
              <Field label={loc(locale, "Passengers / luggage", "人數／行李")}>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={1} value={draft.passengers} onChange={(e) => setDraft({ passengers: Number(e.target.value) })} />
                  <input type="number" min={0} value={draft.luggage} onChange={(e) => setDraft({ luggage: Number(e.target.value) })} />
                </div>
              </Field>
              {draft.service.startsWith("airport") && (
                <Field label={loc(locale, "Flight", "航班")}><input value={draft.flight} onChange={(e) => setDraft({ flight: e.target.value.toUpperCase() })} /></Field>
              )}
              {draft.service === "hourly" && (
                <Field label="Hours 4–12"><input type="number" min={4} max={12} value={draft.hours} onChange={(e) => setDraft({ hours: Number(e.target.value) })} /></Field>
              )}
              {draft.service === "rental" && (
                <Field label="Days 1–14"><input type="number" min={1} max={14} value={draft.days} onChange={(e) => setDraft({ days: Number(e.target.value) })} /></Field>
              )}
            </div>
            {flight && (
              <p className="text-sm text-[var(--muted)]">
                {draft.flight} · {flight.origin} → TPE · {zh ? flight.statusZh : flight.status} · {flight.eta} {flight.terminal}
              </p>
            )}
            <Btn onClick={() => setStep(2)}>{loc(locale, "Choose vehicle", "選車")}</Btn>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {fleet.map((car) => (
              <button
                key={car.id}
                onClick={() => setDraft({ vehicle: car.id })}
                className={`flex w-full justify-between rounded-2xl px-4 py-4 text-left ${draft.vehicle === car.id ? "bg-[var(--surface)]" : ""}`}
              >
                <div>
                  <div className="display text-xl">{car.title}</div>
                  <div className="text-sm text-[var(--muted)]">{car.sub}</div>
                </div>
                <div className="metric text-lg">{money(car.price, "TWD")}</div>
              </button>
            ))}
            {tight && (
              <p className="text-sm text-[var(--warning)]">
                {loc(locale, "This ride may be too small for your group.", "這台車可能不夠載您的人數或行李。")}
                {fleet.find((c) => c.seats >= draft.passengers && c.luggage >= draft.luggage) && (
                  <button
                    className="ml-2 underline"
                    onClick={() => {
                      const rec = fleet.find((c) => c.seats >= draft.passengers && c.luggage >= draft.luggage);
                      if (rec) setDraft({ vehicle: rec.id });
                    }}
                  >
                    {loc(locale, "Recommend a fit", "推薦合適車款")}
                  </button>
                )}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {extraOk.map((e) => {
                const on = draft.extras.includes(e.id);
                return (
                  <button key={e.id} onClick={() => setDraft({ extras: on ? draft.extras.filter((x) => x !== e.id) : [...draft.extras, e.id] })} className={`rounded-xl px-3 py-2 text-sm ${on ? "bg-[var(--surface)]" : "hairline"}`}>
                    {zh ? e.nameZh : e.name} · {money(e.price, "TWD")}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Btn kind="ghost" onClick={() => setStep(1)}>{loc(locale, "Back", "返回")}</Btn>
              <Btn onClick={() => setStep(3)}>{loc(locale, "Confirm", "確認")}</Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label={loc(locale, "Passenger (English name kept)", "乘客（英文姓名不翻譯）")}>
              <input value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} />
            </Field>
            <Field label={loc(locale, "Phone", "電話")}><input value={draft.phone} onChange={(e) => setDraft({ phone: e.target.value })} /></Field>
            <Field label="Promo"><input value={draft.promo} onChange={(e) => setDraft({ promo: e.target.value.toUpperCase() })} /></Field>
            <div className="flex flex-wrap gap-2">
              {(["card", "line", "apple", "cash"] as const).map((p) => (
                <button key={p} onClick={() => setDraft({ payment: p })} className={`rounded-xl px-3 py-2 text-sm ${draft.payment === p ? "bg-[var(--surface)]" : "hairline"}`}>
                  {p}
                </button>
              ))}
            </div>
            <p className="text-sm text-[var(--muted)]">{loc(locale, "Payments are simulated in this design prototype.", "此為設計原型，付款為模擬。")}</p>
            <div className="flex gap-2">
              <Btn kind="ghost" onClick={() => setStep(2)}>{loc(locale, "Back", "返回")}</Btn>
              <Btn onClick={() => router.push(`/trips/${placeBooking().id}/success`)}>
                {loc(locale, "Confirm booking", "確認預訂")} · {money(convert(q.total, currency), currency)}
              </Btn>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <LiveMap locale={locale} mode="trip" height={220} focusDriverId={lastDriverId()} pickup={draft.pickup} dropoff={draft.dropoff} />
        <div>
          <div className="label">{loc(locale, "Estimated total", "預估總價")}</div>
          <div className="display metric text-4xl">{money(convert(q.total, currency), currency)}</div>
          <details className="mt-3 text-sm text-[var(--muted)]">
            <summary>{loc(locale, "Explain this price", "說明這筆費用")}</summary>
            <ul className="mt-2 space-y-1">
              {q.items.map((i) => (
                <li key={i.label} className="flex justify-between gap-3">
                  <span>{zh ? i.labelZh : i.label}</span>
                  <span>{money(convert(i.amount, currency), currency)}</span>
                </li>
              ))}
            </ul>
          </details>
          {draft.promo && promos[draft.promo as keyof typeof promos] && (
            <p className="mt-2 text-sm text-[var(--ai)]">{zh ? promos[draft.promo as keyof typeof promos].zh : promos[draft.promo as keyof typeof promos].en}</p>
          )}
          <Status kind="assigned">{loc(locale, "Fleet priority A > B > C", "車隊優先 A＞B＞C")}</Status>
        </div>
      </aside>
    </div>
  );
}
