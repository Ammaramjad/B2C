"use client";

import { useRouter } from "next/navigation";
import { rentals } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn } from "@/components/ui";

export default function RentalPage() {
  const { locale, setDraft } = useStore();
  const router = useRouter();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Self-drive rental", "租車自駕")}</h1>
      <p className="text-[var(--muted)]">{loc(locale, "1–14 days. One-way + insurance extras. No chauffeur.", "1–14 天。甲租乙還＋保險加購。無司機。")}</p>
      {rentals.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-4">
          <div>
            <div className="display text-2xl">{r.name}</div>
            <p className="text-sm text-[var(--muted)]">{locale === "zh" ? r.nameZh : r.name} · {r.seats} seats</p>
          </div>
          <div className="text-right">
            <div className="metric">{money(r.day, "TWD")}/{locale === "zh" ? "日" : "day"}</div>
            <Btn
              className="mt-2"
              onClick={() => {
                setDraft({ service: "rental", vehicle: r.id, days: 2, extras: ["insurance"] });
                router.push("/book");
              }}
            >
              {loc(locale, "Select", "選擇")}
            </Btn>
          </div>
        </div>
      ))}
    </div>
  );
}
