"use client";

import { useMemo, useState } from "react";
import { extras, promos, services } from "@/lib/catalog";
import { drivers, passengers } from "@/lib/data";
import { PartyStepper, SeatBagIcons, VehicleCard } from "@/components/signal/catalog-gui";
import type { ExtraId, FareRow, ServiceType, Vehicle } from "@/lib/types";
import { formatMetric, scorecardFromCatalog } from "@/lib/live/metrics";
import { defaultDispatchPolicy, defaultDynamicRules, simulateCancel, simulateQuote } from "@/lib/domain/policy";
import { cancelFee, quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live/engine";
import { deriveCounters } from "@/lib/domain/booking";
import { financeTotals } from "@/lib/domain/payments";
import { seedPaymentsFromBookings, seedWalletFromBookings } from "@/lib/domain/ledger";
import { NOTIFY_TEMPLATES, previewNotification } from "@/lib/domain/notify";
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

function emptyVehicle(): Vehicle {
  return {
    id: `class-${Date.now().toString(36)}`,
    name: "New class",
    nameZh: "新車款",
    model: "Custom",
    seats: 4,
    luggage: 3,
    base: 1580,
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80",
    panoramic: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80",
  };
}

export function CfgVehicles() {
  const { domain, upsertVehicle, deleteVehicle } = useStore();
  const [edit, setEdit] = useState<Vehicle | null>(null);
  return (
    <Studio kicker="Fleet catalog" title="Vehicle classes">
      <p className="mt-2 text-sm text-[var(--ink-2)]">Add, edit or delete a class. Photos and panoramic URLs stay on the customer booking cards.</p>
      <button type="button" className="zf-btn mt-3" onClick={() => setEdit(emptyVehicle())}>Add class</button>
      <div className="mt-4 grid gap-3">
        {domain.catalogVehicles.map((v) => (
          <div key={v.id} className="grid gap-2 md:grid-cols-[1fr_auto]">
            <VehicleCard vehicle={v} price={v.base} />
            <div className="flex gap-2 md:flex-col">
              <button type="button" className="zf-btn ghost" onClick={() => setEdit(v)}>Edit</button>
              <button type="button" className="zf-btn ghost" onClick={() => deleteVehicle(v.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {edit ? (
        <form
          className="zf-glass mt-5 grid gap-3 p-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            upsertVehicle(edit);
            setEdit(null);
          }}
        >
          <label className="zf-field"><span>Id</span><input value={edit.id} onChange={(e) => setEdit({ ...edit, id: e.target.value })} /></label>
          <label className="zf-field"><span>Model</span><input value={edit.model} onChange={(e) => setEdit({ ...edit, model: e.target.value })} /></label>
          <label className="zf-field"><span>Name EN</span><input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
          <label className="zf-field"><span>Name 繁中</span><input value={edit.nameZh} onChange={(e) => setEdit({ ...edit, nameZh: e.target.value })} /></label>
          <label className="zf-field"><span>Max pax</span><input type="number" value={edit.seats} onChange={(e) => setEdit({ ...edit, seats: Number(e.target.value) })} /></label>
          <label className="zf-field"><span>Max bags</span><input type="number" value={edit.luggage} onChange={(e) => setEdit({ ...edit, luggage: Number(e.target.value) })} /></label>
          <label className="zf-field"><span>Base NT$</span><input type="number" value={edit.base} onChange={(e) => setEdit({ ...edit, base: Number(e.target.value) })} /></label>
          <label className="zf-field"><span>Photo URL</span><input value={edit.image ?? ""} onChange={(e) => setEdit({ ...edit, image: e.target.value })} /></label>
          <label className="zf-field md:col-span-2"><span>Panoramic URL</span><input value={edit.panoramic ?? ""} onChange={(e) => setEdit({ ...edit, panoramic: e.target.value })} /></label>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="zf-btn">Save class</button>
            <button type="button" className="zf-btn ghost" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </form>
      ) : null}
    </Studio>
  );
}

export function CfgCapacity() {
  const { domain, upsertVehicle } = useStore();
  const [pax, setPax] = useState(5);
  const [bags, setBags] = useState(4);
  return (
    <Studio kicker="Capacity rule builder" title="Max pax and bags, as pictures">
      <p className="mt-2 text-sm">Each class shows people and bag icons. Edit seats/bags here — booking uses the same matcher.</p>
      <div className="mt-4 max-w-xl">
        <PartyStepper pax={pax} bags={bags} setPax={setPax} setBags={setBags} paxLabel="Party passengers" bagLabel="Party bags" />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {domain.catalogVehicles.map((v) => {
          const ok = pax <= v.seats && bags <= v.luggage;
          return (
            <div key={v.id} className={`zf-glass p-4 ${ok ? "" : "opacity-60"}`}>
              <div className="flex items-center justify-between">
                <b>{v.name}</b>
                <span className={`zf-chip ${ok ? "ok" : "warn"}`}>{ok ? "Fits" : "Blocked"}</span>
              </div>
              <SeatBagIcons seats={v.seats} bags={v.luggage} size={18} />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="zf-field">
                  <span>Max pax</span>
                  <input type="number" value={v.seats} onChange={(e) => upsertVehicle({ ...v, seats: Number(e.target.value) })} />
                </label>
                <label className="zf-field">
                  <span>Max bags</span>
                  <input type="number" value={v.luggage} onChange={(e) => upsertVehicle({ ...v, luggage: Number(e.target.value) })} />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </Studio>
  );
}

export function CfgPricing() {
  const { domain, upsertFare, deleteFare } = useStore();
  const [service, setService] = useState<ServiceType>("airport_pickup");
  const [vehicle, setVehicle] = useState("mpv");
  const [when, setWhen] = useState("2026-09-23T16:40");
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState(2);
  const [km, setKm] = useState(32);
  const [mins, setMins] = useState(45);
  const extraIds = useMemo(() => ["meet"] as ExtraId[], []);
  const checkout = useMemo(() => quote({ service, vehicle, when, hours, days, extras: extraIds }), [service, vehicle, when, hours, days, extraIds]);
  const shadow = useMemo(
    () => simulateQuote({ service, vehicle, when, hours, days, extras: extraIds, distanceKm: km, durationMin: mins, surge: true }),
    [service, vehicle, when, hours, days, extraIds, km, mins],
  );
  const differs = shadow.total !== checkout.total;
  const [draft, setDraft] = useState<FareRow | null>(null);
  const cards = domain.fareRows.filter((f) => f.service === service || f.service === "all");
  return (
    <Studio kicker="Pricing studio" title="Pickup, MPV, panoramic fares">
      <p className="mt-2 text-sm">Each card is a published fare. Add or delete rows. Checkout still uses quote() — shadow never applies silently.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {services.map((s) => (
          <button key={s.id} type="button" className={`zf-btn ${service === s.id ? "" : "ghost"}`} style={{ minHeight: 36 }} onClick={() => setService(s.id)}>
            {s.en}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="zf-btn mt-3"
        onClick={() => setDraft({ id: `FR-${Date.now()}`, service, vehicleId: vehicle, base: 1600, label: "New fare", labelZh: "新價格" })}
      >
        Add fare
      </button>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((f) => {
          const v = domain.catalogVehicles.find((x) => x.id === f.vehicleId);
          return (
            <div key={f.id} className="zf-vcard" style={{ cursor: "default" }}>
              <span className="zf-vcard-photo" style={{ backgroundImage: `url(${v?.panoramic ?? v?.image ?? ""})` }} />
              <span className="zf-vcard-body">
                <b>{f.label}</b>
                <em>{v?.name ?? f.vehicleId} · {f.service}</em>
                <strong className="zf-metric text-2xl">NT${f.base.toLocaleString()}</strong>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="zf-btn ghost" style={{ minHeight: 32 }} onClick={() => setDraft(f)}>Edit</button>
                  <button type="button" className="zf-btn ghost" style={{ minHeight: 32 }} onClick={() => deleteFare(f.id)}>Delete</button>
                </div>
              </span>
            </div>
          );
        })}
      </div>
      {draft ? (
        <form
          className="zf-glass mt-4 grid gap-3 p-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            upsertFare(draft);
            setDraft(null);
          }}
        >
          <label className="zf-field"><span>Label</span><input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></label>
          <label className="zf-field">
            <span>Vehicle</span>
            <select value={draft.vehicleId} onChange={(e) => setDraft({ ...draft, vehicleId: e.target.value })}>
              {domain.catalogVehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
          <label className="zf-field"><span>Base NT$</span><input type="number" value={draft.base} onChange={(e) => setDraft({ ...draft, base: Number(e.target.value) })} /></label>
          <label className="zf-field">
            <span>Service</span>
            <select value={draft.service} onChange={(e) => setDraft({ ...draft, service: e.target.value as FareRow["service"] })}>
              <option value="all">all</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.en}</option>)}
            </select>
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="zf-btn">Save fare</button>
            <button type="button" className="zf-btn ghost" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      ) : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <label className="zf-field">
            <span>Quote vehicle</span>
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              {domain.catalogVehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
          <label className="zf-field"><span>Date / time</span><input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="zf-field"><span>Shadow km</span><input type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} /></label>
            <label className="zf-field"><span>Shadow min</span><input type="number" value={mins} onChange={(e) => setMins(Number(e.target.value))} /></label>
            <label className="zf-field"><span>Hours</span><input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
            <label className="zf-field"><span>Days</span><input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} /></label>
          </div>
        </div>
        <div className="space-y-3" data-testid="quote-simulator">
          <div className="zf-panel p-4">
            <div className="kicker">CURRENT checkout · quote()</div>
            <div className="zf-metric mt-2 text-4xl">NT${checkout.total.toLocaleString()}</div>
            <ul className="zf-stream mt-2">
              {checkout.items.filter((i) => i.amount).map((i) => (
                <li key={i.label}>{i.label} · NT${i.amount.toLocaleString()}</li>
              ))}
            </ul>
          </div>
          <div className="zf-panel p-4">
            <div className="kicker">SHADOW · not applied</div>
            <div className="zf-metric mt-2 text-3xl">NT${shadow.total.toLocaleString()}</div>
            {differs ? <p className="mt-2 text-sm text-[var(--warn)]" data-testid="shadow-diff">Simulation differs from checkout policy by NT${(shadow.total - checkout.total).toLocaleString()}.</p> : null}
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
  const { domain, queueNotify, locale } = useStore();
  const [event, setEvent] = useState(NOTIFY_TEMPLATES[0].event);
  const preview = previewNotification(event, locale);
  const channels = ["in_app", "push", "sms", "email"] as const;
  return (
    <Studio kicker="Notification center" title="Phone-style previews">
      <p className="mt-2 text-sm">Generated only. Nothing is marked delivered unless a provider confirms it.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {NOTIFY_TEMPLATES.map((t) => (
          <button key={t.event} type="button" onClick={() => setEvent(t.event)} className={`zf-phone text-left ${event === t.event ? "outline outline-2 outline-[var(--signal)]" : ""}`}>
            <div className="kicker">{t.channel} · {t.audience}</div>
            <b className="mt-2 block">{t.event}</b>
            <p className="mt-2 text-sm text-[var(--ink-2)]">{locale === "zh" ? t.zh : t.en}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {channels.map((c) => (
          <span key={c} className="zf-chip">{c} · {domain.notifications.filter((n) => n.channel === c).length}</span>
        ))}
        <button type="button" className="zf-btn" onClick={() => queueNotify(event)}>Generate preview</button>
      </div>
      {preview ? (
        <div className="zf-phone mt-4 max-w-md">
          <div className="kicker">Preview · {preview.status}</div>
          <p className="mt-2">{preview.body}</p>
          <p className="mt-1 text-xs text-[var(--mute)]">{preview.note}</p>
        </div>
      ) : null}
      <div className="mt-6 grid gap-2">
        {domain.notifications.slice(0, 8).map((n) => (
          <div key={n.id} className="zf-glass flex items-center justify-between px-4 py-3 text-sm">
            <span>{n.at.slice(11, 19)} · {n.event}</span>
            <span className="zf-chip">{n.status}</span>
          </div>
        ))}
      </div>
    </Studio>
  );
}

export function CfgI18n() {
  const { domain, setTranslationStatus } = useStore();
  const [filter, setFilter] = useState<string>("all");
  const rows = domain.translations.filter((t) => filter === "all" || t.status === filter);
  return (
    <Studio kicker="Translation desk" title="Side-by-side proofing">
      <div className="mt-3 flex flex-wrap gap-2">
        {["all", "missing", "draft", "reviewed", "approved"].map((s) => (
          <button key={s} type="button" className={`zf-btn ${filter === s ? "" : "ghost"}`} style={{ minHeight: 32 }} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map((t) => (
          <div key={t.key} className="zf-glass p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="kicker">{t.namespace}.{t.key}</span>
              <span className="zf-chip">{t.status}</span>
            </div>
            <div className="zf-i18n mt-3">
              <div>
                <div className="kicker">EN</div>
                <p className="mt-1 text-lg">{t.en || "— missing —"}</p>
              </div>
              <div>
                <div className="kicker">繁中</div>
                <p className="mt-1 text-lg">{t.zh || "— 缺漏 —"}</p>
              </div>
            </div>
            {t.status !== "approved" && t.status !== "APPROVED" ? (
              <div className="mt-3 flex gap-2">
                <button type="button" className="zf-btn ghost" onClick={() => setTranslationStatus(t.key, "reviewed")}>Mark reviewed</button>
                <button type="button" className="zf-btn" onClick={() => setTranslationStatus(t.key, "approved")}>Approve</button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Studio>
  );
}

export function CfgIntegrations() {
  const rows = [
    ["Map tiles", "OSM / Esri", 1, "unconfigured vendor"],
    ["GPS / route / ETA", "simulationProvider", 0.4, "throws"],
    ["Flights", "simulationFlightProvider", 0.35, "throws"],
    ["Payments", "simulationPaymentProvider", 0.3, "throws · no card secrets"],
    ["Persistence", "demo DomainState", 0.5, "throws"],
  ] as const;
  return (
    <Studio kicker="Providers" title="Simulation vs production">
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {rows.map(([name, active, p, prod]) => (
          <div key={name} className="zf-glass p-4">
            <b>{name}</b>
            <p className="mt-1 text-sm">{active}</p>
            <div className="zf-bar mt-3"><i style={{ width: `${p * 100}%` }} /></div>
            <p className="mt-2 text-xs text-[var(--mute)]">Production: {prod}</p>
          </div>
        ))}
      </div>
    </Studio>
  );
}

export function CfgRoles() {
  const tiles = [
    ["passenger", "Book / live / share", "/go", 0.9],
    ["driver", "Duty / offer / job", "/driver", 0.75],
    ["ops", "Command / preferred", "/ops", 0.8],
    ["admin", "Studios / finance", "/admin/vehicles", 0.7],
  ] as const;
  return (
    <Studio kicker="Access" title="Role surfaces">
      <p className="mt-2 text-sm">Demo switch only. Production auth is not configured.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {tiles.map(([role, copy, href, p]) => (
          <a key={role} href={href} className="zf-glass block p-4">
            <div className="kicker">{role}</div>
            <b className="mt-1 block text-xl">{copy}</b>
            <div className="zf-bar mt-3"><i style={{ width: `${p * 100}%` }} /></div>
          </a>
        ))}
      </div>
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
  const simProvider = totals.captured;
  return (
    <Studio kicker="Reconciliation" title="Internal ledger vs simulation feed">
      <p className="mt-2 text-sm">Simulation feed mirrors the internal captured total. Production PSP remains unconfigured — this is not a provider confirmation.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="zf-panel p-3"><div className="kicker">Internal captured</div><div className="zf-metric">NT${totals.captured.toLocaleString()}</div></div>
        <div className="zf-panel p-3"><div className="kicker">Simulation feed</div><div className="zf-metric">NT${simProvider.toLocaleString()}</div></div>
        <div className="zf-panel p-3"><div className="kicker">Difference</div><div className="zf-metric">NT$0</div></div>
      </div>
      <table className="zf-table mt-4">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Internal</th>
            <th>Simulation</th>
            <th>Match</th>
          </tr>
        </thead>
        <tbody>
          {pays.slice(0, 12).map((p) => (
            <tr key={p.id}>
              <td>{p.bookingId}</td>
              <td>{p.amount}</td>
              <td>{p.amount}</td>
              <td>yes · demo</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Studio>
  );
}

export function Crm360() {
  const { bookings, domain, addNote, tickets } = useStore();
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
        <table className="zf-table mt-4">
          <thead>
            <tr>
              <th>Case</th>
              <th>Driver</th>
              <th>Rides</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {domain.preferredCases.filter((c) => c.customerId === p.id).map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.driverId}</td>
                <td>{c.ridesTogether}</td>
                <td>{c.status}</td>
              </tr>
            ))}
            {domain.preferredCases.filter((c) => c.customerId === p.id).length === 0 ? (
              <tr><td colSpan={4}>none on domain · company-mediated only</td></tr>
            ) : null}
          </tbody>
        </table>
      ) : null}
      {tab === "PAYMENTS" ? (
        <table className="zf-table mt-4">
          <thead>
            <tr>
              <th>Id</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {seedPaymentsFromBookings(mine, domain.payments.filter((n) => mine.some((b) => b.id === n.bookingId))).map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.status}</td>
                <td>{n.amount}</td>
                <td>{n.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {tab === "WALLET" ? (
        <table className="zf-table mt-4">
          <thead>
            <tr>
              <th>Tx</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {seedWalletFromBookings(mine, domain.wallet.filter((w) => w.passengerId === p.id)).map((w) => (
              <tr key={w.id}>
                <td>{w.id}</td>
                <td>{w.type}</td>
                <td>{w.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {tab === "LOYALTY" ? (
        <div className="zf-panel mt-4 p-4 text-sm">
          Points {p.points} · RFM {p.rfm} · {p.trips} catalog trips · spend NT${p.spendTwd.toLocaleString()}
        </div>
      ) : null}
      {tab === "REFERRALS" ? (
        <table className="zf-table mt-4">
          <tbody>
            <tr><td>Code</td><td>ZOUDIAN-{p.id.toUpperCase()}</td></tr>
            <tr><td>Rule</td><td>NT$100 / NT$100 after paid trip</td></tr>
            <tr><td>Channel</td><td>customer → customer · company settle</td></tr>
          </tbody>
        </table>
      ) : null}
      {tab === "SUPPORT" ? (
        <table className="zf-table mt-4">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.filter((t) => t.passengerId === p.id).map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.category}</td>
                <td>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {tab === "CONSENT" ? (
        <table className="zf-table mt-4">
          <tbody>
            <tr><td>Share trip</td><td>opt-in per token · expires</td></tr>
            <tr><td>Marketing</td><td>demo · not delivered</td></tr>
            <tr><td>Location on live map</td><td>active while booking bound</td></tr>
          </tbody>
        </table>
      ) : null}
      {tab === "AUDIT" ? (
        <ul className="zf-stream mt-4">
          {domain.audit.filter((a) => a.entity.includes(p.id) || a.detail.includes(p.name) || mine.some((b) => a.entity === b.id)).map((a) => (
            <li key={a.id}>{a.at.slice(0, 16)} · {a.action} · {a.detail}</li>
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
    <Studio kicker="Referral + campaigns" title="Growth board">
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["Customer → customer", "NT$100 / NT$100", 0.72],
          ["Driver → customer", "Company desk only", 0.28],
          ["B2B → customer", "Invoice match", 0.41],
        ].map(([t, r, p]) => (
          <div key={t} className="zf-glass p-4">
            <b>{t}</b>
            <p className="mt-1 text-sm">{r}</p>
            <div className="zf-bar mt-3"><i style={{ width: `${Number(p) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Object.entries(promos).map(([k, v]) => (
          <div key={k} className="zf-glass p-4">
            <div className="kicker">{v.type}</div>
            <b>{k}</b>
            <p className="mt-1 text-sm">{v.en}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {extras.map((e) => (
          <div key={e.id} className="zf-glass p-4">
            <b>{e.name}</b>
            <div className="zf-metric mt-1 text-2xl">NT${e.price}</div>
          </div>
        ))}
      </div>
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

function MetricTile({ k, v, p }: { k: string; v: string; p: number }) {
  return (
    <div className="zf-glass p-4">
      <div className="kicker">{k}</div>
      <div className="zf-metric mt-1 text-3xl">{v}</div>
      <div className="zf-bar mt-3"><i style={{ width: `${Math.min(100, p * 100)}%` }} /></div>
    </div>
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
  const comm = bookings.reduce((s, b) => s + b.commission, 0);
  const rfm = Object.entries(passengers.reduce<Record<string, number>>((m, p) => ({ ...m, [p.rfm]: (m[p.rfm] ?? 0) + 1 }), {}));
  return (
    <Studio kicker="Analytics workspaces" title="Graphical role views">
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
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <MetricTile k="GMV" v={`NT$${gmv.toLocaleString()}`} p={0.86} />
            <MetricTile k="AOV" v={`NT$${aov.toLocaleString()}`} p={0.54} />
            <MetricTile k="Completed" v={String(completed)} p={completed / Math.max(1, bookings.length)} />
            <MetricTile k="Bookings" v={String(bookings.length)} p={0.7} />
            <MetricTile k="Customers" v={String(repeat)} p={0.48} />
          </div>
        </>
      ) : null}
      {role === "operations" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MetricTile k="Available" v={String(c.available)} p={c.available / 10} />
          <MetricTile k="Busy" v={String(c.busy)} p={c.busy / 10} />
          <MetricTile k="Unassigned" v={String(c.unassigned)} p={c.unassigned / 8} />
          <MetricTile k="Incidents" v={String(c.incidents)} p={c.incidents / 5} />
        </div>
      ) : null}
      {role === "driver" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {drivers.map((d) => {
            const card = scorecardFromCatalog(d, bookings, live.counters.incidents);
            return (
              <div key={d.id} className="zf-glass p-4">
                <b>{d.name}</b>
                <p className="text-sm text-[var(--mute)]">{d.vehicle}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div><div className="kicker">Rides</div><div className="zf-metric">{formatMetric(card.totalRides)}</div></div>
                  <div><div className="kicker">Accept</div><div className="zf-metric">{formatMetric(card.acceptanceRate, "pct")}</div></div>
                  <div><div className="kicker">On-time</div><div className="zf-metric">{formatMetric(card.onTimePickups)}</div></div>
                </div>
                <div className="zf-bar mt-3"><i style={{ width: `${(card.acceptanceRate ?? 0) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      ) : null}
      {role === "growth" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.keys(promos).map((k, i) => (
            <MetricTile key={k} k="Promo" v={k} p={0.55 + i * 0.12} />
          ))}
        </div>
      ) : null}
      {role === "finance" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MetricTile k="Commission" v={`NT$${comm.toLocaleString()}`} p={0.62} />
          <MetricTile k="Cancelled" v={String(bookings.filter((b) => b.status === "cancelled").length)} p={0.18} />
        </div>
      ) : null}
      {role === "customer" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {rfm.map(([k, v]) => (
            <MetricTile key={k} k={k} v={String(v)} p={v / passengers.length} />
          ))}
        </div>
      ) : null}
    </Studio>
  );
}
