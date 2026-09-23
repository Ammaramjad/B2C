"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AtlasMap } from "@/components/zf/map";
import { drivers, flights as flightDb, seedSettlements } from "@/lib/data";
import { formatWhen, serviceLabel, tx } from "@/lib/present";
import { useStore } from "@/lib/store";
import { Price } from "@/components/zf/ui";

const kenji = drivers[0];

export function DriverHome() {
  const { locale, bookings } = useStore();
  const [online, setOnline] = useState(true);
  const next = bookings.find((b) => b.id === "ZD-1805");
  const later = bookings.filter((b) => b.driverId === "d1" && b.id !== "ZD-1805");
  return (
    <div className="zf-page" style={{ paddingBottom: 80 }}>
      <div className="zf-inline" style={{ justifyContent: "space-between" }}>
        <p className="zf-kicker">{online ? tx(locale, "Online · Taipei", "上線 · 台北") : tx(locale, "Offline", "離線")}</p>
        <button
          type="button"
          className="zf-btn zf-btn-ink"
          onClick={() => {
            setOnline(!online);
          }}
        >
          {online ? tx(locale, "Go offline", "收班") : tx(locale, "Go online", "上線")}
        </button>
      </div>
      <p className="zf-note">{tx(locale, "Today", "今日")}</p>
      <h1>
        <Price twd={kenji.earningsToday} />
      </h1>
      {online && next ? (
        <article className="zf-panel" style={{ padding: 16 }}>
          <p className="zf-kicker">{tx(locale, "Current action", "現在要做的事")}</p>
          <h2>{tx(locale, "Go to TPE for Hiro Sato", "前往桃園機場接 Hiro Sato")}</h2>
          <p>
            {next.pickup} → {next.dropoff} · {formatWhen(next.when)}
          </p>
          <p>JL809 · {flightDb.JL809.status} · {flightDb.JL809.terminal}</p>
          <Link href="/driver/pickup" className="zf-btn zf-btn-primary zf-btn-block">
            {tx(locale, "Navigate to pickup", "導航至上車點")}
          </Link>
        </article>
      ) : (
        <p>{tx(locale, "You will not receive offers while offline. Scheduled jobs stay on the list.", "離線時不會收到新單。已排程的任務仍會留在清單。")}</p>
      )}
      <p className="zf-kicker">{tx(locale, "Scheduled", "已排程")}</p>
      {later.map((b) => (
        <p key={b.id}>
          {formatWhen(b.when)} · {b.pickup} → {b.dropoff}
        </p>
      ))}
      <p className="zf-kicker">{tx(locale, "Offer waiting", "待接單")}</p>
      <Link href="/driver/offer">{tx(locale, "Tamsui → Taipei Main · sedan · 18 seconds", "淡水 → 台北車站 · 轎車 · 18 秒")}</Link>
    </div>
  );
}

export function DriverOffer() {
  const { locale, grab, bookings } = useStore();
  const [left, setLeft] = useState(18);
  const [decision, setDecision] = useState<"open" | "accepted" | "rejected">("open");
  const job = bookings.find((b) => b.id === "ZD-1808");
  useEffect(() => {
    if (decision !== "open") return;
    const id = window.setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [decision]);
  if (!job) return null;
  return (
    <div className="zf-driver-job">
      <AtlasMap
        tall
        showRoute
        markers={[
          { id: "me", x: 40, y: 50, kind: "available", label: "You" },
          { id: "p", x: 30, y: 42, kind: "pickup", label: job.pickup },
          { id: "d", x: 62, y: 36, kind: "drop", label: job.dropoff },
        ]}
      />
      <div className="zf-action">
        <p className="zf-countdown zf-num">00:{String(left).padStart(2, "0")}</p>
        <h1>{serviceLabel(job.service, locale)}</h1>
        <p>
          {job.pickup} → {job.dropoff}
        </p>
        <p>{tx(locale, "6.4 km to pickup", "距離上車點 6.4 公里")} · {formatWhen(job.when)}</p>
        <p>
          {job.passengers} {tx(locale, "passengers", "位")} · {job.luggage} {tx(locale, "bags", "件")} · {tx(locale, "Sedan", "轎車")}
        </p>
        <p>
          {tx(locale, "Estimated earnings", "預估收入")} <Price twd={job.driverNet} className="zf-num" />
        </p>
        {decision === "open" ? (
          <>
            <button
              type="button"
              className="zf-btn zf-btn-ink zf-btn-block"
              disabled={left === 0}
              onClick={() => {
                grab(job.id, "d1");
                setDecision("accepted");
              }}
            >
              {tx(locale, "Accept", "接受")}
            </button>
            <button type="button" className="zf-btn zf-btn-line zf-btn-block" onClick={() => setDecision("rejected")}>
              {tx(locale, "Reject", "拒絕")}
            </button>
          </>
        ) : (
          <p>{decision === "accepted" ? tx(locale, "Accepted. Open the job to navigate.", "已接受。打開任務開始導航。") : tx(locale, "Rejected. The offer returns to dispatch.", "已拒絕。訂單回到調度。")}</p>
        )}
      </div>
    </div>
  );
}

export function DriverPickup() {
  const { locale, advance, bookings } = useStore();
  const job = bookings.find((b) => b.id === "ZD-1805");
  if (!job) return null;
  const flight = flightDb.JL809;
  return (
    <div className="zf-driver-job">
      <AtlasMap
        tall
        showRoute
        markers={[
          { id: "me", x: 36, y: 48, kind: "enroute", label: "You" },
          { id: "p", x: 22, y: 46, kind: "pickup", label: "TPE T1" },
        ]}
      />
      <div className="zf-action">
        <p className="zf-kicker">{tx(locale, "Navigate to pickup", "前往上車點")}</p>
        <h1>TPE T1</h1>
        <p>
          {job.passengerName} · {job.passengers} / {job.luggage} · {job.flight}
        </p>
        <p>
          {flight.terminal} · {flight.status} · {tx(locale, "Estimated", "預估")} {flight.eta}
        </p>
        <p className="zf-note">{tx(locale, "Meet at arrivals with the name Sato. Free wait is 45 minutes after wheels-down.", "在到達大廳舉 Sato。落地後免費等候 45 分鐘。")}</p>
        <a className="zf-btn zf-btn-line" href="tel:+819044001199">
          {tx(locale, "Call passenger", "聯絡乘客")}
        </a>
        <Link href="/driver/otp" className="zf-btn zf-btn-ink zf-btn-block" onClick={() => advance(job.id, "arriving")}>
          {tx(locale, "I have arrived", "我已抵達")}
        </Link>
      </div>
    </div>
  );
}

export function DriverOtp() {
  const { locale, bookings, advance } = useStore();
  const job = bookings.find((b) => b.id === "ZD-1805");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  if (!job) return null;
  const ok = job.status === "onboard" || job.status === "completed";
  return (
    <div className="zf-page" style={{ maxWidth: 560, paddingBottom: 80 }}>
      <p className="zf-kicker">{tx(locale, "Verify passenger", "核對乘客")}</p>
      <h1>{job.passengerName}</h1>
      <p>
        {job.pickup} → {job.dropoff}
      </p>
      <label className="zf-field">
        <span>{tx(locale, "Four-digit code", "四位數")}</span>
        <input className="zf-otp" inputMode="numeric" maxLength={4} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="OTP" />
      </label>
      {error && <p className="zf-alert zf-alert-bad">{tx(locale, "That code does not match this booking.", "代碼與這張訂單不符。")}</p>}
      {ok && <p className="zf-alert">{tx(locale, "Passenger verified. Start the trip.", "乘客已核對。可以開始行程。")}</p>}
      <button
        type="button"
        className="zf-btn zf-btn-ink zf-btn-block"
        onClick={() => {
          if (code === job.otp) {
            advance(job.id, "onboard");
            setError(false);
          } else setError(true);
        }}
      >
        {tx(locale, "Verify", "核對")}
      </button>
      {ok && (
        <Link href="/driver/trip" className="zf-btn zf-btn-primary zf-btn-block">
          {tx(locale, "Start trip", "開始行程")}
        </Link>
      )}
    </div>
  );
}

export function DriverTrip() {
  const { locale, advance, bookings } = useStore();
  const job = bookings.find((b) => b.id === "ZD-1805");
  const [done, setDone] = useState(job?.status === "completed");
  if (!job) return null;
  return (
    <div className="zf-driver-job">
      <AtlasMap
        tall
        showRoute
        markers={[
          { id: "me", x: 48, y: 42, kind: "busy", label: "En route" },
          { id: "d", x: 64, y: 30, kind: "drop", label: job.dropoff },
        ]}
      />
      <div className="zf-action">
        <p className="zf-kicker">{tx(locale, "On trip", "行程中")}</p>
        <h1>{job.dropoff}</h1>
        <p>
          {job.passengerName} · {tx(locale, "ETA 34 min", "預計 34 分鐘")}
        </p>
        <a className="zf-btn zf-btn-line" href="tel:+819044001199">
          {tx(locale, "Contact", "聯絡")}
        </a>
        <Link href="/ops/safety" className="zf-btn zf-btn-danger">
          {tx(locale, "Emergency", "緊急")}
        </Link>
        {done ? (
          <p>{tx(locale, "Trip completed. Earnings update after review.", "行程完成。收入在覆核後更新。")}</p>
        ) : (
          <button
            type="button"
            className="zf-btn zf-btn-ink zf-btn-block"
            onClick={() => {
              advance(job.id, "completed");
              setDone(true);
            }}
          >
            {tx(locale, "Complete trip", "完成行程")}
          </button>
        )}
      </div>
    </div>
  );
}

export function DriverEarnings() {
  const { locale, bookings } = useStore();
  const trips = bookings.filter((b) => b.driverId === "d1");
  return (
    <div className="zf-page" style={{ paddingBottom: 80 }}>
      <p className="zf-kicker">{tx(locale, "Earnings", "收入")}</p>
      <div className="zf-grid-2">
        <div>
          <p className="zf-note">{tx(locale, "Today", "今日")}</p>
          <Price twd={kenji.earningsToday} />
        </div>
        <div>
          <p className="zf-note">{tx(locale, "This week", "本週")}</p>
          <Price twd={kenji.earningsWeek} />
        </div>
        <div>
          <p className="zf-note">{tx(locale, "This month", "本月")}</p>
          <Price twd={kenji.earningsMonth} />
        </div>
        <div>
          <p className="zf-note">{tx(locale, "Pending", "待撥")}</p>
          <Price twd={kenji.pendingPayout} />
        </div>
      </div>
      <p>{tx(locale, "Adjustments NT$0 · Bonus NT$600 · Referral NT$450", "調整 NT$0 · 獎金 NT$600 · 推薦 NT$450")}</p>
      <table className="zf-table">
        <thead>
          <tr>
            <th>{tx(locale, "Trip", "行程")}</th>
            <th>{tx(locale, "When", "時間")}</th>
            <th>{tx(locale, "Net", "實收")}</th>
            <th>{tx(locale, "Status", "狀態")}</th>
          </tr>
        </thead>
        <tbody>
          {trips.map((b) => (
            <tr key={b.id}>
              <td>
                {b.pickup} → {b.dropoff}
              </td>
              <td>{formatWhen(b.when)}</td>
              <td className="zf-num">{b.driverNet}</td>
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/driver/settlement">{tx(locale, "Open settlement", "打開結算單")}</Link>
    </div>
  );
}

export function DriverSettlement() {
  const { locale } = useStore();
  const statement = seedSettlements.find((s) => s.driverId === "d1")!;
  return (
    <div className="zf-page zf-page-narrow" style={{ paddingBottom: 80 }}>
      <p className="zf-kicker">{statement.id}</p>
      <h1>{statement.week}</h1>
      <table className="zf-table">
        <tbody>
          <tr>
            <td>{tx(locale, "Rides", "趟次")}</td>
            <td className="zf-num">{statement.rides}</td>
          </tr>
          <tr>
            <td>{tx(locale, "Gross", "總額")}</td>
            <td className="zf-num">{statement.gross}</td>
          </tr>
          <tr>
            <td>{tx(locale, "Commission", "抽成")}</td>
            <td className="zf-num">{statement.commission}</td>
          </tr>
          <tr>
            <td>{tx(locale, "Net", "實付")}</td>
            <td className="zf-num">{statement.net}</td>
          </tr>
          <tr>
            <td>{tx(locale, "Payment", "撥款")}</td>
            <td>{statement.status}</td>
          </tr>
        </tbody>
      </table>
      <button type="button" className="zf-btn zf-btn-line">
        {tx(locale, "Export statement", "匯出對帳單")}
      </button>
    </div>
  );
}

const papers = [
  { name: "Driver license", zh: "駕照", state: "Verified", exp: "12 Apr 2028" },
  { name: "Vehicle registration", zh: "行照", state: "Verified", exp: "30 Jan 2027" },
  { name: "Insurance", zh: "保險", state: "Expires soon", exp: "02 Oct 2026" },
  { name: "Airport permit", zh: "機場許可", state: "Rejected", exp: "—", note: "The photo was cropped. Upload the full permit." },
];

export function DriverDocuments() {
  const { locale } = useStore();
  const [queued, setQueued] = useState(false);
  return (
    <div className="zf-page" style={{ paddingBottom: 80 }}>
      <p className="zf-kicker">{tx(locale, "Compliance", "合規")}</p>
      <h1>{tx(locale, "Documents", "證件")}</h1>
      {papers.map((doc) => (
        <article key={doc.name} className="zf-trip">
          <strong>{locale === "zh" ? doc.zh : doc.name}</strong>
          <span>
            {doc.state} · {doc.exp}
            {doc.note && <span className="zf-note"> {doc.note}</span>}
          </span>
          {doc.state === "Rejected" && (
            <button type="button" className="zf-btn zf-btn-ink" onClick={() => setQueued(true)}>
              {queued ? tx(locale, "Queued for review", "已送審") : tx(locale, "Upload again", "重新上傳")}
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
