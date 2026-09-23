"use client";

import Link from "next/link";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Panel } from "@/components/ui";

export default function LivePage() {
  const { locale, bookings } = useStore();
  const live = bookings.filter((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status));
  return (
    <div className="space-y-5">
      <h1 className="display text-4xl">{loc(locale, "Live marketplace", "即時運力看板")}</h1>
      <LiveMap locale={locale} mode="fleet" height={440} pickup={loc(locale, "WebSocket GPS · 10s", "WebSocket GPS · 10 秒")} dropoff={`${live.length} live`} />
      <div className="grid gap-3 md:grid-cols-2">
        {drivers.map((d) => (
          <Panel key={d.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="avatar">{d.photo}</div>
              <div>
                <div className="display text-xl">{d.name}</div>
                <div className="text-xs text-white/50">
                  {d.plate} · {d.vehicle} · ★ {d.rating} · fleet {d.fleet}
                </div>
              </div>
            </div>
            <span className={`glass-chip ${d.work === "available" ? "lime" : ""}`}>{d.work}</span>
          </Panel>
        ))}
      </div>
      <div className="space-y-2">
        {live.map((b) => (
          <Link key={b.id} href={`/trips/${b.id}`}>
            <Panel>
              {b.id} · {b.status} · {b.pickup} → {b.dropoff}
            </Panel>
          </Link>
        ))}
      </div>
      <Panel>
        <p className="text-sm text-white/65">
          {loc(
            locale,
            "Web live map = browser + HTTPS + GPS pings. Driver phone/PWA sends lat/lng; this page animates cars on the HUD. Admin can switch OSRM / HERE / Google for real roads.",
            "網頁即時地圖＝瀏覽器＋HTTPS＋GPS 點位。司機手機／PWA 傳經緯度，本頁在 HUD 上動畫車輛。後台可切 OSRM／HERE／Google 真實路網。",
          )}
        </p>
      </Panel>
    </div>
  );
}
