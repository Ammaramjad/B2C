"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";
import { resolveBooking } from "@/lib/domain/booking";
import { cancelFee, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live/engine";
import { useCopy, corridor } from "@/lib/copy";

export function SignalTrips() {
  const { bookings, locale } = useStore();
  const { L } = useCopy();
  const tabs = [
    ["Upcoming", L("Upcoming", "即將出發"), ["payment_confirmed", "new", "assigned", "accepted"]],
    ["Active", L("Active", "進行中"), ["arriving", "onboard"]],
    ["Completed", L("Completed", "已完成"), ["completed"]],
    ["Cancelled", L("Cancelled", "已取消"), ["cancelled"]],
  ] as const;
  const [tab, setTab] = useState("Upcoming");
  const rows = bookings.filter((b) => (tabs.find((t) => t[0] === tab)?.[2] ?? []).includes(b.status));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">{L("Movements", "行程")}</div>
      <h1 className="display mt-2 text-5xl">{L("My trips", "我的訂單")}</h1>
      <div className="mt-6 flex gap-4 text-sm">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={tab === id ? "text-[var(--signal)]" : "text-[var(--mute)]"}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((b) => (
          <Link key={b.id} href={`/trips/${b.id}`} className="zf-panel flex justify-between p-4">
            <div>
              <div className="kicker">{b.id}</div>
              <div className="font-semibold">
                {corridor(locale, b.pickup, b.pickupZh)} → {corridor(locale, b.dropoff, b.dropoffZh)}
              </div>
              <div className="text-sm text-[var(--ink-2)]">
                {b.when.replace("T", " ")} · {b.vehicle} · {b.status}
              </div>
            </div>
            <div className="zf-metric">{money(b.price, b.currency)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SignalSuccess() {
  const { id } = useParams<{ id: string }>();
  const { bookings, locale } = useStore();
  const { live } = useLive();
  const { L } = useCopy();
  const b = resolveBooking(id, bookings, live);
  if (!b) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="zf-chip">Unknown booking</div>
        <h1 className="display mt-3 text-5xl">This itinerary is not on the domain.</h1>
        <p className="mt-3 text-sm" data-testid="unknown-booking">
          {id} does not resolve. ZF-82041 is only the seed/demo tape booking — it is not used as a fallback.
        </p>
        <Link href="/trips" className="zf-btn mt-4">All trips</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="zf-chip ok">Paid</div>
        <h1 className="display mt-3 text-5xl">{L("On the network.", "已在網路上。")}</h1>
      <p className="mt-3 text-[var(--ink-2)]">
        {L(`${b.id} is confirmed. Flight and driver states will move on the live map — you do not refresh.`, `${b.id} 已確認。航班與司機狀態會在即時地圖上移動——不必重新整理。`)}
      </p>
      <div className="zf-panel mt-6 p-4">
        <div className="font-semibold">
          {corridor(locale, b.pickup, b.pickupZh)} → {corridor(locale, b.dropoff, b.dropoffZh)}
        </div>
        <div className="text-sm">
          {b.flight || "—"} · {b.vehicle} · {money(b.price, b.currency)}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href="/live" className="zf-btn">
          {L("Open live pickup", "開啟即時接送")}
        </Link>
        <Link href="/trips" className="zf-btn ghost">
          {L("All trips", "全部訂單")}
        </Link>
      </div>
    </div>
  );
}

export function SignalTripDetail() {
  const { id } = useParams<{ id: string }>();
  const { bookings, cancel, cancelMidPct, domain, locale } = useStore();
  const { live } = useLive();
  const { L } = useCopy();
  const [now] = useState(() => Date.now());
  const b = resolveBooking(id, bookings, live);
  if (!b) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="kicker">Unknown booking</div>
        <h1 className="display mt-2 text-5xl">No such movement</h1>
        <p className="mt-3 text-sm" data-testid="unknown-booking">
          {id} is not a persisted or seed booking. It does not resolve to ZF-82041.
        </p>
      </div>
    );
  }
  const hours = Math.max(0, (new Date(b.when).getTime() - now) / 36e5);
  const fee = cancelFee(hours, b.price, cancelMidPct);
  const cx = domain.cancellations.find((c) => c.bookingId === b.id);
  const bound = live.bookingId === b.id;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">{b.id}</div>
      <h1 className="display mt-2 text-5xl">{corridor(locale, b.pickup, b.pickupZh)}</h1>
      <p className="mt-2 text-[var(--ink-2)]">→ {corridor(locale, b.dropoff, b.dropoffZh)}</p>
      <div className="zf-panel mt-6 space-y-2 p-4 text-sm">
        <div>{L("Status", "狀態")} · {b.status}</div>
        <div>{L("Flight", "航班")} · {b.flight || "—"}</div>
        <div>{L("Vehicle", "車款")} · {b.vehicle}</div>
        <div>{L("Driver", "司機")} · {(bound ? live.assignedId : null) ?? b.driverId ?? L("company matching", "公司配對")}</div>
        {bound ? <div>OTP · {live.otp}</div> : <div>OTP · {L("held on the live assignment", "在即時派遣上")}</div>}
        <div className="zf-metric text-2xl">{money(b.price, b.currency)}</div>
        {b.status !== "cancelled" && b.status !== "completed" ? (
          <div data-testid="cancel-fee-preview">Cancel fee now (cancelFee) · NT${fee.toLocaleString()} · {hours.toFixed(1)}h before pickup</div>
        ) : null}
      </div>
      {b.service !== "rental" ? (
        <Link href="/live" className="zf-btn wide mt-4">
          Open live pickup
        </Link>
      ) : (
        <p className="mt-4 text-sm">Self-drive — no chauffeur live map.</p>
      )}
      {b.status !== "completed" && b.status !== "cancelled" ? (
        <button type="button" className="zf-btn ghost wide mt-2" data-testid="cancel-booking" onClick={() => cancel(b.id)}>
          Cancel · fee NT${fee.toLocaleString()}
        </button>
      ) : null}
      {b.status === "cancelled" ? (
        <p className="mt-2 text-sm" data-testid="cancel-result">
          Cancelled. Derived fee NT${(cx?.fee ?? b.price).toLocaleString()} · refund NT${(cx?.refund ?? 0).toLocaleString()}.
        </p>
      ) : null}
    </div>
  );
}

export function SignalAccount() {
  const { user } = useStore();
  const { live } = useLive();
  const { L } = useCopy();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">{L("You", "我的")}</div>
      <h1 className="display mt-2 text-5xl">{user?.name ?? "Sarah Chen"}</h1>
      <div className="mt-6 grid gap-2">
        {[
          ["/preferred", L("Preferred drivers · company-mediated", "指定司機 · 公司仲介")],
          ["/wallet", L("Wallet", "錢包")],
          ["/loyalty", L("Points", "點數")],
          ["/referral", L("Referral", "推薦")],
          ["/inbox", L("Notifications", "通知")],
          ["/support", L("Support", "客服")],
          ["/planner", L("Planner", "行程規劃")],
          ["/trips", L("My trips", "我的訂單")],
          ["/live", `${L("Live pickup", "即時接送")} ${live.bookingId}`],
        ].map(([h, l]) => (
          <Link key={h} href={h} className="zf-panel p-4">
            {l}
          </Link>
        ))}
      </div>
    </div>
  );
}
