"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AtlasMap } from "@/components/zf/map";
import { BookFrame, ExtrasPicker, FareBreakdown, Price, RentalPicker, TaxiPicker, VehiclePicker, quoteTotal } from "@/components/zf/ui";
import { designateRules, formatWhen, serviceLabel, tx, vehicleLabel } from "@/lib/present";
import { useStore } from "@/lib/store";
import { drivers } from "@/lib/data";

export function RideStep() {
  const router = useRouter();
  const { locale, draft, setDraft } = useStore();
  const rental = draft.service === "rental";
  const taxi = draft.service === "instant";
  return (
    <BookFrame
      step={2}
      aside={
        <div className="zf-panel" style={{ padding: 12 }}>
          <p className="zf-kicker">{serviceLabel(draft.service, locale)}</p>
          <p>
            {draft.pickup} → {draft.dropoff}
          </p>
          <p>
            {formatWhen(draft.when)} · {draft.passengers} / {draft.luggage}
          </p>
          <FareBreakdown service={draft.service} vehicle={draft.vehicle} extras={draft.extras} promo={draft.promo} when={draft.when} hours={draft.hours} days={draft.days} />
        </div>
      }
    >
      <p className="zf-kicker">{tx(locale, "Ride", "車輛")}</p>
      <h1>{rental ? tx(locale, "Rental inventory", "自駕車庫存") : taxi ? tx(locale, "Categories nearby", "附近車型") : tx(locale, "A vehicle that fits the party.", "選一輛坐得下的車。")}</h1>
      {rental ? <RentalPicker /> : taxi ? <TaxiPicker /> : <VehiclePicker />}
      {!taxi && !rental && (
        <div style={{ marginTop: 16 }}>
          <p className="zf-kicker">{tx(locale, "Driver preference", "司機偏好")}</p>
          {designateRules.map((rule) => (
            <label key={rule.id} className="zf-inline" style={{ display: "flex", marginBottom: 8 }}>
              <input type="radio" name="designate" checked={draft.designate === rule.id} onChange={() => setDraft({ designate: rule.id })} />
              <span>
                <strong>{tx(locale, rule.en, rule.zh)}</strong>
                <span className="zf-note"> {rule.note}</span>
              </span>
            </label>
          ))}
          {draft.designate !== "standard" && (
            <p className="zf-note">{tx(locale, "If that driver or vehicle is unavailable, dispatch offers the next eligible car and tells you before pickup.", "若指定對象無法出勤，調度會改派下一輛合格車輛，並在上車前通知你。")}</p>
          )}
        </div>
      )}
      <button type="button" className="zf-btn zf-btn-primary" onClick={() => router.push("/book/confirm")}>
        {tx(locale, "Review and confirm", "檢查並確認")}
      </button>
    </BookFrame>
  );
}

export function ConfirmStep() {
  const router = useRouter();
  const { locale, draft, setDraft, placeBooking, user, currency } = useStore();
  const [failed, setFailed] = useState(false);
  const pct = draft.designate === "preferred" ? 0.18 : draft.designate === "timeslot" ? 0.12 : draft.designate === "premium" ? 0.25 : 0;
  const walletBalance = user?.wallet.TWD ?? 12600;
  const wallet = draft.walletApply ? Math.min(walletBalance, 400) : 0;
  const fare = quoteTotal({
    service: draft.service,
    vehicle: draft.vehicle,
    extras: draft.extras,
    promo: draft.promo,
    when: draft.when,
    hours: draft.hours,
    days: draft.days,
    designatePct: pct,
    wallet,
  });
  const driver = drivers.find((d) => d.id === "d3");

  function pay() {
    if (draft.payment === "cash" && draft.service === "instant") {
      setFailed(true);
      return;
    }
    const booking = placeBooking();
    router.push(`/book/done?id=${booking.id}`);
  }

  return (
    <BookFrame
      step={3}
      aside={
        <>
          <AtlasMap
            showRoute
            markers={[
              { id: "a", x: 22, y: 46, kind: "pickup", label: "Pickup" },
              { id: "b", x: 64, y: 38, kind: "drop", label: "Drop" },
            ]}
          />
          <FareBreakdown
            service={draft.service}
            vehicle={draft.vehicle}
            extras={draft.extras}
            promo={draft.promo}
            when={draft.when}
            hours={draft.hours}
            days={draft.days}
            designatePct={pct}
            wallet={wallet}
          />
        </>
      }
    >
      <p className="zf-kicker">{tx(locale, "Confirm", "確認")}</p>
      <h1>{tx(locale, "Check the journey, then pay.", "確認行程後付款。")}</h1>
      <div className="zf-grid-2">
        <label className="zf-field">
          <span>{tx(locale, "Passenger", "乘客姓名")}</span>
          <input value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} />
        </label>
        <label className="zf-field">
          <span>{tx(locale, "Mobile", "手機")}</span>
          <input value={draft.phone} onChange={(e) => setDraft({ phone: e.target.value })} />
        </label>
      </div>
      <dl className="zf-dl">
        <dt>{tx(locale, "Service", "服務")}</dt>
        <dd>{serviceLabel(draft.service, locale)}</dd>
        <dt>{tx(locale, "Journey", "行程")}</dt>
        <dd>
          {draft.pickup} → {draft.stops.filter(Boolean).join(" → ")}
          {draft.stops.length ? " → " : ""}
          {draft.dropoff}
        </dd>
        <dt>{tx(locale, "When", "時間")}</dt>
        <dd>
          {formatWhen(draft.when)} · Asia/Taipei
        </dd>
        <dt>{tx(locale, "Vehicle", "車輛")}</dt>
        <dd>{vehicleLabel(draft.vehicle, locale)}</dd>
        {draft.flight && draft.service.startsWith("airport") && (
          <>
            <dt>{tx(locale, "Flight", "航班")}</dt>
            <dd>{draft.flight}</dd>
          </>
        )}
        {draft.designate !== "standard" && driver && (
          <>
            <dt>{tx(locale, "Requested driver", "指定司機")}</dt>
            <dd>
              {driver.name} · {driver.vehicle} · {driver.rating}
            </dd>
          </>
        )}
      </dl>
      <p className="zf-kicker">{tx(locale, "Extras", "加購")}</p>
      <ExtrasPicker />
      <label className="zf-field">
        <span>{tx(locale, "Promo or referral", "優惠或推薦碼")}</span>
        <input value={draft.promo} onChange={(e) => setDraft({ promo: e.target.value.toUpperCase() })} placeholder="TPE200" />
      </label>
      <label className="zf-inline">
        <input type="checkbox" checked={draft.walletApply} onChange={(e) => setDraft({ walletApply: e.target.checked })} />
        {tx(locale, `Apply wallet credit (sample balance NT$${walletBalance.toLocaleString()})`, `使用錢包（示範餘額 NT$${walletBalance.toLocaleString()}）`)}
      </label>
      <p className="zf-kicker">{tx(locale, "Payment", "付款")}</p>
      <div className="zf-filters">
        {(
          [
            ["card", "Card ···· 4412"],
            ["apple", "Apple Pay"],
            ["google", "Google Pay"],
            ["line", "LINE Pay"],
            ["wallet", "Wallet"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" data-on={draft.payment === id} onClick={() => setDraft({ payment: id })}>
            {label}
          </button>
        ))}
      </div>
      <p className="zf-note">{tx(locale, "Card numbers stay with the payment provider. Zoufeng stores a label and the last four digits.", "卡號留在金流機構。走豐只保存名稱與末四碼。")}</p>
      {currency === "USD" && <p className="zf-note">{tx(locale, "The receipt is issued in NT$. The US dollar figure is a display conversion.", "收據以新台幣開立。美元僅供顯示換算。")}</p>}
      <div className="zf-alert">
        <strong>{tx(locale, "Cancellation", "取消規則")}</strong>
        <p>{tx(locale, "More than 24 hours before pickup: full refund. Between 6 and 24 hours: a partial fee. Under 6 hours: the fare is kept. You will see the exact fee before you cancel.", "出發前 24 小時以上全額退款。6 至 24 小時收取部分費用。6 小時內不退。取消前會先顯示實際費用。")}</p>
      </div>
      {failed && <div className="zf-alert zf-alert-bad">{tx(locale, "Payment failed. Cash is not available for instant taxi. Choose a card or wallet and try again. Nothing was booked.", "付款失敗。即時叫車不收現金。請改用卡片或錢包。尚未建立訂單。")}</div>}
      <button type="button" className="zf-btn zf-btn-primary zf-btn-block" onClick={pay}>
        {tx(locale, "Book and pay", "預訂並付款")} · <Price twd={fare.total} className="zf-num" />
      </button>
    </BookFrame>
  );
}

export function DoneStep() {
  const params = useSearchParams();
  const id = params.get("id");
  const { locale, bookings } = useStore();
  const booking = bookings.find((b) => b.id === id) ?? bookings[0];
  if (!booking) return <p>No booking.</p>;
  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">{tx(locale, "Booked", "已預訂")}</p>
        <h1>
          {booking.id}
        </h1>
        <p>
          {booking.pickup} → {booking.dropoff}
        </p>
        <p>
          {formatWhen(booking.when)} · {vehicleLabel(booking.vehicle, locale)} · {booking.passengerName}
        </p>
        <p>
          {tx(locale, "Payment", "付款")} · {booking.payment} · <Price twd={booking.price} className="zf-num" />
        </p>
        {booking.flight && (
          <p>
            {tx(locale, "Flight", "航班")} {booking.flight}
          </p>
        )}
        <p>{tx(locale, "Driver status", "司機狀態")} · {booking.driverId ? tx(locale, "Assigned. You will get a message when they are on the way.", "已指派。出發時會通知你。") : tx(locale, "Dispatch is searching.", "調度搜尋中。")}</p>
        <p>{tx(locale, "Next, keep the four-digit boarding code on the trip. Share it only with the driver at the car.", "下一步：把四位數上車碼留在行程裡，只在上車時給司機。")}</p>
        <div className="zf-inline">
          <Link className="zf-btn zf-btn-primary" href={`/trips/${booking.id}`}>
            {tx(locale, "Manage booking", "管理訂單")}
          </Link>
          <Link className="zf-btn zf-btn-line" href="/support">
            {tx(locale, "Support", "支援")}
          </Link>
        </div>
      </div>
      <AtlasMap showRoute markers={[{ id: "a", x: 22, y: 46, kind: "pickup", label: "Pickup" }, { id: "b", x: 64, y: 38, kind: "drop", label: "Destination" }]} />
    </div>
  );
}
