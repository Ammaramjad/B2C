"use client";

import { kpis } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Alert } from "@/components/system";
import { AreaChart, Bars } from "@/components/charts";

export default function AnalyticsPage() {
  const { locale, bookings } = useStore();
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  return (
    <div className="space-y-8">
      <div>
        <p className="label">{loc(locale, "Executive view", "經營檢視")}</p>
        <h1 className="display text-4xl">{loc(locale, "Analytics overview", "分析總覽")}</h1>
      </div>
      <Alert tone="info">{loc(locale, "Charts use labeled demo/seed data, not a production warehouse.", "圖表為標示過的示範／種子資料，非正式數倉。")}</Alert>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.slice(0, 4).map((k) => (
          <div key={k.key}>
            <div className="label">{locale === "zh" ? k.labelZh : k.label}</div>
            <div className="metric mt-1 text-3xl">{"twd" in k && k.twd ? money(k.twd, "TWD") : k.value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="display text-2xl">{loc(locale, "Booking trend (demo)", "訂單趨勢（示範）")}</h2>
          <AreaChart values={[18, 22, 19, 31, 28, 24, 27]} label={loc(locale, "Daily bookings", "每日訂單")} />
        </section>
        <section>
          <h2 className="display text-2xl">{loc(locale, "Service mix (demo)", "服務組合（示範）")}</h2>
          <Bars items={[{ name: "Airport", value: 42 }, { name: "P2P", value: 28 }, { name: "Hourly", value: 14 }, { name: "Taxi", value: 11 }, { name: "Rental", value: 5 }]} />
        </section>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        {loc(locale, "This device", "此裝置")} · {loc(locale, "completed", "完成")} {completed} · {loc(locale, "cancelled", "取消")} {cancelled}
      </p>
    </div>
  );
}
