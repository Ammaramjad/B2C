"use client";

import { useRouter } from "next/navigation";
import { taxis } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn } from "@/components/ui";

export default function InstantPage() {
  const { locale, setDraft, placeBooking } = useStore();
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Taxi now", "即時計程車")}</h1>
      <LiveMap locale={locale} mode="fleet" height={320} />
      <div className="space-y-3">
        {taxis.map((t) => (
          <div key={t.id} className="flex items-center justify-between">
            <div>
              <div className="display text-2xl">{t.name}</div>
              <div className="text-sm text-[var(--muted)]">{locale === "zh" ? t.nameZh : t.name} · {t.eta} min</div>
            </div>
            <div className="text-right">
              <div className="metric">{money(t.base, "TWD")}</div>
              <Btn
                className="mt-2"
                onClick={() => {
                  setDraft({ service: "instant", vehicle: t.id, channel: "taxi", extras: [] });
                  router.push(`/trips/${placeBooking().id}/success`);
                }}
              >
                {loc(locale, "Hail", "叫車")}
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
