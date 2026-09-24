"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer, useState } from "react";
import { extras, services } from "@/lib/catalog";
import { quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live/engine";
import { useCopy } from "@/lib/copy";
import { vehicleFits } from "@/lib/live/capacity";
import { communityProvider } from "@/lib/maps/community";
import { googleMapsKey, resolveBookingGeoProvider } from "@/lib/maps";
import { weatherProvider } from "@/lib/maps/weather";
import { CATALOG_PLACES, STEPS, canAdvance, initialCommand, reduceCommand, type PlacePick } from "@/lib/booking/command";
import { BookingMap } from "@/components/booking/map-mount";
import { PartyStepper, VehicleCard } from "@/components/signal/catalog-gui";
import { drivers } from "@/lib/data";
import type { ExtraId, ServiceType } from "@/lib/types";
import type { GeoPoint } from "@/lib/live/types";

const RAIL: { id: ServiceType | "book" | "trips"; href?: string; en: string; zh: string }[] = [
  { id: "book", en: "Book Ride", zh: "叫車" },
  { id: "airport_pickup", en: "Airport Transfer", zh: "機場接送" },
  { id: "p2p", en: "Point to Point", zh: "點對點" },
  { id: "hourly", en: "Hourly Chauffeur", zh: "計時禮賓" },
  { id: "instant", en: "Corporate", zh: "企業" },
  { id: "rental", en: "Rental Service", zh: "租車" },
  { id: "trips", href: "/trips", en: "My Trips", zh: "行程" },
];

export function BookingExperience() {
  const params = useSearchParams();
  const seed = (params.get("service") as ServiceType | null) ?? "airport_pickup";
  const { L, locale, setLocale } = useCopy();
  const { domain, placeBooking, recent, pushRecent } = useStore();
  const notices = domain.notifications.filter((n) => n.audience === "passenger").length;
  const { confirmAirport, bindBooking, live } = useLive();
  const router = useRouter();
  const [state, dispatch] = useReducer(reduceCommand, initialCommand({ service: seed }));
  const [activeEnd, setActiveEnd] = useState<"from" | "to">("from");
  const [suggest, setSuggest] = useState<PlacePick[]>([]);
  const [busy, setBusy] = useState(false);
  const [weather, setWeather] = useState<string | null>(null);
  const [trafficNote, setTrafficNote] = useState<string>("");
  const geo = resolveBookingGeoProvider();
  const fare = useMemo(
    () => quote({ service: state.service, vehicle: state.vehicle, extras: state.extras, when: state.when, hours: 8, days: 2 }),
    [state.service, state.vehicle, state.extras, state.when],
  );
  const cars = domain.catalogVehicles;
  const fit = vehicleFits(state.vehicle, state.passengers, state.luggage);

  useEffect(() => {
    communityProvider.traffic().then((t) => setTrafficNote(`${t.note} · ${t.source}`)).catch(() => setTrafficNote(""));
    weatherProvider.current(25.03, 121.56).then((w) => setWeather(w ? `${w.celsius}°C ${w.summary}` : null));
  }, []);

  useEffect(() => {
    const from = state.from.point;
    const to = state.to.point;
    if (!from || !to) return;
    let liveReq = true;
    communityProvider
      .route(from, to)
      .then((r) => {
        if (liveReq) dispatch({ type: "route", route: r, error: null });
      })
      .catch(() => {
        if (liveReq) dispatch({ type: "route", route: null, error: L("We couldn't calculate this route. Try another destination.", "無法計算路線。請換目的地。") });
      });
    return () => {
      liveReq = false;
    };
  }, [state.from.point, state.to.point, L]);

  function pickSuggest(query: string, end: "from" | "to") {
    const q = query.toLowerCase();
    const catalog = CATALOG_PLACES.filter((p) => p.label.toLowerCase().includes(q) || p.labelZh.includes(query)).map((p) => ({
      label: locale === "zh" ? p.labelZh : p.label,
      point: p.point,
      source: "catalog" as const,
    }));
    const rec = recent.filter((r) => r.toLowerCase().includes(q)).map((r) => ({ label: r, point: null, source: "user" as const }));
    setSuggest([...catalog, ...rec].slice(0, 6));
    dispatch({ type: end, place: { label: query, point: end === "from" ? state.from.point : state.to.point, source: "user" } });
  }

  async function commitPlace(end: "from" | "to", place: PlacePick) {
    let next = place;
    if (!next.point && next.label) {
      const found = CATALOG_PLACES.find((p) => p.label === next.label || p.labelZh === next.label);
      if (found) next = { ...next, point: found.point, source: "catalog" };
      else {
        try {
          const geoHit = await communityProvider.geocode(next.label);
          if (geoHit) next = { label: geoHit.label, point: geoHit.point, source: geoHit.source };
        } catch {
          /* leave unlabeled point */
        }
      }
    }
    dispatch({ type: end, place: next });
    if (next.label) pushRecent(next.label);
    setSuggest([]);
  }

  function onMapPick(p: GeoPoint) {
    const place: PlacePick = { label: `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`, point: p, source: "map-click" };
    dispatch({ type: activeEnd, place });
  }

  function confirm() {
    if (!fit) return;
    setBusy(true);
    const b = placeBooking({
      service: state.service,
      pickup: state.from.label,
      dropoff: state.to.label,
      when: state.when,
      flight: state.flight,
      vehicle: state.vehicle,
      passengers: state.passengers,
      luggage: state.luggage,
      extras: state.extras,
      hours: 8,
      days: 2,
      name: state.name || "Guest traveler",
      phone: state.phone,
      payment: state.payment,
      channel: "web",
    });
    if (state.service === "airport_pickup") {
      confirmAirport({ flight: state.flight, pax: state.passengers, bags: state.luggage, vehicle: state.vehicle, fare: fare.total, bookingId: b.id, name: state.name || "Guest traveler" });
    } else {
      bindBooking({ bookingId: b.id, service: state.service, pickup: state.from.label, dropoff: state.to.label, fare: fare.total, flight: state.flight, name: state.name || "Guest traveler", chauffeur: state.service !== "rental" });
    }
    router.push(`/trips/${b.id}/success`);
  }

  const driver = drivers.find((x) => x.id === live.assignedId) ?? drivers.find((x) => x.work === "available");
  const cta =
    state.step < 5
      ? L("Continue →", "繼續 →")
      : state.step === 5
        ? L("Continue to confirm →", "前往確認 →")
        : L("Confirm booking →", "確認預訂 →");

  return (
    <div className="zf-cmd">
      <header className="zf-cmd-nav">
        <Link href="/" className="flex items-center gap-2 text-[var(--cmd-ink)]">
          <span className="zf-mark">Z</span>
          <b>ZOUFENG</b>
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/go" className="on">{L("Book Ride", "叫車")}</Link>
          <Link href="/destinations">{L("Services", "服務")}</Link>
          <Link href="/go?service=instant">{L("Corporate", "企業")}</Link>
          <Link href="/admin/vehicles">{L("Fleet", "車隊")}</Link>
          <Link href="/trips">{L("My Trips", "行程")}</Link>
          <Link href="/help">{L("Support", "支援")}</Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="zf-chip">{L("Search", "搜尋")}</span>
          <span className="zf-chip">{L("Alerts", "通知")} {notices || ""}</span>
          <button type="button" className="zf-chip" onClick={() => setLocale(locale === "en" ? "zh" : "en")}>{locale === "en" ? "EN" : "繁中"}</button>
          <Link href="/login" className="zf-chip">{L("Account", "帳戶")}</Link>
        </div>
      </header>
      <div className="zf-cmd-body">
        <aside className="zf-cmd-rail" aria-label={L("Services", "服務")}>
          {RAIL.map((r) =>
            r.href ? (
              <Link key={r.id} href={r.href}>{L(r.en, r.zh)}</Link>
            ) : (
              <button
                key={r.id}
                type="button"
                className={state.service === r.id || (r.id === "book" && state.step === 1) ? "on" : ""}
                onClick={() => {
                  if (r.id === "book") dispatch({ type: "step", step: 1 });
                  else dispatch({ type: "patch", patch: { service: r.id as ServiceType } });
                }}
              >
                {L(r.en, r.zh)}
              </button>
            ),
          )}
        </aside>
        <section className="zf-cmd-map">
          <BookingMap from={state.from.point} to={state.to.point} route={state.route} onPick={onMapPick} source={geo.id} />
          {state.route ? (
            <div className="zf-cmd-float" style={{ left: 16, top: 16 }}>
              <div className="zf-src">{L("Best route", "最佳路線")} · {state.route.source}</div>
              <b className="block text-lg">{state.route.etaMin} min · {state.route.km} km</b>
            </div>
          ) : (
            <div className="zf-cmd-float" style={{ left: 16, top: 16 }}>
              {L("Where would you like to go?", "你要去哪裡？")}
            </div>
          )}
          {trafficNote ? (
            <div className="zf-cmd-float" style={{ left: 16, bottom: 16 }}>
              <div className="zf-src">{L("Traffic", "路況")}</div>
              {trafficNote}
            </div>
          ) : null}
          {weather ? <div className="zf-cmd-float" style={{ right: 88, top: 16 }}>{weather}</div> : null}
          <div className="zf-cmd-float" style={{ right: 16, top: 16 }}>
            <div className="zf-src">{googleMapsKey() ? "Google Maps" : L("Esri satellite · community routing", "Esri 衛星 · 社群路線")}</div>
            {L("Signal fleet markers are demo GPS, not a production feed.", "車隊標記是示範 GPS，不是正式軌跡。")}
          </div>
        </section>
        <aside className="zf-cmd-panel">
          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-5">
            <div className="zf-cmd-steps">
              {STEPS.map((s) => (
                <button key={s.id} type="button" onClick={() => dispatch({ type: "step", step: s.id })}>
                  <b className={state.step === s.id ? "on" : ""}>0{s.id} {L(s.en, s.zh)}</b>
                </button>
              ))}
            </div>
            <div>
              <h1>{L("Plan your journey", "規劃行程")}</h1>
              <p className="mt-1 text-sm text-[var(--cmd-mute)]">{L("Safe, comfortable and reliable rides across Taiwan.", "安全、舒適、可靠的台灣接送。")}</p>
            </div>
            <div className="zf-cmd-modes">
              {(["now", "schedule", "multi"] as const).map((m) => (
                <button key={m} type="button" className={state.mode === m ? "on" : ""} onClick={() => dispatch({ type: "mode", mode: m })}>
                  {m === "now" ? L("Ride Now", "現在出發") : m === "schedule" ? L("Schedule", "預約") : L("Multi-stop", "多點")}
                </button>
              ))}
            </div>
            {state.step === 1 ? (
              <div className="space-y-3">
                <label className="zf-cmd-field">
                  <span>{L("From", "上車")}</span>
                  <input
                    value={state.from.label}
                    onFocus={() => setActiveEnd("from")}
                    onChange={(e) => pickSuggest(e.target.value, "from")}
                    placeholder={L("Pickup, airport, hotel", "上車點、機場、飯店")}
                  />
                </label>
                <label className="zf-cmd-field">
                  <span>{L("To", "下車")}</span>
                  <input
                    value={state.to.label}
                    onFocus={() => setActiveEnd("to")}
                    onChange={(e) => pickSuggest(e.target.value, "to")}
                    placeholder={L("Destination", "目的地")}
                  />
                </label>
                <div className="flex gap-2">
                  <button type="button" className="zf-btn ghost" onClick={() => dispatch({ type: "swap" })}>{L("Swap", "對調")}</button>
                  {state.mode === "multi" ? (
                    <button type="button" className="zf-btn ghost" onClick={() => dispatch({ type: "addStop" })}>{L("Add stop", "加停靠")}</button>
                  ) : null}
                </div>
                {suggest.length ? (
                  <ul className="zf-stream">
                    {suggest.map((s) => (
                      <li key={`${s.source}-${s.label}`}>
                        <button type="button" onClick={() => commitPlace(activeEnd, s)}>
                          {s.label} <i className="zf-src">{s.source}</i>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {state.stops.map((st, i) => (
                  <label key={i} className="zf-cmd-field">
                    <span>{L("Stop", "停靠")} {i + 1}</span>
                    <input value={st.label} onChange={(e) => dispatch({ type: "patch", patch: { stops: state.stops.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) } })} />
                  </label>
                ))}
                {state.routeError ? <p className="text-sm text-[var(--signal)]">{state.routeError}</p> : null}
                <p className="zf-src">{L("Catalog / map-click / community geocode only. Not invented live places.", "僅目錄、地圖點選或社群地理編碼。沒有虛構地點。")}</p>
              </div>
            ) : null}
            {state.step === 2 ? (
              <div className="zf-cmd-svc">
                {services.map((s) => (
                  <button key={s.id} type="button" className={state.service === s.id ? "on" : ""} onClick={() => dispatch({ type: "patch", patch: { service: s.id } })}>
                    <b>{L(s.en, s.zh)}</b>
                    <div className="text-xs text-[var(--cmd-mute)]">{s.formula}</div>
                  </button>
                ))}
              </div>
            ) : null}
            {state.step === 3 ? (
              <div className="space-y-3">
                <button type="button" className="zf-btn ghost" onClick={() => dispatch({ type: "patch", patch: { compare: !state.compare } })}>
                  {L("Compare vehicles", "比較車款")}
                </button>
                {state.compare ? (
                  <div className="overflow-auto text-xs">
                    <table className="zf-table">
                      <thead><tr><th>{L("Class", "車款")}</th><th>{L("Pax", "人")}</th><th>{L("Bags", "行李")}</th><th>{L("Fare", "車資")}</th></tr></thead>
                      <tbody>
                        {cars.map((v) => (
                          <tr key={v.id}><td>{v.name}</td><td>{v.seats}</td><td>{v.luggage}</td><td>NT${v.base.toLocaleString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {cars.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    selected={state.vehicle === v.id}
                    pax={state.passengers}
                    bags={state.luggage}
                    price={v.base}
                    onSelect={() => dispatch({ type: "patch", patch: { vehicle: v.id } })}
                  />
                ))}
                {!cars.some((v) => vehicleFits(v.id, state.passengers, state.luggage)) ? (
                  <p>{L("No vehicles are currently available for this party.", "此人數／行李目前沒有可用車款。")}</p>
                ) : null}
              </div>
            ) : null}
            {state.step === 4 ? (
              <div className="space-y-3">
                {state.mode === "schedule" ? (
                  <label className="zf-cmd-field"><span>{L("Pickup time", "上車時間")}</span><input type="datetime-local" value={state.when} onChange={(e) => dispatch({ type: "patch", patch: { when: e.target.value } })} /></label>
                ) : null}
                <PartyStepper pax={state.passengers} bags={state.luggage} setPax={(n) => dispatch({ type: "patch", patch: { passengers: n } })} setBags={(n) => dispatch({ type: "patch", patch: { luggage: n } })} paxLabel={L("Passengers", "乘客")} bagLabel={L("Bags", "行李")} />
                {state.service.startsWith("airport") ? (
                  <label className="zf-cmd-field"><span>{L("Flight", "航班")}</span><input value={state.flight} onChange={(e) => dispatch({ type: "patch", patch: { flight: e.target.value.toUpperCase() } })} /></label>
                ) : null}
                <label className="zf-cmd-field"><span>{L("Name", "姓名")}</span><input value={state.name} onChange={(e) => dispatch({ type: "patch", patch: { name: e.target.value } })} /></label>
                <label className="zf-cmd-field"><span>{L("Phone", "電話")}</span><input value={state.phone} onChange={(e) => dispatch({ type: "patch", patch: { phone: e.target.value } })} /></label>
                <label className="zf-cmd-field"><span>{L("Notes", "備註")}</span><input value={state.notes} onChange={(e) => dispatch({ type: "patch", patch: { notes: e.target.value } })} /></label>
                <div className="grid grid-cols-2 gap-2">
                  {extras.filter((e) => !e.only || e.only.includes(state.service)).map((e) => (
                    <button key={e.id} type="button" className={state.extras.includes(e.id) ? "on" : ""} style={{ border: "1px solid var(--cmd-line)", borderRadius: 14, padding: 12, background: "#121925", color: "inherit", textAlign: "left" }} onClick={() => dispatch({ type: "toggleExtra", id: e.id as ExtraId })}>
                      {L(e.name, e.nameZh)} · NT${e.price}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {state.step === 5 ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--cmd-mute)]">{L("Only methods already on the demo ledger. No fake capture.", "僅示範帳本既有付款方式。沒有虛構請款。")}</p>
                {(["card", "line", "cash"] as const).map((p) => (
                  <button key={p} type="button" className={`zf-cmd-svc w-full ${state.payment === p ? "on" : ""}`} onClick={() => dispatch({ type: "patch", patch: { payment: p } })}>
                    {p === "card" ? L("Pay online · card", "線上刷卡") : p === "line" ? "LINE Pay" : L("Pay in car", "車上付款")}
                  </button>
                ))}
              </div>
            ) : null}
            {state.step === 6 ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold">{state.from.label} → {state.to.label}</p>
                <p className="text-sm">{state.route ? `${state.route.km} km · ${state.route.etaMin} min · ${state.route.source}` : L("Route pending", "路線計算中")}</p>
                <p className="text-sm">{L(services.find((s) => s.id === state.service)?.en ?? "", services.find((s) => s.id === state.service)?.zh ?? "")} · {state.vehicle}</p>
                {driver ? (
                  <div className="zf-glass p-3">
                    <div className="zf-src">{L("Company dispatch candidate (catalog)", "公司派遣候選人（目錄）")}</div>
                    <b>{driver.name}</b>
                    <p className="text-sm">{driver.vehicle} · {driver.plate}</p>
                  </div>
                ) : (
                  <p>{L("No upcoming assignment yet. Confirm to place the company booking.", "尚無指派。確認後才建立公司訂單。")}</p>
                )}
                <button type="button" className="zf-btn ghost" disabled title={L("Assistant is not configured", "助理尚未設定")}>
                  {L("AI Assistant", "AI 助理")}
                </button>
              </div>
            ) : null}
            <div>
              <div className="zf-src">{L("Estimated fare · quote()", "預估車資 · quote()")}</div>
              <div className="zf-metric text-4xl">NT${fare.total.toLocaleString()}</div>
              <ul className="zf-stream mt-2">
                {fare.items.filter((i) => i.amount).map((i) => (
                  <li key={i.label} className="flex justify-between"><span>{L(i.label, i.labelZh)}</span><span>NT${i.amount.toLocaleString()}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--cmd-line)] p-4">
            <button
              type="button"
              className="zf-cmd-cta"
              disabled={busy || (state.step === 6 && !fit) || !canAdvance(state) && state.step < 6}
              onClick={() => (state.step === 6 ? confirm() : dispatch({ type: "next" }))}
              data-testid="cmd-cta"
            >
              {busy ? L("Placing…", "建立中…") : cta}
            </button>
            {state.step > 1 ? (
              <button type="button" className="mt-2 w-full text-sm text-[var(--cmd-mute)]" onClick={() => dispatch({ type: "back" })}>
                {L("Back", "返回")}
              </button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
