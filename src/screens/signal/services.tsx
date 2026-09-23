"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { rentals, taxis } from "@/lib/catalog";
import { useLive } from "@/lib/live/engine";
import { quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { MapMount } from "@/components/signal/map-mount";
import { AirportBook } from "./passenger";
import type { ExtraId, ServiceType } from "@/lib/types";

function payAndGo(router: ReturnType<typeof useRouter>, id: string) {
  router.push(`/trips/${id}/success`);
}

export function ServiceBook() {
  const params = useSearchParams();
  const service = (params.get("service") ?? "airport_pickup") as ServiceType;
  if (service === "airport_pickup") return <AirportBook />;
  if (service === "airport_drop") return <AirportDropBook />;
  if (service === "p2p") return <P2pBook />;
  if (service === "hourly") return <HourlyBook />;
  if (service === "instant") return <InstantBook />;
  return <RentalBook />;
}

function Shell({ title, kicker, children }: { title: string; kicker: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[1fr_420px]">
      <div className="min-h-[320px]">
        <MapMount mode="day" height="100%" />
      </div>
      <div className="space-y-4 overflow-auto p-5">
        <div className="kicker">{kicker}</div>
        <h1 className="display text-4xl">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function AirportDropBook() {
  const { placeBooking } = useStore();
  const { confirmAirport } = useLive();
  const router = useRouter();
  const [flight, setFlight] = useState("BR157");
  const [depart, setDepart] = useState("2026-09-24T18:40");
  const [pickup, setPickup] = useState("Banqiao");
  const [pax, setPax] = useState(6);
  const [bags, setBags] = useState(6);
  const q = useMemo(() => quote({ service: "airport_drop", vehicle: "van", extras: ["meet"], when: depart }), [depart]);
  return (
    <Shell title="Drop at TPE T2" kicker="Airport drop-off · outbound clock">
      <p className="text-sm text-[var(--ink-2)]">Pickup must clear the terminal curb before check-in close. Flight is the departure, not the arrival.</p>
      <label className="zf-field">
        <span>Outbound flight</span>
        <input value={flight} onChange={(e) => setFlight(e.target.value.toUpperCase())} />
      </label>
      <label className="zf-field">
        <span>Hotel / origin</span>
        <input value={pickup} onChange={(e) => setPickup(e.target.value)} />
      </label>
      <label className="zf-field">
        <span>Leave by</span>
        <input type="datetime-local" value={depart} onChange={(e) => setDepart(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="zf-field">
          <span>Pax</span>
          <input type="number" value={pax} onChange={(e) => setPax(Number(e.target.value))} />
        </label>
        <label className="zf-field">
          <span>Bags</span>
          <input type="number" value={bags} onChange={(e) => setBags(Number(e.target.value))} />
        </label>
      </div>
      <div className="zf-metric text-3xl">NT${q.total.toLocaleString()}</div>
      <button
        type="button"
        className="zf-btn wide"
        onClick={() => {
          const b = placeBooking({
            service: "airport_drop",
            flight,
            pickup,
            dropoff: "TPE T2 Departures",
            when: depart,
            vehicle: "van",
            passengers: pax,
            luggage: bags,
            extras: ["meet"],
            name: "Sarah Chen",
          });
          confirmAirport({ flight, pax, bags, vehicle: "Van", fare: q.total, bookingId: b.id, name: "Sarah Chen" });
          payAndGo(router, b.id);
        }}
      >
        Confirm drop-off NT${q.total.toLocaleString()}
      </button>
    </Shell>
  );
}

export function P2pBook() {
  const { placeBooking } = useStore();
  const router = useRouter();
  const [from, setFrom] = useState("Xinyi");
  const [to, setTo] = useState("Songshan TSA");
  const [when, setWhen] = useState("2026-09-24T13:00");
  const [notes, setNotes] = useState("Door-to-door. No airport wait clock.");
  const q = useMemo(() => quote({ service: "p2p", vehicle: "sedan", when }), [when]);
  return (
    <Shell title="Point to point" kicker="Private transfer · city corridor">
      <p className="text-sm text-[var(--ink-2)]">Two addresses, one company-owned assignment. No terminal wait policy.</p>
      <label className="zf-field">
        <span>Pickup</span>
        <input value={from} onChange={(e) => setFrom(e.target.value)} />
      </label>
      <label className="zf-field">
        <span>Drop-off</span>
        <input value={to} onChange={(e) => setTo(e.target.value)} />
      </label>
      <label className="zf-field">
        <span>When</span>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      </label>
      <label className="zf-field">
        <span>Notes for dispatch</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="zf-metric text-3xl">NT${q.total.toLocaleString()}</div>
      <button
        type="button"
        className="zf-btn wide"
        onClick={() => {
          const b = placeBooking({ service: "p2p", pickup: from, dropoff: to, when, vehicle: "sedan", extras: [], name: "Sarah Chen" });
          payAndGo(router, b.id);
        }}
      >
        Confirm transfer
      </button>
    </Shell>
  );
}

export function HourlyBook() {
  const { placeBooking } = useStore();
  const router = useRouter();
  const [hours, setHours] = useState(8);
  const [start, setStart] = useState("Hotel");
  const [loop, setLoop] = useState("Jiufen loop");
  const extras = useMemo<ExtraId[]>(() => ["english"], []);
  const q = useMemo(() => quote({ service: "hourly", vehicle: "mpv", extras, hours, when: "2026-09-25T09:00" }), [extras, hours]);
  return (
    <Shell title="Hourly charter" kicker="Charter · billed on the clock">
      <p className="text-sm text-[var(--ink-2)]">The driver stays with the party. Quote is hours × rate, not a single drop.</p>
      <label className="zf-field">
        <span>Start</span>
        <input value={start} onChange={(e) => setStart(e.target.value)} />
      </label>
      <label className="zf-field">
        <span>Itinerary</span>
        <input value={loop} onChange={(e) => setLoop(e.target.value)} />
      </label>
      <label className="zf-field">
        <span>Hours</span>
        <input type="number" min={4} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
      </label>
      <div className="zf-metric text-3xl">NT${q.total.toLocaleString()}</div>
      <button
        type="button"
        className="zf-btn wide"
        onClick={() => {
          const b = placeBooking({
            service: "hourly",
            pickup: start,
            dropoff: loop,
            hours,
            vehicle: "mpv",
            extras,
            name: "Sarah Chen",
          });
          payAndGo(router, b.id);
        }}
      >
        Confirm charter
      </button>
    </Shell>
  );
}

export function InstantBook() {
  const { placeBooking } = useStore();
  const router = useRouter();
  const [klass, setKlass] = useState(taxis[0].id);
  const t = taxis.find((x) => x.id === klass) ?? taxis[0];
  const q = useMemo(() => quote({ service: "instant", vehicle: klass }), [klass]);
  return (
    <Shell title="Instant taxi" kicker="Nearest compatible class · company dispatch">
      <p className="text-sm text-[var(--ink-2)]">ETA is class-level, not a private driver handshake.</p>
      {taxis.map((x) => (
        <button key={x.id} type="button" onClick={() => setKlass(x.id)} className={`zf-panel w-full p-3 text-left ${klass === x.id ? "outline outline-1 outline-[var(--signal)]" : ""}`}>
          <b>{x.name}</b>
          <div className="text-sm text-[var(--ink-2)]">Catalog ETA {x.eta} min · NT${x.base}</div>
        </button>
      ))}
      <div className="zf-metric text-3xl">NT${q.total.toLocaleString()}</div>
      <button
        type="button"
        className="zf-btn wide"
        onClick={() => {
          const b = placeBooking({ service: "instant", pickup: "Da'an", dropoff: "Nearest drop", vehicle: klass, extras: [], name: "Sarah Chen" });
          payAndGo(router, b.id);
        }}
      >
        Request {t.name}
      </button>
    </Shell>
  );
}

export function RentalBook() {
  const { placeBooking } = useStore();
  const router = useRouter();
  const [car, setCar] = useState(rentals[1].id);
  const [days, setDays] = useState(2);
  const [oneWay, setOneWay] = useState(false);
  const extras = useMemo<ExtraId[]>(() => (oneWay ? ["insurance", "one_way_rental"] : ["insurance"]), [oneWay]);
  const q = useMemo(() => quote({ service: "rental", vehicle: car, extras, days }), [car, extras, days]);
  return (
    <Shell title="Self-drive" kicker="Rental · depot, not a chauffeur">
      <p className="text-sm text-[var(--ink-2)]">No live driver marker. Pickup is a depot window.</p>
      {rentals.map((r) => (
        <button key={r.id} type="button" onClick={() => setCar(r.id)} className={`zf-panel w-full p-3 text-left ${car === r.id ? "outline outline-1 outline-[var(--signal)]" : ""}`}>
          <b>{r.name}</b>
          <div className="text-sm">{r.seats} seats · NT${r.day}/day</div>
        </button>
      ))}
      <label className="zf-field">
        <span>Days</span>
        <input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={oneWay} onChange={(e) => setOneWay(e.target.checked)} />
        One-way return (甲租乙還)
      </label>
      <div className="zf-metric text-3xl">NT${q.total.toLocaleString()}</div>
      <button
        type="button"
        className="zf-btn wide"
        onClick={() => {
          const b = placeBooking({
            service: "rental",
            pickup: "Nangang depot",
            dropoff: oneWay ? "Kaohsiung depot" : "Nangang depot",
            days,
            vehicle: car,
            extras,
            name: "Sarah Chen",
          });
          payAndGo(router, b.id);
        }}
      >
        Reserve car
      </button>
      <Link href="/preferred" className="block text-sm text-[var(--mute)]">
        Preferred drivers do not apply to self-drive.
      </Link>
    </Shell>
  );
}
