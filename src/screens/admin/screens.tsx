"use client";

import { useState } from "react";
import { cancelFee } from "@/lib/pricing";
import { passengers } from "@/lib/data";
import { Kicker, Stamp, Ticket } from "@/components/atlas/primitives";

export function PricingEngine() {
  const factors = [
    "Base",
    "Distance",
    "Time",
    "Airport",
    "Night",
    "Peak",
    "Demand",
    "Supply",
    "Weather",
    "Region",
    "Events",
    "Vehicle",
    "Service",
    "Ops conditions",
    "Historical demand",
    "Commercial controls",
  ];
  return (
    <div>
      <Kicker>M17 · Dynamic pricing</Kicker>
      <h1 className="serif mt-2 text-4xl">Multi-factor engine</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)]">Rule priority, floor, ceiling, simulation, shadow mode, override, history, rollback.</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {factors.map((f, i) => (
          <Ticket key={f}>
            <div className="flex justify-between text-sm">
              <span>{f}</span>
              <span className="mono text-[var(--mute)]">P{i + 1}</span>
            </div>
            <div className="mt-2 text-xs text-[var(--mute)]">Floor / ceiling · shadow {i % 3 === 0 ? "on" : "off"}</div>
          </Ticket>
        ))}
      </div>
      <Ticket className="mt-6">
        <Kicker>Simulation</Kicker>
        <p className="mt-2 text-sm">TPE → 101 · sedan · 23:40 · rain · demand 1.12 → NT$1,536 (shadow vs live NT$1,430)</p>
        <div className="mt-3 flex gap-2 text-sm">
          <Stamp>Version 18 published</Stamp>
          <Stamp tone="warn">Rollback to v17</Stamp>
        </div>
      </Ticket>
    </div>
  );
}

export function CancelPolicy() {
  const [h, setH] = useState(8);
  const fee = cancelFee(h, 2680);
  return (
    <div className="max-w-2xl">
      <h1 className="serif text-4xl">Cancellation bands</h1>
      <label className="mt-6 block text-sm">
        If cancelled {h} hours before pickup
        <input className="mt-2 w-full" type="range" min={0} max={48} value={h} onChange={(e) => setH(Number(e.target.value))} />
      </label>
      <Ticket className="mt-4">
        Consequence: {fee === 0 ? "Full refund" : `Fee NT$${fee.toLocaleString()}`}
      </Ticket>
      <table className="dense mt-6 w-full">
        <thead>
          <tr>
            <th>Band</th>
            <th>Fee</th>
            <th>Refund</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>≥ 24h</td>
            <td>0</td>
            <td>100%</td>
          </tr>
          <tr>
            <td>6–24h</td>
            <td>50%</td>
            <td>50%</td>
          </tr>
          <tr>
            <td>&lt; 6h</td>
            <td>100%</td>
            <td>0%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Ledger({
  title,
  cols,
  rows,
}: {
  title: string;
  cols: string[];
  rows: string[][];
}) {
  return (
    <div>
      <h1 className="serif text-4xl">{title}</h1>
      <table className="dense mt-6 w-full">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className={j === r.length - 1 ? "metric" : ""}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PaymentsTable() {
  return (
    <Ledger
      title="Payments"
      cols={["Txn", "Booking", "Method", "Auth", "Capture", "Status", "Amount"]}
      rows={[
        ["TX-9912", "ZD-1801", "Card ••4410", "OK", "OK", "Settled", "2,750"],
        ["TX-9918", "ZD-1807", "Card ••2291", "OK", "Pending", "Auth", "5,010"],
        ["TX-9920", "ZD-1804", "Apple Pay", "OK", "OK", "Settled", "265"],
      ]}
    />
  );
}

export function RefundsTable() {
  return (
    <Ledger
      title="Refunds"
      cols={["Refund", "Booking", "Reason", "Override", "Dest", "Status", "Amount"]}
      rows={[
        ["RF-110", "ZD-1809", ">24h policy", "No", "LINE Pay", "Posted", "0"],
        ["RF-114", "ZD-1802", "Ops goodwill", "Yes · Nova", "Card", "Review", "380"],
      ]}
    />
  );
}

export function SettlementsTable() {
  return (
    <Ledger
      title="Settlements"
      cols={["Statement", "Party", "Week", "Gross", "Comm", "Net", "Status"]}
      rows={[
        ["ST-d1-38", "Kenji Mori", "2026-W38", "42,800", "8,560", "34,240", "Pending"],
        ["ST-B-38", "Franchise North", "2026-W38", "188,200", "22,584", "165,616", "Paid"],
      ]}
    />
  );
}

export function WalletLedger() {
  return (
    <Ledger
      title="Wallet ledger"
      cols={["Entry", "Account", "Type", "Reason", "Expiry", "Amount"]}
      rows={[
        ["WL-1", "p1 Amara", "Credit", "Campaign TPE", "2026-10-12", "+100"],
        ["WL-2", "p1 Amara", "Debit", "Trip ZD-1801", "—", "-2,750"],
        ["WL-3", "p5 Mei-ling", "Adjust", "Ops correction", "Audit", "+0"],
      ]}
    />
  );
}

export function ReferralAdmin() {
  return (
    <div>
      <h1 className="serif text-4xl">Referral campaigns</h1>
      <table className="dense mt-6 w-full">
        <thead>
          <tr>
            <th>Channel</th>
            <th>Reward</th>
            <th>Conversion</th>
            <th>Fraud flags</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Customer → Customer</td>
            <td>NT$100 / NT$100</td>
            <td>18%</td>
            <td>2 device clusters</td>
          </tr>
          <tr>
            <td>Driver → Customer</td>
            <td>NT$200 after first paid trip</td>
            <td>9%</td>
            <td>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function Crm360() {
  const p = passengers[0];
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Ticket>
        <h1 className="serif text-3xl">{p.name}</h1>
        <div className="mt-2 text-sm">{p.email}</div>
        <div className="text-sm">RFM {p.rfm}</div>
        <div className="text-sm">{p.trips} trips · NT${p.spendTwd.toLocaleString()}</div>
        <Stamp tone="pine">Consent: marketing on</Stamp>
      </Ticket>
      <div className="grid gap-3 md:grid-cols-2">
        {["Trips", "Wallet", "Referrals", "Support", "Campaigns", "Churn risk"].map((k) => (
          <Ticket key={k}>
            <Kicker>{k}</Kicker>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Customer 360 slice — not a KPI wallpaper.</p>
          </Ticket>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsStudio() {
  return (
    <div>
      <h1 className="serif text-4xl">Role analytics</h1>
      <div className="mt-4 flex gap-3 text-sm">
        {["Executive", "Operations", "Growth", "Finance", "Customer"].map((r) => (
          <Stamp key={r}>{r}</Stamp>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Ticket>
          <Kicker>Executive · GMV trend</Kicker>
          <svg viewBox="0 0 320 120" className="mt-4 w-full">
            <polyline fill="none" stroke="var(--copper)" strokeWidth="2" points="0,80 40,70 80,74 120,50 160,54 200,36 240,40 280,22 320,28" />
          </svg>
          <div className="mt-2 text-sm">NT$18.4M · AOV 1,860 · retention 41%</div>
        </Ticket>
        <Ticket>
          <Kicker>Ops · time-to-assign</Kicker>
          <div className="mt-3 space-y-2">
            {[
              ["Airport", 78],
              ["P2P", 54],
              ["Instant", 91],
            ].map(([k, v]) => (
              <div key={String(k)}>
                <div className="flex justify-between text-xs">
                  <span>{k}</span>
                  <span>{v}%</span>
                </div>
                <div className="mt-1 h-2 bg-[var(--sand)]">
                  <div className="h-2 bg-[var(--copper)]" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Ticket>
      </div>
    </div>
  );
}

export function PromosAdmin() {
  return (
    <Ledger
      title="Promotions"
      cols={["Code", "Audience", "Service", "Window", "Usage", "Status"]}
      rows={[
        ["TPE200", "Airport bookers", "Pickup/drop", "Sep 1–30", "412 / 2000", "Live"],
        ["FAMILY", "5+ pax", "Hourly", "Always", "88", "Live"],
      ]}
    />
  );
}

export function I18nAdmin() {
  return (
    <Ledger
      title="Translation / proofreading"
      cols={["Key", "EN source", "繁中", "Status"]}
      rows={[
        ["home.where", "Where should the car meet you?", "車子要在哪裡接你？", "Approved"],
        ["fare.night", "Night surcharge", "夜間加成", "Needs review"],
        ["sos.title", "Emergency assistance", "緊急協助", "Missing JA"],
      ]}
    />
  );
}

export function NotifyAdmin() {
  return (
    <Ledger
      title="Notification center"
      cols={["Event", "Email", "SMS", "Push", "In-app", "Last fail"]}
      rows={[
        ["Driver assigned", "On", "On", "On", "On", "—"],
        ["Flight delay", "On", "On", "On", "On", "SMS 02:14"],
        ["Refund posted", "On", "Off", "On", "On", "—"],
      ]}
    />
  );
}

export function IntegrationsAdmin() {
  return (
    <div>
      <h1 className="serif text-4xl">Integrations</h1>
      <p className="mt-2 text-sm text-[var(--mute)]">Secrets are never displayed. Status and last success only.</p>
      <table className="dense mt-6 w-full">
        <thead>
          <tr>
            <th>System</th>
            <th>Env</th>
            <th>Status</th>
            <th>Last success</th>
            <th>Last failure</th>
          </tr>
        </thead>
        <tbody>
          {["Maps", "Payment", "Flight", "SMS", "Email", "Push", "FX", "Partner mobility", "AI"].map((s) => (
            <tr key={s}>
              <td>{s}</td>
              <td>prod</td>
              <td>Connected</td>
              <td>09:12</td>
              <td>{s === "SMS" ? "02:14 timeout" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AuditAdmin() {
  return (
    <Ledger
      title="Audit log"
      cols={["Time", "Actor", "Role", "Action", "Object", "Before", "After"]}
      rows={[
        ["09:18", "Nova Lin", "ops", "assign", "ZD-1808", "—", "d4"],
        ["09:02", "system", "pricing", "publish", "fare.v18", "v17", "v18"],
        ["08:44", "Finance", "admin", "refund.override", "RF-114", "deny", "review"],
      ]}
    />
  );
}
