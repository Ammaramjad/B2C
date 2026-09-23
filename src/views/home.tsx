"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cities } from "@/lib/catalog";
import { formatWhen, serviceLabel, tx } from "@/lib/present";
import { useStore } from "@/lib/store";
import type { ServiceType } from "@/lib/types";
import { Count, PlaceField, Price, Status, usePassengerId } from "@/components/zf/ui";
import { tripBucket } from "@/lib/present";

const services: { id: ServiceType; en: string; zh: string; href: string }[] = [
  { id: "airport_pickup", en: "Airport pickup", zh: "機場接機", href: "/book/airport" },
  { id: "airport_drop", en: "Airport drop-off", zh: "機場送機", href: "/book/airport?mode=drop" },
  { id: "p2p", en: "Point to point", zh: "點對點", href: "/book/transfer" },
  { id: "hourly", en: "Hourly charter", zh: "計時包車", href: "/book/charter" },
  { id: "instant", en: "Taxi now", zh: "即時叫車", href: "/book/taxi" },
  { id: "rental", en: "Self-drive", zh: "自駕租車", href: "/book/rental" },
];

export function Home() {
  const router = useRouter();
  const { locale, draft, setDraft, bookings, recent, pushRecent, user } = useStore();
  const pid = usePassengerId();
  const upcoming = bookings.find((b) => b.passengerId === pid && tripBucket(b.status) === "upcoming");
  const photo = cities[0].image;

  function go() {
    const href = services.find((s) => s.id === draft.service)?.href ?? "/book/airport";
    pushRecent(`${draft.pickup} → ${draft.dropoff}`);
    router.push(href);
  }

  return (
    <>
      <section className="zf-home">
        <figure className="zf-hero" style={{ backgroundImage: `url(${photo})` }}>
          <figcaption>Taipei basin · TPE corridor</figcaption>
        </figure>
        <div className="zf-composer">
          <p className="zf-kicker">{tx(locale, "Taiwan mobility", "台灣移動")}</p>
          <h1>{tx(locale, "Where are you going?", "你要去哪裡？")}</h1>
          <div className="zf-service-index" role="tablist" aria-label={tx(locale, "Service", "服務")}>
            {services.map((s) => (
              <button key={s.id} type="button" data-on={draft.service === s.id} onClick={() => setDraft({ service: s.id })}>
                {tx(locale, s.en, s.zh)}
              </button>
            ))}
          </div>
          <div className="zf-grid-2">
            <PlaceField label={tx(locale, "From", "出發")} value={draft.pickup} onChange={(pickup) => setDraft({ pickup })} />
            <PlaceField label={tx(locale, "To", "目的地")} value={draft.dropoff} onChange={(dropoff) => setDraft({ dropoff })} />
          </div>
          <div className="zf-grid-2">
            <label className="zf-field">
              <span>{tx(locale, "Date", "日期")}</span>
              <input type="date" value={draft.when.slice(0, 10)} onChange={(e) => setDraft({ when: `${e.target.value}T${draft.when.slice(11, 16) || "16:40"}` })} />
            </label>
            <label className="zf-field">
              <span>{tx(locale, "Time", "時間")}</span>
              <input type="time" value={draft.when.slice(11, 16)} onChange={(e) => setDraft({ when: `${draft.when.slice(0, 10)}T${e.target.value}` })} />
            </label>
          </div>
          <div className="zf-grid-2">
            <Count label={tx(locale, "Passengers", "乘客")} value={draft.passengers} min={1} max={10} onChange={(passengers) => setDraft({ passengers })} />
            <Count label={tx(locale, "Bags", "行李")} value={draft.luggage} min={0} max={12} onChange={(luggage) => setDraft({ luggage })} />
          </div>
          {recent.length > 0 && (
            <p className="zf-note">
              {tx(locale, "Recent", "最近搜尋")}{" "}
              {recent.map((r) => (
                <span key={r}> · {r}</span>
              ))}
            </p>
          )}
          <button type="button" className="zf-btn zf-btn-primary" onClick={go}>
            {tx(locale, "Continue this ride", "繼續預訂")}
          </button>
          <p className="zf-note">{tx(locale, "Airport arrivals this month: NT$200 off with TPE200. Applied only at checkout.", "本月機場接機可用 TPE200 折 NT$200，結帳時使用。")}</p>
        </div>
      </section>
      <div className="zf-home-rest">
        {upcoming && (
          <article className="zf-ticket">
            <div>
              <p className="zf-kicker">{tx(locale, "Upcoming", "即將出發")}</p>
              <Status status={upcoming.status} />
            </div>
            <div>
              <h2 style={{ margin: "0 0 6px" }}>
                {upcoming.pickup} → {upcoming.dropoff}
              </h2>
              <p style={{ margin: 0 }}>
                {serviceLabel(upcoming.service, locale)} · {formatWhen(upcoming.when)}
                {upcoming.flight ? ` · ${upcoming.flight}` : ""}
              </p>
            </div>
            <Link href={`/trips/${upcoming.id}`} className="zf-btn zf-btn-line">
              {tx(locale, "Open trip", "查看行程")}
            </Link>
          </article>
        )}
        <section>
          <p className="zf-kicker">{tx(locale, "Corridors", "路線")}</p>
          <div className="zf-corridors">
            {cities.slice(0, 4).map((city) => (
              <Link key={city.id} href={`/destinations/${city.id}`} className="zf-corridor">
                <i style={{ backgroundImage: `url(${city.image})` }} />
                <span>
                  <strong className="zf-display" style={{ fontSize: "1.7rem" }}>
                    {locale === "zh" ? city.cityZh : city.city}
                  </strong>
                  <br />
                  <span className="zf-note">{locale === "zh" ? city.tagZh : city.tag}</span>
                  <br />
                  <Price twd={city.from} className="zf-num" />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="zf-panel" style={{ padding: 16 }}>
          <p className="zf-kicker">{tx(locale, "Plan a trip", "規劃旅程")}</p>
          <h2 style={{ marginTop: 0 }}>{tx(locale, "Plan a 3-day Taipei family trip for five people.", "規劃五人、三天的台北家庭行程。")}</h2>
          <Link href="/planner" className="zf-btn zf-btn-ink">
            {tx(locale, "Draft an itinerary", "產生行程草案")}
          </Link>
          <p className="zf-note">{tx(locale, "The planner suggests rides. It does not buy them.", "規劃只提出建議，不會自動下單。")}</p>
        </section>
        <section className="zf-facts">
          <div>
            <strong>{tx(locale, "Flight-tracked", "航班追蹤")}</strong>
            <p className="zf-note">{tx(locale, "Pickup follows the recorded arrival, not only the schedule.", "接機時間跟隨實際抵達，不只看表定。")}</p>
          </div>
          <div>
            <strong>{tx(locale, "45 minutes", "45 分鐘")}</strong>
            <p className="zf-note">{tx(locale, "Included waiting after an airport arrival.", "機場抵達後的免費等候。")}</p>
          </div>
          <div>
            <strong>{tx(locale, "Four-digit code", "四位數代碼")}</strong>
            <p className="zf-note">{tx(locale, "You board only after the driver verifies it.", "司機核對後才開始行程。")}</p>
          </div>
          <div>
            <strong>{tx(locale, "Harbor Circle", "豐會籍")}</strong>
            <p className="zf-note">{(user?.points ?? 4280).toLocaleString()} {tx(locale, "points with Amara Chen.", "點，示範帳戶 Amara Chen。")}</p>
          </div>
        </section>
      </div>
    </>
  );
}
