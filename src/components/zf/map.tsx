"use client";

export type MapMarker = {
  id: string;
  x: number;
  y: number;
  kind: "available" | "busy" | "enroute" | "offline" | "exception" | "pickup" | "drop";
  label: string;
};

export function AtlasMap({
  markers = [],
  selected,
  onSelect,
  showRoute = false,
  tall = false,
  unavailable = false,
}: {
  markers?: MapMarker[];
  selected?: string;
  onSelect?: (id: string) => void;
  showRoute?: boolean;
  tall?: boolean;
  unavailable?: boolean;
}) {
  return (
    <div className="zf-map" style={{ minHeight: tall ? 480 : 260 }} role="img" aria-label="Northern Taiwan operating map">
      {unavailable ? (
        <div className="zf-empty">
          <p className="zf-kicker">Map</p>
          <h2>Map unavailable</h2>
          <p>The tile service did not respond. Addresses, flight status, and dispatch actions still work.</p>
        </div>
      ) : (
        <svg viewBox="0 0 800 560" aria-hidden="true">
          <rect width="800" height="560" fill="var(--map-water)" />
          <path d="M210 40 C280 20 360 70 390 120 C430 180 470 160 520 210 C560 250 610 300 590 360 C560 450 500 500 430 520 C340 548 250 500 220 430 C160 340 120 250 150 160 C170 100 180 60 210 40Z" fill="var(--map-land)" />
          <path d="M250 180 C300 170 340 210 330 250 C310 290 260 280 250 180Z" fill="var(--map-park)" />
          <path d="M180 300 C260 280 340 320 430 300 C500 286 560 320 600 340" fill="none" stroke="var(--map-road)" strokeWidth="3" />
          <path d="M240 220 C300 250 360 240 420 280 C470 310 520 360 560 420" fill="none" stroke="var(--map-road)" strokeWidth="2" />
          <path d="M300 140 L340 210 L390 190 L450 240" fill="none" stroke="var(--map-road)" strokeWidth="2" />
          {showRoute && (
            <path d="M168 248 C240 230 300 210 360 236 C420 262 470 250 520 210" fill="none" stroke="var(--pine)" strokeWidth="3" />
          )}
          <text x="150" y="250" fill="var(--ink-3)" fontSize="12">TPE</text>
          <text x="500" y="200" fill="var(--ink-3)" fontSize="12">Taipei</text>
        </svg>
      )}
      {!unavailable &&
        markers.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`zf-pin zf-pin-${m.kind}`}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            data-on={selected === m.id}
            aria-label={m.label}
            onClick={() => onSelect?.(m.id)}
          />
        ))}
    </div>
  );
}

export const fleetMarkers: MapMarker[] = [
  { id: "d1", x: 28, y: 42, kind: "enroute", label: "Kenji Mori, en route to TPE" },
  { id: "d2", x: 62, y: 36, kind: "busy", label: "Aisha Rahman, on trip" },
  { id: "d3", x: 54, y: 48, kind: "available", label: "Wei Chen, available" },
  { id: "d4", x: 58, y: 40, kind: "busy", label: "Lin Yu-ting, on trip" },
  { id: "d5", x: 46, y: 70, kind: "offline", label: "Hsu Cheng, offline" },
  { id: "d6", x: 70, y: 78, kind: "available", label: "Mina Park, available in Kaohsiung" },
  { id: "sos", x: 66, y: 34, kind: "exception", label: "Safety incident SOS-204" },
];
