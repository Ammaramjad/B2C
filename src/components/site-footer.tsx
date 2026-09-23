"use client";

import Link from "next/link";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const cols = [
  {
    en: "Book cars",
    zh: "訂車",
    links: [
      ["/cars", "All cars", "全部專車"],
      ["/airports", "Airports", "機場"],
      ["/routes", "Popular routes", "熱門路線"],
      ["/charter", "Hourly charter", "計時包車"],
      ["/rental", "Self-drive", "租車自駕"],
      ["/instant", "Instant taxi", "即時計程車"],
    ],
  },
  {
    en: "Trip",
    zh: "行程",
    links: [
      ["/book", "3-step book", "三步驟預訂"],
      ["/planner", "AI planner", "AI 規劃"],
      ["/live", "Live track", "即時追蹤"],
      ["/trips", "My trips", "我的訂單"],
      ["/safety", "Safety + SOS", "安全＋SOS"],
      ["/policies", "Cancel & pay", "取消與付款"],
    ],
  },
  {
    en: "Company",
    zh: "公司",
    links: [
      ["/how-it-works", "How it works", "如何使用"],
      ["/reviews", "Reviews", "評價"],
      ["/faq", "FAQ", "常見問題"],
      ["/help", "Help center", "客服"],
      ["/destinations", "8 cities", "8 城市"],
      ["/platform", "All portals", "全部入口"],
    ],
  },
  {
    en: "Staff",
    zh: "內部",
    links: [
      ["/signup", "Passenger signup", "乘客註冊"],
      ["/me", "Passenger panel", "會員中心"],
      ["/driver", "Driver panel", "司機中心"],
      ["/ops", "Operations", "調度"],
      ["/admin", "Admin", "管理"],
      ["/login", "Role login", "角色登入"],
    ],
  },
];

export function SiteFooter() {
  const { locale } = useStore();
  return (
    <footer className="mt-16 border-t border-[var(--border)] pt-10 pb-28 text-sm">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {cols.map((c) => (
          <div key={c.en}>
            <div className="display mb-3 text-lg">{locale === "zh" ? c.zh : c.en}</div>
            <ul className="space-y-2 text-[var(--muted)]">
              {c.links.map(([href, en, zh]) => (
                <li key={href}>
                  <Link href={href}>{locale === "zh" ? zh : en}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-10 text-xs text-[var(--muted)]">
        ZOUDIAN 走癲派車 · Taiwan cars only · NT$ transparent · EN / 繁中 · {loc(locale, "Not a hotel marketplace.", "非飯店平台。")}
      </p>
    </footer>
  );
}
