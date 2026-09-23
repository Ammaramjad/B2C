"use client";

export function AreaChart({
  values,
  label,
}: {
  values: number[];
  label?: string;
}) {
  const max = Math.max(...values, 1);
  const w = 320;
  const h = 88;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - (v / max) * (h - 8);
      return `${x},${y}`;
    })
    .join(" ");
  const fill = `0,${h} ${pts} ${w},${h}`;
  return (
    <div>
      {label && <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>}
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
        <polyline points={fill} fill="rgba(78,242,255,0.16)" />
        <polyline
          points={pts}
          fill="none"
          stroke="#4ef2ff"
          strokeWidth="2.4"
          className="chart-stroke"
        />
      </svg>
    </div>
  );
}

export function Bars({
  items,
}: {
  items: { name: string; value: number }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map((i, idx) => (
        <div key={i.name}>
          <div className="mb-1 flex justify-between text-[11px] text-white/50">
            <span>{i.name}</span>
            <span>{i.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="bar-fill h-full rounded-full bg-[linear-gradient(90deg,#4ef2ff,#b08cff,#ff4fd8)]"
              style={{ width: `${(i.value / max) * 100}%`, animationDelay: `${idx * 90}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
