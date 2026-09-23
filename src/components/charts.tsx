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
      {label && <div className="label mb-2">{label}</div>}
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
        <polyline points={fill} fill="rgba(47,107,255,0.16)" />
        <polyline
          points={pts}
          fill="none"
          stroke="#2f6bff"
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
          <div className="mb-1 flex justify-between text-[11px] text-[var(--muted)]">
            <span>{i.name}</span>
            <span>{i.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--muted)_16%,transparent)]">
            <div
              className="bar-fill h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${(i.value / max) * 100}%`, animationDelay: `${idx * 90}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
