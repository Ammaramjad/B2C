"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { airports, popularRoutes } from "@/lib/routes";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn } from "@/components/ui";

export default function AirportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const a = airports.find((x) => x.id === id) ?? airports[0];
  const { locale, setDraft } = useStore();
  const router = useRouter();
  const rows = popularRoutes.filter((r) => r.from.includes(a.code) || r.to.includes(a.code) || r.from.includes(a.city));
  return (
    <div className="space-y-6">
      <h1 className="display text-5xl">{a.code} · {locale === "zh" ? a.nameZh : a.name}</h1>
      <LiveMap locale={locale} mode="trip" height={320} pickup={a.code} dropoff={a.city} eta={`${a.wait} min wait`} />
      <p className="text-[var(--muted)]">{loc(locale, "Flight-aware pickup. 45-min default wait is admin-configurable.", "航班感知接機。預設等候後台可調。")}</p>
      {rows.map((r) => (
        <button
          key={r.id}
          className="block text-left"
          onClick={() => {
            setDraft({ pickup: r.from, dropoff: r.to, service: r.service, extras: ["meet"] });
            router.push("/book");
          }}
        >
          {locale === "zh" ? `${r.fromZh} → ${r.toZh}` : `${r.from} → ${r.to}`} · {money(r.price, "TWD")}
        </button>
      ))}
      <Btn
        onClick={() => {
          setDraft({ service: "airport_pickup", pickup: `${a.code} arrivals`, extras: ["meet"] });
          router.push("/book");
        }}
      >
        {loc(locale, "Book pickup", "預訂接機")}
      </Btn>
    </div>
  );
}
