"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Orbit } from "lucide-react";
import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

const userNav = [
  ["/", "Home", "首頁"],
  ["/book", "Book", "預訂"],
  ["/live", "Live", "即時"],
  ["/trips", "Trips", "訂單"],
  ["/account", "Account", "帳戶"],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale, setLocale, user, currency, setCurrency } = useStore();
  const d = t(locale);
  const desk = path.startsWith("/driver") || path.startsWith("/ops") || path.startsWith("/dispatch");

  return (
    <div className="orbit min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#030014]/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href={desk ? (path.startsWith("/driver") ? "/driver" : "/ops") : "/"} className="flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-white/5 neon">
              <Orbit className="h-5 w-5 text-cyan-200" />
            </span>
            <span>
              <div className="display text-lg leading-none">{d.brand} {d.product}</div>
              <div className="text-[10px] tracking-[0.2em] text-cyan-200/70">{d.tag}</div>
            </span>
          </Link>
          {!desk && (
            <nav className="hidden items-center gap-1 lg:flex">
              {userNav.map(([href, en, zh]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
                    href === "/" ? path === "/" : path.startsWith(href) ? "bg-white/10 text-white" : "text-white/55"
                  } ${path === href || (href !== "/" && path.startsWith(href)) ? "bg-white/10 text-white" : "text-white/55"}`}
                >
                  {locale === "zh" ? zh : en}
                </Link>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            <select className="hidden w-auto rounded-full py-1.5 text-xs md:block" value={currency} onChange={(e) => setCurrency(e.target.value as never)}>
              <option value="TWD">NT$</option>
              <option value="USD">US$</option>
            </select>
            <label className="hidden items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs sm:flex">
              <Globe className="h-3.5 w-3.5" />
              <select className="w-auto border-0 bg-transparent p-0 text-xs" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
                <option value="zh">繁體中文</option>
                <option value="en">English</option>
              </select>
            </label>
            <Link href="/driver" className="hidden text-[11px] uppercase tracking-[0.14em] text-white/40 md:inline">{d.driver}</Link>
            <Link href="/ops" className="hidden text-[11px] uppercase tracking-[0.14em] text-white/40 md:inline">{d.ops}</Link>
            <Link href={user ? (user.role === "driver" ? "/driver" : user.role === "ops" || user.role === "dispatcher" ? "/ops" : "/account") : "/login"} className="rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-cyan-100">
              {user ? user.name.split(" ")[0] : d.login}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 pb-24">{children}</main>
      {!desk && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-white/10 bg-[#030014]/80 p-2 backdrop-blur-xl lg:hidden">
          {userNav.map(([href, en, zh]) => (
            <Link key={href} href={href} className="py-2 text-center text-[10px] uppercase tracking-[0.12em] text-white/60">
              {locale === "zh" ? zh : en}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
