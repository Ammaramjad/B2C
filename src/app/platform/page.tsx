"use client";

import Link from "next/link";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const blocks = [
  { href: "/", title: "Customer", titleZh: "乘客", items: "Search · Quote · Book · Pay · Track · Cancel · SOS · Loyalty · Planner" },
  { href: "/me", title: "Passenger panel", titleZh: "會員中心", items: "Signup · Bookings · Saved cars · Wallet · Support" },
  { href: "/driver", title: "Driver", titleZh: "司機", items: "Online · Grab · OTP · Nav · Earnings · Settlement · Docs" },
  { href: "/ops", title: "Operations", titleZh: "調度", items: "Live map · Assign · Incidents · Flights · Queue" },
  { href: "/admin", title: "Admin", titleZh: "管理", items: "RBAC · Pricing rules · Audit · Policies · Analytics" },
  { href: "/cars", title: "Car marketplace", titleZh: "專車商城", items: "Taiwan transfers only — no hotels" },
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
