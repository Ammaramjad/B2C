"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLive } from "@/lib/live/engine";

function Director() {
  const { live, play, pause, reset, step, setScenario } = useLive();
  return (
    <div className="flex items-center gap-2 text-[11px]">
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
        <Director />
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
    <div className="mx-auto min-h-screen max-w-[430px] bg-[var(--mist)]">
      <header className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="kicker">Driver command</div>
          <div className="text-lg font-semibold">David / Jason</div>
        </div>
        <Link href="/demo" className="text-[11px] text-[var(--mute)]">
          Demo
        </Link>
      </header>
      {onDuty ? (
        <Link href="/driver/incident" className="mx-4 mb-3 block bg-[var(--signal)] py-3 text-center text-sm font-bold text-white">
          REPORT INCIDENT
        </Link>
      ) : null}
      <div className="px-4 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-1/2 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[var(--line)] bg-[var(--mist)] text-center text-[11px]">
        {[
          ["/driver", "Duty"],
          ["/driver/offer", "Offer"],
          ["/driver/run", "Job"],
          ["/driver/performance", "Stats"],
        ].map(([h, l]) => (
          <Link key={h} href={h} className={`py-4 ${path === h ? "text-[var(--signal)]" : ""}`}>
            {l}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function OpsChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { live } = useLive();
  const rail = [
    ["/ops", "Center"],
    ["/ops/dispatch", "Dispatch"],
    ["/ops/airport", "Airport"],
    ["/ops/incident", "Incident"],
    ["/ops/replace", "Replace"],
    ["/ops/drivers", "Drivers"],
    ["/ops/fleet", "Fleet"],
  ];
  return (
    <div className="grid min-h-screen grid-cols-[76px_1fr]">
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

export function SignalRoot({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const os = path.startsWith("/driver") ? "driver" : path.startsWith("/ops") ? "ops" : path.startsWith("/admin") ? "admin" : path.startsWith("/design") || path.startsWith("/demo") || path.startsWith("/login") ? "system" : "passenger";
  return (
    <div data-os={os === "admin" || os === "system" ? (path.startsWith("/demo") ? "ops" : "passenger") : os} className="min-h-screen">
      {os === "passenger" ? <PassengerChrome>{children}</PassengerChrome> : null}
      {os === "driver" ? <DriverChrome>{children}</DriverChrome> : null}
      {os === "ops" ? <OpsChrome>{children}</OpsChrome> : null}
      {os === "admin" || os === "system" ? (
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
