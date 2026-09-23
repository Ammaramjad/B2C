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

const customerNav = [
  ["/customer", "Hub", "中心"],
  ["/book", "Book", "預訂"],
  ["/trips", "Trips", "行程"],
  ["/wallet", "Wallet", "錢包"],
  ["/account", "You", "我的"],
] as const;

const driverNav = [
  ["/driver", "Today", "今日"],
  ["/driver/jobs", "Jobs", "任務"],
  ["/driver/pay", "Pay", "收入"],
] as const;

const staffNav = [
  ["/ops", "Board", "派遣"],
  ["/ops/map", "Map", "地圖"],
  ["/admin", "Admin", "管理"],
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale, user, theme } = useStore();
  const driver = path.startsWith("/driver");
  const staff = path.startsWith("/ops") || path.startsWith("/admin");

  const home = driver ? "/driver" : staff ? "/ops" : "/";
  const title = driver
    ? loc(locale, "Driver panel", "司機後台")
    : staff
      ? loc(locale, "Staff console", "內部後台")
      : loc(locale, "Customer", "旅客");

  return (
    <div className="os" data-theme={theme}>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href={home} className="display text-lg">
            ZOUDIAN
            <span className="ml-2 text-xs font-normal text-[var(--muted)]">{title}</span>
          </Link>
          {driver && (
            <nav className="hidden items-center gap-1 md:flex">
              {driverNav.map(([href, en, zh]) => (
                <Link key={href} href={href} className={`rounded-xl px-3 py-2 text-sm ${path === href ? "bg-[var(--surface)]" : "text-[var(--muted)]"}`}>
                  {locale === "zh" ? zh : en}
                </Link>
              ))}
            </nav>
          )}
          {staff && (
            <nav className="hidden items-center gap-1 md:flex">
              {staffNav.map(([href, en, zh]) => (
                <Link key={href} href={href} className={`rounded-xl px-3 py-2 text-sm ${path === href || (href !== "/ops" && path.startsWith(href)) ? "bg-[var(--surface)]" : "text-[var(--muted)]"}`}>
                  {locale === "zh" ? zh : en}
                </Link>
              ))}
            </nav>
          )}
          {!driver && !staff && (
            <nav className="hidden items-center gap-1 lg:flex">
              {customerNav.map(([href, en, zh]) => (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-xl px-3 py-2 text-sm ${href === "/customer" ? path.startsWith("/customer") || path === "/" : path.startsWith(href) ? "bg-[var(--surface)]" : "text-[var(--muted)]"}`}
                >
                  {locale === "zh" ? zh : en}
                </Link>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            <LocaleBar />
            <Link
              href={
                user
                  ? user.role === "driver"
                    ? "/driver"
                    : user.role === "passenger"
                      ? "/customer"
                      : "/ops"
                  : "/login"
              }
              className="rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-ink)]"
            >
              {user ? user.name.split(" ")[0] : loc(locale, "Enter", "進入")}
            </Link>
          </div>
        </div>
      </header>
      <main className={`mx-auto w-full px-4 py-6 pb-24 ${staff ? "max-w-[1400px]" : driver ? "max-w-lg" : "max-w-7xl"}`}>{children}</main>
      {driver && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] p-2 md:hidden">
          {driverNav.map(([href, en, zh]) => (
            <Link key={href} href={href} className="py-2 text-center text-[11px] text-[var(--muted)]">
              {locale === "zh" ? zh : en}
            </Link>
          ))}
        </nav>
      )}
      {!driver && !staff && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_90%,transparent)] p-2 backdrop-blur-xl lg:hidden">
          {customerNav.map(([href, en, zh]) => (
            <Link key={href} href={href} className="py-2 text-center text-[11px] text-[var(--muted)]">
              {locale === "zh" ? zh : en}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
