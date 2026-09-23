"use client";

import { useId } from "react";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const ROADS = [
  "M20 240 C 80 40, 160 260, 280 90 S 420 40, 520 180",
  "M10 80 C 140 20, 220 160, 360 70 S 500 200, 540 40",
  "M40 300 C 120 220, 200 320, 340 210 S 480 280, 530 120",
  "M8 160 H 540",
  "M180 10 V 330",
  "M320 20 V 320",
];

const CARS = [
  { path: 0, dur: "11s", delay: "0s", color: "#2f6bff", driver: "d1" },
  { path: 1, dur: "14s", delay: "-4s", color: "#3ee0c8", driver: "d2" },
  { path: 2, dur: "12s", delay: "-7s", color: "#2f6bff", driver: "d3" },
  { path: 3, dur: "9s", delay: "-2s", color: "#4c8dff", driver: "d4" },
  { path: 4, dur: "16s", delay: "-9s", color: "#3ee0c8", driver: "d1" },
  { path: 5, dur: "13s", delay: "-3s", color: "#2f6bff", driver: "d2" },
];

export function LiveMap({
  locale,
  mode = "fleet",
  height = 420,
  focusDriverId,
  pickup,
  dropoff,
  eta,
}: {
  locale: Locale;
  mode?: "fleet" | "trip" | "nav";
  height?: number;
  focusDriverId?: string;
  pickup?: string;
  dropoff?: string;
  eta?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const focus = drivers.find((d) => d.id === focusDriverId) ?? drivers[0];
  return (
    <div className="map-shell relative overflow-hidden rounded-[28px]" style={{ height }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 340" preserveAspectRatio="xMidYMid slice">
        <defs>
          {ROADS.map((d, i) => (
            <path key={i} id={`${uid}-road-${i}`} d={d} />
          ))}
          <linearGradient id="route" x1="0" x2="1">
            <stop stopColor="#2f6bff" />
            <stop offset="1" stopColor="#3ee0c8" />
          </linearGradient>
          <filter id="soft">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
        {ROADS.map((d, i) => (
          <path key={d} d={d} fill="none" stroke="rgba(120,160,220,0.18)" strokeWidth="10" />
        ))}
        {ROADS.map((d, i) => (
          <path
            key={`c${i}`}
            d={d}
            fill="none"
            stroke="rgba(47,107,255,0.35)"
            strokeWidth="1.4"
            strokeDasharray="6 10"
            className="dash-flow"
          />
        ))}
        {mode !== "fleet" && (
          <path
            d={ROADS[0]}
            fill="none"
            stroke="url(#route)"
            strokeWidth="3.2"
            className="draw-route"
          />
        )}
        <circle cx="92" cy="248" r="7" fill="#2f6bff" />
        <circle cx="412" cy="96" r="7" fill="#3ee0c8" />
        {CARS.filter((c) => mode === "fleet" || c.driver === focus.id).map((c, i) => (
          <g key={i}>
            <circle r="7" fill={c.color} filter="url(#soft)">
              <animateMotion dur={c.dur} begin={c.delay} repeatCount="indefinite">
                <mpath href={`#${uid}-road-${c.path}`} />
              </animateMotion>
            </circle>
            <circle r="14" fill="none" stroke={c.color} strokeOpacity="0.35">
              <animate attributeName="r" values="8;18;8" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.4s" repeatCount="indefinite" />
              <animateMotion dur={c.dur} begin={c.delay} repeatCount="indefinite">
                <mpath href={`#${uid}-road-${c.path}`} />
              </animateMotion>
            </circle>
          </g>
        ))}
      </svg>

      <div className="absolute left-4 top-4 flex flex-col gap-2">
        <span className="elevated inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
          <span className="live-dot" />
          {mode === "fleet"
            ? loc(locale, "Taipei live · 18 units", "臺北即時 · 18 車")
            : loc(locale, "Live trip GPS", "即時行程 GPS")}
        </span>
        {eta && <span className="elevated rounded-xl px-3 py-2 text-xs">{eta}</span>}
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
        <div className="elevated flex items-center gap-3 rounded-2xl px-3 py-3">
          <div className="avatar">{focus.photo}</div>
          <div>
            <div className="label">{loc(locale, "Driver", "駕駛")} · {focus.plate}</div>
            <div className="display text-lg leading-tight">{focus.name}</div>
            <div className="text-xs text-[var(--muted)]">★ {focus.rating} · {focus.vehicle}</div>
          </div>
        </div>
        <div className="elevated max-w-[240px] rounded-2xl px-3 py-3 text-left text-xs">
          <div className="label">{pickup || loc(locale, "Pickup → drop", "上車 → 下車")}</div>
          <div>{dropoff || "Taipei 101"}</div>
        </div>
      </div>
    </div>
  );
}
