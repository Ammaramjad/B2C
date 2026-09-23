"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { attractions } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Chip } from "@/components/ui";

export default function PlannerPage() {
  const { locale, setDraft } = useStore();
  const router = useRouter();
  const [prompt, setPrompt] = useState("Plan a 3-day family trip to Taipei.");
  const [days, setDays] = useState([
    [attractions[0], attractions[3]],
    [attractions[2]],
    [attractions[1]],
  ]);
  const hours = days.flat().reduce((s, a) => s + (a?.hours ?? 0), 0);
  const cost = 880 * Math.max(4, Math.ceil(hours));

  function move(di: number, i: number, dir: -1 | 1) {
    const list = [...days[di]];
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const next = [...days];
    next[di] = list;
    setDays(next);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr_300px]">
      <aside className="space-y-3">
        <Chip tone="ai">{loc(locale, "Plan my trip", "規劃行程")}</Chip>
        <textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <p className="text-sm text-[var(--muted)]">{loc(locale, "Prototype itinerary — confirm before booking.", "原型行程 — 預訂前需確認。")}</p>
      </aside>
      <div className="space-y-6">
        {days.map((items, di) => (
          <section key={di}>
            <h2 className="display text-2xl">Day {di + 1}</h2>
            <ul className="mt-2 space-y-2">
              {items.map((a, i) =>
                a ? (
                  <li key={a.id} className="flex items-center justify-between gap-2">
                    <span>{locale === "zh" ? a.nameZh : a.name}</span>
                    <span className="flex gap-1 text-xs text-[var(--muted)]">
                      <button onClick={() => move(di, i, -1)}>↑</button>
                      <button onClick={() => move(di, i, 1)}>↓</button>
                      <button
                        onClick={() => {
                          const next = [...days];
                          next[di] = next[di].filter((_, x) => x !== i);
                          setDays(next);
                        }}
                      >
                        {loc(locale, "Remove", "移除")}
                      </button>
                    </span>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ))}
      </div>
      <aside className="space-y-4">
        <LiveMap locale={locale} mode="trip" height={220} pickup="Taipei" dropoff="Family loop" />
        <div>
          <div className="label">{loc(locale, "Transport estimate", "交通估算")}</div>
          <div className="display metric text-3xl">{money(cost, "TWD")}</div>
          <p className="text-sm text-[var(--muted)]">{Math.ceil(hours)} h charter · 880×h</p>
        </div>
        <Btn
          onClick={() => {
            setDraft({ service: "hourly", hours: Math.max(4, Math.ceil(hours)), vehicle: "mpv", dropoff: "Taipei itinerary" });
            router.push("/book");
          }}
        >
          {loc(locale, "Book transportation", "預訂交通")}
        </Btn>
      </aside>
    </div>
  );
}
