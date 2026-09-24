"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLive } from "@/lib/live/engine";
import { useCopy } from "@/lib/copy";
import { useStore } from "@/lib/store";
import { MapMount } from "@/components/signal/map-mount";

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
  const items = [
    ["/", L("Customer", "乘客")],
    ["/driver", L("Driver", "司機")],
    ["/ops", L("Ops", "調度")],
    ["/admin/services", L("Admin", "後台")],
    ["/demo", "Demo"],
  ];
  return (
    <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]" data-testid="role-jump">
      {items.map(([h, l], i) => (
        <span key={h} className="inline-flex items-center gap-3">
          {i > 0 ? <span className="text-[var(--mute)]">·</span> : null}
          <Link href={h} className="underline-offset-4 hover:underline">
            {l}
          </Link>
        </span>
      ))}
    </nav>
  );
}

function HtmlLang() {
  const { locale } = useCopy();
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
    document.documentElement.dataset.locale = locale;
  }, [locale]);
  return null;
}

function LiveBell() {
  const { live } = useLive();
  const { domain, inboxReadAt, markInboxRead } = useStore();
  const { L } = useCopy();
  const [open, setOpen] = useState(false);
  const notes = [
    ...live.events.filter((e) => e.audience.includes("passenger")).map((e) => ({ id: e.id, clock: e.clock, text: `${e.title} — ${e.body}` })),
    ...domain.notifications.filter((n) => n.audience === "passenger").map((n) => ({ id: n.id, clock: n.at.slice(11, 16), text: n.template })),
  ].slice(0, 8);
  const unread = live.events.filter((e) => e.audience.includes("passenger") && e.at > inboxReadAt).length
    + domain.notifications.filter((n) => n.audience === "passenger" && Date.parse(n.at) > inboxReadAt).length;
  return (
    <div className="relative">
      <button
        type="button"
        className="zf-btn ghost"
        style={{ minHeight: 36, padding: "0 12px" }}
        data-testid="live-bell"
        onClick={() => {
          setOpen((v) => !v);
          markInboxRead();
        }}
      >
        {L("Alerts", "通知")}
        {unread > 0 ? <span className="zf-chip crit" data-testid="live-bell-count">{unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 zf-panel p-3 text-sm" data-testid="live-bell-panel">
          <div className="kicker">{L("Live notices", "即時通知")}</div>
          <ul className="zf-stream mt-2">
            {notes.map((n) => (
              <li key={n.id}>
                <span className="mono text-[var(--mute)]">{n.clock}</span> {n.text}
              </li>
            ))}
          </ul>
          <Link href="/inbox" className="zf-btn ghost mt-2 wide" onClick={() => setOpen(false)}>
            {L("Open inbox", "開啟收件匣")}
          </Link>
        </div>
      ) : null}
    </div>
  );
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
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--mist)_94%,transparent)] px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="zf-pin" style={{ background: "var(--signal)", width: 18, height: 18 }} />
            <b className="text-lg tracking-tight">ZOUFENG</b>
          </Link>
          <nav className="hidden items-center gap-6 text-[17px] font-medium md:flex">
            {tabs.map(([h, l]) => (
              <Link key={h} href={h} className={path === h || (h !== "/" && path.startsWith(h)) ? "text-[var(--signal)]" : "text-[var(--ink-2)]"}>
                {l}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <LiveBell />
            <LocaleBar />
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <RoleJump />
          <Director compact />
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
  const me = live.drivers[0];
  const onDuty = ["en_route_airport", "near_airport", "arrived", "waiting", "trip_started", "en_route_dest", "reassigned", "disrupted"].includes(live.phase);
  const tape = live.events.filter((e) => e.audience.includes("driver")).slice(0, 5);
  return (
    <div className="zf-cockpit min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(520px,42vw)]">
      <HtmlLang />
      <span className="zf-orb a" />
      <span className="zf-orb b" />
      <span className="zf-orb c" />
      <div className="relative z-[2] hidden min-h-screen flex-col lg:flex">
        <div className="relative min-h-[62vh] flex-1 overflow-hidden">
          <MapMount mode="night" height="62vh" showFleet />
          <div className="zf-radar z-[450]"><div className="zf-sweep" /></div>
          <div className="pointer-events-none absolute left-5 top-5 z-[600] max-w-md">
            <div className="zf-glass pointer-events-auto px-4 py-3">
              <div className="kicker">{L("Driver desktop", "司機桌面")}</div>
              <h2 className="display mt-1 text-3xl">{L("Stay on the assignment.", "守住這趟派遣。")}</h2>
              <p className="mt-2 text-sm text-[var(--ink-2)]">
                {L("Live cars move on the map. Duty, job and money stay in the wide console.", "即時車輛在地圖移動。執勤、任務與收入在右側寬控制台。")}
              </p>
              <div className="mt-3 pointer-events-auto">
                <RoleJump />
              </div>
            </div>
          </div>
        </div>
        <ul className="zf-stream z-[2] mx-5 mb-5 mt-4 max-h-40 overflow-auto rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_72%,transparent)] px-4">
          {tape.length ? tape.map((e) => (
            <li key={e.id}>{e.clock} · {e.title}</li>
          )) : <li>{L("Waiting for live tape…", "等待即時事件帶…")}</li>}
        </ul>
      </div>
      <div className="relative z-[3] mx-auto w-full max-w-[640px] border-l border-[var(--line)] bg-[color-mix(in_srgb,var(--mist)_82%,transparent)] backdrop-blur-md lg:max-w-none">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--signal)] text-sm font-bold text-white shadow-[0_0_0_8px_color-mix(in_srgb,var(--signal)_20%,transparent)]">
            {me.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </span>
          <div>
            <div className="kicker">{L("Driver command", "司機指揮")}</div>
            <div className="text-xl font-semibold">{me.name}</div>
            <div className="text-xs text-[var(--mute)]">{me.vehicle} · {me.plate}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LiveBell />
          <LocaleBar />
          <Director compact />
        </div>
      </header>
      {onDuty ? (
        <Link href="/driver/incident" className="mx-5 mb-3 block rounded-2xl bg-[var(--signal)] py-3 text-center text-sm font-bold text-white">
          {L("REPORT INCIDENT", "回報事件")}
        </Link>
      ) : null}
      <div className="px-5 pb-28">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--mist)_92%,transparent)] text-center text-[12px] backdrop-blur lg:left-auto lg:w-[min(42vw,640px)]">
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
    <div className="grid min-h-screen grid-cols-[88px_1fr] md:grid-cols-[168px_1fr]">
      <HtmlLang />
      <aside className="border-r border-[var(--line)] bg-[var(--paper)]">
        <Link href="/ops" className="block px-4 py-5">
          <span className="zf-pin" style={{ background: "var(--signal)", width: 16, height: 16 }} />
          <div className="mt-2 text-[12px] font-semibold tracking-[0.08em]">ZF OPS</div>
        </Link>
        {rail.map(([h, l]) => (
          <Link key={h} href={h} className={`mx-2 mb-1 block rounded-xl px-3 py-2.5 text-[13px] ${path === h ? "bg-[var(--mist)] text-[var(--signal)]" : "text-[var(--mute)]"}`}>
            {l}
          </Link>
        ))}
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
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

function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { L, locale, setLocale } = useCopy();
  const links = [
    ["/", L("Home", "首頁")],
    ["/go", L("Book", "預訂行程")],
    ["/go?service=airport_pickup", L("Airport", "機場接送")],
    ["/go?service=hourly", L("Charter", "包車旅遊")],
    ["/go?service=instant", L("Corporate", "企業用車")],
    ["/fleet", L("Fleet", "車隊介紹")],
    ["/destinations", L("Explore", "探索台灣")],
  ];
  return (
    <div className="zf-site" data-os="site">
      <HtmlLang />
      <header className="zf-site-nav">
        <Link href="/" className="flex items-center gap-2">
          <span className="zf-pin" style={{ background: "#e11d2e", width: 16, height: 16 }} />
          <span>
            <b>ZOUFENG</b>
            <div className="text-[11px] text-[#8b93a0]">{L("Taiwan mobility", "台灣專業移動服務")}</div>
          </span>
        </Link>
        <nav className="hidden lg:flex">
          {links.map(([h, l]) => (
            <Link key={h} href={h} className={path === h || (h !== "/" && path.startsWith(h.split("?")[0]) && h !== "/go") ? "on" : ""}>
              {l}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <button type="button" onClick={() => setLocale(locale === "en" ? "zh" : "en")}>{locale === "en" ? "EN" : "繁體中文"}</button>
          <Link href="/login">{L("Sign in", "登入 / 註冊")}</Link>
        </div>
      </header>
      <main>{children}</main>
      <nav className="zf-site-dock" aria-label={L("Whole system", "完整系統")}>
        <Link href="/" className={path === "/" ? "on" : ""}>{L("Customer", "旅客")}</Link>
        <Link href="/fleet" className={path.startsWith("/fleet") ? "on" : ""}>{L("Drivers", "車隊名錄")}</Link>
        <Link href="/driver">{L("Driver desk", "司機台")}</Link>
        <Link href="/ops">{L("Ops", "調度")}</Link>
        <Link href="/admin/services">{L("Admin", "後台")}</Link>
        <Link href="/go">{L("Book", "預訂")}</Link>
      </nav>
    </div>
  );
}

function GuestChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <HtmlLang />
      {children}
    </div>
  );
}

export function SignalRoot({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const os = path === "/" || path.startsWith("/fleet")
    ? "site"
    : path.startsWith("/go")
    ? "guest"
    : path.startsWith("/driver")
      ? "driver"
      : path.startsWith("/ops")
        ? "ops"
        : path.startsWith("/admin")
          ? "admin"
          : path.startsWith("/design") || path.startsWith("/demo")
            ? "system"
            : "passenger";
  return (
    <div data-os={os === "system" ? (path.startsWith("/demo") ? "ops" : "passenger") : os === "admin" || os === "guest" || os === "site" ? "passenger" : os} className="min-h-screen">
      {os === "site" ? <SiteChrome>{children}</SiteChrome> : null}
      {os === "guest" ? <GuestChrome>{children}</GuestChrome> : null}
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
