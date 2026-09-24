"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cities, vehicles } from "@/lib/catalog";
import { MapMount } from "@/components/signal/map-mount";
import { useCopy } from "@/lib/copy";
import { useLive } from "@/lib/live/engine";
import { useStore } from "@/lib/store";
import type { ServiceType } from "@/lib/types";

const SKYLINE = "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=2000&q=80";
const HOST = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&q=80";
const CAR = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1400&q=80";
const DEEP = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1800&q=80";

const MODES: { id: ServiceType; en: string; zh: string }[] = [
  { id: "airport_pickup", en: "Airport", zh: "機場接送" },
  { id: "p2p", en: "Point to point", zh: "點到點" },
  { id: "hourly", en: "Charter", zh: "包車" },
  { id: "instant", en: "Quote", zh: "用車查詢" },
  { id: "rental", en: "Chauffeur hire", zh: "租車（司機）" },
  { id: "airport_drop", en: "Shared trip", zh: "共享行程" },
];

const SERVICES = [
  { href: "/go?service=airport_pickup", en: "Airport transfer", zh: "機場接送", ico: "✈", dEn: "Flight-aware pickup", dZh: "航班連動接機" },
  { href: "/go?service=p2p", en: "Point to point", zh: "點到點接送", ico: "◎", dEn: "City to city assignment", dZh: "城市之間一趟派遣" },
  { href: "/go?service=hourly", en: "Charter", zh: "包車用車", ico: "▣", dEn: "Driver stays with you", dZh: "司機隨行計時" },
  { href: "/go?service=instant", en: "Quote / corporate", zh: "用車查詢", ico: "⌕", dEn: "Instant corporate quote", dZh: "企業即時報價" },
  { href: "/go?service=rental", en: "Chauffeur hire", zh: "租車（司機）", ico: "▣", dEn: "By the day with driver", dZh: "含司機日租" },
  { href: "/go?service=airport_drop", en: "Shared trip", zh: "共享行程", ico: "⇄", dEn: "Shared airport corridor", dZh: "共享機場廊帶" },
];

const DEST = [
  { city: cities[0], zh: "台北", en: "Taipei" },
  { city: cities[1], zh: "九份", en: "Jiufen" },
  { city: { ...cities[3], city: "Sun Moon Lake", cityZh: "日月潭", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80" }, zh: "日月潭", en: "Sun Moon Lake" },
  { city: cities[5], zh: "高雄", en: "Kaohsiung" },
  { city: cities[6], zh: "花蓮", en: "Hualien" },
  { city: cities[7], zh: "墾丁", en: "Kenting" },
];

const FLEET = [
  vehicles.find((v) => v.id === "sedan")!,
  vehicles.find((v) => v.id === "mpv")!,
  vehicles.find((v) => v.id === "van")!,
  vehicles.find((v) => v.id === "shuttle")!,
];

export function SiteHome() {
  const { L, locale } = useCopy();
  const router = useRouter();
  const { live } = useLive();
  const { bookings } = useStore();
  const [service, setService] = useState<ServiceType>("airport_pickup");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [when, setWhen] = useState("2026-09-24T16:30");
  const [pax, setPax] = useState(2);
  const notes = live.events.filter((e) => e.audience.includes("passenger")).slice(0, 6);
  const trip = bookings[0];
  const driver = live.drivers[0];
  const weather = useMemo(() => live.clock, [live.clock]);

  function search() {
    const q = new URLSearchParams({
      service,
      pickup: from,
      dropoff: to,
      when,
      pax: String(pax),
    });
    router.push(`/go?${q.toString()}`);
  }

  return (
    <div>
      <section className="zf-site-hero">
        <div className="zf-site-hero-bg" style={{ backgroundImage: `url(${SKYLINE})` }} />
        <div className="zf-site-weather" data-testid="site-weather">
          <span>☀</span>
          <b>28°C</b>
          <span>{L("Taipei · partly cloudy", "台北 · 局部多雲")}</span>
          <em className="mono text-[11px] text-[#7a8594]">{weather}</em>
        </div>
        <div className="zf-site-hero-inner">
          <div className="zf-site-hero-copy">
            <h1>
              {L("Travel smarter.", "智能出行")}
              <br />
              {L("Explore Taiwan.", "探索更精彩的台灣")}
            </h1>
            <p className="sub">Travel Smarter, Explore Taiwan</p>
            <p className="mt-4 max-w-md text-[#4a5568]">
              {L(
                "Airport transfer, charter, city to city, corporate cars. Professional drivers. Comfortable fleet. A safer journey.",
                "機場接送、包車旅遊、城市接送、企業用車。專業司機、舒適車隊、安全旅程。",
              )}
            </p>
          </div>
          <div className="zf-site-hero-art" aria-hidden>
            <img className="host" src={HOST} alt="" />
            <img className="car" src={CAR} alt="" />
          </div>
        </div>
      </section>

      <div className="zf-site-search">
        <div className="zf-site-search-card">
          <div className="zf-site-modes" role="tablist">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={service === m.id ? "on" : ""}
                onClick={() => setService(m.id)}
              >
                {L(m.en, m.zh)}
              </button>
            ))}
          </div>
          <div className="zf-site-grid">
            <label>
              <span>{L("Airport / pickup", "機場／上車")}</span>
              <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder={L("TPE Terminal 1", "桃園機場第一航廈")} />
            </label>
            <label>
              <span>{L("Destination", "目的地")}</span>
              <input value={to} onChange={(e) => setTo(e.target.value)} placeholder={L("Taipei 101", "台北 101")} />
            </label>
            <label>
              <span>{L("Date / time", "日期時間")}</span>
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </label>
            <label>
              <span>{L("Passengers / bags", "乘客與行李")}</span>
              <select value={pax} onChange={(e) => setPax(Number(e.target.value))}>
                <option value={1}>{L("1 passenger · 2 bags", "1 位乘客 · 2 件行李")}</option>
                <option value={2}>{L("2 passengers · 2 bags", "2 位乘客 · 2 件行李")}</option>
                <option value={4}>{L("4 passengers · 4 bags", "4 位乘客 · 4 件行李")}</option>
                <option value={6}>{L("6 passengers · 6 bags", "6 位乘客 · 6 件行李")}</option>
              </select>
            </label>
            <button type="button" className="go" onClick={search} data-testid="site-search">
              {L("Search cars", "搜尋車輛")}
            </button>
          </div>
        </div>
      </div>

      <section className="zf-site-wrap">
        <div className="zf-site-cards">
          {SERVICES.map((s) => (
            <Link key={s.href} href={s.href} className="zf-site-card">
              <div className="ico">{s.ico}</div>
              <b>{L(s.en, s.zh)}</b>
              <p>{L(s.dEn, s.dZh)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="zf-site-wrap pt-0">
        <div className="zf-site-live">
          <div className="zf-site-panel">
            <h3>{L("Live notices", "即時動態")} <span className="text-[12px] text-[#2b7cff]">LiveNotification</span></h3>
            <ul>
              {notes.length ? notes.map((n) => (
                <li key={n.id} className="zf-site-note">
                  <time>{n.clock}</time>
                  <span>{n.title} — {n.body}</span>
                </li>
              )) : (
                <li className="zf-site-note"><span>{L("Waiting for live tape…", "等待即時事件帶…")}</span></li>
              )}
            </ul>
          </div>
          <div className="zf-site-panel">
            <h3>{L("Live vehicle position", "即時車輛位置")} <span className="text-[12px] text-[#2b7cff]">LiveTracking</span></h3>
            <div className="zf-site-live-map">
              <MapMount mode="day" showFleet height={240} />
            </div>
            <div className="zf-site-driver">
              <span className="av">{driver.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</span>
              <div>
                <b>{driver.name}</b>
                <div className="text-xs text-[#7a8594]">{driver.vehicle} · {driver.plate}</div>
              </div>
            </div>
          </div>
          <div className="zf-site-panel">
            <h3>{L("My trip", "我的行程")}</h3>
            {trip ? (
              <>
                <div className="zf-site-trip"><span>{L("Booking", "訂單")}</span><em>{trip.id}</em></div>
                <div className="zf-site-trip"><span>{L("Pickup", "上車")}</span><b>{trip.pickup}</b></div>
                <div className="zf-site-trip"><span>{L("Drop-off", "下車")}</span><b>{trip.dropoff}</b></div>
                <div className="zf-site-trip"><span>{L("Status", "狀態")}</span><em>{trip.status}</em></div>
                <Link href={`/trips/${trip.id}`} className="zf-btn wide mt-3">{L("Open trip", "開啟行程")}</Link>
              </>
            ) : (
              <>
                <p className="text-sm text-[#7a8594]">{L("No booking yet. Search a car to start.", "還沒有行程。先搜尋車輛。")}</p>
                <Link href="/go" className="zf-btn wide mt-3">{L("Book now", "立即預訂")}</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="zf-site-wrap pt-0">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="display text-3xl">{L("Popular trips", "探索熱門行程")}</h2>
            <p className="text-sm text-[#7a8594]">{L("Taiwan’s most booked corridors", "台灣最受歡迎的目的地")}</p>
          </div>
          <Link href="/destinations" className="text-sm text-[#2b7cff]">{L("See more", "查看更多")}</Link>
        </div>
        <div className="zf-site-routes">
          {DEST.map((d) => (
            <Link key={d.city.id + d.zh} href={`/destinations/${d.city.id}`} className="zf-site-route">
              <i style={{ backgroundImage: `url(${d.city.image})` }} />
              <b>{locale === "zh" ? d.zh : d.en}</b>
              <em>NT${d.city.from.toLocaleString()}</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="zf-site-wrap pt-0">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="display text-3xl">{L("Choose a vehicle", "精選車型")}</h2>
          <Link href="/fleet" className="text-sm text-[#2b7cff]">{L("Fleet directory", "車隊名錄")}</Link>
        </div>
        <div className="zf-site-cars">
          {FLEET.map((v) => (
            <Link key={v.id} href={`/go?service=airport_pickup`} className="zf-site-car">
              <i style={{ backgroundImage: `url(${v.image})` }} />
              <div className="body">
                <b>{L(v.name, v.nameZh)}</b>
                <p className="text-xs text-[#7a8594]">{v.model} · {v.seats} {L("seats", "人座")}</p>
                <em>NT${v.base.toLocaleString()}</em>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="zf-site-wrap pt-0">
        <div className="zf-site-app">
          <div>
            <h2 className="display text-3xl">{L("Get the ZOUFENG app", "下載 ZOUFENG APP")}</h2>
            <p className="mt-2 text-[#4a5568]">{L("Book, track, and manage trips from your phone.", "在手機預訂、追蹤、管理行程。")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="zf-chip">App Store</span>
              <span className="zf-chip">Google Play</span>
            </div>
          </div>
          <div className="zf-site-app-art" aria-hidden>
            <div className="zf-site-phone">
              <div className="zf-mark mx-auto">Z</div>
              <p className="mt-4 text-center text-sm">ZOUFENG</p>
              <p className="mt-2 text-center text-xs text-[#9eb0c6]">{L("Live trip", "即時行程")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="zf-site-wrap pt-0">
        <div className="zf-site-trust">
          <div><b>16,000+</b><div>{L("Completed trips", "完成行程")}</div></div>
          <div><b>24/7</b><div>{L("Dedicated desk", "專屬客服")}</div></div>
          <div><b>100%</b><div>{L("Company dispatch", "公司派遣")}</div></div>
          <div><b>{locale === "zh" ? "多元支付" : "Pay your way"}</b><div>{L("Card · LINE · cash", "卡 · LINE · 現金")}</div></div>
          <div><b>{L("Corporate", "企業方案")}</b><div>{L("Invoices & seats", "發票與座位")}</div></div>
        </div>
      </section>

      <section className="zf-site-wrap pt-0">
        <div className="zf-site-deep" style={{ backgroundImage: `url(${DEEP})` }}>
          <div>
            <h2 className="display text-4xl">{L("Deeper Taiwan travel", "台灣深度旅遊")}</h2>
            <p className="mt-2">{L("AI itinerary · weather-aware · live map · bilingual desk", "AI 規劃路線 · 天氣連動 · 即時地圖 · 雙語客服")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
