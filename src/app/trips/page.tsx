"use client";

import Link from "next/link";
import { useState } from "react";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Panel } from "@/components/ui";

const tabs = ["all", "upcoming", "live", "completed", "cancelled"] as const;

export default function TripsPage() {
  const { bookings, currency, locale } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("all");
  const live = ["assigned", "accepted", "arriving", "onboard"];
  const rows = bookings.filter((b) => {
    if (tab === "all") return true;
    if (tab === "completed") return b.status === "completed";
    if (tab === "cancelled") return b.status === "cancelled";
    if (tab === "live") return live.includes(b.status);
    return !["completed", "cancelled"].includes(b.status);
  });
  return (
    <div className="space-y-5">
      <h1 className="display text-4xl">{loc(locale, "My orders", "我的訂單")}</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((x) => (
          <button key={x} onClick={() => setTab(x)} className={`rounded-full px-3 py-1 text-xs uppercase ${tab === x ? "bg-cyan-300 text-[#070014]" : "bg-white/8"}`}>
            {x}
          </button>
        ))}
      </div>
      {rows.map((b) => (
        <Link key={b.id} href={`/trips/${b.id}`}>
          <Panel className="mb-3 flex justify-between">
            <div>
              <div className="text-[11px] uppercase text-white/40">{b.id} · {b.service} · {b.status} · {b.channel}</div>
              <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
            </div>
            <div className="text-right">
              <div>{money(convert(b.price, currency), currency)}</div>
              <div className="text-xs text-white/40">OTP {b.otp}</div>
            </div>
          </Panel>
        </Link>
      ))}
    </div>
  );
}
