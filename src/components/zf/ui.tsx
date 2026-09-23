"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { extras, rentals, taxis, vehicles } from "@/lib/catalog";
import { fits, ridePlan, rideTags, unfitNote } from "@/lib/capacity";
import { convert, money, quote } from "@/lib/pricing";
import { extraName, formatWhen, places, serviceLabel, statusLabel, tx, vehicleLabel } from "@/lib/present";
import { useStore } from "@/lib/store";
import type { Booking, BookingStatus, ExtraId, ServiceType } from "@/lib/types";
import { drivers, flights as flightDb } from "@/lib/data";

export function Price({ twd, className = "zf-price" }: { twd: number; className?: string }) {
  const { currency } = useStore();
  return <span className={`zf-num ${className}`}>{money(convert(twd, currency), currency)}</span>;
}

export function Status({ status }: { status: BookingStatus }) {
  const { locale } = useStore();
  const tone =
    status === "cancelled" ? "zf-status-bad" : status === "completed" ? "zf-status-ok" : status === "onboard" || status === "arriving" ? "zf-status-live" : status === "payment_pending" ? "zf-status-warn" : "zf-status-mute";
  return (
    <span className={`zf-status ${tone}`}>
      <i />
      {statusLabel(status, locale)}
    </span>
  );
}

export function PlaceField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const matches = places.filter((p) => p.toLowerCase().includes(value.toLowerCase())).slice(0, 6);
  return (
    <label className="zf-field">
      <span>{label}</span>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="zf-suggest">
          {matches.map((p) => (
            <li key={p}>
              <button
                type="button"
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      )}
    </label>
  );
}

export function Count({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="zf-field">
      <span>{label}</span>
      <div className="zf-count">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - 1))}>
          –
        </button>
        <b className="zf-num">{value}</b>
        <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}

export function BookFrame({ step, children, aside }: { step: 1 | 2 | 3; children: React.ReactNode; aside: React.ReactNode }) {
  const { locale, draft } = useStore();
  const steps = [
    { n: "01", en: "Journey", zh: "行程", href: stepHref(draft.service) },
    { n: "02", en: "Ride", zh: "車輛", href: "/book/ride" },
    { n: "03", en: "Confirm", zh: "確認", href: "/book/confirm" },
  ];
  return (
    <div className="zf-book">
      <ol className="zf-steps">
        {steps.map((s, i) => (
          <li key={s.n}>
            <Link href={s.href} data-on={step === i + 1}>
              <small>{s.n}</small>
              {tx(locale, s.en, s.zh)}
            </Link>
          </li>
        ))}
      </ol>
      <div>{children}</div>
      <aside className="zf-aside">{aside}</aside>
    </div>
  );
}

function stepHref(service: ServiceType) {
  if (service === "airport_drop") return "/book/airport?mode=drop";
  if (service === "airport_pickup") return "/book/airport";
  if (service === "p2p") return "/book/transfer";
  if (service === "hourly") return "/book/charter";
  if (service === "rental") return "/book/rental";
  return "/book/taxi";
}

export function FlightStrip({ code }: { code: string }) {
  const { locale } = useStore();
  const flight = flightDb[code.toUpperCase()];
  if (!flight) {
    return (
      <div className="zf-alert zf-alert-warn">
        <strong>{tx(locale, "Flight feed unavailable", "航班資料暫不可用")}</strong>
        <p>{tx(locale, `No live status for ${code || "this flight"}. You can still book. Operations will attach the flight before dispatch.`, "查無此航班即時狀態。仍可預訂，調度會在派車前補上航班。")}</p>
      </div>
    );
  }
  const delayed = flight.status.toLowerCase().includes("delay");
  return (
    <div className="zf-flight">
      <strong>{code.toUpperCase()}</strong>
      <span>
        {flight.origin} → TPE · {flight.terminal}
      </span>
      <em className={delayed ? "" : "zf-status-ok"}>{locale === "zh" ? flight.statusZh : flight.status}</em>
      <span className="zf-note">{tx(locale, "Estimated", "預估")}</span>
      <b className="zf-num">{flight.eta}</b>
      <span />
    </div>
  );
}

export function FareBreakdown({ service, vehicle, extras: extraIds, promo, when, hours, days, designatePct = 0, wallet = 0 }: { service: ServiceType; vehicle: string; extras: ExtraId[]; promo?: string; when?: string; hours?: number; days?: number; designatePct?: number; wallet?: number }) {
  const { locale, currency } = useStore();
  const [open, setOpen] = useState(false);
  const q = quote({ service, vehicle, extras: extraIds, promo, when, hours, days });
  const designate = Math.round(q.total * designatePct);
  const total = Math.max(0, q.total + designate - wallet);
  const rows = q.items.filter((item) => item.amount !== 0);
  return (
    <div>
      <div className="zf-inline" style={{ justifyContent: "space-between" }}>
        <span>{tx(locale, "Total", "合計")}</span>
        <Price twd={total} />
      </div>
      {currency === "USD" && <p className="zf-note">{tx(locale, "Shown in US dollars. Charged in New Taiwan dollars.", "以美元顯示，以新台幣結算。")}</p>}
      <button type="button" className="zf-btn zf-btn-quiet" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? tx(locale, "Hide fare breakdown", "隱藏費用明細") : tx(locale, "Fare breakdown", "費用明細")}
      </button>
      {open && (
        <div>
          {rows.map((row) => (
            <div key={row.label} className="zf-inline" style={{ justifyContent: "space-between" }}>
              <span>{locale === "zh" ? row.labelZh : row.label}</span>
              <Price twd={row.amount} className="zf-num" />
            </div>
          ))}
          {designate > 0 && (
            <div className="zf-inline" style={{ justifyContent: "space-between" }}>
              <span>{tx(locale, "Driver or vehicle hold", "指定司機／車輛")}</span>
              <Price twd={designate} className="zf-num" />
            </div>
          )}
          {wallet > 0 && (
            <div className="zf-inline" style={{ justifyContent: "space-between" }}>
              <span>{tx(locale, "Wallet credit", "錢包折抵")}</span>
              <Price twd={-wallet} className="zf-num" />
            </div>
          )}
          <p className="zf-note">{tx(locale, "Tolls and parking are billed at cost. Night surcharge is 20% from 23:00 to 06:00. A 4% service fee is included in the fare.", "過路費與停車費實報實銷。23:00 至 06:00 夜間加成 20%。服務費 4% 已包含在車資內。")}</p>
        </div>
      )}
    </div>
  );
}

export function quoteTotal(opts: { service: ServiceType; vehicle: string; extras: ExtraId[]; promo?: string; when?: string; hours?: number; days?: number; designatePct?: number; wallet?: number }) {
  const q = quote(opts);
  const designate = Math.round(q.total * (opts.designatePct ?? 0));
  return { ...q, designate, total: Math.max(0, q.total + designate - (opts.wallet ?? 0)) };
}

export function VehicleArt({ id }: { id: string }) {
  const body = id === "van" || id === "shuttle" || id === "sienta" ? 78 : id === "suv" || id === "xl" ? 62 : 54;
  return (
    <svg viewBox="0 0 120 64" width="120" height="64" aria-hidden="true">
      <rect x="8" y={64 - body} width="104" height={body - 10} fill="var(--paper-sunk)" stroke="var(--ink)" />
      <circle cx="32" cy="54" r="7" fill="var(--ink)" />
      <circle cx="92" cy="54" r="7" fill="var(--ink)" />
      <path d={id === "premium" || id === "black" ? "M20 28 H70 L90 40 H20Z" : "M18 30 H78 L96 42 H18Z"} fill="var(--ink)" />
    </svg>
  );
}

const features: Record<string, [string, string]> = {
  sedan: ["Quiet cabin, name sign available", "安靜車廂，可舉牌"],
  premium: ["Business cabin and bottled water", "商務座艙與飲用水"],
  suv: ["Higher seat, room for four bags", "座椅較高，四件行李"],
  mpv: ["Sliding doors for family boarding", "滑門，方便家庭上下車"],
  van: ["Wheelchair access and group seating", "可協助輪椅與團體座位"],
  shuttle: ["Shared departure, one cabin bag", "共乘班次，一件隨身行李"],
};

export function VehiclePicker() {
  const { locale, draft, setDraft } = useStore();
  const [compare, setCompare] = useState(false);
  const plan = ridePlan(draft.passengers, draft.luggage);
  const ordered = [...vehicles].sort((a, b) => Number(fits(b.id, draft.passengers, draft.luggage)) - Number(fits(a.id, draft.passengers, draft.luggage)));
  const recommended = vehicles.find((v) => v.id === plan.recommended)!;
  return (
    <div>
      <p className="zf-note">
        {tx(locale, `${draft.passengers} passengers · ${draft.luggage} standard bags`, `${draft.passengers} 位乘客 · ${draft.luggage} 件標準行李`)}
      </p>
      <article className="zf-ride-feature">
        <VehicleArt id={recommended.id} />
        <div>
          <span className="zf-tag">{tx(locale, "Recommended", "建議")}</span>
          <h2 style={{ margin: "4px 0" }}>{vehicleLabel(recommended.id, locale)}</h2>
          <p style={{ margin: 0 }}>{recommended.model}</p>
          <p className="zf-note">{locale === "zh" ? features[recommended.id][1] : features[recommended.id][0]}</p>
          <p className="zf-note">
            {recommended.seats} {tx(locale, "passengers", "人")} · {recommended.luggage} {tx(locale, "bags", "件行李")}
          </p>
        </div>
        <div>
          <Price twd={recommended.base} />
          <div>
            <button type="button" className="zf-btn zf-btn-primary" onClick={() => setDraft({ vehicle: recommended.id })}>
              {draft.vehicle === recommended.id ? tx(locale, "Selected", "已選") : tx(locale, "Select", "選擇")}
            </button>
          </div>
        </div>
      </article>
      {ordered
        .filter((v) => v.id !== recommended.id)
        .map((v) => {
          const ok = fits(v.id, draft.passengers, draft.luggage);
          const tags = rideTags(v.id, draft.passengers, draft.luggage, locale);
          return (
            <button key={v.id} type="button" className="zf-ride-row" data-on={draft.vehicle === v.id} onClick={() => ok && setDraft({ vehicle: v.id })} disabled={!ok}>
              <VehicleArt id={v.id} />
              <span>
                {tags.map((tag) => (
                  <span key={tag} className="zf-tag">
                    {tag}
                  </span>
                ))}
                <strong>{vehicleLabel(v.id, locale)}</strong>
                <span className="zf-note">
                  {" "}
                  · {v.model} · {v.seats}/{v.luggage}
                </span>
                {!ok && <span className="zf-unfit"> {unfitNote(v.id, locale)}</span>}
              </span>
              <Price twd={v.base} className="zf-num" />
            </button>
          );
        })}
      <button type="button" className="zf-btn zf-btn-quiet" onClick={() => setCompare((v) => !v)}>
        {compare ? tx(locale, "Hide comparison", "隱藏比較") : tx(locale, "Compare vehicles that fit", "比較可容納的車輛")}
      </button>
      {compare && (
        <table className="zf-compare">
          <thead>
            <tr>
              <th>{tx(locale, "Class", "車型")}</th>
              <th>{tx(locale, "People", "乘客")}</th>
              <th>{tx(locale, "Bags", "行李")}</th>
              <th>{tx(locale, "Fare from", "車資")}</th>
            </tr>
          </thead>
          <tbody>
            {plan.fitting.map((v) => (
              <tr key={v.id}>
                <td>{vehicleLabel(v.id, locale)}</td>
                <td className="zf-num">{v.seats}</td>
                <td className="zf-num">{v.luggage}</td>
                <td>
                  <Price twd={v.base} className="zf-num" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function RentalPicker() {
  const { locale, draft, setDraft } = useStore();
  return (
    <div>
      {rentals.map((car) => (
        <button key={car.id} type="button" className="zf-ride-row" data-on={draft.vehicle === car.id} onClick={() => setDraft({ vehicle: car.id })}>
          <VehicleArt id={car.id} />
          <span>
            <strong>{locale === "zh" ? car.nameZh : car.name}</strong>
            <span className="zf-note">
              {" "}
              · {car.seats} {tx(locale, "seats", "人座")} · {tx(locale, "Self-drive inventory", "自駕庫存")}
            </span>
          </span>
          <span>
            <Price twd={car.day * draft.days} />
            <span className="zf-note"> / {draft.days}d</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function TaxiPicker() {
  const { locale, draft, setDraft } = useStore();
  const nearby = { taxi: 4, plus: 2, xl: 1, black: 1 };
  return (
    <div>
      {taxis.map((taxi) => {
        const tight = draft.passengers > 4 && (taxi.id === "taxi" || taxi.id === "plus");
        return (
          <button key={taxi.id} type="button" className="zf-ride-row" data-on={draft.vehicle === taxi.id} disabled={tight} onClick={() => setDraft({ vehicle: taxi.id })}>
            <VehicleArt id={taxi.id} />
            <span>
              {taxi.id === "black" && <span className="zf-tag">{tx(locale, "Premium", "高級")}</span>}
              {taxi.id === "xl" && draft.passengers >= 5 && <span className="zf-tag">{tx(locale, "Best for groups", "適合團體")}</span>}
              <strong>{locale === "zh" ? taxi.nameZh : taxi.name}</strong>
              <span className="zf-note">
                {" "}
                · ETA {taxi.eta} min · {nearby[taxi.id]} {tx(locale, "nearby", "輛在附近")}
              </span>
              {tight && <span className="zf-unfit"> {tx(locale, "This category seats up to 4.", "此車型最多 4 人。")}</span>}
            </span>
            <Price twd={taxi.base} className="zf-num" />
          </button>
        );
      })}
    </div>
  );
}

export function ExtrasPicker() {
  const { locale, draft, setDraft } = useStore();
  const list = extras.filter((extra) => {
    if (extra.only && !extra.only.includes(draft.service)) return false;
    if (draft.service === "instant") return extra.id === "child_seat" || extra.id === "access";
    if (draft.service === "airport_drop") return extra.id !== "meet";
    if (draft.service !== "rental" && extra.only?.includes("rental")) return false;
    return true;
  });
  return (
    <div className="zf-filters">
      {list.map((extra) => {
        const on = draft.extras.includes(extra.id);
        return (
          <button
            key={extra.id}
            type="button"
            data-on={on}
            onClick={() =>
              setDraft({
                extras: on ? draft.extras.filter((id) => id !== extra.id) : [...draft.extras, extra.id],
              })
            }
          >
            {extraName(extra.id, locale)}
            {extra.price > 0 ? ` · NT$${extra.price}` : ""}
          </button>
        );
      })}
    </div>
  );
}

export function Timeline({ booking }: { booking: Booking }) {
  const { locale } = useStore();
  const flight = booking.flight ? flightDb[booking.flight] : undefined;
  const delayed = flight?.status.toLowerCase().includes("delay");
  const rank = ["payment_pending", "payment_confirmed", "new", "assigned", "accepted", "arriving", "onboard", "completed"];
  const at = booking.status === "cancelled" ? 1 : rank.indexOf(booking.status);
  const events = [
    { label: tx(locale, "Created", "已建立"), on: true },
    { label: tx(locale, "Payment confirmed", "付款確認"), on: at >= 1 },
    { label: tx(locale, "Driver assigned", "已指派司機"), on: at >= 3 || Boolean(booking.driverId) },
    { label: tx(locale, "Driver en route", "司機前往中"), on: at >= 5 },
    { label: tx(locale, "Driver arrived", "司機已抵達"), on: at >= 5 },
    { label: tx(locale, "Trip started", "行程開始"), on: at >= 6 },
    { label: tx(locale, "Completed", "已完成"), on: at >= 7 },
  ];
  return (
    <ol className="zf-timeline">
      {events.map((event) => (
        <li key={event.label} data-wait={!event.on}>
          <i />
          <span>{event.label}</span>
        </li>
      ))}
      {delayed && (
        <li data-bad="true">
          <i />
          <span>{tx(locale, `Flight ${booking.flight} delayed. Pickup clock follows the new arrival.`, `航班 ${booking.flight} 延誤，等候從新抵達時間起算。`)}</span>
        </li>
      )}
      {booking.status === "cancelled" && (
        <li data-bad="true">
          <i />
          <span>{tx(locale, "Cancelled", "已取消")}</span>
        </li>
      )}
    </ol>
  );
}

export function BookingFacts({ booking, dense = false }: { booking: Booking; dense?: boolean }) {
  const { locale } = useStore();
  const driver = drivers.find((d) => d.id === booking.driverId);
  const flight = booking.flight ? flightDb[booking.flight] : undefined;
  const sections = [
    ["Booking", booking.id],
    ["Service", serviceLabel(booking.service, locale)],
    ["Source", booking.channel],
    ["Passenger", booking.passengerName],
    ["Pickup", locale === "zh" ? booking.pickupZh : booking.pickup],
    ["Destination", locale === "zh" ? booking.dropoffZh : booking.dropoff],
    ["When", `${formatWhen(booking.when)} · Asia/Taipei`],
    ["Flight", booking.flight ? `${booking.flight}${flight ? ` · ${flight.terminal} · ${flight.status}` : ""}` : "—"],
    ["Vehicle", vehicleLabel(booking.vehicle, locale)],
    ["Party", `${booking.passengers} / ${booking.luggage} bags`],
    ["Add-ons", booking.extras.map((id) => extraName(id, locale)).join(", ") || "—"],
    ["Driver", driver ? `${driver.name} · ${driver.plate}` : tx(locale, "Unassigned", "未指派")],
    ["Fleet", driver?.fleet ?? "—"],
    ["Payment", booking.payment],
    ["Safety", booking.status === "onboard" ? tx(locale, "OTP verified", "OTP 已驗證") : tx(locale, "OTP ready at boarding", "上車時核對 OTP")],
  ];
  if (!dense) {
    return (
      <dl className="zf-dl">
        {sections.slice(0, 8).map(([k, v]) => (
          <FragmentRow key={k} k={k} v={v} />
        ))}
      </dl>
    );
  }
  return (
    <dl className="zf-dl">
      {sections.map(([k, v]) => (
        <FragmentRow key={k} k={k} v={v} />
      ))}
    </dl>
  );
}

function FragmentRow({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt>{k}</dt>
      <dd>{v}</dd>
    </>
  );
}

export function usePassengerId() {
  const { user } = useStore();
  return user?.role === "passenger" ? user.id : "p1";
}

export function useFarePreview() {
  const { draft } = useStore();
  const pct = draft.designate === "preferred" ? 0.18 : draft.designate === "timeslot" ? 0.12 : draft.designate === "premium" ? 0.25 : 0;
  return useMemo(
    () =>
      quoteTotal({
        service: draft.service,
        vehicle: draft.vehicle,
        extras: draft.extras,
        promo: draft.promo,
        when: draft.when,
        hours: draft.hours,
        days: draft.days,
        designatePct: pct,
        wallet: 0,
      }),
    [draft, pct],
  );
}

export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="zf-drawer-back" onClick={onClose} role="presentation">
      <aside className="zf-drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="zf-inline" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button type="button" className="zf-btn zf-btn-quiet" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export function MiniChart({ points, label }: { points: number[]; label: string }) {
  const max = Math.max(...points);
  const d = points
    .map((n, i) => {
      const x = (i / (points.length - 1)) * 300;
      const y = 80 - (n / max) * 70;
      return `${i === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
  return (
    <svg className="zf-chart" viewBox="0 0 300 90" role="img" aria-label={label}>
      <path d={d} fill="none" stroke="var(--pine)" strokeWidth="2" />
    </svg>
  );
}
