"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { services } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Stat } from "@/components/ui";
import type { ServiceType } from "@/lib/types";

export default function CustomerDashboard() {
  const { user, login, locale, currency, bookings, setDraft } = useStore();
  const router = useRouter();
  const pid = user?.id ?? "p1";
  const mine = bookings.filter((b) => b.passengerId === pid);
  const upcoming = mine.filter((b) => !["completed", "cancelled"].includes(b.status));
  const done = mine.filter((b) => b.status === "completed");
  const spend = done.reduce((s, b) => s + b.price, 0);
  const live = upcoming.find((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status));

  if (!user || user.role !== "passenger") {
    return (
      <div className="space-y-4 py-10">
        <h1 className="display text-3xl">{loc(locale, "Customer dashboard", "旅客後台")}</h1>
        <p className="text-[var(--muted)]">{loc(locale, "This panel is only for travelers — bookings, trips, wallet.", "此後台只給旅客：預訂、行程、錢包。")}</p>
        <Btn onClick={() => login("amara@zoudian.travel", "passenger")}>Amara Chen</Btn>
      </div>
    );
  }

  function book(id: ServiceType) {
    setDraft({ service: id, vehicle: id === "instant" ? "taxi" : id === "rental" ? "yaris" : "sedan", channel: id === "instant" ? "taxi" : "web" });
    router.push("/book");
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="label">{loc(locale, "Customer panel", "旅客後台")}</div>
        <h1 className="display text-4xl">{loc(locale, "Hello", "你好")} {user.name}</h1>
        <p className="text-[var(--muted)]">{user.email} · {user.referralCode}</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat k={loc(locale, "Trips taken", "已完成行程")} v={String(done.length)} />
        <Stat k={loc(locale, "Upcoming", "即將出發")} v={String(upcoming.length)} />
        <Stat k={loc(locale, "Spend", "消費")} v={money(convert(spend, currency), currency)} />
        <Stat k={loc(locale, "Points", "點數")} v={String(user.points)} />
      </div>
      {live && (
        <section className="elevated rounded-2xl p-5">
          <div className="label">{loc(locale, "Live trip", "進行中")}</div>
          <div className="display text-2xl">{live.pickup} → {live.dropoff}</div>
          <Btn href={`/trips/${live.id}`} className="mt-3">{loc(locale, "Open trip", "開啟行程")}</Btn>
        </section>
      )}
      <section>
        <h2 className="display text-2xl">{loc(locale, "Book a ride", "立即預訂")}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <button key={s.id} onClick={() => book(s.id)} className="elevated rounded-2xl p-4 text-left">
              <div className="display text-lg">{locale === "zh" ? s.zh : s.en}</div>
              <div className="text-sm text-[var(--muted)]">{s.formula}</div>
            </button>
          ))}
        </div>
      </section>
      <section>
        <h2 className="display text-2xl">{loc(locale, "Your bookings", "你的訂單")}</h2>
        <ol className="mt-3 space-y-3">
          {mine.slice(0, 8).map((b) => (
            <li key={b.id}>
              <Link href={`/trips/${b.id}`} className="flex justify-between gap-3 border-b border-[var(--border)] py-3">
                <span>{b.pickup} → {b.dropoff}<span className="block text-sm text-[var(--muted)]">{b.id} · {b.status}</span></span>
                <span className="metric">{money(convert(b.price, currency), currency)}</span>
              </Link>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/trips">{loc(locale, "All trips", "全部行程")}</Link>
          <Link href="/wallet">{loc(locale, "Wallet", "錢包")}</Link>
          <Link href="/loyalty">{loc(locale, "Rewards", "會員")}</Link>
          <Link href="/help">{loc(locale, "Support", "客服")}</Link>
        </div>
      </section>
    </div>
  );
}
