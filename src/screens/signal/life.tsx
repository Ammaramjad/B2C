"use client";

import Link from "next/link";
import { useState } from "react";
import { attractions } from "@/lib/data";
import { useLive } from "@/lib/live/engine";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useCopy } from "@/lib/copy";
import { seedWalletFromBookings } from "@/lib/domain/ledger";
import type { Role } from "@/lib/types";

function loyaltyTier(points: number) {
  if (points >= 5000) return { id: "Signal", range: "5000+", perkEn: "Preferred mediation first", perkZh: "指定仲介優先" };
  if (points >= 2000) return { id: "Atlas", range: "2000–4999", perkEn: "Priority desk", perkZh: "優先客服" };
  return { id: "Circle", range: "0–1999", perkEn: "Standard wait", perkZh: "標準等候" };
}

export function SignalWallet() {
  const { bookings, domain } = useStore();
  const { L } = useCopy();
  const shown = seedWalletFromBookings(bookings, domain.wallet);
  const balance = shown.reduce((s, r) => s + (r.type === "debit" || r.type === "expiry" ? -Math.abs(r.amount) : r.amount), 0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">{L("Wallet ledger", "錢包帳本")}</div>
      <h1 className="display mt-2 text-5xl">NT${balance.toLocaleString()}</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">{L("Credits and trip debits. Not a marketing tile.", "儲值與行程扣款。不是行銷磁磚。")}</p>
      <table className="zf-table mt-6">
        <thead>
          <tr>
            <th>{L("When", "時間")}</th>
            <th>{L("Ref", "單號")}</th>
            <th>{L("Type", "類型")}</th>
            <th>{L("Amount", "金額")}</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.id}>
              <td>{r.timestamp.slice(0, 10)}</td>
              <td>{r.bookingId ?? r.reference}</td>
              <td>{r.type} · {r.source}</td>
              <td className="mono">{money(r.type === "debit" ? -Math.abs(r.amount) : r.amount, "TWD")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SignalReferral() {
  const { user, bookings } = useStore();
  const { L } = useCopy();
  const paid = bookings.filter((b) => b.status === "completed").length;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">{L("Growth · company rules", "成長 · 公司規則")}</div>
      <h1 className="display mt-2 text-5xl">{L("Invite on the network.", "在網路上邀請。")}</h1>
      <p className="mt-3 text-[var(--ink-2)]">{L("Customer→customer and B2B codes settle through Zoufeng. This is not a driver side-channel.", "顧客對顧客與 B2B 代碼由走癲結算。這不是司機私訊通路。")}</p>
      <div className="zf-panel mt-6 p-4">
        <div className="kicker">{L("Your code", "你的代碼")}</div>
        <div className="zf-metric text-3xl">{user?.referralCode ?? "ZOUDIAN-88"}</div>
        <div className="mt-2 text-sm">{L("NT$100 / NT$100 after first paid trip · fraud review on device clusters", "首次付費行程後各 NT$100 · 裝置叢集需審核")}</div>
      </div>
      <table className="zf-table mt-6">
        <thead>
          <tr>
            <th>{L("Invite", "邀請")}</th>
            <th>{L("State", "狀態")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>James Wu</td>
            <td>{L("Paid trip credited", "已入帳付費行程")}</td>
          </tr>
          <tr>
            <td>Sophie Tan</td>
            <td>{L("Pending first paid trip", "待首次付費")}</td>
          </tr>
          <tr>
            <td>{L("Completed trips in ledger", "帳本完成行程")}</td>
            <td>{paid}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function SignalPlanner() {
  const [hours, setHours] = useState(6);
  const { locale } = useStore();
  const { L } = useCopy();
  const picks = attractions.filter((a) => a.hours <= hours);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">{L("AI trip planner · suggestion only", "AI 行程規劃 · 僅建議")}</div>
      <h1 className="display mt-2 text-5xl">{L("A day that still fits a car.", "一天行程仍裝得進一輛車。")}</h1>
      <label className="zf-field mt-6 max-w-xs">
        <span>{L("Available hours", "可用時數")}</span>
        <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
      </label>
      <table className="zf-table mt-6">
        <thead>
          <tr>
            <th>{L("Stop", "站點")}</th>
            <th>{L("Hours", "時數")}</th>
            <th>{L("Cost", "費用")}</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((a) => (
            <tr key={a.id}>
              <td>{locale === "zh" ? a.nameZh : a.name}</td>
              <td>{a.hours}</td>
              <td>{a.cost ? `NT$${a.cost}` : L("Free", "免費")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/book?service=hourly" className="zf-btn mt-6">
        {L("Charter this day", "包車這一天")}
      </Link>
    </div>
  );
}

export function SignalSupport() {
  const { tickets, askHalo, messages, createTicket, bookings, requestSwitch, lastDriverId, switches } = useStore();
  const { L } = useCopy();
  const [text, setText] = useState("");
  const [cat, setCat] = useState("Airport Pickup");
  const [msg, setMsg] = useState("");
  const [switchReason, setSwitchReason] = useState("");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">{L("Support", "客服")}</div>
      <h1 className="display mt-2 text-5xl">{L("Desk, not a chatbot wallpaper.", "是櫃檯，不是聊天牆紙。")}</h1>
      <table className="zf-table mt-6">
        <thead>
          <tr>
            <th>{L("Ticket", "工單")}</th>
            <th>{L("Category", "類別")}</th>
            <th>{L("Status", "狀態")}</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.category}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="zf-panel mt-4 space-y-2 p-4">
        <div className="kicker">{L("Open a ticket", "開立工單")}</div>
        <label className="zf-field">
          <span>{L("Category", "類別")}</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option>Airport Pickup</option>
            <option>Cancellation</option>
            <option>Payment</option>
            <option>Driver</option>
            <option>Safety</option>
          </select>
        </label>
        <label className="zf-field">
          <span>{L("Message", "內容")}</span>
          <input value={msg} onChange={(e) => setMsg(e.target.value)} />
        </label>
        <button
          type="button"
          className="zf-btn"
          data-testid="create-ticket"
          onClick={() => {
            if (!msg) return;
            createTicket({ category: cat, categoryZh: cat, message: msg, bookingId: bookings[0]?.id });
            setMsg("");
          }}
        >
          {L("Submit ticket", "送出工單")}
        </button>
      </div>
      <div className="zf-panel mt-4 space-y-2 p-4">
        <div className="kicker">{L("Request different driver via company", "透過公司申請更換司機")}</div>
        <p className="text-sm text-[var(--ink-2)]">{L("After you have been assigned a driver, you cannot privately contact another.", "一旦已指派司機，不得私下聯絡其他司機。")}</p>
        <input className="w-full border border-[var(--line)] px-3 py-2" value={switchReason} onChange={(e) => setSwitchReason(e.target.value)} placeholder={L("Reason", "原因")} />
        <button
          type="button"
          className="zf-btn ghost"
          onClick={() => {
            const from = lastDriverId() ?? "d1";
            if (switchReason) requestSwitch({ fromDriverId: from, reason: switchReason, reasonZh: switchReason, bookingId: bookings.find((b) => b.status !== "completed" && b.status !== "cancelled")?.id });
            setSwitchReason("");
          }}
        >
          {L("Send company switch", "送出公司代換")}
        </button>
        <ul className="zf-stream mt-2">
          {switches.slice(0, 4).map((s) => (
            <li key={s.id}>{s.id} · {s.status} · {s.reason}</li>
          ))}
        </ul>
      </div>
      <div className="zf-panel mt-6 p-4">
        {messages.slice(-4).map((m) => (
          <p key={m.id} className="text-sm">
            <b>{m.role}</b> · {m.text}
          </p>
        ))}
        <div className="mt-3 flex gap-2">
          <input className="flex-1 border border-[var(--line)] px-3 py-2" value={text} onChange={(e) => setText(e.target.value)} />
          <button
            type="button"
            className="zf-btn"
            onClick={() => {
              if (text) askHalo(text);
              setText("");
            }}
          >
            {L("Ask", "詢問")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SignalInbox() {
  const { live } = useLive();
  const { domain } = useStore();
  const { L } = useCopy();
  const notes = live.events.filter((e) => e.audience.includes("passenger")).slice(0, 12);
  const logs = domain.notifications.filter((n) => n.audience === "passenger").slice(0, 12);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">{L("Notifications", "通知")}</div>
      <h1 className="display mt-2 text-5xl">{L("What moved.", "有什麼在動。")}</h1>
      <ul className="zf-stream mt-6">
        {notes.map((e) => (
          <li key={e.id}>
            <span className="mono text-[var(--mute)]">{e.clock}</span> {e.title} — {e.body}
          </li>
        ))}
        {logs.map((n) => (
          <li key={n.id}>
            <span className="mono text-[var(--mute)]">{n.at.slice(11, 16)}</span> {n.event} — {n.template}
          </li>
        ))}
        {notes.length === 0 && logs.length === 0 ? <li>{L("No passenger events yet. Play a scenario or book.", "尚無乘客事件。請播放情境或預訂。")}</li> : null}
      </ul>
    </div>
  );
}

export function SignalLoyalty() {
  const { user, bookings } = useStore();
  const { L } = useCopy();
  const points = user?.points ?? 4280;
  const tier = loyaltyTier(points);
  const done = bookings.filter((b) => b.status === "completed").length;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">{L("Membership", "會員")}</div>
      <h1 className="display mt-2 text-5xl">{points} pts</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">{L("Points accrue on paid trips in the store. Tiers are Circle / Atlas / Signal.", "點數依帳本已付行程累計。等級為 Circle / Atlas / Signal。")}</p>
      <div className="zf-panel mt-4 p-4">
        <div className="kicker">{tier.id}</div>
        <div>{tier.range}</div>
        <div className="text-sm">{L(tier.perkEn, tier.perkZh)}</div>
      </div>
      <div className="mt-4 text-sm">{done} {L("completed rows in this ledger", "筆完成訂單")}</div>
    </div>
  );
}

export function SignalLogin() {
  const { login } = useStore();
  const { L } = useCopy();
  const [email, setEmail] = useState("amara@zoudian.travel");
  const roles: { role: Role; email: string; label: string }[] = [
    { role: "passenger", email: "amara@zoudian.travel", label: L("Customer", "乘客") },
    { role: "driver", email: "driver@zoudian.travel", label: L("Driver", "司機") },
    { role: "ops", email: "ops@zoudian.travel", label: L("Ops", "調度") },
    { role: "dispatcher", email: "admin@zoudian.travel", label: L("Admin", "後台") },
  ];
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="kicker">{L("Identity", "身分")}</div>
      <h1 className="display mt-2 text-5xl">{L("Enter.", "進入。")}</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">{L("Demo switch only. Production auth is unconfigured.", "僅示範切換。正式驗證尚未設定。")}</p>
      <div className="mt-6 grid gap-2">
        {roles.map((r) => (
          <button
            key={r.role}
            type="button"
            className="zf-btn wide"
            data-testid={`login-${r.role}`}
            onClick={() => login(r.email, r.role)}
          >
            {r.label}
          </button>
        ))}
      </div>
      <label className="zf-field mt-6">
        <span>{L("Email", "電子郵件")}</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="button" className="zf-btn ghost wide mt-4" onClick={() => login(email)}>
        {L("Continue", "繼續")}
      </button>
    </div>
  );
}
