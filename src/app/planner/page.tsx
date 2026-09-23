"use client";

import { attractions } from "@/lib/data";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Field, Panel } from "@/components/ui";
import { useState } from "react";

export default function PlannerPage() {
  const { itinerary, setItinerary, planFromPrompt, currency, setDraft, locale } = useStore();
  const [prompt, setPrompt] = useState("a three-day, two-night family trip to Taipei");
  const items = itinerary
    .map((id) => attractions.find((a) => a.id === id))
    .filter(Boolean) as typeof attractions;
  const hours = items.reduce((s, a) => s + a.hours, 0);
  const tickets = items.reduce((s, a) => s + a.cost, 0);
  const vehicle = 4200 + Math.round(hours * 280);

  function move(i: number, dir: -1 | 1) {
    const next = [...itinerary];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItinerary(next);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <h1 className="display text-4xl">AI itinerary forge</h1>
        <p className="text-white/55">
          Natural language in. Drag-order attractions. Halo never auto-books — you seal the orbit.
        </p>
        <Panel className="space-y-3">
          <Field label="Speak the trip">
            <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </Field>
          <Btn onClick={() => planFromPrompt(prompt)}>Generate constellation</Btn>
        </Panel>
        <div className="space-y-3">
          {items.map((a, i) => (
            <Panel key={a.id} className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">0{i + 1}</div>
                <div className="display text-xl">{locale === "zh" ? a.nameZh : a.name}</div>
                <div className="text-xs text-white/50">
                  {a.hours}h · tickets {money(convert(a.cost, currency), currency)}
                </div>
              </div>
              <div className="flex gap-2">
                <Btn kind="ghost" onClick={() => move(i, -1)}>↑</Btn>
                <Btn kind="ghost" onClick={() => move(i, 1)}>↓</Btn>
                <Btn kind="ghost" onClick={() => setItinerary(itinerary.filter((x) => x !== a.id))}>
                  Drop
                </Btn>
              </div>
            </Panel>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {attractions
            .filter((a) => !itinerary.includes(a.id))
            .map((a) => (
              <button
                key={a.id}
                onClick={() => setItinerary([...itinerary, a.id])}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60"
              >
                + {a.name}
              </button>
            ))}
        </div>
      </div>
      <aside className="space-y-4">
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Budget pulse</div>
          <div className="mt-3 space-y-2 text-sm text-white/65">
            <div className="flex justify-between">
              <span>Vessel / charter</span>
              <span>{money(convert(vehicle, currency), currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tickets</span>
              <span>{money(convert(tickets, currency), currency)}</span>
            </div>
            <div className="flex justify-between display text-xl text-white">
              <span>Day orbit</span>
              <span>{money(convert(vehicle + tickets, currency), currency)}</span>
            </div>
          </div>
          <Btn
            className="mt-5 w-full"
            onClick={() => {
              setDraft({
                service: "charter",
                pickup: items[0]?.name ?? "Taipei",
                dropoff: items.at(-1)?.name ?? "Hotel",
                hours: Math.max(4, Math.round(hours)),
              });
            }}
            href="/book"
          >
            Convert to charter booking
          </Btn>
        </Panel>
      </aside>
    </div>
  );
}
