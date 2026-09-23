"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { cities } from "@/lib/catalog";
import { Price } from "@/components/zf/ui";
import { tx } from "@/lib/present";
import { useStore } from "@/lib/store";

export function Destinations() {
  const { locale } = useStore();
  return (
    <div className="zf-page">
      <p className="zf-kicker">{tx(locale, "Taiwan", "台灣")}</p>
      <h1>{tx(locale, "Corridors", "路線")}</h1>
      <div className="zf-corridors">
        {cities.map((city) => (
          <Link key={city.id} href={`/destinations/${city.id}`} className="zf-corridor">
            <i style={{ backgroundImage: `url(${city.image})` }} />
            <span>
              <strong>{locale === "zh" ? city.cityZh : city.city}</strong>
              <br />
              <span className="zf-note">{locale === "zh" ? city.tagZh : city.tag}</span>
              <br />
              <Price twd={city.from} className="zf-num" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { locale, setDraft } = useStore();
  const city = cities.find((c) => c.id === id) ?? cities[0];
  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">{locale === "zh" ? city.tagZh : city.tag}</p>
        <h1>{locale === "zh" ? city.cityZh : city.city}</h1>
        <p>{tx(locale, "Private arrival, a day with a driver, or a car of your own. Fares show the total before you pay.", "私人接機、一日包車，或自己開車。付款前看得到總價。")}</p>
        <p>
          {tx(locale, "Airport pickup from", "接機最低")} <Price twd={city.from} />
        </p>
        <Link href="/book/airport" className="zf-btn zf-btn-primary" onClick={() => setDraft({ service: "airport_pickup", dropoff: city.city })}>
          {tx(locale, "Book a pickup", "預訂接機")}
        </Link>
        <h2>{tx(locale, "Questions", "常見問題")}</h2>
        <p>{tx(locale, "The driver waits 45 minutes after the recorded arrival.", "司機在航班實際抵達後等候 45 分鐘。")}</p>
        <p>{tx(locale, "A sedan fits three passengers and three standard bags. Larger parties are offered an MPV or van.", "轎車可坐三人、三件標準行李。更多人會改建議商務車或廂型車。")}</p>
      </div>
      <div className="zf-hero" style={{ backgroundImage: `url(${city.image})`, minHeight: 420 }} />
    </div>
  );
}

export function RoutePage() {
  const { locale, setDraft } = useStore();
  return (
    <div className="zf-page zf-page-narrow">
      <p className="zf-kicker">TPE → Taipei 101</p>
      <h1>{tx(locale, "Airport to Taipei 101", "機場到台北 101")}</h1>
      <p>{tx(locale, "About 50 minutes without a terminal delay. Meet-and-greet is available on pickup.", "不含航廈延誤時約 50 分鐘。接機可選舉牌。")}</p>
      <p>
        {tx(locale, "From", "最低")} <Price twd={1280} />
      </p>
      <Link href="/book/transfer" className="zf-btn zf-btn-primary" onClick={() => setDraft({ service: "p2p", pickup: "TPE Terminal 1 Arrivals", dropoff: "Taipei 101" })}>
        {tx(locale, "See vehicles", "查看車輛")}
      </Link>
    </div>
  );
}

export function ServicePage() {
  const { locale } = useStore();
  return (
    <div className="zf-page zf-page-narrow">
      <p className="zf-kicker">{tx(locale, "Airport transfer", "機場接送")}</p>
      <h1>{tx(locale, "We follow the flight.", "我們跟著航班。")}</h1>
      <p>{tx(locale, "Give the flight number. The pickup time moves if the aircraft is early or late. You still confirm the vehicle, the price, and the meeting point before you pay.", "填寫航班號碼。飛機提早或延誤時，上車時間會跟著調整。付款前你仍會確認車型、價格與會合方式。")}</p>
      <Link href="/book/airport" className="zf-btn zf-btn-primary">
        {tx(locale, "Arrange a pickup", "安排接機")}
      </Link>
    </div>
  );
}

export function LoginGate() {
  const { login } = useStore();
  const router = useRouter();
  return (
    <div className="zf-login">
      <section>
        <p className="zf-kicker">Passenger</p>
        <h1>Book the ride.</h1>
        <button
          type="button"
          className="zf-btn zf-btn-primary"
          onClick={() => {
            login("amara@zoudian.travel", "passenger");
            router.push("/");
          }}
        >
          Continue as Amara
        </button>
      </section>
      <section>
        <p className="zf-kicker">Driver</p>
        <h1>Take the next job.</h1>
        <button
          type="button"
          className="zf-btn zf-btn-ink"
          onClick={() => {
            login("kenji.driver@zoudian.travel", "driver");
            router.push("/driver");
          }}
        >
          Continue as Kenji
        </button>
      </section>
      <section>
        <p className="zf-kicker">Operations</p>
        <h1>Watch the network.</h1>
        <button
          type="button"
          className="zf-btn zf-btn-line"
          onClick={() => {
            login("nova.ops@zoudian.travel", "ops");
            router.push("/ops");
          }}
        >
          Continue as Nova
        </button>
      </section>
    </div>
  );
}
