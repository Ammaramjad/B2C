"use client";

import { loc } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

type Marker = { x: number; y: number; label: string; kind: "pickup" | "drop" | "driver" | "job" };

export function OpsMap({
  locale,
  height = 420,
  pickup,
  dropoff,
  eta,
  markers,
  caption,
}: {
  locale: Locale;
  height?: number;
  pickup?: string;
  dropoff?: string;
  eta?: string;
  markers?: Marker[];
  caption?: string;
}) {
  const pins: Marker[] = markers ?? [
    { x: 118, y: 248, label: pickup || "TPE T1", kind: "pickup" },
    { x: 392, y: 92, label: dropoff || "Taipei 101", kind: "drop" },
    { x: 210, y: 168, label: "d1", kind: "driver" },
  ];
  return (
    <div className="relative overflow-hidden rounded-[16px] hairline" style={{ height, background: "var(--map-land)" }} aria-label={loc(locale, "Operational map (development fallback)", "營運地圖（開發後備）")}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 340" role="img">
        <rect width="560" height="340" fill="var(--map-land)" />
        <path d="M0 40 C 80 80, 140 10, 240 50 S 400 20, 560 70 V 0 H 0 Z" fill="var(--map-water)" opacity="0.55" />
        <path d="M0 300 C 120 260, 220 320, 340 270 S 480 310, 560 280 V 340 H 0 Z" fill="var(--map-water)" opacity="0.35" />
        <path d="M70 250 C 160 210, 210 170, 300 140 S 400 90, 460 80" fill="none" stroke="var(--border)" strokeWidth="10" />
        <path d="M70 250 C 160 210, 210 170, 300 140 S 400 90, 460 80" fill="none" stroke="var(--map-route)" strokeWidth="2.4" />
        <text x="86" y="300" fill="var(--text-secondary)" fontSize="11">TPE</text>
        <text x="430" y="48" fill="var(--text-secondary)" fontSize="11">Xinyi</text>
        <text x="250" y="210" fill="var(--text-secondary)" fontSize="11">Taoyuan–Taipei</text>
        {pins.map((m) => (
          <g key={`${m.kind}-${m.label}-${m.x}`}>
            <circle cx={m.x} cy={m.y} r={m.kind === "driver" ? 6 : 7} fill={m.kind === "drop" ? "var(--warning)" : "var(--brand)"} />
            <text x={m.x + 10} y={m.y + 4} fill="var(--text)" fontSize="11">
              {m.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute left-3 top-3 max-w-[70%] bg-[var(--surface)]/90 px-3 py-2 text-xs text-[var(--text-secondary)]">
        {caption || loc(locale, "Map adapter · demo geometry, not live GPS", "地圖轉接器 · 示範幾何，非即時 GPS")}
        {eta ? ` · ${eta}` : ""}
      </div>
    </div>
  );
}
