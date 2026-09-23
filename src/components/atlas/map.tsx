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
        <path d="M40 300 C 140 240, 180 340, 280 280 S 420 200, 520 240 S 700 180, 760 210" fill="none" stroke="var(--map-water)" strokeWidth="46" />
        <path d="M0 380 C 160 360, 240 400, 400 370 S 640 390, 800 350" fill="none" stroke="var(--map-road)" strokeWidth="2" opacity="0.45" />
        <path d="M80 80 L 220 160 L 340 120 L 520 200 L 680 90" fill="none" stroke="var(--map-road)" strokeWidth="1.4" opacity="0.4" />
        <path d="M120 360 L 210 300 L 380 250 L 590 160 L 720 120" fill="none" stroke="var(--map-route)" strokeWidth="3.5" strokeDasharray="10 8" />
        <circle cx="150" cy="330" r="46" fill="none" stroke="var(--rule)" />
        <circle cx="610" cy="140" r="28" fill="none" stroke="var(--rule)" />
      </svg>
      {defaults.map((m, i) => (
        <span
          key={`${m.kind}-${i}`}
          className="absolute grid h-3.5 w-3.5 place-items-center"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
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
      <div className="absolute bottom-3 right-3 ticket px-3 py-2 text-xs">
        <div className="kicker">{live ? "Live ETA" : "Route"}</div>
        <div className="metric text-lg">{eta ?? "38 min"}</div>
      </div>
    </div>
  );
}
