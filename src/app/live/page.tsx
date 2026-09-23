"use client";

import Link from "next/link";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Empty } from "@/components/ui";

export default function LivePage() {
  const { locale, bookings } = useStore();
  const live = bookings.filter((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status));
  const active = live[0];
  if (!active) {
    return (
      <Empty
        title={loc(locale, "No live trip", "沒有進行中行程")}
        body={loc(locale, "When a ride is active, this tab becomes the map.", "行程開始後，這裡會變成地圖。")}
        action={<Btn href="/book">{loc(locale, "Book", "預訂")}</Btn>}
      />
    );
  }
  return (
    <div className="space-y-4">
      <LiveMap locale={locale} mode="trip" height={480} focusDriverId={active.driverId} pickup={active.pickup} dropoff={active.dropoff} />
      <Link href={`/trips/${active.id}`} className="block">
        <div className="display text-2xl">{active.pickup} → {active.dropoff}</div>
        <div className="text-sm text-[var(--muted)]">{active.status} · {active.id}</div>
      </Link>
    </div>
  );
}
