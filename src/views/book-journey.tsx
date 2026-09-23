"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtlasMap } from "@/components/zf/map";
import { BookFrame, Count, FareBreakdown, FlightStrip, PlaceField, useFarePreview } from "@/components/zf/ui";
import { tx } from "@/lib/present";
import { useStore } from "@/lib/store";

const routeMarkers = [
  { id: "pickup", x: 22, y: 46, kind: "pickup" as const, label: "Pickup" },
  { id: "drop", x: 64, y: 38, kind: "drop" as const, label: "Destination" },
];

function Aside({ children }: { children?: React.ReactNode }) {
  const { draft } = useStore();
  const fare = useFarePreview();
  return (
    <>
      <AtlasMap markers={routeMarkers} showRoute tall={false} />
      {children}
      <div className="zf-panel" style={{ padding: 12 }}>
        <FareBreakdown service={draft.service} vehicle={draft.vehicle} extras={draft.extras} promo={draft.promo} when={draft.when} hours={draft.hours} days={draft.days} />
        <p className="zf-note">
          {draft.pickup} → {draft.dropoff}
        </p>
        <p className="zf-num">{fare.total > 0 ? "" : ""}</p>
      </div>
    </>
  );
}

export function AirportBook({ mode }: { mode: "pickup" | "drop" }) {
  const router = useRouter();
  const { locale, draft, setDraft } = useStore();
  const drop = mode === "drop";
  return (
    <BookFrame
      step={1}
      aside={
        <Aside>
          <FlightStrip code={draft.flight} />
          {drop ? (
            <div className="zf-leave">
              <div>
                <b>15:20</b>
                <span>{tx(locale, "Leave Banqiao. About 50 minutes to TPE.", "從板橋出發，車程約 50 分鐘。")}</span>
              </div>
              <div>
                <b>16:10</b>
                <span>{tx(locale, "Arrive at the airport.", "抵達機場。")}</span>
              </div>
              <div>
                <b>19:10</b>
                <span>{tx(locale, "Departure. International flights need about three hours.", "起飛。國際線建議預留三小時。")}</span>
              </div>
            </div>
          ) : (
            <div className="zf-panel" style={{ padding: 12 }}>
              <p className="zf-kicker">{tx(locale, "Meeting", "會合")}</p>
              <p>{tx(locale, "With meet and greet, the driver waits in the arrivals hall with your name. Without it, use the pickup point in the booking message.", "若選擇舉牌，司機會在到達大廳舉名牌。若未選擇，請依訂單訊息中的會合點。")}</p>
              <p className="zf-note">{tx(locale, "Waiting is free for 45 minutes after the recorded arrival.", "航班實際抵達後免費等候 45 分鐘。")}</p>
            </div>
          )}
        </Aside>
      }
    >
      <p className="zf-kicker">{drop ? tx(locale, "Airport drop-off", "機場送機") : tx(locale, "Airport pickup", "機場接機")}</p>
      <h1>{drop ? tx(locale, "When should you leave?", "你該幾點出門？") : tx(locale, "We meet the flight.", "我們對航班。")}</h1>
      <div className="zf-inline">
        <Link href="/book/airport" className="zf-btn zf-btn-line" onClick={() => setDraft({ service: "airport_pickup" })}>
          {tx(locale, "Pickup", "接機")}
        </Link>
        <Link href="/book/airport?mode=drop" className="zf-btn zf-btn-line" onClick={() => setDraft({ service: "airport_drop", flight: "BR218" })}>
          {tx(locale, "Drop-off", "送機")}
        </Link>
      </div>
      {drop ? (
        <>
          <PlaceField label={tx(locale, "Pickup", "上車地點")} value={draft.pickup} onChange={(pickup) => setDraft({ pickup, service: "airport_drop" })} />
          <label className="zf-field">
            <span>{tx(locale, "Airport", "機場")}</span>
            <select value={draft.dropoff} onChange={(e) => setDraft({ dropoff: e.target.value, service: "airport_drop" })}>
              <option>TPE Terminal 2 Departures</option>
              <option>TPE Terminal 1 Departures</option>
              <option>Taipei Songshan TSA</option>
              <option>Kaohsiung Airport KHH</option>
            </select>
          </label>
        </>
      ) : (
        <>
          <label className="zf-field">
            <span>{tx(locale, "Airport", "機場")}</span>
            <select
              value={draft.terminal}
              onChange={(e) => setDraft({ terminal: e.target.value, pickup: `TPE ${e.target.value} Arrivals`, service: "airport_pickup" })}
            >
              <option value="T1">TPE Terminal 1</option>
              <option value="T2">TPE Terminal 2</option>
              <option value="TSA">Taipei Songshan</option>
              <option value="KHH">Kaohsiung</option>
            </select>
          </label>
          <PlaceField label={tx(locale, "Destination", "目的地")} value={draft.dropoff} onChange={(dropoff) => setDraft({ dropoff })} />
        </>
      )}
      <div className="zf-grid-2">
        <label className="zf-field">
          <span>{tx(locale, "Flight", "航班")}</span>
          <input value={draft.flight} onChange={(e) => setDraft({ flight: e.target.value.toUpperCase() })} />
        </label>
        <label className="zf-field">
          <span>{drop ? tx(locale, "Departure", "起飛時間") : tx(locale, "Arrival", "抵達時間")}</span>
          <input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
        </label>
      </div>
      <div className="zf-grid-2">
        <Count label={tx(locale, "Passengers", "乘客")} value={draft.passengers} min={1} max={10} onChange={(passengers) => setDraft({ passengers })} />
        <Count label={tx(locale, "Bags", "行李")} value={draft.luggage} min={0} max={12} onChange={(luggage) => setDraft({ luggage })} />
      </div>
      <label className="zf-field">
        <span>{tx(locale, "Special instructions", "特殊需求")}</span>
        <textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ notes: e.target.value })} placeholder={tx(locale, "Gate, sign name, or mobility note", "登機門、舉牌姓名或行動協助")} />
      </label>
      <button type="button" className="zf-btn zf-btn-primary" onClick={() => router.push("/book/ride")}>
        {tx(locale, "Choose the ride", "選擇車輛")}
      </button>
    </BookFrame>
  );
}

export function TransferBook() {
  const router = useRouter();
  const { locale, draft, setDraft } = useStore();
  return (
    <BookFrame step={1} aside={<Aside />}>
      <p className="zf-kicker">{tx(locale, "Point to point", "點對點")}</p>
      <h1>{tx(locale, "A direct ride, with stops if you need them.", "直達，需要時可停靠。")}</h1>
      <PlaceField label={tx(locale, "Pickup", "上車")} value={draft.pickup} onChange={(pickup) => setDraft({ pickup, service: "p2p" })} />
      <PlaceField label={tx(locale, "Destination", "目的地")} value={draft.dropoff} onChange={(dropoff) => setDraft({ dropoff, service: "p2p" })} />
      <div className="zf-field">
        <span>{tx(locale, "Stops", "停靠")}</span>
        {draft.stops.map((stop, i) => (
          <div key={`${stop}-${i}`} className="zf-inline">
            <input
              value={stop}
              onChange={(e) => setDraft({ stops: draft.stops.map((s, idx) => (idx === i ? e.target.value : s)) })}
            />
            <button type="button" className="zf-btn zf-btn-quiet" onClick={() => setDraft({ stops: draft.stops.filter((_, idx) => idx !== i) })}>
              {tx(locale, "Remove", "移除")}
            </button>
          </div>
        ))}
        <button type="button" className="zf-btn zf-btn-line" onClick={() => setDraft({ stops: [...draft.stops, ""] })}>
          {tx(locale, "Add a stop", "加一站")}
        </button>
      </div>
      <div className="zf-grid-2">
        <label className="zf-field">
          <span>{tx(locale, "When", "時間")}</span>
          <input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value })} />
        </label>
        <Count label={tx(locale, "Passengers", "乘客")} value={draft.passengers} min={1} max={10} onChange={(passengers) => setDraft({ passengers })} />
      </div>
      <Count label={tx(locale, "Bags", "行李")} value={draft.luggage} min={0} max={12} onChange={(luggage) => setDraft({ luggage })} />
      <button type="button" className="zf-btn zf-btn-primary" onClick={() => router.push("/book/ride")}>
        {tx(locale, "Choose the ride", "選擇車輛")}
      </button>
    </BookFrame>
  );
}

export function CharterBook() {
  const router = useRouter();
  const { locale, draft, setDraft } = useStore();
  return (
    <BookFrame step={1} aside={<Aside />}>
      <p className="zf-kicker">{tx(locale, "Hourly charter", "計時包車")}</p>
      <h1>{tx(locale, "Keep the vehicle and the driver.", "車輛與司機跟著你。")}</h1>
      <PlaceField label={tx(locale, "Pickup", "上車")} value={draft.pickup} onChange={(pickup) => setDraft({ pickup, service: "hourly" })} />
      <label className="zf-field">
        <span>{tx(locale, "Start", "開始")}</span>
        <input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value, service: "hourly" })} />
      </label>
      <label className="zf-field">
        <span>
          {tx(locale, "Duration", "時數")} · {draft.hours} {tx(locale, "hours", "小時")}
        </span>
        <input type="range" min={4} max={12} value={draft.hours} onChange={(e) => setDraft({ hours: Number(e.target.value), service: "hourly" })} />
      </label>
      <p className="zf-note">{tx(locale, "Baseline charters run 4 to 12 hours. Estimated route about 120 km inside the booked window.", "基本包車為 4 至 12 小時。預估行程約 120 公里，含在預約時數內。")}</p>
      <div className="zf-alert">
        <strong>{tx(locale, "Overtime", "逾時")}</strong>
        <p>{tx(locale, "Each extra hour is billed at the same hourly rate, in 30-minute steps, if the vehicle is free.", "若車輛仍可調度，逾時以同一時薪、每 30 分鐘計費。")}</p>
        <strong>{tx(locale, "Over distance", "超里程")}</strong>
        <p>{tx(locale, "Distance past the included allowance is quoted before you continue.", "超出包含里程前，會先報價再繼續。")}</p>
      </div>
      <button type="button" className="zf-btn zf-btn-line" onClick={() => setDraft({ stops: [...draft.stops, "Jiufen"] })}>
        {tx(locale, "Add Jiufen as a stop", "加入九份")}
      </button>
      <p>{draft.stops.filter(Boolean).join(" · ") || tx(locale, "No extra stops yet.", "尚未加站。")}</p>
      <button type="button" className="zf-btn zf-btn-primary" onClick={() => router.push("/book/ride")}>
        {tx(locale, "Choose the vehicle", "選擇車輛")}
      </button>
    </BookFrame>
  );
}

export function RentalBook() {
  const router = useRouter();
  const { locale, draft, setDraft } = useStore();
  return (
    <BookFrame step={1} aside={<Aside />}>
      <p className="zf-kicker">{tx(locale, "Self-drive", "自駕租車")}</p>
      <h1>{tx(locale, "Take the car. Leave the chauffeur.", "自己開車。")}</h1>
      <PlaceField label={tx(locale, "Pickup depot", "取車點")} value={draft.pickup} onChange={(pickup) => setDraft({ pickup, service: "rental" })} />
      <PlaceField label={tx(locale, "Return", "還車點")} value={draft.returnLoc} onChange={(returnLoc) => setDraft({ returnLoc, dropoff: returnLoc, service: "rental" })} />
      <div className="zf-grid-2">
        <label className="zf-field">
          <span>{tx(locale, "Start", "取車")}</span>
          <input type="datetime-local" value={draft.when} onChange={(e) => setDraft({ when: e.target.value, service: "rental" })} />
        </label>
        <label className="zf-field">
          <span>{tx(locale, "Return", "還車時間")}</span>
          <input type="datetime-local" value={draft.returnAt} onChange={(e) => setDraft({ returnAt: e.target.value })} />
        </label>
      </div>
      <Count label={tx(locale, "Days", "天數")} value={draft.days} min={1} max={14} onChange={(days) => setDraft({ days, service: "rental" })} />
      <div className="zf-alert">
        <p>{tx(locale, "Driver must be 21 or older, with a license held for one year. A deposit authorization is placed on the card and released after the vehicle is checked in.", "駕駛需年滿 21 歲且持照滿一年。卡片會預先授權押金，驗車後解除。")}</p>
        <p className="zf-note">{tx(locale, "One-way return and extra insurance are offered on the next step, only for rentals.", "異地還車與加強保險只在自駕的下一步出現。")}</p>
      </div>
      <button type="button" className="zf-btn zf-btn-primary" onClick={() => router.push("/book/ride")}>
        {tx(locale, "Choose a car", "選擇車輛")}
      </button>
    </BookFrame>
  );
}

export function TaxiBook() {
  const router = useRouter();
  const { locale, draft, setDraft } = useStore();
  const cars = [
    { id: "n1", x: 58, y: 36, kind: "available" as const, label: "Taxi 3 min" },
    { id: "n2", x: 62, y: 42, kind: "available" as const, label: "Plus 5 min" },
    { id: "n3", x: 54, y: 40, kind: "busy" as const, label: "XL 7 min" },
  ];
  return (
    <BookFrame
      step={1}
      aside={
        <Aside>
          <p className="zf-note">{tx(locale, "Three vehicles are inside a 2 km ring of the pickup pin.", "上車點兩公里內有三輛車。")}</p>
        </Aside>
      }
    >
      <p className="zf-kicker">{tx(locale, "Taxi now", "即時叫車")}</p>
      <h1>{tx(locale, "A car near you.", "附近有車。")}</h1>
      <AtlasMap markers={cars} showRoute />
      <PlaceField label={tx(locale, "Pickup", "上車")} value={draft.pickup} onChange={(pickup) => setDraft({ pickup, service: "instant" })} />
      <PlaceField label={tx(locale, "Destination", "目的地")} value={draft.dropoff} onChange={(dropoff) => setDraft({ dropoff, service: "instant" })} />
      <Count label={tx(locale, "Passengers", "乘客")} value={draft.passengers} min={1} max={6} onChange={(passengers) => setDraft({ passengers })} />
      <button type="button" className="zf-btn zf-btn-primary" onClick={() => router.push("/book/ride")}>
        {tx(locale, "Choose a category", "選擇車型")}
      </button>
    </BookFrame>
  );
}
