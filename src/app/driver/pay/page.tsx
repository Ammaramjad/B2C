"use client";

import { drivers, seedSettlements } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Stat } from "@/components/ui";

export default function DriverPayPage() {
  const { user, locale, currency, bookings } = useStore();
  const me = drivers[0];
  const done = bookings.filter((b) => b.driverId === me.id && b.status === "completed");
  if (!user || user.role !== "driver") {
    return <p><a className="underline" href="/driver">{loc(locale, "Open driver dashboard", "開啟司機後台")}</a></p>;
  }
  return (
    <div className="space-y-6">
      <h1 className="display text-3xl">{loc(locale, "Earnings", "收入")}</h1>
      <div className="grid grid-cols-2 gap-6">
        <Stat k={loc(locale, "Today", "今日")} v={money(convert(me.earningsToday, currency), currency)} />
        <Stat k={loc(locale, "Week", "本週")} v={money(convert(me.earningsWeek, currency), currency)} />
        <Stat k={loc(locale, "Pending payout", "待撥")} v={money(convert(me.pendingPayout, currency), currency)} />
        <Stat k={loc(locale, "Completed trips", "完成趟次")} v={String(done.length)} />
      </div>
      <h2 className="display text-xl">{loc(locale, "Settlement", "結算")}</h2>
      {seedSettlements.filter((s) => s.driverId === me.id).map((s) => (
        <p key={s.id} className="text-sm">{s.week} · {s.rides} rides · {money(convert(s.net, currency), currency)} · {s.status}</p>
      ))}
    </div>
  );
}
