"use client";

import { useRouter } from "next/navigation";
import { popularRoutes } from "@/lib/routes";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export default function RoutesPage() {
  const { locale, setDraft } = useStore();
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Popular routes", "熱門路線")}</h1>
      {popularRoutes.map((r) => (
        <button
          key={r.id}
          className="flex w-full justify-between border-b border-[var(--border)] py-4 text-left"
          onClick={() => {
            setDraft({ pickup: r.from, dropoff: r.to, service: r.service });
            router.push("/book");
          }}
        >
          <span className="display text-xl">{locale === "zh" ? `${r.fromZh} → ${r.toZh}` : `${r.from} → ${r.to}`}</span>
          <span>{r.mins} min · {money(r.price, "TWD")}</span>
        </button>
      ))}
    </div>
  );
}
