"use client";

import Link from "next/link";
import { cities, services } from "@/lib/catalog";
import { useCopy } from "@/lib/copy";

export default function Page() {
  const { L, locale } = useCopy();
  return (
    <div className="zf-site-wrap">
      <div className="kicker">{L("Explore Taiwan", "探索台灣")}</div>
      <h1 className="display mt-2 text-5xl">{L("Airport and city corridors.", "機場與城市廊帶。")}</h1>
      <p className="mt-3 max-w-xl text-[#4a5568]">
        {L("Bookable landings — dispatch stays company-owned.", "可預訂的目的地頁。派遣仍由公司掌握。")}
      </p>
      <h2 className="mt-8 text-xl font-semibold">{L("Services", "服務")}</h2>
      <div className="zf-site-cards mt-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {services.map((s) => (
          <Link key={s.id} href={`/go?service=${s.id}`} className="zf-site-card">
            <div className="ico">→</div>
            <b>{L(s.en, s.zh)}</b>
            <p>{s.formula}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-semibold">{L("Cities", "城市")}</h2>
      <div className="zf-site-routes mt-4">
        {cities.map((c) => (
          <Link key={c.id} href={`/destinations/${c.id}`} className="zf-site-route">
            <i style={{ backgroundImage: `url(${c.image})` }} />
            <b>{locale === "zh" ? c.cityZh : c.city}</b>
            <em>NT${c.from.toLocaleString()}</em>
          </Link>
        ))}
      </div>
    </div>
  );
}
