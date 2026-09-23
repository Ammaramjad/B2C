"use client";

import Link from "next/link";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const blocks = [
  { href: "/", title: "Home", titleZh: "首頁", items: "Search · services · routes · cars · cities · extras · reviews" },
  { href: "/cars", title: "Marketplace", titleZh: "商城", items: "Filters · save · product pages" },
  { href: "/airports", title: "Airports", titleZh: "機場", items: "TPE TSA RMQ KHH" },
  { href: "/routes", title: "Routes", titleZh: "路線", items: "Airport ↔ city" },
  { href: "/charter", title: "Charter", titleZh: "包車", items: "4–12h · 880×h" },
  { href: "/rental", title: "Rental", titleZh: "租車", items: "Yaris · Cross · Sienta" },
  { href: "/instant", title: "Taxi", titleZh: "計程", items: "Taxi Plus XL Black" },
  { href: "/me", title: "Passenger panel", titleZh: "會員", items: "Signup · bookings · wallet" },
  { href: "/driver", title: "Driver", titleZh: "司機", items: "Duty · grab · earnings" },
  { href: "/ops", title: "Operations", titleZh: "調度", items: "Map · assign · SOS" },
  { href: "/admin", title: "Admin", titleZh: "管理", items: "Rules · RBAC · audit" },
];

export default function PlatformPage() {
  const { locale } = useStore();
  return (
    <div className="space-y-8">
      <h1 className="display text-5xl">{loc(locale, "Four environments", "四個環境")}</h1>
      <p className="max-w-2xl text-[var(--muted)]">
        {loc(locale, "Every control writes the domain store and audit log. Production DB/payments are the next engineering phase.", "每個操作寫入領域狀態與稽核。正式資料庫／金流屬下一階段。")}
      </p>
      <div className="stagger grid gap-6 md:grid-cols-2">
        {blocks.map((b) => (
          <Link key={b.href} href={b.href} className="block rounded-[20px] hairline p-5">
            <div className="display text-2xl">{locale === "zh" ? b.titleZh : b.title}</div>
            <p className="mt-2 text-sm text-[var(--muted)]">{b.items}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
