"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { extras as extraCat, promos, rentals, services, taxis, vehicles } from "@/lib/catalog";
import { flights as flightDb } from "@/lib/data";
import { capacityNote, fitLabel } from "@/lib/domain/matching";
import { cancellationConsequence, policy } from "@/lib/domain/policy";
import { loc } from "@/lib/i18n";
import { convert, money, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Alert, Button, Field, Price, Stepper } from "@/components/system";
import { OpsMap } from "@/components/ops-map";

export default function BookPage() {
  const { draft, setDraft, currency, placeBooking, locale, lastDriverId } = useStore();
  const [step, setStep] = useState(1);
  const [sameDriver, setSameDriver] = useState(false);
  const router = useRouter();
  const zh = locale === "zh";
  const q = useMemo(
    () => quote({ service: draft.service, vehicle: draft.vehicle, extras: draft.extras, promo: draft.promo, when: draft.when, hours: draft.hours, days: draft.days }),
    [draft],
  );
  const fleet =
    draft.service === "instant"
      ? taxis.map((x) => ({ id: x.id, title: zh ? x.nameZh : x.name, sub: `ETA ${x.eta} min`, price: x.base, seats: 4, luggage: 2 }))
      : draft.service === "rental"
        ? rentals.map((x) => ({ id: x.id, title: x.name, sub: `${x.seats} seats`, price: x.day, seats: x.seats, luggage: 3 }))
        : vehicles.map((x) => ({ id: x.id, title: `${x.name} · ${x.model}`, sub: `${x.seats} / ${x.luggage}`, price: x.base, seats: x.seats, luggage: x.luggage }));
  const extraOk = extraCat.filter((e) => !e.only || e.only.includes(draft.service));
  const flight = flightDb[draft.flight];
  const selected = fleet.find((c) => c.id === draft.vehicle);
  const cheapest = Math.min(...fleet.map((f) => f.price));
  const tight = selected
    ? capacityNote({ passengers: draft.passengers, luggage: draft.luggage, vehicle: selected, locale, alternatives: fleet })
    : null;
  const cancel = draft.when ? cancellationConsequence(draft.when, q.total) : null;
  const preferred = lastDriverId();

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-8">
        <div>
          <p className="label">{loc(locale, "Book", "預訂")}</p>
          <h1 className="display mt-1 text-3xl md:text-4xl">{loc(locale, "Three steps. One booking.", "三個步驟，一筆訂單。")}</h1>
        </div>
        <Stepper step={step} labels={[loc(locale, "Journey", "行程"), loc(locale, "Ride", "車款"), loc(locale, "Confirm", "確認")]} />

        <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-[var(--border)] pb-3">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => setDraft({ service: s.id, vehicle: s.id === "instant" ? "taxi" : s.id === "rental" ? "yaris" : "sedan" })}
              className={`py-2 text-sm ${draft.service === s.id ? "border-b-2 border-[var(--brand)] font-semibold" : "text-[var(--text-secondary)]"}`}
            >
              {zh ? s.zh : s.en}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {draft.service !== "rental" && (
              <Field label={loc(locale, "Pickup", "上車")}><input value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} /></Field>
            )}
            {draft.service === "rental" && (
              <Field label={loc(locale, "Pickup location", "取車地")}><input value={draft.pickup} onChange={(e) => setDraft({ pickup: e.target.value })} /></Field>
            )}
            {draft.service !== "hourly" && draft.service !== "rental" && (
              <Field label={loc(locale, "Destination", "下車")}><input value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} /></Field>
            )}
            {draft.service === "rental" && (
              <Field label={loc(locale, "Return location", "還車地")}><input value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value })} /></Field>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={loc(locale, "Start time", "出發時間")}><input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} /></Field>
              <Field label={loc(locale, "Passengers / bags", "人數／行李")}>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={1} aria-label={loc(locale, "Passengers", "人數")} value={draft.passengers} onChange={(e) => setDraft({ passengers: Number(e.target.value) })} />
                  <input type="number" min={0} aria-label={loc(locale, "Luggage", "行李")} value={draft.luggage} onChange={(e) => setDraft({ luggage: Number(e.target.value) })} />
                </div>
              </Field>
              {draft.service.startsWith("airport") && (
                <Field label={loc(locale, "Flight number", "航班號碼")} hint={loc(locale, "Used for delay and wait policy.", "用於延誤與等候政策。")}>
                  <input value={draft.flight} onChange={(e) => setDraft({ flight: e.target.value.toUpperCase() })} />
                </Field>
              )}
              {draft.service === "hourly" && (
                <Field label={loc(locale, `Duration (${policy.hourly.minHours}–${policy.hourly.maxHours} hours)`, `時數（${policy.hourly.minHours}–${policy.hourly.maxHours}）`)}>
                  <input type="number" min={policy.hourly.minHours} max={policy.hourly.maxHours} value={draft.hours} onChange={(e) => setDraft({ hours: Number(e.target.value) })} />
                </Field>
              )}
              {draft.service === "rental" && (
                <Field label={loc(locale, `Days (${policy.rental.minDays}–${policy.rental.maxDays})`, `天數（${policy.rental.minDays}–${policy.rental.maxDays}）`)}>
                  <input type="number" min={policy.rental.minDays} max={policy.rental.maxDays} value={draft.days} onChange={(e) => setDraft({ days: Number(e.target.value) })} />
                </Field>
              )}
            </div>
            {flight && (
              <Alert tone="info">
                {draft.flight} · {flight.origin} → TPE · {zh ? flight.statusZh : flight.status} · {flight.eta} · {flight.terminal} · {loc(locale, `${policy.airportWait.freeMinutes} min free wait (configurable)`, `免費等候 ${policy.airportWait.freeMinutes} 分（可設定）`)}
              </Alert>
            )}
            <Button className="w-full md:w-auto" onClick={() => setStep(2)}>{loc(locale, "Continue to vehicles", "繼續選車")}</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {fleet.map((car) => {
              const tag = fitLabel({ seats: car.seats, luggage: car.luggage, price: car.price, passengers: draft.passengers, bags: draft.luggage, cheapest, locale });
              const over = draft.passengers > car.seats || draft.luggage > car.luggage;
              return (
                <button
                  key={car.id}
                  onClick={() => setDraft({ vehicle: car.id })}
                  className={`flex w-full items-start justify-between gap-4 border-b border-[var(--border)] py-4 text-left ${draft.vehicle === car.id ? "font-semibold" : ""}`}
                >
                  <div>
                    <div className="display text-xl">{car.title}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{car.sub}{tag ? ` · ${tag}` : ""}{over ? (zh ? " · 容量不足" : " · over capacity") : ""}</div>
                  </div>
                  <div className="metric text-lg">{money(car.price, "TWD")}</div>
                </button>
              );
            })}
            {tight && <Alert tone="warn">{tight}</Alert>}
            <div className="flex flex-wrap gap-2">
              {extraOk.map((e) => {
                const on = draft.extras.includes(e.id);
                return (
                  <button key={e.id} onClick={() => setDraft({ extras: on ? draft.extras.filter((x) => x !== e.id) : [...draft.extras, e.id] })} className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-[var(--brand)] text-[var(--brand-ink)]" : "hairline"}`}>
                    {zh ? e.nameZh : e.name} · {money(e.price, "TWD")}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button kind="ghost" onClick={() => setStep(1)}>{loc(locale, "Back", "返回")}</Button>
              <Button onClick={() => setStep(3)}>{loc(locale, "Continue to confirm", "繼續確認")}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Field label={loc(locale, "Passenger name (kept in English)", "乘客姓名（英文不翻譯）")}>
              <input value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} />
            </Field>
            <Field label={loc(locale, "Phone", "電話")}><input value={draft.phone} onChange={(e) => setDraft({ phone: e.target.value })} /></Field>
            <Field label={loc(locale, "Promo / referral code", "優惠／推薦碼")}><input value={draft.promo} onChange={(e) => setDraft({ promo: e.target.value.toUpperCase() })} /></Field>
            {preferred && draft.service !== "rental" && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-auto" checked={sameDriver} onChange={(e) => setSameDriver(e.target.checked)} />
                {loc(locale, `Request designated driver ${preferred} (+${Math.round(policy.designatedDriver.directPct * 100)}% configurable premium — quoted separately at dispatch)`, `指定司機 ${preferred}（+${Math.round(policy.designatedDriver.directPct * 100)}% 可設定加成，派遣時另計）`)}
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              {(["card", "line", "apple", "cash"] as const).map((p) => (
                <button key={p} onClick={() => setDraft({ payment: p })} className={`px-3 py-2 text-sm ${draft.payment === p ? "bg-[var(--brand)] text-[var(--brand-ink)]" : "hairline"}`}>
                  {p === "card" ? "Card" : p === "line" ? "LINE Pay" : p === "apple" ? "Apple Pay" : loc(locale, "Cash (ops)", "現金（調度）")}
                </button>
              ))}
            </div>
            <Alert tone="info">{loc(locale, "Payments are a sandbox adapter. No real charge is made.", "付款為沙盒轉接器，不會產生真實扣款。")}</Alert>
            {cancel && (
              <p className="text-sm text-[var(--text-secondary)]">
                {loc(locale, "If you cancel now: ", "若現在取消：")}
                {cancel.tier === "free" ? loc(locale, "full refund.", "全額退款。") : cancel.tier === "partial" ? loc(locale, `fee ${money(cancel.fee, "TWD")}, refund ${money(cancel.refund, "TWD")}.`, `手續費 ${money(cancel.fee, "TWD")}，退 ${money(cancel.refund, "TWD")}。`) : loc(locale, "non-refundable under current policy.", "依現行政策不予退款。")}
              </p>
            )}
            <div className="sticky bottom-16 z-10 flex gap-2 bg-[var(--bg)] py-3 md:static md:bottom-auto">
              <Button kind="ghost" onClick={() => setStep(2)}>{loc(locale, "Back", "返回")}</Button>
              <Button
                className="flex-1"
                onClick={() => {
                  const b = placeBooking();
                  router.push(`/trips/${b.id}/success`);
                }}
              >
                {loc(locale, "Confirm booking", "確認預訂")} · {money(convert(q.total, currency), currency)}
              </Button>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-5 lg:sticky lg:top-24">
        <OpsMap locale={locale} height={200} pickup={draft.pickup} dropoff={draft.dropoff} />
        <Price value={money(convert(q.total, currency), currency)} note={loc(locale, "Estimated total · TWD settlement", "預估總價 · 以新台幣結算")} />
        <ul className="space-y-1 text-sm">
          {q.items.filter((i) => i.amount !== 0).map((i) => (
            <li key={i.label} className="flex justify-between gap-3">
              <span className="text-[var(--text-secondary)]">{zh ? i.labelZh : i.label}</span>
              <span className="metric">{money(convert(i.amount, currency), currency)}</span>
            </li>
          ))}
        </ul>
        {draft.promo && promos[draft.promo as keyof typeof promos] && (
          <p className="text-sm">{zh ? promos[draft.promo as keyof typeof promos].zh : promos[draft.promo as keyof typeof promos].en}</p>
        )}
        <p className="text-xs text-[var(--text-secondary)]">{loc(locale, "Fleet priority A → B → C is configurable policy.", "車隊優先序 A→B→C 為可設定政策。")}</p>
      </aside>
    </div>
  );
}
