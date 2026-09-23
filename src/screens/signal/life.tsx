"use client";

import Link from "next/link";
import { useState } from "react";
import { attractions } from "@/lib/data";
import { useLive } from "@/lib/live/engine";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export function SignalWallet() {
  const { bookings, domain } = useStore();
  const rows = domain.wallet.length ? domain.wallet : bookings.slice(0, 6).map((b) => ({
    id: `seed_${b.id}`,
    timestamp: b.createdAt,
    bookingId: b.id,
    type: b.status === "cancelled" ? "refund" : "debit",
    amount: b.price,
    currency: b.currency,
    source: "seed" as const,
  }));
  const balance = rows.reduce((s, r) => s + (r.type === "debit" || r.type === "expiry" ? -Math.abs(r.amount) : r.amount), 0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">Wallet ledger</div>
      <h1 className="display mt-2 text-5xl">NT${balance.toLocaleString()}</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">Credits and trip debits. Not a marketing tile.</p>
      <table className="zf-table mt-6">
        <thead>
          <tr>
            <th>When</th>
            <th>Ref</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.timestamp.slice(0, 10)}</td>
              <td>{r.bookingId}</td>
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
  const { user } = useStore();
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">Growth · company rules</div>
      <h1 className="display mt-2 text-5xl">Invite on the network.</h1>
      <p className="mt-3 text-[var(--ink-2)]">Customer→customer and B2B codes settle through Zoufeng. This is not a driver side-channel.</p>
      <div className="zf-panel mt-6 p-4">
        <div className="kicker">Your code</div>
        <div className="zf-metric text-3xl">{user?.referralCode ?? "ZOUDIAN-88"}</div>
        <div className="mt-2 text-sm">NT$100 / NT$100 after first paid trip · fraud review on device clusters</div>
      </div>
    </div>
  );
}

export function SignalPlanner() {
  const [hours, setHours] = useState(6);
  const picks = attractions.filter((a) => a.hours <= hours);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">AI trip planner · suggestion only</div>
      <h1 className="display mt-2 text-5xl">A day that still fits a car.</h1>
      <label className="zf-field mt-6 max-w-xs">
        <span>Available hours</span>
        <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
      </label>
      <table className="zf-table mt-6">
        <thead>
          <tr>
            <th>Stop</th>
            <th>Hours</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {picks.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.hours}</td>
              <td>{a.cost ? `NT$${a.cost}` : "Free"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/book?service=hourly" className="zf-btn mt-6">
        Charter this day
      </Link>
    </div>
  );
}

export function SignalSupport() {
  const { tickets, askHalo, messages } = useStore();
  const [text, setText] = useState("");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">Support</div>
      <h1 className="display mt-2 text-5xl">Desk, not a chatbot wallpaper.</h1>
      <table className="zf-table mt-6">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Category</th>
            <th>Status</th>
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
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

export function SignalInbox() {
  const { live } = useLive();
  const notes = live.events.filter((e) => e.audience.includes("passenger")).slice(0, 12);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">Notifications</div>
      <h1 className="display mt-2 text-5xl">What moved.</h1>
      <ul className="zf-stream mt-6">
        {notes.map((e) => (
          <li key={e.id}>
            <span className="mono text-[var(--mute)]">{e.clock}</span> {e.title} — {e.body}
          </li>
        ))}
        {notes.length === 0 ? <li>No passenger events yet. Play a scenario or book.</li> : null}
      </ul>
    </div>
  );
}

export function SignalLoyalty() {
  const { user, bookings } = useStore();
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">Membership</div>
      <h1 className="display mt-2 text-5xl">{user?.points ?? 4280} pts</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">Points accrue on paid trips in the store. No invented tiers.</p>
      <div className="mt-4 text-sm">{bookings.filter((b) => b.status === "completed").length} completed rows in this ledger</div>
    </div>
  );
}

export function SignalLogin() {
  const { login } = useStore();
  const [email, setEmail] = useState("amara@zoudian.travel");
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="kicker">Identity</div>
      <h1 className="display mt-2 text-5xl">Enter.</h1>
      <label className="zf-field mt-6">
        <span>Email</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="button" className="zf-btn wide mt-4" onClick={() => login(email)}>
        Continue
      </button>
    </div>
  );
}
