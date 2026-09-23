"use client";

import { useMemo, useState } from "react";
import { extras, promos, services, vehicles } from "@/lib/catalog";
import { passengers } from "@/lib/data";
import { capacityScenario, defaultDispatchPolicy, defaultDynamicRules, simulateCancel, simulateQuote } from "@/lib/domain/policy";
import { cancelFee, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live/engine";
import { deriveCounters } from "@/lib/domain/booking";
import { financeTotals } from "@/lib/domain/payments";
import { seedPaymentsFromBookings, seedWalletFromBookings } from "@/lib/domain/ledger";
import { NOTIFY_TEMPLATES, previewNotification } from "@/lib/domain/notify";
import type { ExtraId, ServiceType } from "@/lib/types";
import type { PaymentState } from "@/lib/domain/payments";

function Studio({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <div className="p-5">
      <div className="kicker">{kicker}</div>
      <h1 className="display mt-2 text-4xl">{title}</h1>
      {children}
    </div>
  );
}

export function CfgServices() {
  return (
    <Studio kicker="Service catalog" title="Products on the network">
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {services.map((s) => (
          <div key={s.id} className="zf-panel p-4">
            <div className="kicker">{s.id}</div>
            <div className="text-xl font-semibold">{s.en}</div>
            <div className="text-sm">{s.zh}</div>
            <p className="mt-2 text-sm text-[var(--ink-2)]">Formula {s.formula}</p>
          </div>
        ))}
      </div>
    </Studio>
  );
}

export function CfgVehicles() {
  return (
    <Studio kicker="Fleet catalog" title="Vehicle classes">
      <div className="mt-4 overflow-x-auto">
        <table className="zf-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Seats</th>
              <th>Bags</th>
              <th>Base</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.seats}</td>
                <td>{v.luggage}</td>
                <td>NT${v.base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Studio>
  );
}

export function CfgCapacity() {
  const [pax, setPax] = useState(5);
  const [bags, setBags] = useState(4);
  const rows = capacityScenario(pax, bags);
  return (
    <Studio kicker="Capacity rule builder" title="Who can take this party">
      <div className="mt-4 grid max-w-md grid-cols-2 gap-2">
        <label className="zf-field">
          <span>Passengers</span>
          <input type="number" value={pax} onChange={(e) => setPax(Number(e.target.value))} />
        </label>
        <label className="zf-field">
          <span>Bags</span>
          <input type="number" value={bags} onChange={(e) => setBags(Number(e.target.value))} />
        </label>
      </div>
      <p className="mt-3 text-sm">Scenario {pax} pax / {bags} bags · same matcher as booking.</p>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Class</th>
            <th>Max pax</th>
            <th>Max bags</th>
            <th>Eligible</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.klass}>
              <td>{r.klass}</td>
              <td>{r.seats}</td>
              <td>{r.bags}</td>
              <td>{r.eligible ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function CfgPricing() {
  const [service, setService] = useState<ServiceType>("airport_pickup");
  const [vehicle, setVehicle] = useState("mpv");
  const [when, setWhen] = useState("2026-09-23T16:40");
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState(2);
  const [km, setKm] = useState(32);
  const [mins, setMins] = useState(45);
  const extras = useMemo(() => ["meet"] as ExtraId[], []);
  const checkout = useMemo(() => quote({ service, vehicle, when, hours, days, extras }), [service, vehicle, when, hours, days, extras]);
  const shadow = useMemo(
    () => simulateQuote({ service, vehicle, when, hours, days, extras, distanceKm: km, durationMin: mins, surge: true }),
    [service, vehicle, when, hours, days, extras, km, mins],
  );
  const differs = shadow.total !== checkout.total;
  return (
    <Studio kicker="Pricing studio" title="BASE / CURRENT / SHADOW / PRODUCTION">
      <p className="mt-2 text-sm">Checkout uses quote(). Shadow distance/time/surge never apply silently.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <label className="zf-field">
            <span>Service</span>
            <select value={service} onChange={(e) => setService(e.target.value as ServiceType)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.en}</option>
              ))}
            </select>
          </label>
          <label className="zf-field">
            <span>Vehicle</span>
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </label>
          <label className="zf-field">
            <span>Date / time</span>
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="zf-field"><span>Shadow km</span><input type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} /></label>
            <label className="zf-field"><span>Shadow min</span><input type="number" value={mins} onChange={(e) => setMins(Number(e.target.value))} /></label>
            <label className="zf-field"><span>Hours</span><input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
            <label className="zf-field"><span>Days</span><input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} /></label>
          </div>
        </div>
        <div className="space-y-3" data-testid="quote-simulator">
          <div className="zf-panel p-4">
            <div className="kicker">BASE / CURRENT checkout · quote()</div>
            <div className="zf-metric mt-2 text-4xl">NT${checkout.total.toLocaleString()}</div>
          </div>
          <div className="zf-panel p-4">
            <div className="kicker">SHADOW · not applied</div>
            <div className="zf-metric mt-2 text-3xl">NT${shadow.total.toLocaleString()}</div>
            {differs ? <p className="mt-2 text-sm text-[var(--warn)]" data-testid="shadow-diff">Simulation differs from checkout policy by NT${(shadow.total - checkout.total).toLocaleString()}.</p> : null}
          </div>
          <div className="zf-panel p-4">
            <div className="kicker">PRODUCTION published</div>
            <div className="text-sm">Same as CURRENT until a server fare table is configured. Production persist throws.</div>
            <div className="zf-metric mt-2 text-2xl">NT${checkout.total.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </Studio>
  );
}

export function CfgDynamic() {
  const [shadow, setShadow] = useState(true);
  const normal = simulateQuote({ service: "airport_pickup", vehicle: "mpv", when: "2026-09-23T16:40" });
  const dyn = simulateQuote({ service: "airport_pickup", vehicle: "mpv", when: "2026-09-23T16:40", surge: true });
  return (
    <Studio kicker="Dynamic pricing control" title="Factors without silent customer apply">
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Rule</th>
            <th>Factor</th>
            <th>×</th>
            <th>Floor / ceil</th>
            <th>Shadow</th>
          </tr>
        </thead>
        <tbody>
          {defaultDynamicRules.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.factor}</td>
              <td>{r.multiplier}</td>
              <td>{r.floor}–{r.ceiling}</td>
              <td>{r.shadow ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
        Shadow mode — do not apply to customers
      </label>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="zf-panel p-3"><div className="kicker">Normal</div><div className="zf-metric text-2xl">NT${normal.total.toLocaleString()}</div></div>
        <div className="zf-panel p-3"><div className="kicker">Proposed dynamic</div><div className="zf-metric text-2xl">NT${dyn.total.toLocaleString()}</div></div>
        <div className="zf-panel p-3"><div className="kicker">Difference</div><div className="zf-metric text-2xl">NT${(dyn.total - normal.total).toLocaleString()}</div></div>
      </div>
      {shadow ? <p className="mt-3 text-sm">Shadow only. Customer checkout still uses published quote().</p> : null}
    </Studio>
  );
}

export function CfgAirport() {
  return (
    <Studio kicker="Airport policy studio" title="TPE pickup rules">
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[
          ["Airport", "TPE"],
          ["Terminals", "T1 / T2"],
          ["Pickup zone", "T2 Door 8"],
          ["Free wait", "45 minutes after actual arrival"],
          ["Delay handling", "Hold assignment, recalc ETA"],
          ["Grace", "15 minutes after wait clock"],
          ["Meet-and-greet", "Extra SKU"],
          ["Staging", "T2 commercial lane"],
        ].map(([k, v]) => (
          <div key={k} className="zf-panel p-3">
            <div className="kicker">{k}</div>
            {v}
          </div>
        ))}
      </div>
    </Studio>
  );
}

export function CfgCancel() {
  const [h, setH] = useState(8);
  const [price, setPrice] = useState(2680);
  const sim = simulateCancel(price, h, 0.5);
  return (
    <Studio kicker="Cancellation / refund policy" title="Time-band editor + simulator">
      <label className="zf-field mt-4 max-w-sm">
        <span>Hours before pickup · {h}</span>
        <input type="range" min={0} max={48} value={h} onChange={(e) => setH(Number(e.target.value))} />
      </label>
      <label className="zf-field mt-2 max-w-sm">
        <span>Booking amount</span>
        <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      </label>
      <div className="zf-panel mt-4 max-w-lg p-4" data-testid="cancel-simulator">
        <div className="kicker">Booking NT${price.toLocaleString()} · cancel {h}h before</div>
        <div className="mt-2">Band {sim.band}</div>
        <div>Customer fee NT${sim.fee.toLocaleString()}</div>
        <div>Refund NT${sim.refund.toLocaleString()} ({sim.refundPct}%)</div>
        <div className="text-sm text-[var(--mute)]">Engine cancelFee() = NT${cancelFee(h, price).toLocaleString()}</div>
      </div>
    </Studio>
  );
}

export function CfgDispatch() {
  const p = defaultDispatchPolicy;
  return (
    <Studio kicker="Dispatch policy studio" title="Weights, radius, timeout">
      <dl className="mt-4 grid gap-2 md:grid-cols-2">
        {[
          ["Distance weight", p.distanceWeight],
          ["ETA weight", p.etaWeight],
          ["Fleet priority", p.fleetPriority],
          ["Max offer radius", `${p.maxRadiusKm} km`],
          ["Offer timeout", `${p.offerTimeoutSec}s`],
          ["Auto-assign", String(p.autoAssign)],
        ].map(([k, v]) => (
          <div key={k} className="zf-panel p-3">
            <dt className="kicker">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm">Candidate simulation uses rankReplacements() on the live fleet — open /ops/replace after an incident.</p>
    </Studio>
  );
}

export function CfgNotify() {
  const { domain, queueNotify } = useStore();
  const [event, setEvent] = useState(NOTIFY_TEMPLATES[0].event);
  const preview = previewNotification(event, "en");
  return (
    <Studio kicker="Notification center" title="Templates · generated, never claimed delivered">
      <p className="mt-2 text-sm">Demo preview only. SMS/email/push is not delivered unless a provider confirms it.</p>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Event</th>
            <th>Audience</th>
            <th>Channel</th>
          </tr>
        </thead>
        <tbody>
          {NOTIFY_TEMPLATES.map((t) => (
            <tr key={t.event}>
              <td>{t.event}</td>
              <td>{t.audience}</td>
              <td>{t.channel}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap gap-2">
        <select value={event} onChange={(e) => setEvent(e.target.value)} aria-label="Template event">
          {NOTIFY_TEMPLATES.map((t) => (
            <option key={t.event} value={t.event}>{t.event}</option>
          ))}
        </select>
        <button type="button" className="zf-btn" onClick={() => queueNotify(event)}>Generate preview</button>
      </div>
      {preview ? (
        <div className="zf-panel mt-3 p-3 text-sm">
          Status {preview.status} · {preview.body} · {preview.note}
        </div>
      ) : null}
      <div className="kicker mt-6">Domain log</div>
      <ul className="zf-stream mt-2">
        {domain.notifications.slice(0, 12).map((n) => (
          <li key={n.id}>{n.at.slice(11, 19)} · {n.event} · {n.status}{n.providerConfirmed ? " · provider" : " · not delivered"}</li>
        ))}
      </ul>
    </Studio>
  );
}

export function CfgI18n() {
  const { domain } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const rows = domain.translations.filter((t) => filter === "all" || t.status === filter);
  return (
    <Studio kicker="Translation desk" title="Side-by-side proofing">
      <div className="mt-3 flex flex-wrap gap-2">
        {["all", "missing", "draft", "reviewed", "approved", "MISSING", "DRAFT", "NEEDS REVIEW", "APPROVED"].map((s) => (
          <button key={s} type="button" className={`zf-btn ${filter === s ? "" : "ghost"}`} style={{ minHeight: 32 }} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Key</th>
            <th>EN</th>
            <th>繁中</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.key}>
              <td>{t.namespace}.{t.key}</td>
              <td>{t.en || "—"}</td>
              <td>{t.zh || "—"}</td>
              <td>{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function CfgIntegrations() {
  return (
    <Studio kicker="Providers" title="Simulation vs production">
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Concern</th>
            <th>Active</th>
            <th>Production</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Map tiles", "OSM / Esri", "unconfigured vendor"],
            ["GPS / route / ETA / traffic", "simulationProvider", "throws"],
            ["Flights", "simulationFlightProvider", "throws"],
            ["Payments", "simulationPaymentProvider", "throws · no card secrets"],
            ["Persistence", "demo DomainState", "throws"],
          ].map((r) => (
            <tr key={r[0]}>
              <td>{r[0]}</td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function CfgRoles() {
  return (
    <Studio kicker="Access" title="Roles / flags — local demo switch only">
      <p className="mt-2 text-sm">Production authentication is not configured. This table documents surfaces. It does not authorize anything.</p>
      <table className="zf-table mt-4">
        <tbody>
          <tr><td>passenger</td><td>book / live / share / trips</td></tr>
          <tr><td>driver</td><td>duty / offer / job</td></tr>
          <tr><td>ops</td><td>command / preferred queue</td></tr>
          <tr><td>admin</td><td>studios / finance</td></tr>
        </tbody>
      </table>
      <p className="mt-3 text-sm text-[var(--warn)]">Unavailable: SSO, RBAC persist, session tokens. productionPersist throws.</p>
    </Studio>
  );
}

export function CfgAudit() {
  const { live } = useLive();
  const { domain } = useStore();
  return (
    <Studio kicker="Audit" title="Tape + domain actions">
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>When</th>
            <th>Actor / type</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {domain.audit.slice(0, 8).map((a) => (
            <tr key={a.id}>
              <td>{a.at.slice(11, 19)}</td>
              <td>{a.actor} · {a.action}</td>
              <td>{a.detail}</td>
            </tr>
          ))}
          {live.events.slice(0, 12).map((e) => (
            <tr key={e.id}>
              <td>{e.clock}</td>
              <td>{e.type}</td>
              <td>{e.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function FinPayments() {
  const { bookings, domain, setPaymentStatus } = useStore();
  const rows = seedPaymentsFromBookings(bookings, domain.payments);
  const [id, setId] = useState(rows[0]?.id);
  const row = rows.find((x) => x.id === id) ?? rows[0];
  const states: PaymentState[] = ["authorized", "captured", "failed", "refunded", "partially_refunded", "voided"];
  return (
    <Studio kicker="Payments" title="Demo inspector · production PSP unconfigured">
      <p className="mt-2 text-sm">States are labeled demo. Production authorize/capture/refund throws until credentials exist.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="zf-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => setId(r.id)} className={id === r.id ? "text-[var(--signal)]" : ""}>
                <td>{r.id}</td>
                <td>{r.bookingId}</td>
                <td>{r.customer}</td>
                <td>{r.method}</td>
                <td>{r.status}</td>
                <td>{r.amount}</td>
                <td>{r.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {row ? (
        <div className="zf-panel mt-4 p-4 text-sm">
          Inspector · {row.id} · {row.provider} · {row.timestamp} · no card secrets
          <div className="mt-2 flex flex-wrap gap-2">
            {states.map((s) => (
              <button key={s} type="button" className="zf-btn ghost" data-testid={`pay-${s}`} style={{ minHeight: 32 }} onClick={() => setPaymentStatus(row.id, s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </Studio>
  );
}

export function FinRefunds() {
  const { bookings } = useStore();
  const rows = bookings.filter((b) => b.status === "cancelled");
  return (
    <Studio kicker="Refunds" title="Policy + approval">
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Original</th>
            <th>Policy row</th>
            <th>Refundable</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>sim-auth-{b.id}</td>
              <td>cancel band</td>
              <td>{b.price === 0 ? "full" : b.price}</td>
              <td>approved (demo ledger)</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function FinSettle() {
  const { settlements } = useStore();
  return (
    <Studio kicker="Settlements" title="Driver / fleet periods">
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Id</th>
            <th>Driver</th>
            <th>Week</th>
            <th>Gross</th>
            <th>Commission</th>
            <th>Net</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.driverId}</td>
              <td>{s.week}</td>
              <td>{s.gross}</td>
              <td>{s.commission}</td>
              <td>{s.net}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function FinWallet() {
  const { bookings, domain } = useStore();
  const rows = seedWalletFromBookings(bookings, domain.wallet);
  const totals = financeTotals(seedPaymentsFromBookings(bookings, domain.payments), rows);
  return (
    <Studio kicker="Wallet ledger" title="Typed transactions">
      <div className="mt-3 zf-panel p-3" data-testid="finance-totals">
        Derived · captured NT${totals.captured.toLocaleString()} · refunded NT${totals.refunded.toLocaleString()} · wallet NT${totals.walletBalance.toLocaleString()} · {totals.walletCount} tx
      </div>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Id</th>
            <th>Booking</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.bookingId ?? r.reference}</td>
              <td>{r.type}</td>
              <td>{r.amount} {r.currency}</td>
              <td>{r.status}</td>
              <td>{r.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function FinRecon() {
  const { bookings, domain } = useStore();
  const pays = seedPaymentsFromBookings(bookings, domain.payments);
  const totals = financeTotals(pays, domain.wallet);
  return (
    <Studio kicker="Reconciliation" title="Internal ledger vs unconfigured provider">
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="zf-panel p-3"><div className="kicker">Internal captured</div><div className="zf-metric">NT${totals.captured.toLocaleString()}</div></div>
        <div className="zf-panel p-3"><div className="kicker">Provider</div><div className="text-sm">Not enough data — production PSP unconfigured</div></div>
        <div className="zf-panel p-3"><div className="kicker">Difference</div><div className="text-sm">Unknown until a provider feed exists</div></div>
      </div>
    </Studio>
  );
}

export function Crm360() {
  const { bookings, domain, addNote } = useStore();
  const [id, setId] = useState(passengers[0].id);
  const [tab, setTab] = useState("OVERVIEW");
  const [note, setNote] = useState("");
  const extras = bookings
    .filter((b) => !passengers.some((x) => x.id === b.passengerId))
    .map((b) => ({ id: b.passengerId, name: b.passengerName, email: "demo@zoufeng.local", rfm: "new" as const, trips: 0, spendTwd: 0, lastDriverId: b.driverId, city: "Taipei", phone: "", points: 0 }));
  const people = [...passengers, ...extras.filter((e, i, a) => a.findIndex((x) => x.id === e.id) === i)];
  const p = people.find((x) => x.id === id) ?? people[0];
  const mine = bookings.filter((b) => b.passengerId === p.id);
  return (
    <Studio kicker="CRM 360" title={p.name}>
      <div className="mt-2 text-sm">{p.email} · {p.rfm} · {p.trips} rides · NT${p.spendTwd.toLocaleString()} · wallet on file · last driver {p.lastDriverId ?? "—"} (company-mediated)</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {people.map((x) => (
          <button key={x.id} type="button" className={`zf-btn ${id === x.id ? "" : "ghost"}`} style={{ minHeight: 32 }} onClick={() => setId(x.id)}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
        {["OVERVIEW", "TRIPS", "PAYMENTS", "WALLET", "LOYALTY", "REFERRALS", "PREFERRED DRIVERS", "SUPPORT", "CONSENT", "AUDIT"].map((t) => (
          <button key={t} type="button" className={tab === t ? "text-[var(--signal)]" : "text-[var(--mute)]"} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "TRIPS" || tab === "OVERVIEW" ? (
        <table className="zf-table mt-4">
          <thead>
            <tr>
              <th>Booking</th>
              <th>Service</th>
              <th>Status</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.service}</td>
                <td>{b.status}</td>
                <td>{b.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {tab === "PREFERRED DRIVERS" ? (
        <p className="mt-4 text-sm">
          Preferred cases: {domain.preferredCases.filter((c) => c.customerId === p.id).length || "none on domain"}. Company-mediated only — /ops/preferred.
        </p>
      ) : null}
      {tab === "PAYMENTS" ? (
        <ul className="zf-stream mt-4">
          {domain.payments.filter((n) => mine.some((b) => b.id === n.bookingId)).map((n) => (
            <li key={n.id}>{n.id} · {n.status} · {n.amount} · {n.source}</li>
          ))}
        </ul>
      ) : null}
      <div className="zf-panel mt-4 p-3">
        <div className="kicker">Case notes</div>
        <div data-testid="crm-notes">
        {domain.notes.filter((n) => n.passengerId === p.id).map((n) => (
          <p key={n.id} className="text-sm">{n.at.slice(0, 16)} · {n.body}</p>
        ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input className="flex-1 border border-[var(--line)] px-2 py-1" data-testid="crm-note-input" aria-label="CRM note" value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="button" className="zf-btn" data-testid="crm-note-add" style={{ minHeight: 36 }} onClick={() => { if (note) addNote(p.id, note); setNote(""); }}>
            Add note
          </button>
        </div>
      </div>
    </Studio>
  );
}

export function CrmGrowth() {
  return (
    <Studio kicker="Referral + campaigns" title="Channels and conversion rules">
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Path</th>
            <th>Rule</th>
            <th>Fraud</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Customer → customer</td><td>NT$100 / NT$100 after paid trip</td><td>device cluster review</td></tr>
          <tr><td>Driver → customer</td><td>Company desk only</td><td>no private payout</td></tr>
          <tr><td>B2B → customer</td><td>Company desk</td><td>invoice match</td></tr>
        </tbody>
      </table>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Promo</th>
            <th>Type</th>
            <th>Copy</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(promos).map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v.type}</td>
              <td>{v.en}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Extra</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {extras.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function CfgLoyalty() {
  return (
    <Studio kicker="Loyalty" title="Tiers, earn, burn">
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Circle", "0–1999 pts", "Standard wait"],
          ["Atlas", "2000–4999", "Priority desk"],
          ["Signal", "5000+", "Preferred mediation first"],
        ].map(([t, r, b]) => (
          <div key={t} className="zf-panel p-3">
            <div className="kicker">{t}</div>
            <div>{r}</div>
            <div className="text-sm">{b}</div>
          </div>
        ))}
      </div>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Points</th>
            <th>RFM</th>
          </tr>
        </thead>
        <tbody>
          {passengers.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.points}</td>
              <td>{p.rfm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function RoleAnalytics() {
  const { bookings } = useStore();
  const { live } = useLive();
  const [role, setRole] = useState("executive");
  const gmv = bookings.reduce((s, b) => s + (b.status === "cancelled" ? 0 : b.price), 0);
  const aov = bookings.length ? Math.round(gmv / bookings.length) : 0;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const repeat = new Set(bookings.map((b) => b.passengerId)).size;
  const c = deriveCounters(live, bookings);
  const series = bookings.map((b, i) => `${i * 28},${80 - Math.min(70, b.price / 120)}`).join(" ");
  return (
    <Studio kicker="Analytics workspaces" title="Role views from ledger + live">
      <div className="mt-3 flex flex-wrap gap-2">
        {["executive", "operations", "driver", "growth", "finance", "customer"].map((r) => (
          <button key={r} type="button" className={`zf-btn ${role === r ? "" : "ghost"}`} style={{ minHeight: 32 }} onClick={() => setRole(r)}>
            {r}
          </button>
        ))}
      </div>
      {role === "executive" ? (
        <>
          <svg viewBox="0 0 320 90" className="zf-spark mt-4">
            <polyline fill="none" stroke="var(--signal)" strokeWidth="2" points={series} />
          </svg>
          <table className="zf-table mt-3">
            <tbody>
              <tr><td>GMV ex-cancel</td><td>{gmv}</td></tr>
              <tr><td>Bookings</td><td>{bookings.length}</td></tr>
              <tr><td>AOV</td><td>{aov}</td></tr>
              <tr><td>Completed</td><td>{completed}</td></tr>
              <tr><td>Distinct customers</td><td>{repeat}</td></tr>
            </tbody>
          </table>
        </>
      ) : null}
      {role === "operations" ? (
        <table className="zf-table mt-4">
          <tbody>
            <tr><td>Available drivers</td><td>{c.available}</td></tr>
            <tr><td>Busy</td><td>{c.busy}</td></tr>
            <tr><td>Unassigned (derived)</td><td>{c.unassigned}</td></tr>
            <tr><td>Incidents on tape</td><td>{c.incidents}</td></tr>
            <tr><td>Time-to-assign</td><td>Not enough data</td></tr>
          </tbody>
        </table>
      ) : null}
      {role === "driver" ? (
        <p className="mt-4 text-sm">Driver distributions use scorecards — no hardcoded Kenji week count.</p>
      ) : null}
      {role === "growth" ? (
        <table className="zf-table mt-4">
          <tbody>
            {Object.keys(promos).map((k) => (
              <tr key={k}><td>{k}</td><td>active catalog</td></tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {role === "finance" ? (
        <table className="zf-table mt-4">
          <tbody>
            <tr><td>Commission field sum</td><td>{bookings.reduce((s, b) => s + b.commission, 0)}</td></tr>
            <tr><td>Cancelled rows</td><td>{bookings.filter((b) => b.status === "cancelled").length}</td></tr>
          </tbody>
        </table>
      ) : null}
      {role === "customer" ? (
        <table className="zf-table mt-4">
          <tbody>
            {Object.entries(passengers.reduce<Record<string, number>>((m, p) => ({ ...m, [p.rfm]: (m[p.rfm] ?? 0) + 1 }), {})).map(([k, v]) => (
              <tr key={k}><td>{k}</td><td>{v}</td></tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Studio>
  );
}
