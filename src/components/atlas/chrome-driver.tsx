"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["/driver", "Duty"],
  ["/driver/offer", "Job"],
  ["/driver/earnings", "Pay"],
];

export function DriverChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto min-h-screen max-w-[430px] border-x border-[var(--rule)]">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="kicker">Driver OS</div>
          <div className="serif text-2xl">Run</div>
        </div>
        <Link href="/" className="text-xs text-[var(--mute)]">
          Atlas
        </Link>
      </header>
      <main className="px-4 pb-24">{children}</main>
      <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-3 border-t border-[var(--rule)] bg-[var(--canvas)]">
        {tabs.map(([href, label]) => (
          <Link key={href} href={href} className={`py-4 text-center text-sm ${path === href ? "text-[var(--copper)]" : "text-[var(--mute)]"}`}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
