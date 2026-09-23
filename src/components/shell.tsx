"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useStore } from "@/lib/store";
import { loc } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

function ThemeBtn() {
  const { theme, setTheme } = useStore();
  return (
    <button
      className="focus-ring grid h-10 w-10 place-items-center rounded-xl hairline"
      aria-label="Theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function LocaleBar() {
  const { locale, setLocale, currency, setCurrency } = useStore();
  return (
    <div className="flex items-center gap-2">
      <select className="w-auto py-1.5 text-xs" value={currency} onChange={(e) => setCurrency(e.target.value as never)}>
        <option value="TWD">NT$</option>
        <option value="USD">US$</option>
      </select>
      <select className="w-auto py-1.5 text-xs" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
        <option value="en">EN</option>
        <option value="zh">繁中</option>
      </select>
      <ThemeBtn />
    </div>
  );
}

const customer = [
  ["/", "Go", "出發"],
  ["/book", "Book", "預訂"],
  ["/live", "Live", "即時"],
  ["/trips", "Trips", "行程"],
  ["/account", "You", "我的"],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale, user, theme } = useStore();
  const driver = path.startsWith("/driver");
  const ops = path.startsWith("/ops");
  const admin = path.startsWith("/admin");
  const desk = driver || ops || admin;

  return (
    <div className="os" data-theme={theme}>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href={driver ? "/driver" : ops ? "/ops" : admin ? "/admin" : "/"} className="display text-lg">
            ZOUDIAN
            <span className="ml-2 text-xs font-normal text-[var(--muted)]">
              {driver ? loc(locale, "Driver", "司機") : ops ? loc(locale, "Operations", "調度") : admin ? loc(locale, "Admin", "管理") : loc(locale, "Mobility", "移動")}
            </span>
          </Link>
          {!desk && (
            <nav className="hidden items-center gap-1 lg:flex">
              {customer.map(([href, en, zh]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    href === "/" ? path === "/" : path.startsWith(href) ? "bg-[var(--surface)]" : "text-[var(--muted)]"
                  }`}
                >
                  {locale === "zh" ? zh : en}
                </Link>
              ))}
            </nav>
          )}
          {ops && (
            <nav className="hidden gap-3 text-sm md:flex">
              <Link href="/ops">Map</Link>
              <Link href="/admin" className="text-[var(--muted)]">Admin</Link>
            </nav>
          )}
          <div className="flex items-center gap-2">
            <LocaleBar />
            {!desk && (
              <>
                <Link href="/driver" className="hidden text-xs text-[var(--muted)] md:inline">
                  {loc(locale, "Driver", "司機")}
                </Link>
                <Link href="/ops" className="hidden text-xs text-[var(--muted)] md:inline">
                  {loc(locale, "Ops", "調度")}
                </Link>
                <Link href="/admin" className="hidden text-xs text-[var(--muted)] md:inline">
                  Admin
                </Link>
              </>
            )}
            <Link
              href={user ? (user.role === "driver" ? "/driver" : user.role === "ops" || user.role === "dispatcher" ? "/ops" : "/account") : "/login"}
              className="rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-ink)]"
            >
              {user ? user.name.split(" ")[0] : loc(locale, "Enter", "進入")}
            </Link>
          </div>
        </div>
      </header>
      <main className={`mx-auto w-full px-4 py-6 pb-24 ${ops || admin ? "max-w-[1400px]" : "max-w-7xl"}`}>{children}</main>
      {!desk && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] p-2 backdrop-blur-xl lg:hidden">
          {customer.map(([href, en, zh]) => (
            <Link key={href} href={href} className="py-2 text-center text-[11px] text-[var(--muted)]">
              {locale === "zh" ? zh : en}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
