"use client";

import { useMemo, useState } from "react";
import { extras, promos, services, vehicles } from "@/lib/catalog";
import { cancelFee } from "@/lib/pricing";
import { passengers, seedSettlements } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live/engine";

function Table({ cols, rows }: { cols: string[]; rows: (string | number)[][] }) {
  return (
    <table className="zf-table mt-4">
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
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Frame({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
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
    <Frame kicker="Configuration" title="Services">
      <Table cols={["Id", "EN", "ZH", "Formula"]} rows={services.map((s) => [s.id, s.en, s.zh, s.formula])} />
    </Frame>
  );
}

export function CfgVehicles() {
  return (
    <Frame kicker="Configuration" title="Vehicle catalog">
      <Table cols={["Id", "Seats", "Bags", "Base"]} rows={vehicles.map((v) => [v.id, v.seats, v.luggage, v.base])} />
    </Frame>
  );
}

export function CfgCapacity() {
  return (
    <Frame kicker="Rules" title="Capacity">
      <p className="mt-2 text-sm">Same matcher as booking and replacement ranking.</p>
      <Table cols={["Class", "Max pax", "Max bags"]} rows={vehicles.map((v) => [v.name, v.seats, v.luggage])} />
    </Frame>
  );
}

export function CfgPricing() {
  const factors = ["Base", "Night", "Surge", "Hours", "Days", "Extras", "Promo"];
  return (
    <Frame kicker="Pricing" title="Quote factors">
      <p className="mt-2 max-w-xl text-sm">Live quote() is the engine. Factors below are the ones the function actually applies.</p>
      <Table cols={["Factor", "In quote()"]} rows={factors.map((f) => [f, "yes"])} />
    </Frame>
  );
}

export function CfgDynamic() {
  return (
    <Frame kicker="Pricing" title="Dynamic controls">
      <Table
        cols={["Control", "State"]}
        rows={[
          ["Night 23:00–06:00", "20%"],
          ["Surge when duplicate corridor ≥2", "15%"],
          ["Shadow / rollback", "Not stored — UI only"],
        ]}
      />
    </Frame>
  );
}

export function CfgAirport() {
  return (
    <Frame kicker="Airport" title="Airport rules">
      <Table
        cols={["Rule", "Value"]}
        rows={[
          ["Free wait", "45 minutes after actual arrival"],
          ["Pickup zone", "T2 Door 8 (live tape)"],
          ["Flight source", "Simulated status events"],
        ]}
      />
    </Frame>
  );
}

export function CfgCancel() {
  const [h, setH] = useState(8);
  const fee = cancelFee(h, 2680);
  return (
    <Frame kicker="Policy" title="Cancellation / refund">
      <label className="zf-field mt-4 max-w-sm">
        <span>Hours before pickup · {h}</span>
        <input type="range" min={0} max={48} value={h} onChange={(e) => setH(Number(e.target.value))} />
      </label>
      <p className="mt-3 text-sm">cancelFee() result on NT$2,680: NT${fee.toLocaleString()}</p>
      <Table
        cols={["Band", "Fee", "Refund"]}
        rows={[
          [">= 24h", "0", "100%"],
          ["6–24h", "admin %", "partial"],
          ["< 6h", "100%", "0"],
        ]}
      />
    </Frame>
  );
}

export function CfgDispatch() {
  return (
    <Frame kicker="Dispatch" title="Rules">
      <Table
        cols={["Rule", "Value"]}
        rows={[
          ["Auto-assign", "false"],
          ["Fleet priority", "A → B → C"],
          ["Replacement rank", "distance + fleet + accept + rating + capacity"],
          ["Preferred", "company-mediated only"],
        ]}
      />
    </Frame>
  );
}

export function CfgPayments() {
  return (
    <Frame kicker="Payments" title="Methods / currency">
      <Table cols={["Method", "Used on bookings"]} rows={[["card", "yes"], ["line", "yes"], ["apple", "yes"], ["cash", "yes"]]} />
      <Table cols={["Currency", "Store default"]} rows={[["TWD", "yes"], ["USD", "convert()"]]} />
    </Frame>
  );
}

export function CfgNotify() {
  const { live } = useLive();
  return (
    <Frame kicker="Notifications" title="Event subscriptions">
      <p className="mt-2 text-sm">Role audiences on the live tape: passenger / driver / ops / system.</p>
      <ul className="zf-stream mt-4">
        {live.events.slice(0, 10).map((e) => (
          <li key={e.id}>
            {e.type} · {e.audience.join(",")}
          </li>
        ))}
      </ul>
    </Frame>
  );
}

export function CfgI18n() {
  return (
    <Frame kicker="Translation" title="Copy sources">
      <Table cols={["Surface", "Source"]} rows={services.map((s) => [s.id, `${s.en} / ${s.zh}`])} />
    </Frame>
  );
}

export function CfgIntegrations() {
  return (
    <Frame kicker="Integrations" title="Providers">
      <Table
        cols={["Concern", "Active", "Production"]}
        rows={[
          ["Map tiles", "OSM / Esri (simulation)", "unconfigured"],
          ["GPS / routing / ETA", "simulationProvider", "throws until wired"],
          ["Payments", "store ledger", "unconfigured"],
        ]}
      />
    </Frame>
  );
}

export function CfgRoles() {
  return (
    <Frame kicker="Access" title="Roles / flags">
      <Table cols={["Role", "Surfaces"]} rows={[["passenger", "book/live/trips"], ["driver", "duty/offer/job"], ["ops", "command/dispatch"], ["admin", "config/finance"]]} />
      <Table cols={["Flag", "State"]} rows={[["NEXT_PUBLIC_GEO_PROVIDER", "simulation"], ["Preferred private book", "off"]]} />
    </Frame>
  );
}

export function CfgAudit() {
  const { live } = useLive();
  return (
    <Frame kicker="Audit" title="Live tape">
      <Table cols={["Clock", "Type", "Title"]} rows={live.events.slice(0, 20).map((e) => [e.clock, e.type, e.title])} />
    </Frame>
  );
}

export function FinPayments() {
  const { bookings } = useStore();
  return (
    <Frame kicker="Finance" title="Payments / auth / capture">
      <Table
        cols={["Booking", "Method", "Status", "Amount"]}
        rows={bookings.map((b) => [b.id, b.payment, b.status, b.price])}
      />
    </Frame>
  );
}

export function FinRefunds() {
  const { bookings } = useStore();
  const rows = bookings.filter((b) => b.status === "cancelled");
  return (
    <Frame kicker="Finance" title="Refunds">
      <Table cols={["Booking", "Policy row", "Amount"]} rows={rows.map((b) => [b.id, b.status, b.price])} />
    </Frame>
  );
}

export function FinSettle() {
  return (
    <Frame kicker="Finance" title="Settlements">
      <Table cols={["Id", "Driver", "Week", "Gross", "Net", "Status"]} rows={seedSettlements.map((s) => [s.id, s.driverId, s.week, s.gross, s.net, s.status])} />
    </Frame>
  );
}

export function FinWallet() {
  const { bookings } = useStore();
  return (
    <Frame kicker="Finance" title="Wallet ledger">
      <Table cols={["Ref", "Passenger", "Amount"]} rows={bookings.slice(0, 12).map((b) => [b.id, b.passengerName, b.price])} />
    </Frame>
  );
}

export function FinRecon() {
  const { bookings } = useStore();
  const gmv = bookings.reduce((s, b) => s + (b.status === "cancelled" ? 0 : b.price), 0);
  const comm = bookings.reduce((s, b) => s + b.commission, 0);
  return (
    <Frame kicker="Finance" title="Reconciliation">
      <Table
        cols={["Line", "Value"]}
        rows={[
          ["Bookings in ledger", bookings.length],
          ["GMV ex-cancelled", gmv],
          ["Commission field sum", comm],
        ]}
      />
    </Frame>
  );
}

export function Crm360() {
  const { bookings } = useStore();
  const [id, setId] = useState(passengers[0].id);
  const p = passengers.find((x) => x.id === id) ?? passengers[0];
  const mine = bookings.filter((b) => b.passengerId === p.id);
  return (
    <Frame kicker="CRM" title="Customer 360">
      <div className="mt-3 flex flex-wrap gap-2">
        {passengers.map((x) => (
          <button key={x.id} type="button" className={`zf-btn ${id === x.id ? "" : "ghost"}`} style={{ minHeight: 32 }} onClick={() => setId(x.id)}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm">
        {p.email} · RFM {p.rfm} · {p.trips} trips · NT${p.spendTwd.toLocaleString()} · last driver {p.lastDriverId ?? "—"} (company-mediated)
      </div>
      <Table cols={["Booking", "Service", "Status", "Price"]} rows={mine.map((b) => [b.id, b.service, b.status, b.price])} />
    </Frame>
  );
}

export function CrmGrowth() {
  return (
    <Frame kicker="Growth" title="Campaigns / promotions / referral">
      <Table cols={["Promo", "Type", "Copy"]} rows={Object.entries(promos).map(([k, v]) => [k, v.type, v.en])} />
      <Table
        cols={["Referral path", "Rule"]}
        rows={[
          ["Customer → customer", "NT$100 / NT$100 after paid trip"],
          ["B2B", "Company desk only"],
          ["Preferred driver", "Never a private commercial book"],
        ]}
      />
      <Table cols={["Extra SKU", "Price"]} rows={extras.map((e) => [e.name, e.price])} />
    </Frame>
  );
}

export function RoleAnalytics() {
  const { bookings } = useStore();
  const [role, setRole] = useState("executive");
  const gmv = bookings.reduce((s, b) => s + (b.status === "cancelled" ? 0 : b.price), 0);
  const aov = bookings.length ? Math.round(gmv / bookings.length) : 0;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const series = bookings.map((b, i) => `${i * 28},${80 - Math.min(70, b.price / 120)}`).join(" ");
  return (
    <Frame kicker="Analytics" title="Role views">
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
          <Table cols={["Metric", "From ledger"]} rows={[["GMV ex-cancel", gmv], ["Bookings", bookings.length], ["AOV", aov], ["Completed", completed]]} />
        </>
      ) : null}
      {role === "operations" ? (
        <Table
          cols={["Metric", "Source"]}
          rows={[
            ["Unassigned", bookings.filter((b) => !b.driverId && b.status !== "cancelled").length],
            ["Onboard / arriving", bookings.filter((b) => b.status === "onboard" || b.status === "arriving").length],
            ["Time-to-assign", "— not stored"],
          ]}
        />
      ) : null}
      {role === "driver" ? <Table cols={["Driver trips in catalog week", "Value"]} rows={[["Kenji completedWeek", 19]]} /> : null}
      {role === "growth" ? <Table cols={["Promo", "Active"]} rows={Object.keys(promos).map((k) => [k, "yes"])} /> : null}
      {role === "finance" ? <Table cols={["Commission sum", "Value"]} rows={[["commission field", bookings.reduce((s, b) => s + b.commission, 0)]]} /> : null}
      {role === "customer" ? (
        <Table cols={["RFM", "Count"]} rows={Object.entries(passengers.reduce<Record<string, number>>((m, p) => ({ ...m, [p.rfm]: (m[p.rfm] ?? 0) + 1 }), {})).map(([k, v]) => [k, v])} />
      ) : null}
    </Frame>
  );
}

export function CfgLoyalty() {
  const pts = useMemo(() => passengers.reduce((s, p) => s + p.points, 0), []);
  return (
    <Frame kicker="Loyalty" title="Points on file">
      <Table cols={["Customer", "Points", "RFM"]} rows={passengers.map((p) => [p.name, p.points, p.rfm])} />
      <p className="mt-3 text-sm">Sum {pts} — stored on profiles, not a fabricated currency.</p>
    </Frame>
  );
}
