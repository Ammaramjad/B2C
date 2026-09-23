export function AtlasMap({
  pickup = "TPE T1",
  dropoff = "Taipei 101",
  eta,
  live,
  height = 360,
  markers = [],
}: {
  pickup?: string;
  dropoff?: string;
  eta?: string;
  live?: boolean;
  height?: number;
  markers?: { x: number; y: number; kind: "free" | "busy" | "enroute" | "off" | "sos" | "car" | "pin" }[];
}) {
  const defaults = markers.length
    ? markers
    : [
        { x: 18, y: 62, kind: "pin" as const },
        { x: 74, y: 28, kind: "pin" as const },
        { x: 42, y: 46, kind: "car" as const },
      ];

  return (
    <div className="map-atlas relative overflow-hidden" style={{ minHeight: height }}>
      <svg viewBox="0 0 800 460" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="800" height="460" fill="var(--map-land)" />
        <path d="M0 210 C 80 180, 140 230, 220 200 C 320 160, 360 240, 460 210 C 560 180, 640 230, 800 190 L 800 460 L 0 460 Z" fill="var(--map-water)" opacity="0.55" />
        <path d="M-10 90 C 90 70, 160 120, 250 80 C 340 40, 410 110, 520 70" fill="none" stroke="var(--map-road)" strokeWidth="1.2" opacity="0.35" />
        <path d="M20 400 C 180 360, 260 420, 420 380 S 660 400, 820 340" fill="none" stroke="var(--map-road)" strokeWidth="2" opacity="0.4" />
        <path d="M60 40 L 90 110 L 160 150 L 210 240 L 300 280 L 390 260 L 480 300" fill="none" stroke="var(--map-road)" strokeWidth="1.1" opacity="0.35" />
        <path d="M500 40 L 560 120 L 640 160 L 720 240" fill="none" stroke="var(--map-road)" strokeWidth="1.1" opacity="0.35" />
        <circle cx="210" cy="250" r="54" fill="none" stroke="var(--rule)" opacity="0.7" />
        <circle cx="610" cy="150" r="34" fill="none" stroke="var(--rule)" opacity="0.7" />
        <path d="M140 340 C 240 300, 320 280, 410 250 C 500 220, 600 170, 710 120" fill="none" stroke="var(--map-route)" strokeWidth="3.2" strokeDasharray="9 7" />
        <text x="48" y="48" fill="var(--mute)" fontSize="11" letterSpacing="1.6">
          TAIPEI BASIN
        </text>
        <text x="560" y="88" fill="var(--mute)" fontSize="11" letterSpacing="1.6">
          XINYI
        </text>
        <text x="92" y="368" fill="var(--mute)" fontSize="11" letterSpacing="1.6">
          TPE
        </text>
      </svg>
      {defaults.map((m, i) => (
        <span key={`${m.kind}-${i}`} className="absolute" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
          <span
            className="block h-3.5 w-3.5 rotate-45 border"
            style={{
              background:
                m.kind === "free"
                  ? "var(--pine)"
                  : m.kind === "busy"
                    ? "var(--brass)"
                    : m.kind === "enroute"
                      ? "var(--copper)"
                      : m.kind === "sos"
                        ? "var(--alert)"
                        : m.kind === "off"
                          ? "var(--mute)"
                          : "var(--ink)",
              borderColor: "var(--paper-2)",
            }}
          />
        </span>
      ))}
      <div className="absolute left-3 top-3 flex gap-2">
        <div className="ticket px-3 py-2 text-xs">
          <div className="kicker">Pickup</div>
          <div className="font-semibold">{pickup}</div>
        </div>
        <div className="ticket px-3 py-2 text-xs">
          <div className="kicker">Drop</div>
          <div className="font-semibold">{dropoff}</div>
        </div>
      </div>
      <div className="absolute bottom-3 left-3 ticket px-2 py-1 text-[10px] tracking-[0.18em]">N</div>
      <div className="absolute bottom-3 right-3 ticket px-3 py-2 text-xs">
        <div className="kicker">{live ? "Live ETA" : "Route"}</div>
        <div className="metric text-lg">{eta ?? "38 min"}</div>
      </div>
    </div>
  );
}
