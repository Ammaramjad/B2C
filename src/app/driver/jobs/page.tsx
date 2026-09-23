"use client";

import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn } from "@/components/ui";

export default function DriverJobsPage() {
  const { user, bookings, advance, grab, locale, currency } = useStore();
  const me = drivers[0];
  const mine = bookings.filter((b) => b.driverId === me.id);
  const incoming = bookings.find((b) => b.status === "new" || (!b.driverId && b.status === "payment_confirmed"));
  const active = mine.find((b) => !["completed", "cancelled"].includes(b.status));
  const primaryActions: Record<string, { next: "accepted" | "arriving" | "onboard" | "completed"; label: string }> = {
    assigned: { next: "accepted", label: loc(locale, "Accept", "接單") },
    accepted: { next: "arriving", label: loc(locale, "Start to pickup", "前往接駕") },
    arriving: { next: "onboard", label: loc(locale, "Arrived", "已到達") },
    onboard: { next: "completed", label: loc(locale, "Complete", "完成") },
  };
  const primary = active ? primaryActions[active.status] : null;

  if (!user || user.role !== "driver") {
    return <p><a className="underline" href="/driver">{loc(locale, "Open driver dashboard", "開啟司機後台")}</a></p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="display text-3xl">{loc(locale, "Jobs", "任務")}</h1>
      {incoming && (
        <section className="elevated space-y-3 rounded-2xl p-5">
          <div className="label">{loc(locale, "Incoming offer", "新派遣")}</div>
          <div className="display text-2xl">{incoming.pickup} → {incoming.dropoff}</div>
          <p className="text-[var(--muted)]">{money(convert(incoming.driverNet, currency), currency)}</p>
          <Btn className="w-full" onClick={() => grab(incoming.id, me.id)}>{loc(locale, "Accept", "接單")}</Btn>
        </section>
      )}
      {active ? (
        <>
          <LiveMap locale={locale} mode="nav" height={280} focusDriverId={me.id} pickup={active.pickup} dropoff={active.dropoff} />
          <p className="text-[var(--muted)]">OTP {active.otp} · {active.status}</p>
          {primary?.next && (
            <Btn className="w-full min-h-14" onClick={() => advance(active.id, primary.next)}>{primary.label}</Btn>
          )}
        </>
      ) : (
        <p className="text-[var(--muted)]">{loc(locale, "No active job.", "沒有進行中任務。")}</p>
      )}
      <ol className="space-y-2 text-sm">
        {mine.map((b) => (
          <li key={b.id} className="flex justify-between border-b border-[var(--border)] py-2">
            <span>{b.pickup} → {b.dropoff}</span>
            <span>{b.status}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
