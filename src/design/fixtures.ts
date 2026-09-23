export const flightBoard = [
  { flight: "CI101", airport: "TPE", terminal: "T1", dir: "Arriving", sched: "16:40", est: "16:40", delay: "On time", booking: "ZD-1812", passenger: "Amara Chen", driver: "Wei Chen", adjust: "No change", status: "Watch" },
  { flight: "JL809", airport: "TPE", terminal: "T1", dir: "Arriving", sched: "16:30", est: "16:22", delay: "Early 8m", booking: "ZD-1805", passenger: "Hiro Sato", driver: "Kenji Mori", adjust: "Pickup pulled forward", status: "Adjusted" },
  { flight: "BR856", airport: "TPE", terminal: "T2", dir: "Arriving", sched: "15:48", est: "16:10", delay: "Delayed 22m", booking: "ZD-1844", passenger: "Nora Berg", driver: "Unassigned", adjust: "Waiting clock starts at wheels-down", status: "Exception" },
  { flight: "CX494", airport: "TPE", terminal: "T2", dir: "Arriving", sched: "18:25", est: "19:05", delay: "Delayed 40m", booking: "ZD-1848", passenger: "Elena Voss", driver: "Mina Park", adjust: "Driver hold at staging", status: "Exception" },
  { flight: "BR218", airport: "TPE", terminal: "T2", dir: "Departing", sched: "19:10", est: "19:10", delay: "On time", booking: "ZD-1806", passenger: "James Wu", driver: "Wei Chen", adjust: "Leave Banqiao by 15:20", status: "Watch" },
];

export const payments = [
  { id: "PAY-88421", booking: "ZD-1812", method: "Visa ···· 4412", kind: "Capture", amount: 2630, status: "Captured", when: "22 Sep · 18:02" },
  { id: "PAY-88402", booking: "ZD-1811", method: "Visa ···· 4412", kind: "Capture", amount: 1280, status: "Captured", when: "23 Sep · 11:32" },
  { id: "PAY-88311", booking: "ZD-1807", method: "Mastercard ···· 2201", kind: "Authorization", amount: 5010, status: "Authorized", when: "22 Sep · 12:04" },
  { id: "PAY-88290", booking: "ZD-1804", method: "Apple Pay", kind: "Capture", amount: 265, status: "Captured", when: "23 Sep · 09:51" },
  { id: "PAY-88201", booking: "ZD-1794", method: "LINE Pay", kind: "Capture", amount: 1680, status: "Failed", when: "21 Sep · 20:18" },
  { id: "PAY-88110", booking: "ZD-1809", method: "LINE Pay", kind: "Refund", amount: 1680, status: "Refunded", when: "16 Sep · 14:40" },
];

export const refunds = [
  { id: "RF-331", booking: "ZD-1809", passenger: "Mei-ling Kao", reason: "Cancelled more than 24h before pickup", fee: 0, refund: 1680, dest: "LINE Pay", status: "Paid", owner: "Finance" },
  { id: "RF-334", booking: "ZD-1844", passenger: "Nora Berg", reason: "Flight diverted, guest requests full refund", fee: 0, refund: 2280, dest: "Wallet credit", status: "Needs review", owner: "Ops" },
  { id: "RF-335", booking: "ZD-1772", passenger: "James Wu", reason: "Driver late 28m", fee: 0, refund: 400, dest: "Original card", status: "Approved", owner: "Care" },
];

export const walletLedger = [
  { id: "WL-1902", account: "Amara Chen", type: "Refund credit", amount: 0, note: "No open credit", at: "—", actor: "—" },
  { id: "WL-1888", account: "Amara Chen", type: "Referral", amount: 200, note: "Customer to customer, campaign HARBOR", at: "12 Sep", actor: "System" },
  { id: "WL-1881", account: "James Wu", type: "Manual adjustment", amount: -150, note: "Duplicate goodwill credit", at: "11 Sep", actor: "Nova Lin" },
  { id: "WL-1874", account: "Hiro Sato", type: "Campaign", amount: 300, note: "September airport return", at: "02 Sep", actor: "Marketing" },
];

export const referrals = [
  { code: "ZF-AMARA", channel: "Customer → customer", invited: 6, pending: 1, earned: 2, reward: "NT$200", flag: "Clear" },
  { code: "ZF-KENJI", channel: "Driver → customer", invited: 14, pending: 3, earned: 9, reward: "NT$150", flag: "Clear" },
  { code: "ZF-NORTHSTAR", channel: "B2B → customer", invited: 40, pending: 4, earned: 22, reward: "8%", flag: "Review velocity" },
];

export const promotions = [
  { code: "TPE200", name: "Airport return", off: "NT$200", service: "Airport", region: "TPE", audience: "All guests", window: "1–30 Sep", used: 428, limit: "2,000", status: "Live" },
  { code: "FAMILY", name: "Family vehicle", off: "10%", service: "Transfer, charter", region: "Taiwan", audience: "4+ passengers", window: "Always", used: 126, limit: "None", status: "Live" },
  { code: "WELCOME", name: "First ride", off: "NT$100", service: "All except rental", region: "Taiwan", audience: "New account", window: "Always", used: 902, limit: "1 per guest", status: "Live" },
];

export const translations = [
  { key: "home.where", source: "Where are you going?", zh: "你要去哪裡？", status: "Approved" },
  { key: "ride.unfit.sedan", source: "Sedan supports up to 3 passengers and 3 standard bags.", zh: "舒適轎車最多 3 位乘客、3 件標準行李。", status: "Needs review" },
  { key: "wait.airport", source: "The driver waits 45 minutes after arrival.", zh: "司機於航班抵達後免費等候 45 分鐘。", status: "Approved" },
  { key: "sos.action", source: "Contact the safety desk", zh: "", status: "Missing" },
  { key: "driver.offer.accept", source: "Accept", zh: "接受", status: "Approved" },
  { key: "policy.cancel.mid", source: "Between 6 and 24 hours, a partial fee applies.", zh: "出發前 6 至 24 小時取消，收取部分費用。", status: "Proofreading" },
];

export const notifications = [
  { id: "NT-01", event: "Driver assigned", channel: "Push + SMS", lang: "EN / 繁中", state: "Delivered", when: "23 Sep · 11:06" },
  { id: "NT-02", event: "Flight delay", channel: "Push", lang: "EN", state: "Delivered", when: "23 Sep · 15:02" },
  { id: "NT-03", event: "Payment failed", channel: "Email", lang: "EN", state: "Failed", when: "21 Sep · 20:18" },
  { id: "NT-04", event: "Refund completed", channel: "Email + in-app", lang: "繁中", state: "Retrying", when: "16 Sep · 14:41" },
];

export const integrations = [
  { name: "Maps", env: "Production", status: "Live", ok: "23 Sep · 11:58", fail: "18 Sep · 02:11", config: "Tiles and routing connected" },
  { name: "Payments", env: "Production", status: "Live", ok: "23 Sep · 11:32", fail: "21 Sep · 20:18", config: "Cards, Apple Pay, Google Pay, LINE Pay" },
  { name: "Flight feed", env: "Production", status: "Degraded", ok: "23 Sep · 11:50", fail: "23 Sep · 11:54", config: "TPE and KHH subscribed" },
  { name: "SMS", env: "Production", status: "Live", ok: "23 Sep · 11:06", fail: "None in 7 days", config: "Transactional only" },
  { name: "Email", env: "Production", status: "Live", ok: "23 Sep · 09:12", fail: "None in 7 days", config: "Receipts and flight notices" },
  { name: "Push", env: "Production", status: "Live", ok: "23 Sep · 11:06", fail: "None in 7 days", config: "iOS and Android" },
  { name: "FX", env: "Production", status: "Live", ok: "23 Sep · 09:00", fail: "None in 7 days", config: "Display rates, settlement in TWD" },
  { name: "Partner mobility", env: "Sandbox", status: "Idle", ok: "—", fail: "—", config: "Adapter slot reserved" },
  { name: "AI planner", env: "Production", status: "Live", ok: "23 Sep · 10:41", fail: "20 Sep · 16:02", config: "Drafts only, no autonomous purchase" },
];

export const auditRows = [
  { actor: "Nova Lin", role: "Dispatcher", action: "Assign driver", object: "ZD-1806", old: "Unassigned", next: "Wei Chen", at: "22 Sep · 16:04", ip: "Taipei desk", reason: "Van required for six guests" },
  { actor: "Nora Kuo", role: "Finance", action: "Approve refund", object: "RF-335", old: "Needs review", next: "Approved", at: "21 Sep · 11:20", ip: "Taipei desk", reason: "Driver late 28 minutes" },
  { actor: "System", role: "Pricing", action: "Publish fare table", object: "Fare v12.4", old: "v12.3", next: "v12.4", at: "01 Sep · 00:00", ip: "—", reason: "September airport surcharge" },
  { actor: "Kenji Mori", role: "Driver", action: "Reject offer", object: "ZD-1790", old: "Offered", next: "Rejected", at: "19 Sep · 08:12", ip: "Driver app", reason: "Already at TPE staging" },
];

export const pricingFactors = [
  { id: "base", name: "Base fare", weight: "Table", on: true },
  { id: "distance", name: "Distance", weight: "Per km after included", on: true },
  { id: "time", name: "Duration", weight: "Per minute after included", on: true },
  { id: "airport", name: "Airport", weight: "Flat by terminal", on: true },
  { id: "night", name: "Night", weight: "+20% · 23:00–06:00", on: true },
  { id: "peak", name: "Peak", weight: "Calendar bands", on: true },
  { id: "demand", name: "Demand", weight: "Live, capped", on: true },
  { id: "supply", name: "Supply", weight: "Idle vehicles in zone", on: true },
  { id: "weather", name: "Weather", weight: "Advisory only", on: false },
  { id: "region", name: "Region", weight: "North / central / south", on: true },
  { id: "events", name: "Events", weight: "Venue calendar", on: true },
  { id: "vehicle", name: "Vehicle", weight: "Class adjustment", on: true },
  { id: "service", name: "Service", weight: "Airport, charter, taxi, rental", on: true },
  { id: "ops", name: "Operational conditions", weight: "Manual corridor closure", on: true },
  { id: "history", name: "Historical demand", weight: "Same weekday baseline", on: true },
  { id: "commercial", name: "Commercial controls", weight: "Floor, ceiling, promo", on: true },
];

export const parameterGroups = [
  "Booking",
  "Pricing",
  "Dispatch",
  "Airport",
  "Flight",
  "Waiting",
  "Cancellation",
  "Refund",
  "Vehicle",
  "Capacity",
  "Fleet priority",
  "Payment",
  "Currency",
  "Wallet",
  "Referral",
  "Loyalty",
  "Notification",
  "Safety",
  "Integration",
];

export const plannerSeed = [
  {
    day: "Day 1",
    date: "Thu 24 Sep",
    items: [
      { id: "d1a", name: "TPE Terminal 1", nameZh: "桃園機場第一航廈", time: "16:40", duration: "45 min", transport: "Airport pickup", vehicle: "MPV", fare: 2630, photo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80" },
      { id: "d1b", name: "Da'an apartment", nameZh: "大安住所", time: "18:10", duration: "40 min", transport: "Arrive and settle", vehicle: "—", fare: 0, photo: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=900&q=80" },
      { id: "d1c", name: "Shilin Night Market", nameZh: "士林夜市", time: "19:30", duration: "2 hr", transport: "Point to point", vehicle: "MPV", fare: 980, photo: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900&q=80" },
    ],
  },
  {
    day: "Day 2",
    date: "Fri 25 Sep",
    items: [
      { id: "d2a", name: "Jiufen Old Street", nameZh: "九份老街", time: "09:30", duration: "8 hr", transport: "Hourly charter", vehicle: "MPV", fare: 7240, photo: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80" },
      { id: "d2b", name: "Shifen", nameZh: "十分", time: "14:00", duration: "90 min", transport: "Included stop", vehicle: "MPV", fare: 0, photo: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&q=80" },
    ],
  },
  {
    day: "Day 3",
    date: "Sat 26 Sep",
    items: [
      { id: "d3a", name: "Taipei 101", nameZh: "台北 101", time: "10:00", duration: "2 hr", transport: "Point to point", vehicle: "MPV", fare: 780, photo: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=900&q=80" },
      { id: "d3b", name: "TPE Terminal 1", nameZh: "桃園機場第一航廈", time: "15:10", duration: "70 min", transport: "Airport drop-off", vehicle: "MPV", fare: 2480, photo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80" },
    ],
  },
];

export type PlanDay = (typeof plannerSeed)[number];
export type PlanItem = PlanDay["items"][number];
