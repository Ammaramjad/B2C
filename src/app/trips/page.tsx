"use client";

import Link from "next/link";
import { useState } from "react";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Empty, Status } from "@/components/ui";

const tabs = ["upcoming", "live", "completed", "cancelled"] as const;

export default function TripsPage() {
  const { bookings, currency, locale } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("upcoming");
  const live = ["assigned", "accepted", "arriving", "onboard"];
  const rows = bookings.filter((b) => {
    if (tab === "completed") return b.status === "completed";
    if (tab === "cancelled") return b.status === "cancelled";
    if (tab === "live") return live.includes(b.status);
    return !["completed", "cancelled"].includes(b.status);
  });
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Trips", "行程")}</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((x) => (
          <button key={x} onClick={() => setTab(x)} className={`rounded-xl px-3 py-2 text-sm capitalize ${tab === x ? "bg-[var(--surface)]" : "text-[var(--muted)]"}`}>
            {x}
          </button>
        ))}
      </div>
      {rows.length === 0 && (
        <Empty title={loc(locale, "Nothing here", "目前沒有行程")} body={loc(locale, "Book a ride to see it on this timeline.", "預訂後會出現在時間軸。")} />
      )}
      <ol className="space-y-6 border-l border-[var(--border)] pl-5">
        {rows.map((b) => (
          <li key={b.id}>
            <Link href={`/trips/${b.id}`} className="block">
              <Status kind={live.includes(b.status) ? "active" : b.status}>{b.status}</Status>
              <div className="display mt-2 text-2xl">{b.pickup} → {b.dropoff}</div>
              <div className="text-sm text-[var(--muted)]">{b.id} · {money(convert(b.price, currency), currency)}</div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
