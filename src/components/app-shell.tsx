"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Locale } from "@/lib/types";

function LocaleTools() {
  const { locale, setLocale, currency, setCurrency, theme, setTheme } = useStore();
  return (
    <div className="flex items-center gap-2 text-xs">
      <select className="w-auto py-1.5 text-xs" value={currency} onChange={(e) => setCurrency(e.target.value as never)} aria-label="Currency">
        <option value="TWD">NT$</option>
        <option value="USD">US$</option>
      </select>
      <select className="w-auto py-1.5 text-xs" value={locale} onChange={(e) => setLocale(e.target.value as Locale)} aria-label="Language">
        <option value="en">EN</option>
        <option value="zh">繁中</option>
      </select>
      <button className="focus-ring px-2 py-1.5 text-[var(--text-secondary)]" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? loc(locale, "Light", "淺色") : loc(locale, "Dark", "深色")}
      </button>
    </div>
  );
}

const passengerNav = [
  ["/", "Home", "首頁"],
  ["/book", "Book", "預訂"],
  ["/trips", "Trips", "行程"],
  ["/planner", "Plan", "規劃"],
  ["/account", "You", "我的"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale, user } = useStore();
  const driver = path.startsWith("/driver");
  const ops = path.startsWith("/ops") || path.startsWith("/admin");

  if (ops) {
    return (
      <div className="os">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link href="/ops" className="display text-lg">
              ZOUFENG <span className="text-sm font-normal text-[var(--text-secondary)]">{loc(locale, "Operations", "營運指揮")}</span>
            </Link>
            <nav className="hidden gap-4 text-sm md:flex">
              <Link href="/ops" className={path === "/ops" ? "font-semibold" : "text-[var(--text-secondary)]"}>{loc(locale, "Canvas", "畫布")}</Link>
              <Link href="/ops/fleet" className={path.startsWith("/ops/fleet") ? "font-semibold" : "text-[var(--text-secondary)]"}>{loc(locale, "Fleet", "車隊")}</Link>
              <Link href="/ops/pricing" className={path.startsWith("/ops/pricing") ? "font-semibold" : "text-[var(--text-secondary)]"}>{loc(locale, "Pricing", "計價")}</Link>
              <Link href="/ops/analytics" className={path.startsWith("/ops/analytics") ? "font-semibold" : "text-[var(--text-secondary)]"}>{loc(locale, "Analytics", "分析")}</Link>
            </nav>
            <div className="flex items-center gap-3">
              <LocaleTools />
              <Link href="/login" className="text-sm">{user?.name.split(" ")[0] ?? loc(locale, "Sign in", "登入")}</Link>
            </div>
          </div>
        </header>
        <main className="px-3 py-3 md:px-4">{children}</main>
      </div>
    );
  }

  if (driver) {
    return (
      <div className="os">
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
            <Link href="/driver" className="display">{loc(locale, "Driver", "司機")}</Link>
            <LocaleTools />
          </div>
        </header>
        <main className="mx-auto max-w-lg px-4 py-5 pb-24">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-3 border-t border-[var(--border)] bg-[var(--bg)] p-2 text-center text-sm">
          <Link href="/driver">{loc(locale, "Today", "今日")}</Link>
          <Link href="/driver/offer">{loc(locale, "Offer", "派遣")}</Link>
          <Link href="/driver/trip">{loc(locale, "Trip", "任務")}</Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="os">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="display text-lg tracking-[0.12em]">ZOUFENG</Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {passengerNav.map(([href, en, zh]) => (
              <Link key={href} href={href} className={(href === "/" ? path === "/" : path.startsWith(href)) ? "font-semibold" : "text-[var(--text-secondary)]"}>
                {locale === "zh" ? zh : en}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LocaleTools />
            <Link href={user ? "/account" : "/login"} className="text-sm font-semibold">
              {user ? user.name.split(" ")[0] : loc(locale, "Sign in", "登入")}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:py-8">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--bg)] p-2 text-center text-[11px] md:hidden">
        {passengerNav.map(([href, en, zh]) => (
          <Link key={href} href={href} className="py-2">
            {locale === "zh" ? zh : en}
          </Link>
        ))}
      </nav>
    </div>
  );
}
