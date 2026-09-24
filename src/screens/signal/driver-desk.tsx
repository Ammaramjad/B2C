"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { drivers, seedBookings, seedSettlements } from "@/lib/data";
import { formatMetric, mergeScorecards, scorecardFromCatalog, scorecardFromLive } from "@/lib/live/metrics";
import { useLive } from "@/lib/live/engine";
import { MapMount } from "@/components/signal/map-mount";
import { useStore } from "@/lib/store";
import { useCopy, corridor } from "@/lib/copy";

const me = drivers[0];

const PHASES = ["assigned", "en_route_airport", "near_airport", "arrived", "waiting", "trip_started", "en_route_dest", "completed"] as const;

function Ring({ value, label, accent }: { value: number; label: string; accent: string }) {
  const p = Math.max(0, Math.min(1, value));
  return (
    <div className="flex flex-col items-center gap-2">
      <svg className="zf-ring" viewBox="0 0 80 80" style={{ "--p": p, "--accent": accent } as CSSProperties}>
        <circle className="track" cx="40" cy="40" r="36" />
        <circle className="fill" cx="40" cy="40" r="36" />
        <text x="40" y="44" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">
          {Math.round(p * 100)}
        </text>
      </svg>
      <div className="kicker">{label}</div>
    </div>
  );
}

export function DriverDutyHome() {
  const { live, setDuty } = useLive();
  const { L } = useCopy();
  const d = live.drivers[0];
  const phaseIdx = Math.max(0, PHASES.indexOf(live.phase as (typeof PHASES)[number]));
  const bars = [0.45, 0.7, 0.55, 0.92, 0.64, 0.8, 0.5];
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="kicker">{L("Duty status", "執勤狀態")}</div>
          <h1 className="display text-5xl capitalize">{d.duty}</h1>
        </div>
        <span className="zf-chip live">{d.state}</span>
      </div>
      <div className="zf-duty">
        {(["online", "busy", "break", "offline"] as const).map((x) => (
          <button key={x} type="button" className={d.duty === x ? "on" : ""} onClick={() => setDuty(d.id, x)}>
            <i className="zf-dot" />
            <span className="text-sm capitalize">{x}</span>
          </button>
        ))}
      </div>
      <div className="zf-glass p-5">
        <div className="flex items-center justify-between">
          <div className="kicker">{L("Current / next", "目前／下一趟")}</div>
          <span className="zf-chip ok">{live.phase.replaceAll("_", " ")}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold">
          {live.bookingId} · {live.pickup}
        </div>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          {live.flight} · {live.passenger} · {d.etaMin} min
        </p>
        <div className="zf-phase mt-4">
          {PHASES.map((p, i) => (
            <i key={p} className={i <= phaseIdx ? "on" : ""} title={p} />
          ))}
        </div>
        <Link href="/driver/run" className="zf-btn wide mt-4">
          {L("Open assignment", "開啟派遣")}
        </Link>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Link href="/driver/history" className="zf-glass p-4">{L("History", "歷史")}</Link>
          <Link href="/driver/settlement" className="zf-glass p-4">{L("Settlement", "結算")}</Link>
          <Link href="/driver/documents" className="zf-glass p-4">{L("Vehicle / docs", "車輛／證件")}</Link>
          <Link href="/driver/safety" className="zf-glass p-4">{L("Safety", "安全")}</Link>
          <Link href="/driver/inbox" className="zf-glass p-4">{L("Inbox", "收件匣")}</Link>
          <Link href="/driver/support" className="zf-glass p-4">{L("Support", "支援")}</Link>
        </div>
      </div>
      <div className="zf-glass grid grid-cols-3 gap-2 p-4">
        <Ring value={d.accept} label={L("Accept", "接單")} accent="#2b5bff" />
        <Ring value={d.onTime} label={L("On time", "準時")} accent="#14b8a6" />
        <Ring value={Math.min(1, me.completedWeek / 24)} label={L("Week load", "週負載")} accent="#ff3b48" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="zf-glass p-4">
          <div className="kicker">{L("Today", "今日")}</div>
          <div className="zf-metric mt-1 text-3xl">NT${me.earningsToday.toLocaleString()}</div>
          <div className="zf-spark-bar mt-3">
            {bars.map((h, i) => (
              <b key={i} style={{ height: `${h * 100}%`, animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        </div>
        <div className="zf-glass p-4">
          <div className="kicker">{L("This week", "本週")}</div>
          <div className="zf-metric mt-1 text-3xl">{me.completedWeek} {L("trips", "趟")}</div>
          <p className="mt-3 text-sm text-[var(--ink-2)]">
            {L("Online", "上線")} {d.onlineHours}h · {d.fleet} {L("fleet", "車隊")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DriverJobFlow({ step }: { step?: "run" | "pickup" | "otp" | "trip" }) {
  const { live, markArrived, verifyOtp, completeTrip } = useLive();
  const { L } = useCopy();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const d = live.drivers.find((x) => x.id === live.assignedId) ?? live.drivers[0];
  function act() {
    if (live.phase === "arrived" || live.phase === "waiting") {
      if (!verifyOtp(otp)) setErr("OTP does not match the booking.");
      else {
        setErr("");
        router.push("/driver/trip");
      }
      return;
    }
    if (live.phase === "trip_started" || live.phase === "en_route_dest") {
      completeTrip();
      router.push("/driver/performance");
      return;
    }
    markArrived();
  }
  const cta =
    live.phase === "arrived" || live.phase === "waiting"
      ? L("Verify OTP", "驗證 OTP")
      : live.phase === "trip_started" || live.phase === "en_route_dest"
        ? L("Complete trip", "完成行程")
        : L("Arrived at Door 8", "已到 8 號門");
  const banner =
    step === "pickup"
      ? L("Pickup — approach Door 8", "接客 — 前往 8 號門")
      : step === "otp"
        ? L("OTP — passenger code on the live sheet", "OTP — 乘客即時頁上的代碼")
        : step === "trip"
          ? L("Trip — en route to destination", "行程 — 前往目的地")
          : L("Job — follow the live assignment", "任務 — 依即時派遣");
  return (
    <div className="-mx-4">
      <div className="h-[320px]">
        <MapMount mode="night" height="320px" showFleet={false} />
      </div>
      <div className="space-y-3 px-4 pt-3">
        <div className="kicker">{banner} · {live.phase.replaceAll("_", " ")}</div>
        <h1 className="display text-3xl">{live.pickup}</h1>
        <p className="text-sm">
          {live.flight} · {live.flightStatus} · {d.name}
        </p>
        <div className="zf-metric text-4xl">
          {live.etaMin} min · {live.distanceKm} km
        </div>
        {live.phase === "arrived" || live.phase === "waiting" ? (
          <label className="zf-field">
            <span>{L("Passenger OTP", "乘客 OTP")}</span>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={live.otp} />
          </label>
        ) : null}
        {err ? <p className="text-sm text-[var(--signal)]">{err}</p> : null}
        <button type="button" className="zf-btn wide" data-testid="driver-job-cta" onClick={act}>
          {cta}
        </button>
      </div>
    </div>
  );
}

export function DriverHistory() {
  const { locale } = useStore();
  const { L } = useCopy();
  const mine = seedBookings.filter((b) => b.driverId === "d1" || b.driverId === "D-118");
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Trip history", "行程歷史")}</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Corridor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mine.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>
                {corridor(locale, b.pickup, b.pickupZh)} → {corridor(locale, b.dropoff, b.dropoffZh)}
              </td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverMoney() {
  const { L } = useCopy();
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Earnings", "收入")}</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Window</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Today</td>
            <td>NT${me.earningsToday.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Week</td>
            <td>NT${me.earningsWeek.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Month</td>
            <td>NT${me.earningsMonth.toLocaleString()}</td>
          </tr>
          <tr>
            <td>YTD</td>
            <td>NT${me.earningsYtd.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Pending payout</td>
            <td>NT${me.pendingPayout.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function DriverSettle() {
  const { L } = useCopy();
  const rows = seedSettlements.filter((s) => s.driverId === "d1");
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Settlement", "結算")}</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Statement</th>
            <th>Week</th>
            <th>Net</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.week}</td>
              <td>NT${s.net.toLocaleString()}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverDocs() {
  const { L } = useCopy();
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Documents / vehicle", "證件／車輛")}</h1>
      <table className="zf-table">
        <tbody>
          <tr><td>{L("License", "駕照")}</td><td>{me.license}</td></tr>
          <tr><td>{L("Vehicle", "車輛")}</td><td>{me.vehicle} · {me.plate}</td></tr>
          <tr><td>{L("Fuel", "能源")}</td><td>{me.fuel}</td></tr>
          <tr><td>{L("State", "狀態")}</td><td>{me.vehicleState}</td></tr>
          <tr><td>{L("Fleet", "車隊")}</td><td>{me.fleet}</td></tr>
          <tr><td>{L("Compliance", "合規")}</td><td>{L("Demo card — upload not configured", "示範卡片 — 尚未設定上傳")}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function DriverScore() {
  const { live } = useLive();
  const { bookings, domain } = useStore();
  const { L } = useCopy();
  const liveD = live.drivers[0];
  const extras = {
    rejects: live.rejects[liveD.id] ?? domain.rejects.filter((r) => r.driverId === liveD.id).length,
    punctuality: domain.punctuality,
    offersSent: live.events.filter((e) => e.type === "dispatch.offer.sent").length || undefined,
  };
  const card = mergeScorecards(
    scorecardFromCatalog(me, bookings, live.counters.incidents, extras),
    scorecardFromLive(liveD, live.incident && live.incident.driverId === liveD.id ? 1 : live.counters.incidents, extras),
  );
  const rows: [string, string][] = [
    ["Total rides", formatMetric(card.totalRides)],
    ["Completed", formatMetric(card.completedRides)],
    ["Cancelled", formatMetric(card.cancelledRides)],
    ["Rejected offers", formatMetric(card.rejectedOffers)],
    ["On-time pickups", formatMetric(card.onTimePickups)],
    ["Late pickups", formatMetric(card.latePickups)],
    ["Total late minutes", formatMetric(card.totalLateMinutes, "min")],
    ["Average late minutes", formatMetric(card.averageLateMinutes, "min")],
    ["Acceptance", formatMetric(card.acceptanceRate, "pct")],
    ["Completion", formatMetric(card.completionRate, "pct")],
    ["Cancellation", formatMetric(card.cancellationRate, "pct")],
    ["Rating", card.rating != null ? String(card.rating) : "—"],
    ["Incidents", formatMetric(card.incidentCount)],
  ];
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Performance", "績效")}</h1>
      <p className="text-sm text-[var(--mute)]">{L("Dashes are fields the domain does not store. Nothing is invented.", "破折號表示領域沒有此欄。沒有編造數字。")}</p>
      <table className="zf-table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td className="zf-metric">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DriverSafety() {
  const { L } = useCopy();
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Safety", "安全")}</h1>
      <Link href="/driver/incident" className="zf-btn wide">
        {L("Report incident", "回報事件")}
      </Link>
      <p className="text-sm">{L("SOS is opened from the passenger live sheet and lands on the ops tape.", "SOS 從乘客即時頁開啟，落在調度事件帶。")}</p>
    </div>
  );
}

export function DriverHelp() {
  const { L } = useCopy();
  const { tickets, askHalo, messages } = useStore();
  const [text, setText] = useState("");
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Support", "支援")}</h1>
      <p className="text-sm">{L("Dispatch-owned offers only. Preferred bookings cannot be accepted as a private job.", "僅公司派遣指派。指定訂單不能當私活接下。")}</p>
      <table className="zf-table">
        <tbody>
          {tickets.slice(0, 4).map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.category}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="zf-panel p-3">
        {messages.slice(-3).map((m) => (
          <p key={m.id} className="text-sm">{m.role} · {m.text}</p>
        ))}
        <div className="mt-2 flex gap-2">
          <input className="flex-1 border border-[var(--line)] px-2 py-1" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="button" className="zf-btn" onClick={() => { if (text) askHalo(text); setText(""); }}>{L("Ask", "詢問")}</button>
        </div>
      </div>
    </div>
  );
}

export function DriverInbox() {
  const { live } = useLive();
  const { domain } = useStore();
  const { L } = useCopy();
  const rows = live.events.filter((e) => e.audience.includes("driver")).slice(0, 16);
  const notes = domain.notifications.filter((n) => n.audience === "driver" || n.audience === "ops").slice(0, 8);
  return (
    <div className="space-y-3">
      <h1 className="display text-4xl">{L("Notifications", "通知")}</h1>
      <ul className="zf-stream">
        {rows.map((e) => (
          <li key={e.id}>
            {e.clock} · {e.title}
          </li>
        ))}
        {notes.map((n) => (
          <li key={n.id}>
            {n.at.slice(11, 16)} · {n.event} · {n.template}
          </li>
        ))}
      </ul>
    </div>
  );
}
