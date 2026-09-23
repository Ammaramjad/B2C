"use client";

import { useRouter } from "next/navigation";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn } from "@/components/ui";

const packs = [
  { h: 4, en: "Half day", zh: "半天" },
  { h: 8, en: "Full day", zh: "一天" },
  { h: 10, en: "Long day", zh: "長天" },
  { h: 12, en: "Max", zh: "上限" },
];

export default function CharterPage() {
  const { locale, setDraft } = useStore();
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Hourly charter", "計時包車")}</h1>
      <p className="text-[var(--muted)]">{loc(locale, "880 × hours. Extra stops, parking, tolls shown separately.", "880×小時。加停、停車、過路費另計。")}</p>
      <div className="stagger grid gap-4 md:grid-cols-4">
        {packs.map((p) => (
          <button
            key={p.h}
            className="text-left"
            onClick={() => {
              setDraft({ service: "hourly", hours: p.h, vehicle: "mpv" });
              router.push("/book");
            }}
          >
            <div className="display text-3xl">{locale === "zh" ? p.zh : p.en}</div>
            <div className="metric">{p.h} h · {money(880 * p.h, "TWD")}</div>
          </button>
        ))}
      </div>
      <Btn href="/planner">{loc(locale, "Open AI itinerary canvas", "開啟 AI 行程畫布")}</Btn>
    </div>
  );
}
