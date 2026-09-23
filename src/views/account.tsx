"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AtlasMap, type MapMarker } from "@/components/zf/map";
import { MiniChart, Price } from "@/components/zf/ui";
import { plannerSeed, type PlanItem } from "@/design/fixtures";
import { tx } from "@/lib/present";
import { useStore } from "@/lib/store";

export function WalletView() {
  const { locale, user, currency } = useStore();
  const wallet = user?.wallet ?? { TWD: 12600, USD: 240 };
  const rows = [
    ["12 Sep", tx(locale, "Referral reward", "推薦回饋"), 200, "ZF-AMARA"],
    ["02 Sep", tx(locale, "Airport credit", "機場點數折抵"), -200, "TPE200"],
    ["20 Aug", tx(locale, "Refund to wallet", "退款入錢包"), 0, "—"],
  ];
  return (
    <div className="zf-page">
      <p className="zf-kicker">{tx(locale, "Wallet", "錢包")}</p>
      <h1>
        <Price twd={wallet.TWD} />
      </h1>
      <p className="zf-note">
        {tx(locale, "Credits, coupons, and referral rewards sit in this balance. Display currency is", "點數、優惠與推薦回饋都在這個餘額。顯示幣別為")} {currency}. {currency === "USD" ? tx(locale, "Settlement stays in NT$.", "結算仍為新台幣。") : ""}
      </p>
      {!user && <p className="zf-note">{tx(locale, "Previewing Amara Chen. Sign in to use your own wallet.", "目前預覽 Amara Chen。登入後使用自己的錢包。")}</p>}
      <div className="zf-grid-2">
        <div>
          <p className="zf-kicker">{tx(locale, "Coupons", "優惠券")}</p>
          <p>TPE200 · NT$200 · {tx(locale, "Airport · expires 30 Sep", "機場 · 9 月 30 日到期")}</p>
          <p>FAMILY · 10% · {tx(locale, "4 or more passengers", "四人以上")}</p>
        </div>
        <div>
          <p className="zf-kicker">{tx(locale, "Referral rewards", "推薦回饋")}</p>
          <p>{tx(locale, "NT$200 pending · one invited trip not yet completed.", "NT$200 待入帳 · 一趟受邀行程尚未完成。")}</p>
        </div>
      </div>
      <table className="zf-table">
        <thead>
          <tr>
            <th>{tx(locale, "Date", "日期")}</th>
            <th>{tx(locale, "Entry", "項目")}</th>
            <th>{tx(locale, "Amount", "金額")}</th>
            <th>{tx(locale, "Ref", "參考")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[1]}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td className="zf-num">{row[2]}</td>
              <td>{row[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReferralView() {
  const { locale, user } = useStore();
  const code = user?.referralCode ?? "ZF-AMARA";
  return (
    <div className="zf-page">
      <p className="zf-kicker">{tx(locale, "Referral", "推薦")}</p>
      <h1>{code}</h1>
      <p>{tx(locale, "Share this code. You and the guest each receive NT$200 after their first completed ride.", "分享這個代碼。對方完成第一趟後，雙方各得 NT$200。")}</p>
      <div className="zf-inline">
        <button type="button" className="zf-btn zf-btn-primary" onClick={() => navigator.clipboard?.writeText(code)}>
          {tx(locale, "Copy code", "複製代碼")}
        </button>
        <button type="button" className="zf-btn zf-btn-line">
          {tx(locale, "Invite by message", "以訊息邀請")}
        </button>
      </div>
      <table className="zf-table">
        <thead>
          <tr>
            <th>{tx(locale, "Guest", "對象")}</th>
            <th>{tx(locale, "State", "狀態")}</th>
            <th>{tx(locale, "Reward", "回饋")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mei Lin</td>
            <td>{tx(locale, "Completed", "已完成")}</td>
            <td>NT$200</td>
          </tr>
          <tr>
            <td>Owen P.</td>
            <td>{tx(locale, "Pending first ride", "待首趟完成")}</td>
            <td>NT$200</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const tabs = ["account", "membership", "people", "places", "pay", "preferences"] as const;

export function Profile({ initial = "account" }: { initial?: (typeof tabs)[number] }) {
  const { locale, user, logout } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>(initial);
  const labels: Record<(typeof tabs)[number], [string, string]> = {
    account: ["Account", "帳戶"],
    membership: ["Membership", "會籍"],
    people: ["Passengers", "乘客"],
    places: ["Places", "地點"],
    pay: ["Payment", "付款"],
    preferences: ["Preferences", "偏好"],
  };
  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">Amara Chen</p>
        <h1>{tx(locale, labels[tab][0], labels[tab][1])}</h1>
        <div className="zf-tabs">
          {tabs.map((id) => (
            <button key={id} type="button" data-on={tab === id} onClick={() => setTab(id)}>
              {tx(locale, labels[id][0], labels[id][1])}
            </button>
          ))}
        </div>
        {tab === "account" && (
          <dl className="zf-dl">
            <dt>Email</dt>
            <dd>{user?.email ?? "amara@zoudian.travel"}</dd>
            <dt>{tx(locale, "Mobile", "手機")}</dt>
            <dd>{user?.phone ?? "+886 900 880 101"}</dd>
            <dt>{tx(locale, "Security", "安全")}</dt>
            <dd>{tx(locale, "Password and device list", "密碼與裝置")}</dd>
          </dl>
        )}
        {tab === "membership" && (
          <div>
            <p>{tx(locale, "Harbor Circle", "豐會籍")} · {(user?.points ?? 4280).toLocaleString()} {tx(locale, "points", "點")}</p>
            <p>{tx(locale, "Benefits: preferred-driver rate review, airport wait protection, and a yearly charter credit.", "權益：指定司機費率檢視、機場等候保障，以及年度包車點數。")}</p>
            <MiniChart points={[12, 18, 16, 22, 28, 26, 34]} label="Points earned by month" />
          </div>
        )}
        {tab === "people" && (
          <ul>
            <li>Amara Chen · +886 900 880 101</li>
            <li>Leo Chen · {tx(locale, "child seat", "兒童座椅")}</li>
          </ul>
        )}
        {tab === "places" && (
          <ul>
            <li>Home · Da&apos;an</li>
            <li>Work · Taipei 101</li>
          </ul>
        )}
        {tab === "pay" && <p>Visa ···· 4412 · {tx(locale, "expires 08/28", "08/28 到期")}</p>}
        {tab === "preferences" && (
          <ul>
            <li>{tx(locale, "Language follows the header switch.", "語言跟隨頁首切換。")}</li>
            <li>{tx(locale, "Quiet cabin. No phone calls unless the flight changes.", "偏好安靜。除非航班變更，否則不打電話。")}</li>
            <li>{tx(locale, "Currency display is separate from settlement.", "顯示幣別與結算幣別分開。")}</li>
          </ul>
        )}
        <button type="button" className="zf-btn zf-btn-quiet" onClick={logout}>
          {tx(locale, "Sign out", "登出")}
        </button>
      </div>
      <aside>
        <p className="zf-kicker">{tx(locale, "Also", "其他")}</p>
        <p>
          <Link href="/wallet">{tx(locale, "Wallet", "錢包")}</Link>
        </p>
        <p>
          <Link href="/referral">{tx(locale, "Referral", "推薦")}</Link>
        </p>
        <p>
          <Link href="/support">{tx(locale, "Support", "支援")}</Link>
        </p>
      </aside>
    </div>
  );
}

export function SupportView() {
  const { locale, messages, askHalo, bookings } = useStore();
  const [text, setText] = useState("");
  const [human, setHuman] = useState(false);
  const trip = bookings.find((b) => b.id === "ZD-1812");
  return (
    <div className="zf-split">
      <div>
        <p className="zf-kicker">{tx(locale, "Support", "支援")}</p>
        <h1>{tx(locale, "Ask about a trip.", "詢問一趟行程。")}</h1>
        <div className="zf-filters">
          {["Booking", "Payment", "Refund", "Flight"].map((item) => (
            <button key={item} type="button" onClick={() => askHalo(item)}>
              {item}
            </button>
          ))}
        </div>
        <div>
          {messages.map((m) => (
            <p key={m.id}>
              <strong>{m.role === "agent" ? "Zoufeng" : "You"}</strong> {m.text}
            </p>
          ))}
        </div>
        <form
          className="zf-inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            askHalo(text);
            setText("");
          }}
        >
          <input className="zf-input zf-grow" value={text} onChange={(e) => setText(e.target.value)} placeholder={tx(locale, "Ask about ZD-1812", "詢問 ZD-1812")} />
          <button className="zf-btn zf-btn-primary" type="submit">
            {tx(locale, "Send", "送出")}
          </button>
        </form>
        <button type="button" className="zf-btn zf-btn-line" onClick={() => setHuman(true)}>
          {tx(locale, "Talk to a person", "轉接專人")}
        </button>
        <Link href="/live" className="zf-btn zf-btn-danger">
          SOS
        </Link>
        {human && <p className="zf-alert">{tx(locale, "A care agent has the booking, payment, and flight. Average reply on this desk is under four minutes.", "客服已看到訂單、付款與航班。這個席位平均四分鐘內回覆。")}</p>}
      </div>
      <aside className="zf-panel" style={{ padding: 12 }}>
        <p className="zf-kicker">{trip?.id}</p>
        <p>
          {trip?.pickup} → {trip?.dropoff}
        </p>
        <p>{trip?.flight} · CI101 on time</p>
        <p>{tx(locale, "Payment captured on Visa ···· 4412.", "Visa ···· 4412 已請款。")}</p>
      </aside>
    </div>
  );
}

export function PlannerView() {
  const { locale } = useStore();
  const [days, setDays] = useState(plannerSeed);
  const [view, setView] = useState<"timeline" | "map" | "budget">("timeline");
  const [drag, setDrag] = useState<string | null>(null);
  const total = days.reduce((sum, day) => sum + day.items.reduce((s, item) => s + item.fare, 0), 0);
  const markers: MapMarker[] = useMemo(
    () =>
      days.flatMap((day, di) =>
        day.items.map((item, ii) => ({
          id: item.id,
          x: 30 + di * 18 + ii * 6,
          y: 30 + ii * 12,
          kind: "pickup" as const,
          label: item.name,
        })),
      ),
    [days],
  );

  function move(dayIndex: number, item: PlanItem, dir: -1 | 1) {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIndex) return day;
        const idx = day.items.findIndex((x) => x.id === item.id);
        const next = idx + dir;
        if (next < 0 || next >= day.items.length) return day;
        const items = [...day.items];
        const [row] = items.splice(idx, 1);
        items.splice(next, 0, row);
        return { ...day, items };
      }),
    );
  }

  return (
    <div className="zf-page">
      <p className="zf-kicker">{tx(locale, "Itinerary", "行程草案")}</p>
      <h1>{tx(locale, "Three days in Taipei for five.", "五人、台北三天。")}</h1>
      <p>{tx(locale, "MPV is recommended because a sedan does not fit five people and four bags. Nothing is booked until you review transportation.", "建議商務車，因為轎車坐不下五人與四件行李。在你確認交通前，不會下單。")}</p>
      <div className="zf-tabs">
        {(["timeline", "map", "budget"] as const).map((id) => (
          <button key={id} type="button" data-on={view === id} onClick={() => setView(id)}>
            {id}
          </button>
        ))}
      </div>
      {view === "map" && <AtlasMap markers={markers} showRoute />}
      {view === "budget" && (
        <div>
          <MiniChart points={days.map((d) => d.items.reduce((s, i) => s + i.fare, 0))} label="Fare by day" />
          <p>
            {tx(locale, "Transport total", "交通合計")} <Price twd={total} />
          </p>
        </div>
      )}
      {view === "timeline" && (
        <div className="zf-days">
          {days.map((day, dayIndex) => (
            <section key={day.day} className="zf-day">
              <h2>
                {day.day}
                <span className="zf-note"> {day.date}</span>
              </h2>
              {day.items.map((item) => (
                <article
                  key={item.id}
                  className="zf-plan-item"
                  draggable
                  onDragStart={() => setDrag(item.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (!drag || drag === item.id) return;
                    setDays((prev) =>
                      prev.map((d) => {
                        const from = d.items.findIndex((x) => x.id === drag);
                        const to = d.items.findIndex((x) => x.id === item.id);
                        if (from < 0 || to < 0) return d;
                        const items = [...d.items];
                        const [row] = items.splice(from, 1);
                        items.splice(to, 0, row);
                        return { ...d, items };
                      }),
                    );
                  }}
                >
                  <div style={{ width: 64, height: 48, background: `center/cover url(${item.photo})` }} role="img" aria-label={item.name} />
                  <div>
                    <strong>{locale === "zh" ? item.nameZh : item.name}</strong>
                    <p className="zf-note">
                      {item.time} · {item.duration} · {item.transport} · {item.vehicle}
                    </p>
                    {item.fare > 0 && <Price twd={item.fare} className="zf-num" />}
                    <div className="zf-inline">
                      <button type="button" className="zf-btn zf-btn-quiet" onClick={() => move(dayIndex, item, -1)}>
                        Up
                      </button>
                      <button type="button" className="zf-btn zf-btn-quiet" onClick={() => move(dayIndex, item, 1)}>
                        Down
                      </button>
                      <button
                        type="button"
                        className="zf-btn zf-btn-quiet"
                        onClick={() => setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, items: d.items.filter((x) => x.id !== item.id) } : d)))}
                      >
                        {tx(locale, "Remove", "移除")}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              <button
                type="button"
                className="zf-btn zf-btn-line"
                onClick={() =>
                  setDays((prev) =>
                    prev.map((d, i) =>
                      i === dayIndex
                        ? { ...d, items: [...d.items, { id: `n-${Date.now()}`, name: "Added stop", nameZh: "新增停靠", time: "12:00", duration: "1 hr", transport: "Point to point", vehicle: "MPV", fare: 680, photo: itemPhoto() }] }
                        : d,
                    ),
                  )
                }
              >
                {tx(locale, "Add a stop", "加一站")}
              </button>
            </section>
          ))}
        </div>
      )}
      <p>
        {tx(locale, "Transport total", "交通合計")} <Price twd={total} />
      </p>
      <Link href="/book/charter" className="zf-btn zf-btn-primary">
        {tx(locale, "Review and book transportation", "檢查並預訂交通")}
      </Link>
    </div>
  );
}

function itemPhoto() {
  return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80";
}
