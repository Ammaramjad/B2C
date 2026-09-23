"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Orbit, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const nav = [
  ["/book", "book"],
  ["/destinations", "destinations"],
  ["/planner", "planner"],
  ["/trips", "trips"],
  ["/wallet", "wallet"],
  ["/support", "support"],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale, setLocale, user, currency, setCurrency } = useStore();
  const d = t(locale);
  const hide = path.startsWith("/driver") || path.startsWith("/ops");

  return (
    <div className="orbit min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#030014]/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-white/5 neon">
              <Orbit className="h-5 w-5 text-cyan-200" />
              <span className="ring h-10 w-10" />
            </span>
            <span>
              <div className="display text-lg leading-none tracking-[0.18em]">{d.brand}</div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-cyan-200/70">{d.product} · {d.tag}</div>
            </span>
          </Link>
          {!hide && (
            <nav className="hidden items-center gap-1 lg:flex">
              {nav.map(([href, key]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.16em] ${
                    path.startsWith(href) ? "bg-white/10 text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {d[key]}
                </Link>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            <select
              className="hidden w-auto rounded-full py-1.5 text-xs md:block"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as never)}
            >
              <option value="TWD">TWD NT$</option>
              <option value="USD">USD US$</option>
            </select>
            <label className="hidden items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-white/60 sm:flex">
              <Globe className="h-3.5 w-3.5" />
              <select
                className="w-auto border-0 bg-transparent p-0 text-xs"
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
              >
                <option value="en">English</option>
                <option value="zh">繁體中文</option>
              </select>
            </label>
            <Link href="/driver" className="hidden text-[11px] uppercase tracking-[0.16em] text-white/40 md:inline">
              {d.driver}
            </Link>
            <Link href="/ops" className="hidden text-[11px] uppercase tracking-[0.16em] text-white/40 md:inline">
              {d.ops}
            </Link>
            <Link
              href={user ? "/account" : "/login"}
              className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-xs uppercase tracking-[0.16em] text-cyan-100"
            >
              {user ? user.name.split(" ")[0] : d.login}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-24">{children}</main>
      {!hide && (
        <footer className="border-t border-white/8 px-4 py-10 text-center text-xs text-white/35">
          <div className="display mb-2 flex items-center justify-center gap-2 text-sm text-white/70">
            <Sparkles className="h-4 w-4 text-cyan-200" /> ZOUFENG AETHER · v12.1 mobility mesh
          </div>
          Safe, transparent, intelligent mobility for travelers worldwide. Demo environment — payments are simulated.
        </footer>
      )}
      {!hide && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-4 border-t border-white/10 bg-[#030014]/80 p-2 backdrop-blur-xl lg:hidden">
          {[
            ["/", "Home"],
            ["/book", d.book],
            ["/trips", d.trips],
            ["/planner", d.planner],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="py-2 text-center text-[10px] uppercase tracking-[0.16em] text-white/60">
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
