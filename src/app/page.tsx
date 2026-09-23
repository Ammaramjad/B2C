"use client";

import { useRouter } from "next/navigation";
import { services } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Chip } from "@/components/ui";
import type { ServiceType } from "@/lib/types";

export default function HomePage() {
  const { locale, setDraft, recent, pushRecent, draft } = useStore();
  const router = useRouter();
  const zh = locale === "zh";

  function go(id: ServiceType) {
    setDraft({ service: id, channel: id === "instant" ? "taxi" : "web" });
    pushRecent(id);
    router.push(id === "instant" ? "/instant" : id === "hourly" ? "/planner" : "/book");
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px]">
        <LiveMap locale={locale} mode="fleet" height={520} pickup={draft.pickup} dropoff={draft.dropoff} eta={zh ? "45 分免費等候" : "45-min free wait"} />
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-8">
          <div className="elevated mx-auto max-w-xl space-y-4 rounded-[24px] p-5">
            <Chip tone="ai">{loc(locale, "Ask AI · Plan my trip", "問 AI · 規劃行程")}</Chip>
            <h1 className="display text-4xl md:text-5xl">{loc(locale, "Where are you going?", "要去哪裡？")}</h1>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                router.push("/book");
              }}
            >
              <input
                aria-label={loc(locale, "Destination", "目的地")}
                value={draft.dropoff}
                onChange={(e) => setDraft({ dropoff: e.target.value })}
                placeholder={zh ? "台北 101、桃園機場…" : "Taipei 101, TPE…"}
              />
              <Btn type="submit">{loc(locale, "Continue", "繼續")}</Btn>
              <Btn kind="ghost" href="/customer">{loc(locale, "Customer dashboard", "旅客後台")}</Btn>
            </form>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button key={s.id} onClick={() => go(s.id)} className="rounded-xl hairline px-3 py-2 text-sm text-[var(--muted)]">
                  {zh ? s.zh : s.en}
                </button>
              ))}
            </div>
            {recent.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                {recent.map((r) => (
                  <button key={r} onClick={() => go(r as ServiceType)}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
