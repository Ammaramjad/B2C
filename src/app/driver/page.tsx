"use client";

import { useEffect, useState } from "react";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { AreaChart } from "@/components/charts";
import { LiveMap } from "@/components/live-map";
import { Btn, Panel, Stat } from "@/components/ui";

export default function DriverPage() {
  const { user, login, bookings, advance, grab, currency, locale, settlements } = useStore();
  const me = drivers[0];
  const [work, setWork] = useState(me.work);
  const [tick, setTick] = useState(0);
  const zh = locale === "zh";
  const mine = bookings.filter((b) => b.driverId === me.id);
  const pool = bookings.filter((b) => b.status === "new" || (!b.driverId && b.status === "payment_confirmed"));

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 4000);
    return () => clearInterval(t);
  }, []);

  if (!user || user.role !== "driver") {
    return (
      <Panel className="space-y-3">
        <h1 className="display text-3xl">{loc(locale, "Driver side", "司機端")}</h1>
        <Btn onClick={() => login("kenji@zoudian.travel", "driver")}>Kenji Mori</Btn>
      </Panel>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase text-cyan-200/70">{loc(locale, "Driver console", "司機後台")}</div>
          <h1 className="display text-4xl">{me.name}</h1>
          <p className="text-sm text-white/50">{me.plate} · {me.vehicle} · fleet {me.fleet} · ★ {me.rating}</p>
        </div>
        <div className="flex gap-2">
          {(["available", "busy", "offline"] as const).map((w) => (
            <Btn key={w} kind={work === w ? "primary" : "ghost"} onClick={() => setWork(w)}>
              {w}
            </Btn>
          ))}
        </div>
      </div>
      <LiveMap locale={locale} mode="nav" height={360} focusDriverId={me.id} pickup={loc(locale, "In-app nav", "導航")} dropoff={mine[0]?.dropoff} eta={`${work} · tick ${tick}`} />
      <Panel className="neon"><AreaChart label={zh ? "本週收入" : "Week earnings"} values={[4.2, 5.1, 6.2, 5.8, 6.8, 7.1, 6.2]} /></Panel>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat k={zh ? "今日" : "Today"} v={money(convert(me.earningsToday, currency), currency)} />
        <Stat k={zh ? "本週" : "Week"} v={money(convert(me.earningsWeek, currency), currency)} />
        <Stat k={zh ? "待撥" : "Payout"} v={money(convert(me.pendingPayout, currency), currency)} />
        <Stat k={zh ? "完成趟" : "Done"} v={String(mine.filter((b) => b.status === "completed").length)} />
      </div>
      <section>
        <h2 className="display text-2xl">{loc(locale, "Grab pool · 4s refresh", "搶單池 · 4 秒刷新")}</h2>
        {pool.map((b) => (
          <Panel key={b.id} className="mt-3 flex justify-between">
            <div>
              <div className="text-xs text-white/40">{b.id} · {b.service} · {b.status}</div>
              <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
            </div>
            <Btn onClick={() => grab(b.id, me.id)}>{zh ? "搶單" : "Grab"}</Btn>
          </Panel>
        ))}
      </section>
      <section>
        <h2 className="display text-2xl">{loc(locale, "My jobs", "我的任務")}</h2>
        {mine.map((b) => (
          <Panel key={b.id} className="mt-3 flex justify-between">
            <div>
              <div className="text-xs text-white/40">{b.id} · {b.status} · OTP {b.otp}</div>
              <div className="display text-xl">{b.pickup} → {b.dropoff}</div>
              <div className="text-sm text-white/50">{money(convert(b.driverNet, currency), currency)} net</div>
            </div>
            {b.status !== "completed" && b.status !== "cancelled" && (
              <Btn onClick={() => advance(b.id)}>{zh ? "下一狀態" : "Next status"}</Btn>
            )}
          </Panel>
        ))}
      </section>
      {settlements.filter((s) => s.driverId === me.id).map((s) => (
        <Panel key={s.id} className="flex justify-between">
          <span>{s.week} · {s.rides} · {s.status}</span>
          <span>{money(convert(s.net, currency), currency)}</span>
        </Panel>
      ))}
    </div>
  );
}
