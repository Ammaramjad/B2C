"use client";

import { useMemo, useState } from "react";
import { MiniChart, Price } from "@/components/zf/ui";
import { auditRows, integrations, notifications, parameterGroups, payments, pricingFactors, promotions, referrals, refunds, translations, walletLedger } from "@/design/fixtures";
import { drivers, passengers } from "@/lib/data";
import { cancelFee, quote } from "@/lib/pricing";

export function PricingDesk() {
  const [shadow, setShadow] = useState(true);
  const [floor, setFloor] = useState(880);
  const [ceiling, setCeiling] = useState(12000);
  const [version, setVersion] = useState("v12.4");
  const [hours, setHours] = useState(8);
  const sample = quote({ service: "hourly", vehicle: "mpv", hours, when: "2026-09-24T22:30" });
  const bounded = Math.min(ceiling, Math.max(floor, sample.total));
  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">Fare {version}</p>
        <h1>Pricing factors</h1>
        <table className="zf-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Factor</th>
              <th>Rule</th>
              <th>On</th>
            </tr>
          </thead>
          <tbody>
            {pricingFactors.map((factor, i) => (
              <tr key={factor.id}>
                <td className="zf-mono">{i + 1}</td>
                <td>{factor.name}</td>
                <td>{factor.weight}</td>
                <td>{factor.on ? "Yes" : "Off"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="zf-panel" style={{ padding: 12 }}>
        <p className="zf-kicker">Simulation</p>
        <label className="zf-field">
          <span>Charter hours</span>
          <input type="number" min={4} max={12} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
        </label>
        <label className="zf-field">
          <span>Floor</span>
          <input type="number" value={floor} onChange={(e) => setFloor(Number(e.target.value))} />
        </label>
        <label className="zf-field">
          <span>Ceiling</span>
          <input type="number" value={ceiling} onChange={(e) => setCeiling(Number(e.target.value))} />
        </label>
        <p>
          Raw <Price twd={sample.total} className="zf-num" />
        </p>
        <p>
          After floor {floor} and ceiling {ceiling}: <Price twd={bounded} className="zf-num" />
        </p>
        <label className="zf-inline">
          <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} /> Shadow mode
        </label>
        <p className="zf-note">{shadow ? "Quotes are logged. Guests still see v12.3." : "Live for new quotes."}</p>
        <div className="zf-inline">
          <button type="button" className="zf-btn zf-btn-primary" onClick={() => setVersion("v12.5")}>
            Publish
          </button>
          <button type="button" className="zf-btn zf-btn-line" onClick={() => setVersion("v12.3")}>
            Roll back
          </button>
        </div>
        <p className="zf-note">History: v12.3 night band, v12.2 airport flat, v12.1 launch.</p>
      </aside>
    </div>
  );
}

export function CancellationDesk() {
  const [hours, setHours] = useState(8);
  const [feePct, setFeePct] = useState(0.5);
  const fare = 2630;
  const fee = cancelFee(hours, fare, feePct);
  return (
    <div className="zf-page zf-page-narrow">
      <p className="zf-kicker">Airport pickup · Taiwan · effective 1 Sep 2026</p>
      <h1>Cancellation</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Band</th>
            <th>Fee</th>
            <th>Refund</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>More than 24 hours</td>
            <td>0</td>
            <td>Full</td>
          </tr>
          <tr>
            <td>6 to 24 hours</td>
            <td>{Math.round(feePct * 100)}%</td>
            <td>Remainder</td>
          </tr>
          <tr>
            <td>Under 6 hours</td>
            <td>Full fare</td>
            <td>None</td>
          </tr>
        </tbody>
      </table>
      <label className="zf-field">
        <span>If cancelled this many hours before pickup</span>
        <input type="number" value={hours} min={0} max={72} onChange={(e) => setHours(Number(e.target.value))} />
      </label>
      <p>
        On a NT${fare.toLocaleString()} airport pickup, the fee is <Price twd={fee} className="zf-num" /> and the refund is <Price twd={fare - fee} className="zf-num" />.
      </p>
      <label className="zf-field">
        <span>Mid-band fee</span>
        <input type="range" min={0} max={1} step={0.05} value={feePct} onChange={(e) => setFeePct(Number(e.target.value))} />
      </label>
    </div>
  );
}

export function PaymentsDesk() {
  const [id, setId] = useState(payments[4].id);
  const row = payments.find((p) => p.id === id)!;
  return (
    <div className="zf-page">
      <h1>Payments</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Booking</th>
            <th>Method</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>
                <button type="button" className="zf-rowbtn" onClick={() => setId(p.id)}>
                  {p.id}
                </button>
              </td>
              <td>{p.booking}</td>
              <td>{p.method}</td>
              <td>{p.kind}</td>
              <td className="zf-mono">{p.amount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <aside className="zf-panel" style={{ padding: 12, marginTop: 12 }}>
        <h2>{row.id}</h2>
        <p>
          {row.kind} · {row.status} · {row.when}
        </p>
        <p className="zf-note">No full card number is stored. Reconciliation matches the provider reference to the booking.</p>
      </aside>
    </div>
  );
}

export function RefundsDesk() {
  const [note, setNote] = useState("Approve wallet credit. Flight diverted before dispatch.");
  return (
    <div className="zf-page">
      <h1>Refund review</h1>
      {refunds.map((row) => (
        <article key={row.id} className="zf-panel" style={{ padding: 12, marginBottom: 10 }}>
          <strong>
            {row.id} · {row.status}
          </strong>
          <p>
            {row.passenger} · {row.booking} · {row.reason}
          </p>
          <p>
            Fee NT${row.fee} · Refund NT${row.refund} → {row.dest} · {row.owner}
          </p>
        </article>
      ))}
      <label className="zf-field">
        <span>Override note</span>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button type="button" className="zf-btn zf-btn-primary">
        Approve RF-334
      </button>
    </div>
  );
}

export function SettlementsDesk() {
  return (
    <div className="zf-page">
      <h1>Settlements</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Statement</th>
            <th>Party</th>
            <th>Rides</th>
            <th>Gross</th>
            <th>Commission</th>
            <th>Net</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {drivers.slice(0, 3).map((d) => (
            <tr key={d.id}>
              <td>2026-W38</td>
              <td>{d.name}</td>
              <td className="zf-mono">{d.completedWeek}</td>
              <td className="zf-mono">{d.earningsWeek}</td>
              <td className="zf-mono">{Math.round(d.earningsWeek * d.commissionRate)}</td>
              <td className="zf-mono">{d.pendingPayout}</td>
              <td>Pending</td>
            </tr>
          ))}
          <tr>
            <td>2026-W38</td>
            <td>Northstar franchise</td>
            <td className="zf-mono">40</td>
            <td className="zf-mono">186400</td>
            <td className="zf-mono">27960</td>
            <td className="zf-mono">158440</td>
            <td>Scheduled</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function WalletLedgerDesk() {
  return (
    <div className="zf-page">
      <h1>Wallet ledger</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Entry</th>
            <th>Account</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Note</th>
            <th>Actor</th>
          </tr>
        </thead>
        <tbody>
          {walletLedger.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.account}</td>
              <td>{row.type}</td>
              <td className="zf-mono">{row.amount}</td>
              <td>{row.note}</td>
              <td>{row.actor}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="zf-note">Campaign credit expires 90 days after issue. Manual adjustments require a reason and land in the audit log.</p>
    </div>
  );
}

export function ReferralDesk() {
  return (
    <div className="zf-page">
      <h1>Referrals</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Channel</th>
            <th>Invited</th>
            <th>Pending</th>
            <th>Earned</th>
            <th>Reward</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((row) => (
            <tr key={row.code}>
              <td className="zf-mono">{row.code}</td>
              <td>{row.channel}</td>
              <td>{row.invited}</td>
              <td>{row.pending}</td>
              <td>{row.earned}</td>
              <td>{row.reward}</td>
              <td>{row.flag}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Chain: Northstar invited Amara, Amara invited Mei Lin. Conversion 38% on the B2B channel this month.</p>
    </div>
  );
}

export function CrmDesk() {
  const [id, setId] = useState("p1");
  const person = passengers.find((p) => p.id === id)!;
  return (
    <div className="zf-split">
      <div>
        <h1>Customers</h1>
        <table className="zf-table">
          <tbody>
            {passengers.map((p) => (
              <tr key={p.id}>
                <td>
                  <button type="button" className="zf-rowbtn" onClick={() => setId(p.id)}>
                    {p.name}
                  </button>
                </td>
                <td>{p.rfm}</td>
                <td className="zf-mono">{p.trips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="zf-panel" style={{ padding: 12 }}>
        <p className="zf-kicker">{person.rfm}</p>
        <h2>{person.name}</h2>
        <p>
          {person.email} · {person.phone}
        </p>
        <p>
          {person.trips} trips · NT${person.spendTwd.toLocaleString()} · {person.points} points
        </p>
        <p>Consent: trip messages on, marketing off.</p>
        <p className="zf-note">Churn watch is on for risk accounts. Support and referral history sit on the same record.</p>
      </aside>
    </div>
  );
}

const lenses = ["Executive", "Operations", "Growth", "Finance", "Customer"] as const;

export function AnalyticsDesk() {
  const [lens, setLens] = useState<(typeof lenses)[number]>("Executive");
  const copy: Record<(typeof lenses)[number], { title: string; points: number[]; note: string }> = {
    Executive: { title: "GMV by week", points: [12, 14, 13, 16, 18, 17, 21], note: "Bookings 1,284 · average order NT$1,860 · repeat 34% in Taipei." },
    Operations: { title: "Minutes to assign", points: [9, 8, 11, 7, 6, 8, 5], note: "Acceptance 93%. Airport on-time pickup 96%. Exceptions today: 2 delayed flights." },
    Growth: { title: "First booking conversion", points: [4, 5, 5, 6, 6, 7, 7], note: "Referral share 18%. Campaign TPE200 conversion is higher on airport pages than on home." },
    Finance: { title: "Captured vs refunded", points: [20, 22, 19, 21, 24, 23, 25], note: "Refund rate 3.1%. One failed capture is still unmatched." },
    Customer: { title: "Repeat within 60 days", points: [28, 30, 29, 33, 34, 32, 36], note: "Support contacts per 100 trips: 6. Churn risk is concentrated in single-trip accounts." },
  };
  const view = copy[lens];
  return (
    <div className="zf-page">
      <div className="zf-tabs">
        {lenses.map((item) => (
          <button key={item} type="button" data-on={lens === item} onClick={() => setLens(item)}>
            {item}
          </button>
        ))}
      </div>
      <h1>{view.title}</h1>
      <MiniChart points={view.points} label={view.title} />
      <p>{view.note}</p>
    </div>
  );
}

export function PromoDesk() {
  return (
    <div className="zf-page">
      <h1>Promotions</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Offer</th>
            <th>Service</th>
            <th>Audience</th>
            <th>Window</th>
            <th>Used</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((p) => (
            <tr key={p.code}>
              <td className="zf-mono">{p.code}</td>
              <td>{p.name}</td>
              <td>{p.off}</td>
              <td>{p.service}</td>
              <td>{p.audience}</td>
              <td>{p.window}</td>
              <td className="zf-mono">
                {p.used} / {p.limit}
              </td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TranslationDesk() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const rows = translations.filter((row) => (status === "All" || row.status === status) && `${row.key} ${row.source} ${row.zh}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="zf-page">
      <h1>Traditional Chinese / English</h1>
      <p className="zf-note">Simplified Chinese, Japanese, and Korean are reserved as empty locales. English names of people are never translated.</p>
      <div className="zf-inline">
        <input className="zf-input" style={{ maxWidth: 280 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search keys" />
        {["All", "Approved", "Needs review", "Missing", "Proofreading"].map((item) => (
          <button key={item} type="button" className="zf-chip" data-on={status === item} onClick={() => setStatus(item)}>
            {item}
          </button>
        ))}
      </div>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Key</th>
            <th>English</th>
            <th>繁體中文</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="zf-mono">{row.key}</td>
              <td>{row.source}</td>
              <td>{row.zh || "—"}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NotificationDesk() {
  return (
    <div className="zf-split">
      <div>
        <h1>Delivery</h1>
        <table className="zf-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Channel</th>
              <th>Language</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id}>
                <td>{n.event}</td>
                <td>{n.channel}</td>
                <td>{n.lang}</td>
                <td>{n.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <aside className="zf-panel" style={{ padding: 12 }}>
        <p className="zf-kicker">Template · flight delay</p>
        <p>Your pickup for {"{{flight}}"} now follows {"{{eta}}"}. The driver waits 45 minutes after arrival.</p>
        <button type="button" className="zf-btn zf-btn-line">
          Retry failed email
        </button>
      </aside>
    </div>
  );
}

export function IntegrationDesk() {
  return (
    <div className="zf-page">
      <h1>Integrations</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>System</th>
            <th>Environment</th>
            <th>Status</th>
            <th>Last success</th>
            <th>Last failure</th>
            <th>Configuration</th>
          </tr>
        </thead>
        <tbody>
          {integrations.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.env}</td>
              <td>{row.status}</td>
              <td>{row.ok}</td>
              <td>{row.fail}</td>
              <td>{row.config}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="zf-note">Secrets are not shown. Rotate them in the provider console.</p>
    </div>
  );
}

export function AuditDesk() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => auditRows.filter((row) => `${row.actor} ${row.action} ${row.object}`.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div className="zf-page">
      <h1>Audit</h1>
      <input className="zf-input" style={{ maxWidth: 320 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Actor, action, object" />
      <table className="zf-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Object</th>
            <th>Old</th>
            <th>New</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.at + row.object}>
              <td>{row.at}</td>
              <td>
                {row.actor}
                <span className="zf-note"> {row.role}</span>
              </td>
              <td>{row.action}</td>
              <td>{row.object}</td>
              <td>{row.old}</td>
              <td>{row.next}</td>
              <td>{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="zf-btn zf-btn-line">
        Export
      </button>
    </div>
  );
}

export function VehicleDesk() {
  return (
    <div className="zf-page">
      <h1>Vehicles</h1>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Class</th>
            <th>Plate</th>
            <th>Fleet</th>
            <th>People / bags</th>
            <th>Driver</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td>{d.vehicle}</td>
              <td>{d.vehicleClass}</td>
              <td className="zf-mono">{d.plate}</td>
              <td>{d.fleet}</td>
              <td>{d.vehicleClass === "van" ? "8 / 8" : d.vehicleClass === "mpv" ? "6 / 6" : "3 / 3"}</td>
              <td>{d.name}</td>
              <td>{d.vehicleState}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AccountsDesk() {
  const [tab, setTab] = useState("Customers");
  return (
    <div className="zf-page">
      <h1>Accounts</h1>
      <div className="zf-tabs">
        {["Customers", "Drivers", "Staff", "Companies", "Partners"].map((item) => (
          <button key={item} type="button" data-on={tab === item} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>
      {tab === "Customers" &&
        passengers.map((p) => (
          <p key={p.id}>
            {p.name} · {p.email} · active
          </p>
        ))}
      {tab === "Drivers" &&
        drivers.map((d) => (
          <p key={d.id}>
            {d.name} · {d.status}
          </p>
        ))}
      {tab === "Staff" && <p>Nova Lin · Dispatcher · Taipei desk</p>}
      {tab === "Companies" && <p>Northstar Trading · cost center NT-44 · net 30</p>}
      {tab === "Partners" && <p>Kaohsiung franchise · fleet B · settlement weekly</p>}
    </div>
  );
}

export function CorporateDesk() {
  return (
    <div className="zf-page">
      <p className="zf-kicker">Northstar Trading</p>
      <h1>Corporate travel</h1>
      <div className="zf-grid-2">
        <div>
          <p>Employees 46 · active bookers 12</p>
          <p>Policy: sedan up to 2 guests, MPV above that. Airport meet-and-greet is pre-approved.</p>
          <p>Cost center NT-44 · monthly ceiling NT$180,000</p>
        </div>
        <div>
          <p>Open invoices: September NT$86,400</p>
          <p>Referral channel ZF-NORTHSTAR · 8% after the guest’s first completed ride</p>
        </div>
      </div>
      <table className="zf-table">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Employee</th>
            <th>Route</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ZD-1806</td>
            <td>James Wu</td>
            <td>Banqiao → TPE T2</td>
            <td className="zf-mono">2630</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function ParametersDesk() {
  const [group, setGroup] = useState("Waiting");
  const [version, setVersion] = useState("2026.09");
  return (
    <div className="zf-split">
      <nav>
        {parameterGroups.map((item) => (
          <button key={item} type="button" className="zf-rowbtn" data-on={group === item} onClick={() => setGroup(item)} style={{ display: "block", padding: "6px 0" }}>
            {item}
          </button>
        ))}
      </nav>
      <div>
        <p className="zf-kicker">Version {version}</p>
        <h1>{group}</h1>
        <p>
          {group === "Waiting" && "Airport arrivals include 45 minutes. After that, waiting is billed in 30-minute blocks."}
          {group === "Fleet priority" && "Dispatch tries fleet A, then B, then C, unless a preferred-driver rule overrides it."}
          {group === "Currency" && "Guests may display USD. Settlement and driver pay remain TWD."}
          {group !== "Waiting" && group !== "Fleet priority" && group !== "Currency" && `${group} rules are versioned. Publish creates the next version. Rollback restores the previous one.`}
        </p>
        <button type="button" className="zf-btn zf-btn-primary" onClick={() => setVersion("2026.10")}>
          Publish
        </button>
      </div>
    </div>
  );
}
