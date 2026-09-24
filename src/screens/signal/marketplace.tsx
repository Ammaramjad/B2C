"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { cities, extras, services } from "@/lib/catalog";
import { fareFor } from "@/lib/catalog-runtime";
import { quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useLive } from "@/lib/live/engine";
import { useCopy } from "@/lib/copy";
import { vehicleFits } from "@/lib/live/capacity";
import { PartyStepper, VehicleCard } from "@/components/signal/catalog-gui";
import type { ExtraId, ServiceType } from "@/lib/types";

const SERVICE_IMG: Record<string, string> = {
  airport_pickup: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80",
  airport_drop: "https://images.unsplash.com/photo-1544620341-11cb2cd7c323?w=1400&q=80",
  p2p: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=1400&q=80",
  hourly: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=80",
  instant: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1400&q=80",
  rental: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1400&q=80",
};

export function GoHome() {
  const { L } = useCopy();
  return (
    <div className="zf-market min-h-screen pb-16">
      <section className="zf-hero" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=1800&q=80)" }}>
        <div className="zf-hero-inner">
          <div className="kicker" style={{ color: "#ffd8d4" }}>{L("Taiwan private transfer", "台灣私人接送")}</div>
          <h1 className="display mt-3 max-w-3xl text-5xl md:text-6xl">{L("Airport cars you can actually see.", "接機車輛，看得到。")}</h1>
          <p className="mt-4 max-w-xl text-white/85">{L("Pick people and bags. We only show cars that fit. Pay once — the live pickup stays on the company network.", "選人數與行李。只顯示裝得下的車。一次付款——即時接送留在公司網路上。")}</p>
        </div>
      </section>
      <div className="zf-search">
        <div className="grid gap-3 sm:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <Link key={s.id} href={`/go/book?service=${s.id}`} className="overflow-hidden rounded-2xl border border-[#ece6dc] bg-[#faf7f2]">
              <i className="block h-28 bg-cover bg-center" style={{ backgroundImage: `url(${SERVICE_IMG[s.id]})` }} />
              <div className="p-3">
                <b>{L(s.en, s.zh)}</b>
                <div className="text-xs text-[#6b645c]">{s.formula}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <section className="mx-auto mt-12 max-w-[1100px] px-5">
        <h2 className="display text-3xl">{L("Popular corridors", "熱門廊帶")}</h2>
        <div className="zf-dest-grid mt-4">
          {cities.map((c) => (
            <Link key={c.id} href={`/go/book?service=airport_pickup&city=${c.id}`} className="zf-dest">
              <i style={{ backgroundImage: `url(${c.image})` }} />
              <b>{L(c.city, c.cityZh)}</b>
              <span>{L(c.tag, c.tagZh)} · {L("from", "起")} NT${c.from.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export function GoBook() {
  const params = useSearchParams();
  const service = (params.get("service") ?? "airport_pickup") as ServiceType;
  const { L } = useCopy();
  const { domain, placeBooking } = useStore();
  const { confirmAirport, bindBooking } = useLive();
  const router = useRouter();
  const [pickup, setPickup] = useState(service.startsWith("airport") ? "TPE T2 Arrivals · Door 8" : "Xinyi");
  const [dropoff, setDropoff] = useState("Taipei 101");
  const [when, setWhen] = useState("2026-09-24T16:40");
  const [flight, setFlight] = useState("BR156");
  const [pax, setPax] = useState(3);
  const [bags, setBags] = useState(2);
  const [vehicle, setVehicle] = useState("mpv");
  const [picked, setPicked] = useState<ExtraId[]>(["meet"]);
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState(2);
  const cars = domain.catalogVehicles;
  const q = useMemo(
    () => quote({ service, vehicle, extras: picked, when, hours, days }),
    [service, vehicle, picked, when, hours, days],
  );
  const fit = vehicleFits(vehicle, pax, bags);
  const svc = services.find((s) => s.id === service);

  function toggle(id: ExtraId) {
    setPicked((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  }

  function confirm() {
    const b = placeBooking({
      service,
      pickup,
      dropoff,
      when,
      flight,
      vehicle,
      passengers: pax,
      luggage: bags,
      extras: picked,
      hours,
      days,
      name: "Guest traveler",
      channel: "web",
    });
    if (service === "airport_pickup") {
      confirmAirport({ flight, pax, bags, vehicle, fare: q.total, bookingId: b.id, name: "Guest traveler" });
    } else {
      bindBooking({ bookingId: b.id, service, pickup, dropoff, fare: q.total, flight, name: "Guest traveler", chauffeur: service !== "rental" });
    }
    router.push(`/trips/${b.id}/success`);
  }

  return (
    <div className="zf-market min-h-screen pb-20">
      <div className="relative h-56 bg-cover bg-center" style={{ backgroundImage: `url(${SERVICE_IMG[service]})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="relative z-[1] mx-auto flex h-full max-w-[1100px] flex-col justify-end px-5 pb-6 text-white">
          <Link href="/go" className="text-sm text-white/80">{L("← All trips", "← 全部行程")}</Link>
          <h1 className="display mt-2 text-4xl">{svc ? L(svc.en, svc.zh) : service}</h1>
        </div>
      </div>
      <div className="mx-auto mt-6 grid max-w-[1100px] gap-6 px-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="kicker">{L("Trip details", "行程細節")}</div>
            {service.startsWith("airport") ? (
              <label className="zf-field mt-3"><span>{L("Flight", "航班")}</span><input value={flight} onChange={(e) => setFlight(e.target.value.toUpperCase())} /></label>
            ) : null}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="zf-field"><span>{L("Pickup", "上車")}</span><input value={pickup} onChange={(e) => setPickup(e.target.value)} /></label>
              <label className="zf-field"><span>{L("Drop-off", "下車")}</span><input value={dropoff} onChange={(e) => setDropoff(e.target.value)} /></label>
            </div>
            <label className="zf-field mt-3"><span>{L("When", "時間")}</span><input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
            {service === "hourly" ? (
              <label className="zf-field mt-3"><span>{L("Hours", "時數")}</span><input type="number" min={4} value={hours} onChange={(e) => setHours(Number(e.target.value))} /></label>
            ) : null}
            {service === "rental" ? (
              <label className="zf-field mt-3"><span>{L("Days", "天數")}</span><input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} /></label>
            ) : null}
            <div className="mt-4">
              <PartyStepper pax={pax} bags={bags} setPax={setPax} setBags={setBags} paxLabel={L("Passengers", "乘客")} bagLabel={L("Bags", "行李")} />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="display text-2xl">{L("Cars that fit this party", "裝得下的車款")}</h2>
            {cars.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                selected={vehicle === v.id}
                pax={pax}
                bags={bags}
                price={fareFor(service, v.id)}
                onSelect={() => setVehicle(v.id)}
              />
            ))}
          </div>
          <div className="rounded-3xl bg-white p-5">
            <div className="kicker">{L("Add-ons", "加購")}</div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {extras.filter((e) => !e.only || e.only.includes(service)).map((e) => (
                <label key={e.id} className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${picked.includes(e.id) ? "border-[var(--signal)]" : "border-[#ece6dc]"}`}>
                  <span>
                    <input className="mr-2" type="checkbox" checked={picked.includes(e.id)} onChange={() => toggle(e.id)} />
                    {L(e.name, e.nameZh)}
                  </span>
                  <b>NT${e.price}</b>
                </label>
              ))}
            </div>
          </div>
        </div>
        <aside className="lg:sticky lg:top-20 h-fit rounded-3xl bg-white p-5 shadow-sm">
          {cars.find((v) => v.id === vehicle)?.panoramic ? (
            <div className="mb-4 h-40 rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${cars.find((v) => v.id === vehicle)?.panoramic})` }} />
          ) : null}
          <div className="kicker">{L("Live quote", "即時報價")}</div>
          <div className="zf-metric mt-1 text-4xl">NT${q.total.toLocaleString()}</div>
          <ul className="zf-stream mt-3">
            {q.items.filter((i) => i.amount).map((i) => (
              <li key={i.label} className="flex justify-between">
                <span>{L(i.label, i.labelZh)}</span>
                <span>NT${i.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          {!fit ? <p className="mt-3 text-sm text-[var(--warn)]">{L("This class is over capacity. Pick another car.", "此車款超載。請換車。")}</p> : null}
          <button type="button" className="zf-btn wide mt-4" disabled={!fit} onClick={confirm} data-testid="go-confirm">
            {L("Confirm & pay", "確認並付款")} NT${q.total.toLocaleString()}
          </button>
          <p className="mt-3 text-xs text-[#6b645c]">{L("Company-owned assignment. No private driver chat.", "公司派遣。沒有私下司機對話。")}</p>
        </aside>
      </div>
    </div>
  );
}
