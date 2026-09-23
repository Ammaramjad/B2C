"use client";

import { useRouter } from "next/navigation";
import { services } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Button } from "@/components/system";
import { OpsMap } from "@/components/ops-map";
import type { ServiceType } from "@/lib/types";

export default function HomePage() {
  const { locale, setDraft, draft, bookings, user } = useStore();
  const router = useRouter();
  const zh = locale === "zh";
  const live = bookings.find((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status) && b.passengerId === (user?.id ?? "p1"));

  function start(id: ServiceType) {
    setDraft({
      service: id,
      channel: id === "instant" ? "taxi" : "web",
      vehicle: id === "instant" ? "taxi" : id === "rental" ? "yaris" : "sedan",
    });
    router.push("/book");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <p className="label">{loc(locale, "Zoufeng mobility", "走癲移動")}</p>
        <h1 className="display text-4xl md:text-6xl">{loc(locale, "Where are you going?", "要去哪裡？")}</h1>
        <p className="max-w-xl text-[var(--text-secondary)]">
          {loc(locale, "Airport, city, charter, taxi, or self-drive — one booking record, transparent NT$ fare.", "接機、市區、包車、計程車或自駕——同一筆訂單、新台幣透明報價。")}
        </p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/book");
          }}
        >
          <label className="block">
            <span className="label">{loc(locale, "Destination", "目的地")}</span>
            <input
              className="mt-2"
              value={draft.dropoff}
              onChange={(e) => setDraft({ dropoff: e.target.value })}
              placeholder={zh ? "台北 101、桃園機場…" : "Taipei 101, TPE Airport…"}
            />
          </label>
          <Button type="submit" className="w-full sm:w-auto">{loc(locale, "Plan this trip", "規劃這趟行程")}</Button>
        </form>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <button key={s.id} onClick={() => start(s.id)} className="focus-ring flex items-center justify-between border-b border-[var(--border)] py-3 text-left">
              <span>{zh ? s.zh : s.en}</span>
              <span className="text-sm text-[var(--text-secondary)]">{s.formula.includes("880") ? "4–12h" : s.id === "instant" ? "ETA" : "NT$"}</span>
            </button>
          ))}
        </div>
      </section>
      <aside className="space-y-4">
        <OpsMap locale={locale} height={320} pickup={draft.pickup} dropoff={draft.dropoff} />
        {live ? (
          <div className="border-t border-[var(--border)] pt-4">
            <div className="label">{loc(locale, "Active trip", "進行中行程")}</div>
            <p className="mt-1 display text-2xl">{live.pickup} → {live.dropoff}</p>
            <Button href={`/trips/${live.id}`} kind="ghost" className="mt-3">{loc(locale, "Open live trip", "開啟即時行程")}</Button>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">{loc(locale, "No live trip on this device.", "此裝置沒有進行中行程。")}</p>
        )}
      </aside>
    </div>
  );
}
