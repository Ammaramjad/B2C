export type ScreenRole = "passenger" | "driver" | "ops" | "admin" | "system";

export interface ScreenDef {
  id: string;
  n: number;
  title: string;
  titleZh: string;
  href: string;
  role: ScreenRole;
  note: string;
}

export const screens: ScreenDef[] = [
  { id: "P01", n: 1, title: "Home", titleZh: "旅客首頁", href: "/", role: "passenger", note: "Travel marketplace, not a dashboard" },
  { id: "P02", n: 2, title: "Airport booking", titleZh: "機場預訂", href: "/book?service=airport_pickup", role: "passenger", note: "Flight-aware journey" },
  { id: "P03", n: 3, title: "Point-to-point", titleZh: "點對點", href: "/book?service=p2p", role: "passenger", note: "Stops + route canvas" },
  { id: "P04", n: 4, title: "Vehicle selection", titleZh: "車型選擇", href: "/book?service=airport_pickup&step=2", role: "passenger", note: "Capacity matching" },
  { id: "P05", n: 5, title: "Checkout", titleZh: "確認付款", href: "/book?service=airport_pickup&step=3", role: "passenger", note: "Fare, wallet, policy" },
  { id: "P06", n: 6, title: "Confirmation", titleZh: "預訂成功", href: "/trips/ZD-1805/success", role: "passenger", note: "Command after book" },
  { id: "P07", n: 7, title: "My trips", titleZh: "我的行程", href: "/trips", role: "passenger", note: "Upcoming / active / done" },
  { id: "P08", n: 8, title: "Booking detail", titleZh: "訂單詳情", href: "/trips/ZD-1805", role: "passenger", note: "Timeline + map" },
  { id: "P09", n: 9, title: "Live trip", titleZh: "即時行程", href: "/live?id=ZD-1805", role: "passenger", note: "Map-first safety" },
  { id: "P10", n: 10, title: "Wallet", titleZh: "錢包", href: "/wallet", role: "passenger", note: "Credits, coupons, FX" },
  { id: "P11", n: 11, title: "Referral", titleZh: "推薦", href: "/referral", role: "passenger", note: "Share + history" },
  { id: "P12", n: 12, title: "AI planner", titleZh: "行程規劃", href: "/planner", role: "passenger", note: "Review & book only" },
  { id: "P13", n: 13, title: "Support", titleZh: "客服", href: "/support", role: "passenger", note: "AI + escalation" },
  { id: "P14", n: 14, title: "Profile", titleZh: "會員", href: "/account", role: "passenger", note: "Tier, prefs, safety" },
  { id: "D15", n: 15, title: "Driver home", titleZh: "司機首頁", href: "/driver", role: "driver", note: "Current action" },
  { id: "D16", n: 16, title: "Incoming offer", titleZh: "新任務", href: "/driver/offer", role: "driver", note: "Accept / reject" },
  { id: "D17", n: 17, title: "Active pickup", titleZh: "前往上車", href: "/driver/pickup", role: "driver", note: "Navigate to pickup" },
  { id: "D18", n: 18, title: "OTP verify", titleZh: "驗證碼", href: "/driver/otp", role: "driver", note: "Four-digit boarding" },
  { id: "D19", n: 19, title: "Active trip", titleZh: "行程中", href: "/driver/trip", role: "driver", note: "State CTA" },
  { id: "D20", n: 20, title: "Earnings", titleZh: "收入", href: "/driver/earnings", role: "driver", note: "Today / week / month" },
  { id: "D21", n: 21, title: "Settlement", titleZh: "結算", href: "/driver/settlement", role: "driver", note: "Statement export" },
  { id: "D22", n: 22, title: "Documents", titleZh: "證件", href: "/driver/documents", role: "driver", note: "Compliance" },
  { id: "O23", n: 23, title: "Command center", titleZh: "指揮中心", href: "/ops", role: "ops", note: "Map + inspector" },
  { id: "O24", n: 24, title: "Booking queue", titleZh: "訂單佇列", href: "/ops/queue", role: "ops", note: "Operational filters" },
  { id: "O25", n: 25, title: "Booking inspector", titleZh: "訂單檢視", href: "/ops?inspect=ZD-1805", role: "ops", note: "Contextual drawer" },
  { id: "O26", n: 26, title: "Dispatch board", titleZh: "派遣板", href: "/ops/dispatch", role: "ops", note: "Explainable ranking" },
  { id: "O27", n: 27, title: "Fleet map", titleZh: "車隊地圖", href: "/ops/fleet", role: "ops", note: "Status markers" },
  { id: "O28", n: 28, title: "Flight board", titleZh: "航班板", href: "/ops/flights", role: "ops", note: "Delay + wait" },
  { id: "O29", n: 29, title: "Driver management", titleZh: "司機管理", href: "/ops/drivers", role: "ops", note: "Directory + profile" },
  { id: "O30", n: 30, title: "Fleet management", titleZh: "車隊管理", href: "/ops/fleets", role: "ops", note: "A / B / C fleets" },
  { id: "O31", n: 31, title: "Manual order", titleZh: "人工建單", href: "/ops/manual", role: "ops", note: "Phone / corporate" },
  { id: "O32", n: 32, title: "Safety incident", titleZh: "安全事件", href: "/ops/safety", role: "ops", note: "SOS command" },
  { id: "O33", n: 33, title: "Support workspace", titleZh: "客服工作台", href: "/ops/support", role: "ops", note: "Context + AI" },
  { id: "A34", n: 34, title: "Pricing", titleZh: "定價引擎", href: "/admin/pricing", role: "admin", note: "Factors + simulation" },
  { id: "A35", n: 35, title: "Cancellation policy", titleZh: "取消政策", href: "/admin/cancellation", role: "admin", note: "Time-band simulator" },
  { id: "A36", n: 36, title: "Payments", titleZh: "付款", href: "/admin/payments", role: "admin", note: "Ledger table" },
  { id: "A37", n: 37, title: "Refunds", titleZh: "退款", href: "/admin/refunds", role: "admin", note: "Review + audit" },
  { id: "A38", n: 38, title: "Settlements", titleZh: "司機結算", href: "/admin/settlements", role: "admin", note: "Partner + driver" },
  { id: "A39", n: 39, title: "Wallet ledger", titleZh: "錢包帳本", href: "/admin/wallet", role: "admin", note: "Adjustments" },
  { id: "A40", n: 40, title: "Referral management", titleZh: "推薦管理", href: "/admin/referrals", role: "admin", note: "Channels + fraud" },
  { id: "A41", n: 41, title: "CRM", titleZh: "顧客 360", href: "/admin/crm", role: "admin", note: "RFM + consent" },
  { id: "A42", n: 42, title: "Analytics", titleZh: "分析", href: "/admin/analytics", role: "admin", note: "Role-specific" },
  { id: "A43", n: 43, title: "Promotions", titleZh: "促銷", href: "/admin/promotions", role: "admin", note: "Campaigns" },
  { id: "A44", n: 44, title: "Translation", titleZh: "翻譯校對", href: "/admin/i18n", role: "admin", note: "EN / 繁中" },
  { id: "A45", n: 45, title: "Notifications", titleZh: "通知中心", href: "/admin/notifications", role: "admin", note: "Templates" },
  { id: "A46", n: 46, title: "Integrations", titleZh: "整合", href: "/admin/integrations", role: "admin", note: "No secrets" },
  { id: "A47", n: 47, title: "Audit", titleZh: "稽核日誌", href: "/admin/audit", role: "admin", note: "Actor + delta" },
];

export const extraRoutes = [
  { href: "/design", title: "Design foundation", role: "system" },
  { href: "/login", title: "Role gate", role: "system" },
  { href: "/book?service=airport_drop", title: "Airport drop-off", role: "passenger" },
  { href: "/book?service=hourly", title: "Hourly charter", role: "passenger" },
  { href: "/book?service=rental", title: "Self-drive rental", role: "passenger" },
  { href: "/book?service=instant", title: "Instant taxi", role: "passenger" },
  { href: "/destinations", title: "City discovery", role: "passenger" },
  { href: "/destinations/taipei", title: "Taipei corridor", role: "passenger" },
  { href: "/help", title: "Help index", role: "passenger" },
];

export const serviceCopy: Record<
  string,
  { en: string; zh: string; verb: string; verbZh: string; hint: string; hintZh: string }
> = {
  airport_pickup: {
    en: "Airport pickup",
    zh: "機場接機",
    verb: "Meet the flight",
    verbZh: "接機",
    hint: "Flight, terminal, waiting policy",
    hintZh: "航班、航廈、等候規則",
  },
  airport_drop: {
    en: "Airport drop-off",
    zh: "機場送機",
    verb: "Leave on time",
    verbZh: "準時出發",
    hint: "Recommended leave time",
    hintZh: "建議出發時間",
  },
  p2p: {
    en: "Private transfer",
    zh: "點對點接送",
    verb: "Door to door",
    verbZh: "門到門",
    hint: "Stops and route preview",
    hintZh: "停靠與路線預覽",
  },
  hourly: {
    en: "Hourly charter",
    zh: "計時包車",
    verb: "Keep the car",
    verbZh: "包車隨行",
    hint: "4–12 hours, overtime rules",
    hintZh: "4–12 小時與超時規則",
  },
  rental: {
    en: "Self-drive",
    zh: "租車自駕",
    verb: "Take the keys",
    verbZh: "自行駕駛",
    hint: "Depot, deposit, terms",
    hintZh: "取還車、保證金、條款",
  },
  instant: {
    en: "Instant taxi",
    zh: "即時計程車",
    verb: "Ride now",
    verbZh: "立刻出發",
    hint: "Nearby cars and ETA",
    hintZh: "附近車輛與抵達時間",
  },
};
