"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AtlasMap } from "@/components/zf/map";
import { BookingFacts, Price, Status, Timeline } from "@/components/zf/ui";
import { drivers, flights as flightDb } from "@/lib/data";
import { cancelFee } from "@/lib/pricing";
import { channelLabel, extraName, formatWhen, serviceLabel, tripBucket, tx, vehicleLabel, type TripBucket } from "@/lib/present";
import { useStore } from "@/lib/store";
import { usePassengerId } from "@/components/zf/ui";

const buckets: TripBucket[] = ["upcoming", "active", "completed", "cancelled"];
const bucketLabel: Record<TripBucket, [string, string]> = {
  upcoming: ["Upcoming", "即將出發"],
  active: ["Active", "進行中"],
  completed: ["Completed", "已完成"],
  cancelled: ["Cancelled", "已取消"],
};

export function Trips() {
  const { locale, bookings } = useStore();
  const pid = usePassengerId();
  const [tab, setTab] = useState<TripBucket>("upcoming");
  const [q, setQ] = useState("");
  const mine = bookings.filter((b) => b.passengerId === pid);
  const rows = mine.filter((b) => tripBucket(b.status) === tab).filter((b) => `${b.id} ${b.pickup} ${b.dropoff} ${b.flight ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="zf-page">
      <p className="zf-kicker">{tx(locale, "Your travel", "你的行程")}</p>
      <h1>{tx(locale, "Trips", "行程")}</h1>
      <div className="zf-tabs">
        {buckets.map((id) => (
          <button key={id} type="button" data-on={tab === id} onClick={() => setTab(id)}>
            {tx(locale, bucketLabel[id][0], bucketLabel[id][1])}
          </button>
        ))}
      </div>
      <input className="zf-input" style={{ maxWidth: 360 }} placeholder={tx(locale, "Search route, flight, reference", "搜尋路線、航班、編號")} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="zf-list">
        {rows.length === 0 && <p className="zf-empty">{tx(locale, "Nothing in this list.", "這個分類是空的。")}</p>}
        {rows.map((b) => {
          const driver = drivers.find((d) => d.id === b.driverId);
          return (
            <Link key={b.id} href={`/trips/${b.id}`} className="zf-trip">
              <div>
                <Status status={b.status} />
                <p className="zf-note">{formatWhen(b.when)}</p>
              </div>
              <div>
                <strong>
                  {b.pickup} → {b.dropoff}
                </strong>
                <p className="zf-note">
                  {serviceLabel(b.service, locale)} · {vehicleLabel(b.vehicle, locale)}
                  {driver ? ` · ${driver.name}` : ""}
                </p>
              </div>
              <Price twd={b.price} className="zf-num" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function TripDetail({ id }: { id: string }) {
  const { locale, bookings, cancel, cancelMidPct, currency } = useStore();
  const booking = bookings.find((b) => b.id === id);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Change of plans");
  const [done, setDone] = useState(false);
  const hours = booking ? Math.max(0, (new Date(booking.when).getTime() - Date.parse("2026-09-23T12:00:00+08:00")) / 36e5) : 0;
  const fee = booking ? cancelFee(hours, booking.price, cancelMidPct) : 0;
  const driver = drivers.find((d) => d.id === booking?.driverId);
  const flight = booking?.flight ? flightDb[booking.flight] : undefined;
  const refund = booking ? Math.max(0, booking.price - fee) : 0;

  if (!booking) return <div className="zf-page">{tx(locale, "This trip is not on this device.", "此裝置沒有這筆行程。")}</div>;

  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">{booking.id}</p>
        <h1>
          {booking.pickup} → {booking.dropoff}
        </h1>
        <Status status={booking.status} />
        <p>
          {serviceLabel(booking.service, locale)} · {channelLabel(booking.channel, locale)} · {formatWhen(booking.when)} · Asia/Taipei
        </p>
        <AtlasMap
          showRoute
          markers={[
            { id: "p", x: 24, y: 48, kind: "pickup", label: booking.pickup },
            { id: "d", x: 66, y: 36, kind: "drop", label: booking.dropoff },
          ]}
        />
        <BookingFacts booking={booking} />
        {flight && (
          <div className="zf-alert" style={{ marginTop: 12 }}>
            <strong>
              {booking.flight} · {flight.terminal}
            </strong>
            <p>
              {locale === "zh" ? flight.statusZh : flight.status} · {tx(locale, "Estimated", "預估")} {flight.eta}
            </p>
          </div>
        )}
        <p>
          {tx(locale, "Passenger", "乘客")} {booking.passengerName} · {booking.passengerPhone}
        </p>
        <p>
          {tx(locale, "Vehicle", "車輛")} {vehicleLabel(booking.vehicle, locale)}
          {driver ? ` · ${driver.name} · ${driver.plate} · ${driver.rating}` : ""}
        </p>
        <p>
          {tx(locale, "Extras", "加購")} {booking.extras.map((id) => extraName(id, locale)).join(", ") || "—"}
        </p>
        <p>
          {tx(locale, "Paid", "已付")} <Price twd={booking.price} className="zf-num" /> · {booking.payment}
        </p>
        <div className="zf-inline">
          {tripBucket(booking.status) === "active" && (
            <Link className="zf-btn zf-btn-primary" href="/live">
              {tx(locale, "Open live trip", "打開即時行程")}
            </Link>
          )}
          <Link className="zf-btn zf-btn-line" href="/support">
            {tx(locale, "Support", "支援")}
          </Link>
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <button type="button" className="zf-btn zf-btn-quiet" onClick={() => setOpen(true)}>
              {tx(locale, "Cancel trip", "取消行程")}
            </button>
          )}
        </div>
        {open && (
          <div className="zf-sheet" role="dialog" aria-label="Cancel">
            <h2>{tx(locale, "Cancel this trip?", "要取消這趟嗎？")}</h2>
            <label className="zf-field">
              <span>{tx(locale, "Reason", "原因")}</span>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
                <option>Change of plans</option>
                <option>Flight cancelled</option>
                <option>Booked another way</option>
              </select>
            </label>
            <p>
              {tx(locale, "Fee", "取消費")} <Price twd={fee} className="zf-num" />
            </p>
            <p>
              {tx(locale, "Refund", "退款")} <Price twd={refund} className="zf-num" /> → {booking.payment === "card" ? "Visa ···· 4412" : booking.payment}
            </p>
            <p className="zf-note">{currency === "USD" ? tx(locale, "Refund is calculated in NT$ and returned to the original method.", "退款以新台幣計算，退回原付款方式。") : tx(locale, "You will see this consequence before the trip is cancelled.", "取消前會先看到這個結果。")}</p>
            {done ? (
              <p>{tx(locale, "Cancellation recorded.", "已取消。")}</p>
            ) : (
              <button
                type="button"
                className="zf-btn zf-btn-danger"
                onClick={() => {
                  cancel(booking.id);
                  setDone(true);
                }}
              >
                {tx(locale, "Confirm cancellation", "確認取消")}
              </button>
            )}
            <button type="button" className="zf-btn zf-btn-quiet" onClick={() => setOpen(false)}>
              {tx(locale, "Keep the trip", "保留行程")}
            </button>
          </div>
        )}
      </div>
      <aside>
        <p className="zf-kicker">{tx(locale, "Timeline", "時間軸")}</p>
        <Timeline booking={booking} />
      </aside>
    </div>
  );
}

export function useActiveTrip() {
  const { bookings } = useStore();
  const pid = usePassengerId();
  return useMemo(() => {
    const mine = bookings.filter((b) => b.passengerId === pid);
    return mine.find((b) => b.status === "onboard") ?? mine.find((b) => b.status === "arriving") ?? mine.find((b) => tripBucket(b.status) === "active");
  }, [bookings, pid]);
}
