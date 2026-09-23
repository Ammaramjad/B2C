"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    title: "Commerce",
    items: [
      ["/admin/pricing", "Pricing"],
      ["/admin/cancellation", "Cancellation"],
      ["/admin/promotions", "Promotions"],
    ],
  },
  {
    title: "Finance",
    items: [
      ["/admin/payments", "Payments"],
      ["/admin/refunds", "Refunds"],
      ["/admin/settlements", "Settlements"],
      ["/admin/wallet", "Wallet ledger"],
    ],
  },
  {
    title: "Growth",
    items: [
      ["/admin/referrals", "Referrals"],
      ["/admin/crm", "CRM"],
      ["/admin/analytics", "Analytics"],
    ],
  },
  {
    title: "System",
    items: [
      ["/admin/i18n", "Translation"],
      ["/admin/notifications", "Notifications"],
      ["/admin/integrations", "Integrations"],
      ["/admin/audit", "Audit"],
    ],
  },
];

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr]">
      <aside className="border-r border-[var(--rule)] bg-[var(--paper)] px-4 py-5">
        <Link href="/design" className="serif text-2xl">
          Atlas
        </Link>
        <p className="mt-1 text-[12px] text-[var(--mute)]">Admin / Finance / Growth</p>
        {groups.map((g) => (
          <div key={g.title} className="mt-6">
            <div className="kicker">{g.title}</div>
            <div className="mt-2 space-y-1">
              {g.items.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-1 py-1 text-sm ${path === href ? "text-[var(--copper)]" : "text-[var(--ink-soft)]"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <Link href="/ops" className="mt-8 block text-xs text-[var(--mute)]">
          ← Command center
        </Link>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-[var(--rule)] px-6 py-3">
          <input className="atlas-input max-w-md" placeholder="Search configuration, payments, keys…" />
          <Link href="/" className="text-xs text-[var(--mute)]">
            Passenger preview
          </Link>
        </header>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
