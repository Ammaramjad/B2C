"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cities } from "@/lib/catalog";
import { useCopy } from "@/lib/copy";

const HERO = "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=2000&q=80";
const VAN = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1400&q=80";

const SERVICES = [
  { href: "/go?service=airport_pickup", en: "Airport transfer", zh: "機場接送", img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80", dEn: "Flight-aware pickup and drop-off", dZh: "航班連動接機／送機" },
  { href: "/go?service=p2p", en: "Point to point", zh: "點對點接送", img: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=900&q=80", dEn: "City to city, one assignment", dZh: "城市之間，一趟公司派遣" },
  { href: "/go?service=rental", en: "Self-drive", zh: "自駕租車", img: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=900&q=80", dEn: "Depot pickup, no chauffeur", dZh: "車廠取車，無司機" },
  { href: "/go?service=hourly", en: "Charter", zh: "包車用車", img: "https://images.unsplash.com/photo-1544620341-11cb2cd7c323?w=900&q=80", dEn: "Driver stays with the party", dZh: "司機隨行，計時包車" },
];

const ROUTES = [
  { from: "台北", to: "桃園機場", price: 1280, img: cities[2].image, href: "/go?service=airport_drop" },
  { from: "台北", to: "九份", price: 1680, img: cities[1].image, href: "/go?service=hourly" },
  { from: "台中", to: "日月潭", price: 2480, img: cities[3].image, href: "/go?service=hourly" },
  { from: "高雄", to: "小港機場", price: 1880, img: cities[5].image, href: "/go?service=airport_pickup" },
  { from: "花蓮", to: "太魯閣", price: 1880, img: cities[6].image, href: "/go?service=p2p" },
  { from: "高雄", to: "墾丁", price: 2660, img: cities[7].image, href: "/go?service=hourly" },
];

export function SiteHome() {
  const { L, locale } = useCopy();
  const router = useRouter();
  const [mode, setMode] = useState<"now" | "schedule" | "multi">("now");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [when, setWhen] = useState("2026-09-24T16:30");
  const [pax, setPax] = useState(1);
  function search() {
    const q = new URLSearchParams({ service: "airport_pickup", pickup: from, dropoff: to, when, pax: String(pax) });
    router.push(`/go?${q.toString()}`);
  }
  return (
    <div>
      <section className="zf-site-hero" style={{ backgroundImage: `url(${HERO})` }}>
        <div className="zf-site-hero-inner">
          <div className="kicker" style={{ color: "#ffb4b8" }}>{L("More professional · more comfortable · more at ease", "更專業 · 更舒適 · 更安心")}</div>
          <h1>{L("Move Taiwan closer.", "移動，讓台灣更近")}</h1>
          <p className="mt-4 max-w-md text-[#d5dbe3]">
            {L("Airport, charter, city transfer, corporate. Professional drivers. Comfortable cars. A safer journey.", "機場接送、包車旅遊、城市接送、企業用車。專業司機、舒適車輛、安全旅程。")}
          </p>
          <img src={VAN} alt={L("Chauffeur van", "禮賓車")} className="pointer-events-none absolute bottom-0 right-8 hidden w-[46%] max-w-[620px] lg:block" />
        </div>
      </section>
      <div className="zf-site-search">
        <div className="zf-site-search-card">
          <div className="zf-site-modes">
            <button type="button" className={mode === "now" ? "on" : ""} onClick={() => setMode("now")}>{L("Ride now", "立即叫車")}</button>
            <button type="button" className={mode === "schedule" ? "on" : ""} onClick={() => setMode("schedule")}>{L("Schedule", "預約用車")}</button>
            <button type="button" className={mode === "multi" ? "on" : ""} onClick={() => setMode("multi")}>{L("Multi-stop", "多點行程")}</button>
          </div>
          <div className="zf-site-grid">
            <label><span>{L("Pickup", "上車地點")}</span><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder={L("Enter pickup", "請輸入上車地點")} /></label>
            <label><span>{L("Destination", "目的地")}</span><input value={to} onChange={(e) => setTo(e.target.value)} placeholder={L("Enter destination", "請輸入目的地")} /></label>
            <label><span>{L("Date / time", "日期時間")}</span><input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
            <label><span>{L("Passengers / bags", "乘客與行李")}</span>
              <select value={pax} onChange={(e) => setPax(Number(e.target.value))}>
                <option value={1}>{L("1 passenger · 2 bags", "1 位乘客 · 2 件行李")}</option>
                <option value={2}>{L("2 passengers · 2 bags", "2 位乘客 · 2 件行李")}</option>
                <option value={4}>{L("4 passengers · 4 bags", "4 位乘客 · 4 件行李")}</option>
                <option value={6}>{L("6 passengers · 6 bags", "6 位乘客 · 6 件行李")}</option>
              </select>
            </label>
            <button type="button" className="go" onClick={search}>{L("Search cars →", "搜尋車輛 →")}</button>
          </div>
        </div>
      </div>
      <section className="zf-site-wrap">
        <div className="zf-site-cards">
          {SERVICES.map((s) => (
            <Link key={s.href} href={s.href} className="zf-site-card">
              <i style={{ backgroundImage: `url(${s.img})` }} />
              <b>{L(s.en, s.zh)}</b>
              <p>{L(s.dEn, s.dZh)}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="zf-site-wrap pt-0">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="display text-3xl">{L("Popular routes", "熱門路線")}</h2>
            <p className="text-sm text-[#8b93a0]">{L("Explore Taiwan’s most booked corridors", "探索台灣最受歡迎的目的地")}</p>
          </div>
          <Link href="/destinations" className="text-sm text-[#e11d2e]">{L("See more", "查看更多")}</Link>
        </div>
        <div className="zf-site-routes">
          {ROUTES.map((r) => (
            <Link key={`${r.from}-${r.to}`} href={r.href} className="zf-site-route">
              <i style={{ backgroundImage: `url(${r.img})` }} />
              <b>{r.from} → {r.to}</b>
              <em>NT${r.price.toLocaleString()}</em>
            </Link>
          ))}
        </div>
      </section>
      <section className="zf-site-wrap pt-0">
        <div className="zf-site-trust">
          <div><b>100%</b><div>{L("On-time commitment", "準時保證")}</div></div>
          <div><b>24/7</b><div>{L("Dedicated desk", "專屬客服")}</div></div>
          <div><b>5,000+</b><div>{L("Professional drivers", "專業司機")}</div></div>
          <div><b>4.8 / 5</b><div>{L("From 10,000+ reviews", "10,000+ 評價")}</div></div>
          <div><b>{locale === "zh" ? "多元支付" : "Pay your way"}</b><div>{L("Card · LINE · cash", "卡 · LINE · 現金")}</div></div>
        </div>
      </section>
    </div>
  );
}
