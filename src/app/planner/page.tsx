"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { attractions } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Alert, Button, Field } from "@/components/system";

export default function PlannerPage() {
  const { locale, setDraft } = useStore();
  const router = useRouter();
  const [prompt, setPrompt] = useState("3-day family trip in Taipei for 5 people");
  const [days, setDays] = useState(() => [attractions.slice(0, 2), attractions.slice(2, 4)]);
  const zh = locale === "zh";

  const budget = useMemo(() => {
    const spots = days.flat();
    const hours = spots.reduce((s, a) => s + a.hours, 0);
    const spend = spots.reduce((s, a) => s + a.cost, 0);
    const transport = 2280 + Math.round(hours * 180);
    return { spend, transport, hours, vehicle: "MPV / Alphard" };
  }, [days]);

  function move(di: number, i: number, dir: -1 | 1) {
    setDays((all) => {
      const copy = all.map((d) => [...d]);
      const j = i + dir;
      if (j < 0 || j >= copy[di].length) return all;
      const t = copy[di][i];
      copy[di][i] = copy[di][j];
      copy[di][j] = t;
      return copy;
    });
  }

  function remove(di: number, i: number) {
    setDays((all) => all.map((d, idx) => (idx === di ? d.filter((_, j) => j !== i) : d)));
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="label">{loc(locale, "AI itinerary", "AI 行程")}</p>
        <h1 className="display text-4xl">{loc(locale, "Plan, then confirm transport.", "先規劃，再確認交通。")}</h1>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          {loc(locale, "AI recommends a sequence. It does not purchase rides. Demo attractions are catalog data.", "AI 只建議順序，不會自動購買交通。景點為目錄示範資料。")}
        </p>
      </div>
      <Field label={loc(locale, "Ask", "提問")}>
        <textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </Field>
      <div className="grid gap-8 md:grid-cols-2">
        {days.map((day, di) => (
          <section key={di}>
            <h2 className="display text-2xl">{loc(locale, `Day ${di + 1}`, `第 ${di + 1} 天`)}</h2>
            <ol className="mt-4 space-y-3">
              {day.map((a, i) => (
                <li key={a.id} className="flex items-start justify-between gap-3 border-b border-[var(--border)] py-3">
                  <div>
                    <div className="font-semibold">{zh ? a.nameZh : a.name}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{a.hours}h · {money(a.cost, "TWD")}</div>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button onClick={() => move(di, i, -1)} disabled={i === 0}>{loc(locale, "Up", "上")}</button>
                    <button onClick={() => move(di, i, 1)} disabled={i === day.length - 1}>{loc(locale, "Down", "下")}</button>
                    <button onClick={() => remove(di, i)}>{loc(locale, "Remove", "移除")}</button>
                  </div>
                </li>
              ))}
              {day.length === 0 && <li className="text-sm text-[var(--text-secondary)]">{loc(locale, "Empty day — add from catalog later.", "此日為空。")}</li>}
            </ol>
          </section>
        ))}
      </div>
      <div className="border-t border-[var(--border)] pt-4">
        <div className="label">{loc(locale, "Estimate", "估算")}</div>
        <p className="display text-2xl">{budget.vehicle}</p>
        <p className="text-[var(--text-secondary)]">
          {loc(locale, "Transport", "交通")} {money(budget.transport, "TWD")} · {loc(locale, "Activities", "活動")} {money(budget.spend, "TWD")} · {budget.hours}h
        </p>
      </div>
      <Alert tone="info">{loc(locale, "Recommendation only. Confirm a booking to create a canonical reservation.", "僅為建議。確認預訂後才會建立正式訂單。")}</Alert>
      <Button
        onClick={() => {
          setDraft({ service: "hourly", hours: 8, passengers: 5, luggage: 4, vehicle: "mpv", pickup: "Taipei hotel", dropoff: "Taipei loop" });
          router.push("/book");
        }}
      >
        {loc(locale, "Review transport booking", "檢視交通預訂")}
      </Button>
    </div>
  );
}
