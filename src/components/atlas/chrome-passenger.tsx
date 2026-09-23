"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const tabs = [
  ["/", "Discover", "探索"],
  ["/trips", "Trips", "行程"],
  ["/live", "Live", "即時"],
  ["/planner", "Plan", "規劃"],
  ["/account", "You", "我的"],
] as const;

export function PassengerChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale, setLocale, currency, setCurrency, theme, setTheme, user } = useStore();
  const zh = locale === "zh";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--canvas)_88%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link href="/" className="serif text-[28px] leading-none">
            Zoufeng
          </Link>
          <nav className="hidden items-center gap-6 text-[15px] md:flex">
            {tabs.map(([href, en, zhl]) => {
              const on = href === "/" ? path === "/" : path.startsWith(href);
              return (
                <Link key={href} href={href} className={on ? "border-b border-[var(--copper)] pb-0.5" : "text-[var(--ink-soft)]"}>
                  {zh ? zhl : en}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-xs">
            <select className="atlas-select w-auto py-1" value={currency} onChange={(e) => setCurrency(e.target.value as never)}>
              <option value="TWD">NT$</option>
              <option value="USD">US$</option>
            </select>
            <select className="atlas-select w-auto py-1" value={locale} onChange={(e) => setLocale(e.target.value as never)}>
              <option value="en">EN</option>
              <option value="zh">繁中</option>
            </select>
            <button className="atlas-btn ghost min-h-8 px-2 text-xs" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? "Day" : "Dusk"}
            </button>
            <Link href="/support" className="hidden text-[var(--ink-soft)] sm:inline">
              {zh ? "支援" : "Support"}
            </Link>
            <Link href={user ? "/account" : "/login"} className="atlas-btn solid min-h-8 px-3 text-xs">
              {user ? user.name.split(" ")[0] : zh ? "登入" : "Enter"}
            </Link>
          </div>
        </div>
      </header>
      <main className="pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--rule)] bg-[var(--canvas)] md:hidden">
        {tabs.map(([href, en, zhl]) => (
          <Link key={href} href={href} className="py-3 text-center text-[11px] tracking-wide">
            {zh ? zhl : en}
          </Link>
        ))}
      </nav>
    </div>
  );
}
