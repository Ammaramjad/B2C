"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLive } from "@/lib/live/engine";

function Director({ compact = false }: { compact?: boolean }) {
  const { live, play, pause, reset, step, setScenario } = useLive();
  const [open, setOpen] = useState(false);
  if (compact && !open) {
    return (
      <button type="button" className="zf-chip live" onClick={() => setOpen(true)}>
        SIM {live.clock}
      </button>
    );
  }
  return (
    <div className={`flex flex-wrap items-center gap-2 text-[11px] ${compact ? "w-full justify-end" : ""}`}>
      {compact ? (
        <button type="button" className="text-[var(--mute)]" onClick={() => setOpen(false)}>
          Hide sim
        </button>
      ) : null}
      <span className="mono text-[var(--mute)]">{live.clock}</span>
      <span className="zf-chip live">{live.playing ? "LIVE" : "PAUSED"}</span>
      <button className="zf-btn" style={{ minHeight: 28, padding: "0 8px", fontSize: 11 }} onClick={live.playing ? pause : play}>
        {live.playing ? "Pause" : "Play scenario"}
      </button>
      <button className="zf-btn ghost" style={{ minHeight: 28, padding: "0 8px", fontSize: 11 }} onClick={step}>
        Next beat
      </button>
      <button className="zf-btn ghost" style={{ minHeight: 28, padding: "0 8px", fontSize: 11 }} onClick={() => reset(live.scenario)}>
        Reset
      </button>
      <select
        className="border border-[var(--line)] bg-[var(--paper)] px-2 py-1"
        value={live.scenario}
        onChange={(e) => setScenario(e.target.value as "pickup" | "preferred")}
      >
        <option value="pickup">ZF-82041 disruption</option>
        <option value="preferred">Preferred David</option>
      </select>
    </div>
  );
}

export function PassengerChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { live } = useLive();
  const tabs = [
    ["/", "Move"],
    ["/book", "Book"],
    ["/live", "Live"],
    ["/preferred", "Drivers"],
    ["/account", "You"],
  ];
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--mist)_90%,transparent)] px-4 py-2 backdrop-blur">
        <Link href="/" className="flex items-center gap-2">
          <span className="zf-pin" style={{ background: "var(--signal)", width: 16, height: 16 }} />
          <b className="tracking-tight">ZOUFENG</b>
        </Link>
        <nav className="hidden gap-4 text-sm md:flex">
          {tabs.map(([h, l]) => (
            <Link key={h} href={h} className={path === h || (h !== "/" && path.startsWith(h)) ? "text-[var(--signal)]" : "text-[var(--ink-2)]"}>
              {l}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block">
          <Director />
        </div>
        <div className="md:hidden">
          <Director compact />
        </div>
      </header>
      {live.customerNotice ? (
        <div className="zf-alert">
          <b>Update</b>
          <span>{live.customerNotice}</span>
        </div>
      ) : null}
      <main>{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-[var(--mist)] md:hidden">
        {tabs.map(([h, l]) => (
          <Link key={h} href={h} className="py-3 text-center text-[11px]">
            {l}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function DriverChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { live } = useLive();
  const onDuty = ["en_route_airport", "near_airport", "arrived", "waiting", "trip_started", "en_route_dest", "reassigned", "disrupted"].includes(live.phase);
  return (
    <div className="min-h-screen bg-[var(--mist)] lg:grid lg:grid-cols-[1fr_430px]">
      <div className="hidden border-r border-[var(--line)] lg:block">
        <div className="p-6">
          <div className="kicker">Driver desktop</div>
          <h2 className="display mt-2 text-4xl">Stay on the assignment.</h2>
          <p className="mt-3 max-w-md text-sm text-[var(--ink-2)]">Map and event tape stay on the left. Task controls stay in the column — no invented KPIs.</p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[430px] lg:max-w-none">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div>
          <div className="kicker">Driver command</div>
          <div className="text-lg font-semibold">David / Jason</div>
        </div>
        <Director compact />
      </header>
      {onDuty ? (
        <Link href="/driver/incident" className="mx-4 mb-3 block bg-[var(--signal)] py-3 text-center text-sm font-bold text-white">
          REPORT INCIDENT
        </Link>
      ) : null}
      <div className="px-4 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-[var(--mist)] text-center text-[11px] lg:left-auto lg:w-[430px]">
        {[
          ["/driver", "Duty"],
          ["/driver/offer", "Offer"],
          ["/driver/run", "Job"],
          ["/driver/performance", "Stats"],
          ["/driver/earnings", "Pay"],
        ].map(([h, l]) => (
          <Link key={h} href={h} className={`py-4 ${path === h ? "text-[var(--signal)]" : ""}`}>
            {l}
          </Link>
        ))}
      </nav>
      </div>
    </div>
  );
}

export function OpsChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { live } = useLive();
  const rail = [
    ["/ops", "Center"],
    ["/ops/queue", "Queue"],
    ["/ops/dispatch", "Dispatch"],
    ["/ops/airport", "Airport"],
    ["/ops/flights", "Flights"],
    ["/ops/incident", "Incident"],
    ["/ops/replace", "Replace"],
    ["/ops/drivers", "Drivers"],
    ["/ops/fleet", "Fleet"],
    ["/ops/vehicles", "Vehicles"],
    ["/ops/manual", "Manual"],
    ["/ops/support", "Support"],
    ["/ops/exceptions", "Pay/ex"],
    ["/ops/safety", "Safety"],
    ["/ops/preferred", "Preferred"],
  ];
  return (
    <div className="grid min-h-screen grid-cols-[64px_1fr] md:grid-cols-[76px_1fr]">
      <aside className="border-r border-[var(--line)] bg-[var(--paper)]">
        <Link href="/ops" className="block px-3 py-4">
          <span className="zf-pin" style={{ background: "var(--signal)", width: 16, height: 16 }} />
          <div className="mt-2 text-[10px] tracking-[0.14em]">ZF OPS</div>
        </Link>
        {rail.map(([h, l]) => (
          <Link key={h} href={h} className={`block px-3 py-3 text-[11px] ${path === h ? "text-[var(--signal)]" : "text-[var(--mute)]"}`}>
            {l}
          </Link>
        ))}
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
          <input className="w-full max-w-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm" placeholder="Command: ZF-82041 · BR156 · D-118 · TPE" />
          <Director />
        </header>
        {live.incident && !live.incident.ack && live.phase !== "reassigned" && live.phase !== "completed" ? (
          <Link href="/ops/incident" className="zf-alert">
            <span className="zf-chip crit">CRITICAL</span>
            <b>{live.incident.category}</b>
            <span>
              {live.bookingId} · {live.passenger} waiting context · {live.candidates.length} replacements
            </span>
            <span className="ml-auto underline">Open incident</span>
          </Link>
        ) : null}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function AdminChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const rail = [
    ["/admin/services", "Services"],
    ["/admin/vehicles", "Vehicles"],
    ["/admin/capacity", "Capacity"],
    ["/admin/pricing", "Pricing"],
    ["/admin/dynamic", "Dynamic"],
    ["/admin/airports", "Airport"],
    ["/admin/cancellation", "Cancel"],
    ["/admin/dispatch", "Dispatch"],
    ["/admin/payments", "Pay"],
    ["/admin/refunds", "Refunds"],
    ["/admin/settlements", "Settle"],
    ["/admin/wallet", "Wallet"],
    ["/admin/recon", "Recon"],
    ["/admin/crm", "CRM"],
    ["/admin/promotions", "Growth"],
    ["/admin/loyalty", "Loyalty"],
    ["/admin/analytics", "Analytics"],
    ["/admin/notifications", "Notify"],
    ["/admin/i18n", "i18n"],
    ["/admin/integrations", "Integrations"],
    ["/admin/roles", "Roles"],
    ["/admin/audit", "Audit"],
  ];
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[140px_1fr]">
      <aside className="hidden border-r border-[var(--line)] bg-[var(--paper)] md:block">
        <Link href="/admin/services" className="block px-3 py-4 text-[10px] tracking-[0.14em]">
          ZF CONFIG
        </Link>
        {rail.map(([h, l]) => (
          <Link key={h} href={h} className={`block px-3 py-2 text-[11px] ${path === h ? "text-[var(--signal)]" : "text-[var(--mute)]"}`}>
            {l}
          </Link>
        ))}
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-[var(--line)] px-3 py-2">
          <span className="kicker">Configuration · Signal OS</span>
          <Director compact />
        </header>
        <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] px-3 py-2 md:hidden">
          {rail.map(([h, l]) => (
            <Link key={h} href={h} className={`shrink-0 text-[11px] ${path === h ? "text-[var(--signal)]" : "text-[var(--mute)]"}`}>
              {l}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export function SignalRoot({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const os = path.startsWith("/driver") ? "driver" : path.startsWith("/ops") ? "ops" : path.startsWith("/admin") ? "admin" : path.startsWith("/design") || path.startsWith("/demo") ? "system" : "passenger";
  return (
    <div data-os={os === "system" ? (path.startsWith("/demo") ? "ops" : "passenger") : os === "admin" ? "passenger" : os} className="min-h-screen">
      {os === "passenger" ? <PassengerChrome>{children}</PassengerChrome> : null}
      {os === "driver" ? <DriverChrome>{children}</DriverChrome> : null}
      {os === "ops" ? <OpsChrome>{children}</OpsChrome> : null}
      {os === "admin" ? <AdminChrome>{children}</AdminChrome> : null}
      {os === "system" ? (
        <div>
          <header className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <Link href="/design" className="font-semibold">
              ZOUFENG · Design gate
            </Link>
            <Director />
          </header>
          {children}
        </div>
      ) : null}
    </div>
  );
}
