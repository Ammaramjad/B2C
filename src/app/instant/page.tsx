"use client";

import { useRouter } from "next/navigation";
import { taxis } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Panel } from "@/components/ui";

export default function InstantPage() {
  const { locale, setDraft, placeBooking } = useStore();
  const router = useRouter();
  const zh = locale === "zh";
  return (
    <div className="space-y-5">
      <h1 className="display text-4xl">{loc(locale, "Instant taxi", "即時計程車")}</h1>
      <LiveMap locale={locale} mode="fleet" height={360} pickup={zh ? "附近運力" : "Nearby supply"} dropoff={zh ? "自動派單" : "Auto dispatch"} />
      <div className="grid gap-3 md:grid-cols-2">
        {taxis.map((t) => (
          <Panel key={t.id} className="flex items-center justify-between">
            <div>
              <div className="display text-2xl">{t.name}</div>
              <div className="text-sm text-white/55">{zh ? t.nameZh : t.name} · ETA {t.eta} min</div>
            </div>
            <div className="text-right">
              <div className="display text-xl">{money(t.base, "TWD")}</div>
              <Btn
                className="mt-2"
                onClick={() => {
                  setDraft({ service: "instant", vehicle: t.id, channel: "taxi", extras: [] });
                  router.push(`/trips/${placeBooking().id}`);
                }}
              >
                {zh ? "一鍵叫車" : "Hail now"}
              </Btn>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
