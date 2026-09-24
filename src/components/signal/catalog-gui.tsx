"use client";

import type { Vehicle } from "@/lib/types";
import { vehicleFits } from "@/lib/live/capacity";

export function SeatBagIcons({ seats, bags, size = 16 }: { seats: number; bags: number; size?: number }) {
  return (
    <div className="zf-cap" aria-label={`${seats} passengers, ${bags} bags`}>
      <span className="zf-cap-row">
        {Array.from({ length: Math.min(seats, 10) }).map((_, i) => (
          <i key={`p${i}`} className="zf-pax" style={{ width: size, height: size }} />
        ))}
        <b>{seats}</b>
      </span>
      <span className="zf-cap-row">
        {Array.from({ length: Math.min(bags, 10) }).map((_, i) => (
          <i key={`b${i}`} className="zf-bag" style={{ width: size, height: size }} />
        ))}
        <b>{bags}</b>
      </span>
    </div>
  );
}

export function PartyStepper({
  pax,
  bags,
  setPax,
  setBags,
  paxLabel,
  bagLabel,
}: {
  pax: number;
  bags: number;
  setPax: (n: number) => void;
  setBags: (n: number) => void;
  paxLabel: string;
  bagLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="zf-glass p-3">
        <div className="kicker">{paxLabel}</div>
        <div className="mt-2 flex items-center justify-between">
          <button type="button" className="zf-btn ghost" onClick={() => setPax(Math.max(1, pax - 1))}>−</button>
          <span className="zf-metric text-3xl">{pax}</span>
          <button type="button" className="zf-btn ghost" onClick={() => setPax(pax + 1)}>+</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {Array.from({ length: pax }).map((_, i) => <i key={i} className="zf-pax" />)}
        </div>
      </div>
      <div className="zf-glass p-3">
        <div className="kicker">{bagLabel}</div>
        <div className="mt-2 flex items-center justify-between">
          <button type="button" className="zf-btn ghost" onClick={() => setBags(Math.max(0, bags - 1))}>−</button>
          <span className="zf-metric text-3xl">{bags}</span>
          <button type="button" className="zf-btn ghost" onClick={() => setBags(bags + 1)}>+</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {Array.from({ length: bags }).map((_, i) => <i key={i} className="zf-bag" />)}
        </div>
      </div>
    </div>
  );
}

export function VehicleCard({
  vehicle,
  selected,
  pax,
  bags,
  price,
  onSelect,
}: {
  vehicle: Vehicle;
  selected?: boolean;
  pax?: number;
  bags?: number;
  price?: number;
  onSelect?: () => void;
}) {
  const fit = pax == null || bags == null ? true : vehicleFits(vehicle.id, pax, bags);
  return (
    <button type="button" onClick={onSelect} className={`zf-vcard ${selected ? "on" : ""} ${fit ? "" : "dim"}`}>
      <span className="zf-vcard-photo" style={{ backgroundImage: `url(${vehicle.image ?? ""})` }} />
      <span className="zf-vcard-body">
        <b>{vehicle.name}</b>
        <em>{vehicle.model}</em>
        <SeatBagIcons seats={vehicle.seats} bags={vehicle.luggage} />
        {price != null ? <strong className="zf-metric">NT${price.toLocaleString()}</strong> : null}
        {!fit ? <small>Over capacity</small> : null}
      </span>
    </button>
  );
}
