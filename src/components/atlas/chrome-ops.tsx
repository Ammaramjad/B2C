"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const rail = [
  ["/ops", "Center"],
  ["/ops/queue", "Queue"],
  ["/ops/dispatch", "Dispatch"],
  ["/ops/fleet", "Fleet"],
  ["/ops/flights", "Flights"],
  ["/ops/drivers", "Drivers"],
  ["/ops/fleets", "Companies"],
  ["/ops/manual", "Manual"],
  ["/ops/safety", "Safety"],
  ["/ops/support", "Care"],
];

export function OpsChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="grid min-h-screen grid-cols-[88px_1fr]">
      <aside className="border-r border-[var(--rule)] bg-[var(--paper)]">
        <Link href="/ops" className="block border-b border-[var(--rule)] px-3 py-4">
          <div className="kicker">ZF</div>
          <div className="serif text-xl">Ops</div>
        </Link>
        <nav className="flex flex-col">
          {rail.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`border-l-2 px-3 py-3 text-[11px] tracking-wide ${
                path === href || (href === "/ops" && path === "/ops")
                  ? "border-[var(--copper)] text-[var(--ink)]"
                  : "border-transparent text-[var(--mute)]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/admin/pricing" className="mt-6 block px-3 text-[11px] text-[var(--mute)]">
          Admin →
        </Link>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--rule)] px-4 py-2">
          <input className="atlas-input max-w-xl" placeholder="Command: booking, flight, driver, plate…" />
          <div className="flex items-center gap-3 text-[11px]">
            <span className="stamp text-[var(--pine)]">Systems nominal</span>
            <span className="text-[var(--mute)]">TPE · Asia/Taipei</span>
          </div>
        </header>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
