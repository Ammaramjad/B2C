"use client";

import { useState } from "react";
import Link from "next/link";
import { transfers } from "@/lib/transfers";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Status } from "@/components/ui";

const tabs = ["home", "bookings", "saved", "wallet", "loyalty", "support", "profile"] as const;

export default function UserPanelPage() {
  const { user, bookings, locale, currency, saved, logout } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("home");
  const zh = locale === "zh";
  const mine = bookings.filter((b) => !user || b.passengerId === user.id || user.id === "p1" || user.id.startsWith("u-"));

  if (!user || user.role !== "passenger") {
    return (
      <div className="space-y-4 py-10">
        <h1 className="display text-3xl">{loc(locale, "Passenger panel", "乘客中心")}</h1>
        <p className="text-[var(--muted)]">{loc(locale, "Sign up to keep bookings, wallet, and saved cars.", "註冊後可保存訂單、錢包與收藏。")}</p>
        <Btn href="/signup">{loc(locale, "Sign up", "註冊")}</Btn>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <aside className="space-y-2 text-sm">
        <div className="display text-xl">{user.name}</div>
        <p className="text-[var(--muted)]">{user.email}</p>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`block capitalize ${tab === t ? "" : "text-[var(--muted)]"}`}>
            {t}
          </button>
        ))}
        <button className="text-[var(--muted)]" onClick={logout}>{loc(locale, "Sign out", "登出")}</button>
      </aside>
      <div className="space-y-5">
        {tab === "home" && (
          <>
            <h1 className="display text-4xl">{loc(locale, "Your cars", "你的專車")}</h1>
            <p className="text-[var(--muted)]">{loc(locale, "Upcoming first. Hotels are not part of this panel.", "先看即將出發。不含飯店。")}</p>
            {mine.filter((b) => !["completed", "cancelled"].includes(b.status)).slice(0, 4).map((b) => (
              <Link key={b.id} href={`/trips/${b.id}`} className="block">
                <Status kind={b.status}>{b.status}</Status>
                <div className="display text-2xl">{b.pickup} → {b.dropoff}</div>
                <div className="text-sm text-[var(--muted)]">{b.id} · {b.when} · {money(convert(b.price, currency), currency)} · OTP {b.otp}</div>
              </Link>
            ))}
          </>
        )}
        {tab === "bookings" &&
          mine.map((b) => (
            <Link key={b.id} href={`/trips/${b.id}`} className="block border-b border-[var(--border)] py-3">
              <div className="flex justify-between">
                <span>{b.id} · {b.service}</span>
                <Status kind={b.status}>{b.status}</Status>
              </div>
              <div>{b.pickup} → {b.dropoff}</div>
              <div className="text-sm text-[var(--muted)]">
                {b.when} · {b.vehicle} · {b.channel} · {b.payment} · extras {b.extras.join(", ") || "—"} · {money(convert(b.price, currency), currency)}
              </div>
            </Link>
          ))}
        {tab === "saved" &&
          (saved.length === 0 ? (
            <p>{loc(locale, "No saved cars yet.", "尚無收藏。")}</p>
          ) : (
            saved.map((id) => {
              const t = transfers.find((x) => x.id === id);
              return t ? (
                <Link key={id} href={`/cars/${id}`} className="block">
                  {zh ? t.titleZh : t.title} · {money(convert(t.price, currency), currency)}
                </Link>
              ) : null;
            })
          ))}
        {tab === "wallet" && (
          <div>
            <div className="metric text-4xl">{money(user.wallet.TWD, "TWD")}</div>
            <p className="text-[var(--muted)]">USD {money(user.wallet.USD, "USD")} · {loc(locale, "Credits from promo / refund / referral.", "折價金來自活動／退款／推薦。")}</p>
          </div>
        )}
        {tab === "loyalty" && (
          <p>
            {user.points} pts · {user.referralCode} · {loc(locale, "Welcome NT$100 after first completed ride.", "首趟完成後 WELCOME NT$100。")}
          </p>
        )}
        {tab === "support" && (
          <p>
            <Link href="/help" className="underline">{loc(locale, "Open help (8 categories)", "開啟客服（8 分類）")}</Link>
          </p>
        )}
        {tab === "profile" && (
          <div className="space-y-2 text-sm">
            <p>{user.name}</p>
            <p>{user.phone}</p>
            <p>{user.email}</p>
            <p>{loc(locale, "Language EN / 繁中 · Currency TWD / USD", "語言 EN／繁中 · 幣別 TWD／USD")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
