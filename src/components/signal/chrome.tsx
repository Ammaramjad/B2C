"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLive } from "@/lib/live/engine";
import { useCopy } from "@/lib/copy";

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

function LocaleBar() {
  const { locale, setLocale, L } = useCopy();
  return (
    <div className="flex items-center gap-1" data-testid="locale-bar">
      <button
        type="button"
        className={`zf-btn ${locale === "en" ? "" : "ghost"}`}
        style={{ minHeight: 28, padding: "0 8px", fontSize: 11 }}
        onClick={() => setLocale("en")}
        data-testid="locale-en"
      >
        EN
      </button>
      <button
        type="button"
        className={`zf-btn ${locale === "zh" ? "" : "ghost"}`}
        style={{ minHeight: 28, padding: "0 8px", fontSize: 11 }}
        onClick={() => setLocale("zh")}
        data-testid="locale-zh"
      >
        繁中
      </button>
      <span className="sr-only">{L("English", "繁體中文")}</span>
    </div>
  );
}

function RoleJump() {
  const { L } = useCopy();
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[11px]" data-testid="role-jump">
      <Link href="/" className="underline">
        {L("Customer", "乘客")}
      </Link>
      <Link href="/driver" className="underline">
        {L("Driver", "司機")}
      </Link>
      <Link href="/ops" className="underline">
        {L("Ops", "調度")}
      </Link>
      <Link href="/admin/services" className="underline">
        {L("Admin", "後台")}
      </Link>
      <Link href="/demo" className="underline">
        Demo
      </Link>
    </nav>
  );
}

function HtmlLang() {
  const { locale } = useCopy();
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
  }, [locale]);
  return null;
}

export function PassengerChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { live } = useLive();
  const { L } = useCopy();
  const tabs = [
    ["/", L("Move", "移動")],
    ["/book", L("Book", "預訂")],
    ["/live", L("Live", "即時")],
    ["/preferred", L("Drivers", "司機")],
    ["/account", L("You", "我的")],
  ];
  return (
    <div className="min-h-screen">
      <HtmlLang />
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
        <div className="flex flex-wrap items-center justify-end gap-3">
          <LocaleBar />
          <RoleJump />
          <div className="hidden md:block">
            <Director />
          </div>
          <div className="md:hidden">
            <Director compact />
          </div>
        </div>
      </header>
      {live.customerNotice ? (
        <div className="zf-alert">
          <b>{L("Update", "更新")}</b>
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
  const { L } = useCopy();
  const onDuty = ["en_route_airport", "near_airport", "arrived", "waiting", "trip_started", "en_route_dest", "reassigned", "disrupted"].includes(live.phase);
  return (
    <div className="min-h-screen bg-[var(--mist)] lg:grid lg:grid-cols-[1fr_430px]">
      <HtmlLang />
      <div className="hidden border-r border-[var(--line)] lg:block">
        <div className="p-6">
          <div className="kicker">{L("Driver desktop", "司機桌面")}</div>
          <h2 className="display mt-2 text-4xl">{L("Stay on the assignment.", "守住這趟派遣。")}</h2>
          <p className="mt-3 max-w-md text-sm text-[var(--ink-2)]">
            {L("Map and event tape stay on the left. Task controls stay in the column — no invented KPIs.", "地圖與事件帶在左側，任務操作在右側欄——不編造 KPI。")}
          </p>
          <div className="mt-6">
            <RoleJump />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[430px] lg:max-w-none">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div>
          <div className="kicker">{L("Driver command", "司機指揮")}</div>
          <div className="text-lg font-semibold">David / Jason</div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LocaleBar />
          <Director compact />
        </div>
      </header>
      {onDuty ? (
        <Link href="/driver/incident" className="mx-4 mb-3 block bg-[var(--signal)] py-3 text-center text-sm font-bold text-white">
          {L("REPORT INCIDENT", "回報事件")}
        </Link>
      ) : null}
      <div className="px-4 pb-24">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-[var(--mist)] text-center text-[11px] lg:left-auto lg:w-[430px]">
        {[
          ["/driver", L("Duty", "執勤")],
          ["/driver/offer", L("Offer", "指派")],
          ["/driver/run", L("Job", "任務")],
          ["/driver/performance", L("Stats", "績效")],
          ["/driver/earnings", L("Pay", "收入")],
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
  const { L } = useCopy();
  const rail = [
    ["/ops", L("Center", "中心")],
    ["/ops/queue", L("Queue", "佇列")],
    ["/ops/dispatch", L("Dispatch", "派遣")],
    ["/ops/airport", L("Airport", "機場")],
    ["/ops/flights", L("Flights", "航班")],
    ["/ops/incident", L("Incident", "事件")],
    ["/ops/replace", L("Replace", "替換")],
    ["/ops/drivers", L("Drivers", "司機")],
    ["/ops/fleet", L("Fleet", "車隊")],
    ["/ops/vehicles", L("Vehicles", "車輛")],
    ["/ops/manual", L("Manual", "人工")],
    ["/ops/support", L("Support", "客服")],
    ["/ops/exceptions", L("Pay/ex", "帳務")],
    ["/ops/safety", L("Safety", "安全")],
    ["/ops/preferred", L("Preferred", "指定")],
  ];
  return (
    <div className="grid min-h-screen grid-cols-[64px_1fr] md:grid-cols-[76px_1fr]">
      <HtmlLang />
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
          <input className="w-full max-w-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm" placeholder={L("Command: ZF-82041 · BR156 · D-118 · TPE", "指令：ZF-82041 · BR156 · D-118 · TPE")} />
          <div className="flex flex-wrap items-center gap-2">
            <LocaleBar />
            <RoleJump />
            <Director />
          </div>
        </header>
        {live.incident && !live.incident.ack && live.phase !== "reassigned" && live.phase !== "completed" ? (
          <Link href="/ops/incident" className="zf-alert">
            <span className="zf-chip crit">{L("CRITICAL", "緊急")}</span>
            <b>{live.incident.category}</b>
            <span>
              {live.bookingId} · {live.passenger} {L("waiting context", "等候中")} · {live.candidates.length} {L("replacements", "替補")}
            </span>
            <span className="ml-auto underline">{L("Open incident", "開啟事件")}</span>
          </Link>
        ) : null}
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function AdminChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { L } = useCopy();
  const rail = [
    ["/admin/services", L("Services", "服務")],
    ["/admin/vehicles", L("Vehicles", "車款")],
    ["/admin/capacity", L("Capacity", "承載")],
    ["/admin/pricing", L("Pricing", "計價")],
    ["/admin/dynamic", L("Dynamic", "動態")],
    ["/admin/airports", L("Airport", "機場")],
    ["/admin/cancellation", L("Cancel", "取消")],
    ["/admin/dispatch", L("Dispatch", "派遣")],
    ["/admin/payments", L("Pay", "付款")],
    ["/admin/refunds", L("Refunds", "退款")],
    ["/admin/settlements", L("Settle", "結算")],
    ["/admin/wallet", L("Wallet", "錢包")],
    ["/admin/recon", L("Recon", "對帳")],
    ["/admin/crm", L("CRM", "客戶")],
    ["/admin/promotions", L("Growth", "成長")],
    ["/admin/loyalty", L("Loyalty", "會員")],
    ["/admin/analytics", L("Analytics", "分析")],
    ["/admin/notifications", L("Notify", "通知")],
    ["/admin/i18n", "i18n"],
    ["/admin/integrations", L("Integrations", "串接")],
    ["/admin/roles", L("Roles", "角色")],
    ["/admin/audit", L("Audit", "稽核")],
  ];
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[140px_1fr]">
      <HtmlLang />
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
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2">
          <span className="kicker">{L("Configuration · Signal OS", "設定 · Signal OS")}</span>
          <div className="flex flex-wrap items-center gap-2">
            <LocaleBar />
            <RoleJump />
            <Director compact />
          </div>
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
          <HtmlLang />
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
            <Link href="/design" className="font-semibold">
              ZOUFENG · Design gate
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <LocaleBar />
              <RoleJump />
              <Director />
            </div>
          </header>
          {children}
        </div>
      ) : null}
    </div>
  );
}
