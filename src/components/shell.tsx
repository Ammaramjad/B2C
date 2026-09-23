"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { navGroups, screens } from "@/design/screens";
import { tx } from "@/lib/present";
import { useStore } from "@/lib/store";
import type { Currency, Locale } from "@/lib/types";

function Wordmark({ href }: { href: string }) {
  return (
    <Link href={href} className="zf-wordmark">
      <span className="zf-seal">豐</span>
      Zoufeng
    </Link>
  );
}

function Tools() {
  const { locale, setLocale, currency, setCurrency, theme, setTheme, user } = useStore();
  return (
    <div className="zf-tools">
      <select aria-label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
        <option value="TWD">NT$</option>
        <option value="USD">US$</option>
      </select>
      <select aria-label="Language" value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
        <option value="en">EN</option>
        <option value="zh">繁中</option>
      </select>
      <button type="button" className="zf-btn zf-btn-quiet" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        {theme === "light" ? "Night" : "Day"}
      </button>
      <Link href={user ? "/account" : "/login"} className="zf-textlink">
        {user ? user.name.split(" ")[0] : "Sign in"}
      </Link>
    </div>
  );
}

function PassengerShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale } = useStore();
  const on = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <div className="zf-passenger">
      <a href="#content" className="zf-skip zf-btn zf-btn-line">
        Skip to content
      </a>
      <header className="zf-mast">
        <Wordmark href="/" />
        <nav className="zf-nav" aria-label="Passenger">
          {navGroups.passenger.map((item) => (
            <Link key={item.href} href={item.href} data-on={on(item.href)}>
              {tx(locale, item.en, item.zh)}
            </Link>
          ))}
        </nav>
        <Tools />
      </header>
      <div id="content">{children}</div>
      <nav className="zf-tabbar" aria-label="Mobile">
        {navGroups.passengerMobile.map((item) => (
          <Link key={item.href} href={item.href} data-on={on(item.href)}>
            {tx(locale, item.en, item.zh)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function DriverShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale } = useStore();
  return (
    <div className="zf-driver">
      <header className="zf-dutybar">
        <Wordmark href="/driver" />
        <span className="zf-note">{tx(locale, "Driver", "司機")}</span>
        <Tools />
      </header>
      <div id="content">{children}</div>
      <nav className="zf-tabbar" style={{ display: "flex" }} aria-label="Driver">
        {navGroups.driver.map((item) => (
          <Link key={item.href} href={item.href} data-on={path === item.href}>
            {tx(locale, item.en, item.zh)}
          </Link>
        ))}
      </nav>
    </div>
  );
}

const opsNav = [
  ["Command", "/ops"],
  ["Queue", "/ops/queue"],
  ["Dispatch", "/ops/dispatch"],
  ["Fleet map", "/ops/fleet-map"],
  ["Flights", "/ops/flights"],
  ["Drivers", "/ops/drivers"],
  ["Fleets", "/ops/fleet"],
  ["Manual order", "/ops/manual"],
  ["Safety", "/ops/safety"],
  ["Support", "/ops/support"],
] as const;

const adminNav = [
  ["Network", [["Vehicles", "/admin/vehicles"], ["Accounts", "/admin/accounts"], ["Corporate", "/admin/corporate"]]],
  ["Commerce", [["Pricing", "/admin/pricing"], ["Cancellation", "/admin/cancellation"], ["Promotions", "/admin/promotions"], ["Referrals", "/admin/referrals"]]],
  ["Finance", [["Payments", "/admin/payments"], ["Refunds", "/admin/refunds"], ["Settlements", "/admin/settlements"], ["Wallet ledger", "/admin/wallet"]]],
  ["Care", [["CRM", "/admin/crm"], ["Notifications", "/admin/notifications"]]],
  ["Insight", [["Analytics", "/admin/analytics"]]],
  ["System", [["Parameters", "/admin/parameters"], ["Translation", "/admin/translations"], ["Integrations", "/admin/integrations"], ["Audit", "/admin/audit"]]],
] as const;

function DeskShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const admin = path.startsWith("/admin");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return screens.slice(0, 8);
    return screens.filter((s) => `${s.name} ${s.href} ${s.note}`.toLowerCase().includes(query)).slice(0, 8);
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="zf-desk">
      <header className="zf-desk-top">
        <Wordmark href={admin ? "/admin/pricing" : "/ops"} />
        <div className="zf-desk-switch">
          <Link href="/ops" data-on={!admin}>
            Operations
          </Link>
          <Link href="/admin/pricing" data-on={admin}>
            Administration
          </Link>
        </div>
        <input
          className="zf-search"
          placeholder="Search bookings, flights, screens"
          aria-label="Command search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) router.push(results[0].href);
          }}
        />
        <span className="zf-note zf-hide-sm">Maps live · Flight feed degraded</span>
        <Tools />
        {open && (
          <div className="zf-palette" role="listbox">
            {results.map((s) => (
              <Link key={s.href + s.name} href={s.href} onClick={() => setOpen(false)}>
                {s.n ? `${s.n}. ` : ""}
                {s.name}
                <span className="zf-note"> {s.href}</span>
              </Link>
            ))}
          </div>
        )}
      </header>
      <nav className="zf-desk-nav" aria-label={admin ? "Administration" : "Operations"}>
        {admin ? (
          adminNav.map(([group, links]) => (
            <div key={group}>
              <p>{group}</p>
              {links.map(([label, href]) => (
                <Link key={href} href={href} data-on={path === href}>
                  {label}
                </Link>
              ))}
            </div>
          ))
        ) : (
          <>
            <p>Desk</p>
            {opsNav.map(([label, href]) => (
              <Link key={href} href={href} data-on={path === href}>
                {label}
                {href === "/ops/safety" && <span>1</span>}
              </Link>
            ))}
            <p>Also</p>
            <Link href="/design">Design studio</Link>
          </>
        )}
      </nav>
      <div className="zf-desk-main" id="content">
        {children}
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/driver")) return <DriverShell>{children}</DriverShell>;
  if (path.startsWith("/ops") || path.startsWith("/admin")) return <DeskShell>{children}</DeskShell>;
  if (path.startsWith("/login")) return <div className="zf-bare">{children}</div>;
  if (path.startsWith("/design")) {
    return (
      <div className="zf-passenger">
        <header className="zf-mast">
          <Wordmark href="/design" />
          <nav className="zf-nav">
            <Link href="/design" data-on={path === "/design"}>
              Foundation
            </Link>
            <Link href="/design/states" data-on={path.startsWith("/design/states")}>
              States
            </Link>
            <Link href="/">Passenger</Link>
            <Link href="/driver">Driver</Link>
            <Link href="/ops">Operations</Link>
          </nav>
          <Tools />
        </header>
        {children}
      </div>
    );
  }
  return <PassengerShell>{children}</PassengerShell>;
}
