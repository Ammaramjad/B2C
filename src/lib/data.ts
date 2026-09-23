import type {
  Attraction,
  Booking,
  Destination,
  Driver,
  Experience,
  PassengerProfile,
  Settlement,
  SwitchRequest,
  Ticket,
  Vehicle,
} from "./types";

export const vehicles: Vehicle[] = [
  { id: "sedan", name: "Aether Sedan", seats: 3, luggage: 2, tag: "City pulse", tagZh: "城市脈衝", multiplier: 1 },
  { id: "business", name: "Orbit Business", seats: 3, luggage: 2, tag: "Silent cabin", tagZh: "靜音座艙", multiplier: 1.35 },
  { id: "mpv", name: "Halo MPV", seats: 5, luggage: 4, tag: "Family orbit", tagZh: "家庭軌道", multiplier: 1.55 },
  { id: "van", name: "Nexus Van", seats: 8, luggage: 8, tag: "Crew lift", tagZh: "團隊載具", multiplier: 1.9 },
  { id: "ev", name: "Lumen EV", seats: 4, luggage: 3, tag: "Zero wake", tagZh: "零尾流", multiplier: 1.2 },
];

export const destinations: Destination[] = [
  { id: "taipei", city: "Taipei", cityZh: "臺北", country: "Taiwan", countryZh: "臺灣", tag: "Night markets · TPE", tagZh: "夜市 · 桃園機場", image: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=1400&q=80", routes: 48, from: 890 },
  { id: "taichung", city: "Taichung", cityZh: "臺中", country: "Taiwan", countryZh: "臺灣", tag: "RMQ · Calligraphy Greenway", tagZh: "清泉崗 · 草悟道", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80", routes: 22, from: 980 },
  { id: "kaohsiung", city: "Kaohsiung", cityZh: "高雄", country: "Taiwan", countryZh: "臺灣", tag: "KHH · Harbor", tagZh: "小港 · 港灣", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&q=80", routes: 18, from: 1100 },
  { id: "tokyo", city: "Tokyo", cityZh: "東京", country: "Japan", countryZh: "日本", tag: "HND / NRT", tagZh: "羽田／成田", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400&q=80", routes: 62, from: 1680 },
  { id: "seoul", city: "Seoul", cityZh: "首爾", country: "Korea", countryZh: "韓國", tag: "ICN", tagZh: "仁川", image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1400&q=80", routes: 41, from: 1420 },
  { id: "singapore", city: "Singapore", cityZh: "新加坡", country: "Singapore", countryZh: "新加坡", tag: "SIN", tagZh: "樟宜", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1400&q=80", routes: 36, from: 2100 },
];

export const experiences: Experience[] = [
  { id: "ex-1", title: "Jiufen night ridge + driver-guide", titleZh: "九份夜嶺＋導遊司機", city: "Taipei", hours: 8, price: 6800, rating: 4.92, image: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=900&q=80", category: "Charter" },
  { id: "ex-2", title: "TPE arrivals — priority meet & greet", titleZh: "桃機優先接機舉牌", city: "Taipei", hours: 2, price: 1680, rating: 4.88, image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80", category: "Airport" },
  { id: "ex-3", title: "Yehliu + Jiufen full-day charter", titleZh: "野柳＋九份全日包車", city: "Taipei", hours: 9, price: 7200, rating: 4.9, image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80", category: "Charter" },
  { id: "ex-4", title: "TPE lounge transfer + SIM desk", titleZh: "桃機貴賓室接駁＋SIM", city: "Taipei", hours: 3, price: 1980, rating: 4.81, image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80", category: "Airport" },
];

export const drivers: Driver[] = [
  { id: "d1", name: "Kenji Mori", nameZh: "森 健司", rating: 4.98, trips: 2140, vehicle: "Orbit Business", plate: "TPE-8801", city: "Taipei", online: true, languages: ["EN", "ZH"], photo: "KM", phone: "+886 912 880 101", license: "TW-DRV-8801", fleet: "owned", status: "approved", joined: "2022-03-12", acceptRate: 0.97, rejectRate: 0.03, emptyKmWeek: 48, commissionRate: 0.2, earningsToday: 6240, earningsWeek: 42800, earningsMonth: 168400, earningsYtd: 1240800, pendingPayout: 34240, completedWeek: 19, cancelledWeek: 1 },
  { id: "d2", name: "Aisha Rahman", nameZh: "艾莎 · 拉赫曼", rating: 4.94, trips: 1688, vehicle: "Lumen EV", plate: "TPE-2209", city: "Taipei", online: true, languages: ["EN", "ZH"], photo: "AR", phone: "+886 933 220 909", license: "TW-DRV-2209", fleet: "owned", status: "approved", joined: "2023-01-08", acceptRate: 0.94, rejectRate: 0.06, emptyKmWeek: 61, commissionRate: 0.2, earningsToday: 4180, earningsWeek: 36120, earningsMonth: 142200, earningsYtd: 980400, pendingPayout: 28896, completedWeek: 16, cancelledWeek: 0 },
  { id: "d3", name: "Wei Chen", nameZh: "陳威", rating: 4.91, trips: 3012, vehicle: "Halo MPV", plate: "TPE-4410", city: "Taipei", online: true, languages: ["ZH", "EN"], photo: "WC", phone: "+886 918 441 010", license: "TW-DRV-4410", fleet: "franchise", status: "approved", joined: "2021-07-22", acceptRate: 0.92, rejectRate: 0.08, emptyKmWeek: 73, commissionRate: 0.2, earningsToday: 8900, earningsWeek: 51240, earningsMonth: 201800, earningsYtd: 1562200, pendingPayout: 40992, completedWeek: 22, cancelledWeek: 2 },
  { id: "d4", name: "Lin Yu-ting", nameZh: "林鈺婷", rating: 4.96, trips: 990, vehicle: "Aether Sedan", plate: "TPE-1188", city: "Taipei", online: true, languages: ["ZH", "EN"], photo: "LY", phone: "+886 975 118 812", license: "TW-DRV-1188", fleet: "partner", status: "approved", joined: "2024-02-01", acceptRate: 0.95, rejectRate: 0.05, emptyKmWeek: 39, commissionRate: 0.2, earningsToday: 2760, earningsWeek: 28900, earningsMonth: 110400, earningsYtd: 420800, pendingPayout: 23120, completedWeek: 13, cancelledWeek: 0 },
  { id: "d5", name: "Hsu Cheng", nameZh: "許成", rating: 4.72, trips: 540, vehicle: "Nexus Van", plate: "TXG-3301", city: "Taichung", online: false, languages: ["ZH"], photo: "HC", phone: "+886 922 330 101", license: "TW-DRV-3301", fleet: "franchise", status: "pending", joined: "2026-08-14", acceptRate: 0.88, rejectRate: 0.12, emptyKmWeek: 22, commissionRate: 0.2, earningsToday: 0, earningsWeek: 9800, earningsMonth: 41200, earningsYtd: 41200, pendingPayout: 7840, completedWeek: 4, cancelledWeek: 1 },
];

export const passengers: PassengerProfile[] = [
  { id: "p1", name: "Amara Chen", nameZh: "陳安瑪", email: "amara@zoufeng.travel", phone: "+886 900 880 101", city: "Taipei", lastDriverId: "d1", lastContactAt: "2026-09-20T14:10:00+08:00", points: 4280, rfm: "champion", trips: 18, spendTwd: 41200, prefs: { quiet: true, ac: 22, vehicle: "business" } },
  { id: "p2", name: "James Wu", nameZh: "吳傑", email: "james.wu@example.com", phone: "+886 911 220 334", city: "Taipei", lastDriverId: "d3", lastContactAt: "2026-09-21T09:02:00+08:00", points: 1560, rfm: "loyal", trips: 7, spendTwd: 18600, prefs: { quiet: false, ac: 24, vehicle: "mpv" } },
  { id: "p3", name: "Sophie Tan", nameZh: "譚蘇菲", email: "sophie.tan@example.com", phone: "+65 8123 4400", city: "Singapore", lastDriverId: "d2", lastContactAt: "2026-09-18T21:40:00+08:00", points: 820, rfm: "new", trips: 2, spendTwd: 5400, prefs: { quiet: true, ac: 23, vehicle: "ev" } },
  { id: "p4", name: "Hiro Sato", nameZh: "佐藤 博", email: "hiro.sato@example.com", phone: "+81 90 4400 1199", city: "Tokyo", lastDriverId: "d1", lastContactAt: "2026-09-12T11:20:00+08:00", points: 2400, rfm: "loyal", trips: 9, spendTwd: 26800, prefs: { quiet: true, ac: 21, vehicle: "business" } },
  { id: "p5", name: "Mei-ling Kao", nameZh: "高美玲", email: "ml.kao@example.com", phone: "+886 988 771 203", city: "Taichung", lastDriverId: "d5", lastContactAt: "2026-08-30T16:00:00+08:00", points: 200, rfm: "risk", trips: 1, spendTwd: 2100, prefs: { quiet: false, ac: 25, vehicle: "sedan" } },
];

export const attractions: Attraction[] = [
  { id: "a1", name: "Chiang Kai-shek Memorial", nameZh: "中正紀念堂", hours: 1.5, cost: 0, city: "Taipei" },
  { id: "a2", name: "Shilin Night Market", nameZh: "士林夜市", hours: 2, cost: 600, city: "Taipei" },
  { id: "a3", name: "Jiufen Old Street", nameZh: "九份老街", hours: 3, cost: 400, city: "Taipei" },
  { id: "a4", name: "Yehliu Geopark", nameZh: "野柳地質公園", hours: 2.5, cost: 180, city: "Taipei" },
  { id: "a5", name: "Taipei 101 Observatory", nameZh: "臺北 101 觀景台", hours: 1.5, cost: 600, city: "Taipei" },
  { id: "a6", name: "Beitou Hot Springs", nameZh: "北投溫泉", hours: 2, cost: 450, city: "Taipei" },
  { id: "a7", name: "Tamsui Sunset Pier", nameZh: "淡水夕陽碼頭", hours: 2, cost: 200, city: "Taipei" },
  { id: "a8", name: "National Palace Museum", nameZh: "國立故宮博物院", hours: 2.5, cost: 350, city: "Taipei" },
];

export const popularRoutes = [
  { from: "TPE Terminal 1", fromZh: "桃園機場第一航廈", to: "Xinyi / Taipei 101", toZh: "信義／臺北 101", km: 42, mins: 45, price: 1450 },
  { from: "TPE Terminal 2", fromZh: "桃園機場第二航廈", to: "Ximending", toZh: "西門町", km: 40, mins: 48, price: 1380 },
  { from: "Songshan TSA", fromZh: "松山機場", to: "Neihu", toZh: "內湖", km: 12, mins: 22, price: 780 },
  { from: "TPE Terminal 1", fromZh: "桃園機場第一航廈", to: "Beitou", toZh: "北投", km: 38, mins: 50, price: 1680 },
];

export const flights: Record<string, { eta: string; status: string; statusZh: string; terminal: string; origin: string }> = {
  CI101: { eta: "14:35", status: "On time", statusZh: "準時", terminal: "T1", origin: "NRT" },
  BR856: { eta: "16:10", status: "Delayed +22m", statusZh: "延誤 +22 分", terminal: "T2", origin: "SFO" },
  JL809: { eta: "11:05", status: "Early -8m", statusZh: "提早 -8 分", terminal: "T1", origin: "HND" },
  KE185: { eta: "19:42", status: "On time", statusZh: "準時", terminal: "T2", origin: "ICN" },
  CI012: { eta: "08:20", status: "Landed", statusZh: "已降落", terminal: "T1", origin: "LAX" },
};

function fare(price: number, airport = false, designated = false) {
  const breakdown = [
    { label: "Base fare", labelZh: "基本車資", amount: Math.round(price * 0.78) },
    ...(airport ? [{ label: "Airport access + meet", labelZh: "機場接駁與舉牌", amount: 280 }] : []),
    { label: "Demand & weather (16-factor)", labelZh: "供需與天候（16 因子）", amount: Math.round(price * 0.08) },
    ...(designated ? [{ label: "Designated driver +18%", labelZh: "指定司機 +18%", amount: Math.round(price * 0.12) }] : []),
  ];
  const total = breakdown.reduce((s, i) => s + i.amount, 0);
  return { price: total, breakdown, commission: Math.round(total * 0.2), driverNet: Math.round(total * 0.8) };
}

function b(partial: Omit<Booking, "otp" | "currency" | "commission" | "driverNet" | "breakdown" | "price"> & { priceHint: number; airport?: boolean; designated?: boolean }): Booking {
  const f = fare(partial.priceHint, partial.airport, partial.designated);
  const { priceHint: _p, airport: _a, designated: _d, ...rest } = partial;
  return {
    ...rest,
    ...f,
    currency: "TWD",
    otp: String(1000 + Math.abs(rest.id.charCodeAt(3) * 17) % 9000),
  };
}

export const seedBookings: Booking[] = [
  b({ id: "ZF-A1801", service: "airport", status: "completed", pickup: "TPE Terminal 1 Arrivals", pickupZh: "桃園機場第一航廈到達", dropoff: "Xinyi / Taipei 101", dropoffZh: "信義／臺北 101", when: "2026-09-20T14:40", vehicle: "business", passengers: 2, luggage: 2, flight: "CI101", flightEta: "14:35 T1", driverId: "d1", preferredDriver: true, passengerId: "p1", createdAt: "2026-09-18T10:00:00+08:00", passengerName: "Amara Chen", passengerPhone: "+886 900 880 101", channel: "app", priceHint: 2100, airport: true, designated: true }),
  b({ id: "ZF-A1802", service: "point", status: "completed", pickup: "Xinyi", pickupZh: "信義", dropoff: "Songshan TSA", dropoffZh: "松山機場", when: "2026-09-15T08:10", vehicle: "business", passengers: 1, luggage: 1, driverId: "d1", passengerId: "p1", createdAt: "2026-09-14T21:00:00+08:00", passengerName: "Amara Chen", passengerPhone: "+886 900 880 101", channel: "app", priceHint: 980 }),
  b({ id: "ZF-A1803", service: "charter", status: "completed", pickup: "Hotel okura Prestige", pickupZh: "大倉久和大飯店", dropoff: "Jiufen + Yehliu loop", dropoffZh: "九份＋野柳環線", when: "2026-09-10T09:00", vehicle: "mpv", passengers: 4, luggage: 3, hours: 8, driverId: "d3", passengerId: "p2", createdAt: "2026-09-07T11:00:00+08:00", passengerName: "James Wu", passengerPhone: "+886 911 220 334", channel: "app", priceHint: 7200 }),
  b({ id: "ZF-A1804", service: "airport", status: "in_progress", pickup: "TPE Terminal 2 Arrivals", pickupZh: "桃園機場第二航廈到達", dropoff: "Ximending", dropoffZh: "西門町", when: "2026-09-23T09:20", vehicle: "ev", passengers: 2, luggage: 2, flight: "BR856", flightEta: "16:10 T2", driverId: "d2", passengerId: "p3", createdAt: "2026-09-21T08:00:00+08:00", passengerName: "Sophie Tan", passengerPhone: "+65 8123 4400", channel: "app", priceHint: 1680, airport: true }),
  b({ id: "ZF-A1805", service: "airport", status: "assigned", pickup: "TPE Terminal 1 Arrivals", pickupZh: "桃園機場第一航廈到達", dropoff: "Beitou", dropoffZh: "北投", when: "2026-09-23T16:30", vehicle: "business", passengers: 2, luggage: 3, flight: "JL809", flightEta: "11:05 T1", driverId: "d1", preferredDriver: true, passengerId: "p4", createdAt: "2026-09-22T09:30:00+08:00", passengerName: "Hiro Sato", passengerPhone: "+81 90 4400 1199", channel: "app", priceHint: 1880, airport: true, designated: true }),
  b({ id: "ZF-A1806", service: "taxi", status: "en_route", pickup: "Da'an", pickupZh: "大安", dropoff: "Neihu", dropoffZh: "內湖", when: "2026-09-23T10:05", vehicle: "sedan", passengers: 1, luggage: 0, driverId: "d4", passengerId: "p2", createdAt: "2026-09-23T09:50:00+08:00", passengerName: "James Wu", passengerPhone: "+886 911 220 334", channel: "app", priceHint: 620 }),
  b({ id: "ZF-A1807", service: "airport", status: "confirmed", pickup: "TPE Terminal 1", pickupZh: "桃園機場第一航廈", dropoff: "Banqiao", dropoffZh: "板橋", when: "2026-09-24T18:40", vehicle: "van", passengers: 6, luggage: 6, flight: "KE185", flightEta: "19:42 T2", driverId: "d3", passengerId: "p2", createdAt: "2026-09-22T16:00:00+08:00", passengerName: "James Wu", passengerPhone: "+886 911 220 334", channel: "ops", priceHint: 2480, airport: true }),
  b({ id: "ZF-A1808", service: "designated", status: "completed", pickup: "Xinyi nightlife", pickupZh: "信義夜生活", dropoff: "Home — Neihu", dropoffZh: "住家 — 內湖", when: "2026-09-19T23:10", vehicle: "sedan", passengers: 1, luggage: 0, hours: 3, driverId: "d4", passengerId: "p1", createdAt: "2026-09-19T21:00:00+08:00", passengerName: "Amara Chen", passengerPhone: "+886 900 880 101", channel: "app", priceHint: 2760 }),
  b({ id: "ZF-A1809", service: "point", status: "cancelled", pickup: "Tamsui", pickupZh: "淡水", dropoff: "Taipei Main", dropoffZh: "臺北車站", when: "2026-09-16T13:00", vehicle: "ev", passengers: 2, luggage: 1, driverId: "d2", passengerId: "p5", createdAt: "2026-09-16T09:00:00+08:00", passengerName: "Mei-ling Kao", passengerPhone: "+886 988 771 203", channel: "app", priceHint: 890 }),
  b({ id: "ZF-A1810", service: "charter", status: "completed", pickup: "Kaohsiung KHH", pickupZh: "高雄小港機場", dropoff: "Pier-2 + Lotus Pond", dropoffZh: "駁二＋蓮池潭", when: "2026-09-08T10:00", vehicle: "mpv", passengers: 5, luggage: 4, hours: 7, driverId: "d3", passengerId: "p4", createdAt: "2026-09-05T14:00:00+08:00", passengerName: "Hiro Sato", passengerPhone: "+81 90 4400 1199", channel: "referral", priceHint: 6400 }),
  b({ id: "ZF-A1811", service: "airport", status: "arrived", pickup: "TPE Terminal 1 Arrivals", pickupZh: "桃園機場第一航廈到達", dropoff: "National Palace Museum", dropoffZh: "故宮", when: "2026-09-23T11:40", vehicle: "business", passengers: 2, luggage: 2, flight: "CI012", flightEta: "08:20 T1", driverId: "d1", passengerId: "p1", createdAt: "2026-09-20T19:00:00+08:00", passengerName: "Amara Chen", passengerPhone: "+886 900 880 101", channel: "app", priceHint: 1760, airport: true }),
  b({ id: "ZF-A1812", service: "rental", status: "confirmed", pickup: "Nangang depot", pickupZh: "南港車廠", dropoff: "Self-drive 24h", dropoffZh: "自駕 24 小時", when: "2026-09-25T09:00", vehicle: "ev", passengers: 2, luggage: 2, hours: 24, passengerId: "p3", createdAt: "2026-09-22T12:00:00+08:00", passengerName: "Sophie Tan", passengerPhone: "+65 8123 4400", channel: "app", priceHint: 4200 }),
  b({ id: "ZF-A1813", service: "airport", status: "completed", pickup: "TPE Terminal 2", pickupZh: "桃園機場第二航廈", dropoff: "Da'an", dropoffZh: "大安", when: "2026-09-21T07:50", vehicle: "mpv", passengers: 3, luggage: 4, flight: "CI101", driverId: "d3", passengerId: "p2", createdAt: "2026-09-19T18:00:00+08:00", passengerName: "James Wu", passengerPhone: "+886 911 220 334", channel: "app", priceHint: 1980, airport: true }),
  b({ id: "ZF-A1814", service: "point", status: "completed", pickup: "Beitou", pickupZh: "北投", dropoff: "Tamsui", dropoffZh: "淡水", when: "2026-09-17T17:20", vehicle: "sedan", passengers: 2, luggage: 0, driverId: "d4", passengerId: "p1", createdAt: "2026-09-17T16:40:00+08:00", passengerName: "Amara Chen", passengerPhone: "+886 900 880 101", channel: "app", priceHint: 720 }),
  b({ id: "ZF-A1815", service: "taxi", status: "completed", pickup: "Xinyi", pickupZh: "信義", dropoff: "Neihu", dropoffZh: "內湖", when: "2026-09-22T19:05", vehicle: "ev", passengers: 1, luggage: 0, driverId: "d2", passengerId: "p3", createdAt: "2026-09-22T18:50:00+08:00", passengerName: "Sophie Tan", passengerPhone: "+65 8123 4400", channel: "app", priceHint: 540 }),
];

export const seedSwitches: SwitchRequest[] = [
  { id: "SW-01", bookingId: "ZF-A1805", passengerId: "p4", fromDriverId: "d1", reason: "Need MPV for extra luggage — request via company, no private driver contact.", reasonZh: "行李增加需改 MPV — 僅能透過公司申請，不得私下聯絡其他司機。", status: "open", createdAt: "2026-09-22T20:10:00+08:00" },
  { id: "SW-02", bookingId: "ZF-A1803", passengerId: "p2", fromDriverId: "d3", toDriverId: "d1", reason: "Preferred English-speaking captain for next airport arrival.", reasonZh: "下次接機希望改英語司機。", status: "approved", createdAt: "2026-09-11T08:00:00+08:00", decidedAt: "2026-09-11T09:40:00+08:00", note: "Reassigned under M25 designated-driver policy." },
];

export const seedTickets: Ticket[] = [
  { id: "TK-110", passengerId: "p1", bookingId: "ZF-A1801", level: "L1", topic: "Wait-time confirmation after CI101", topicZh: "CI101 落地後等候時間確認", status: "resolved", createdAt: "2026-09-20T14:50:00+08:00" },
  { id: "TK-111", passengerId: "p5", bookingId: "ZF-A1809", level: "L2", topic: "Cancellation fee dispute", topicZh: "取消費爭議", status: "l2", createdAt: "2026-09-16T14:20:00+08:00" },
  { id: "TK-112", passengerId: "p3", bookingId: "ZF-A1804", level: "L3", topic: "Share-link for family (not SOS)", topicZh: "家屬分享連結（非 SOS）", status: "open", createdAt: "2026-09-23T09:30:00+08:00" },
];

export const seedSettlements: Settlement[] = [
  { id: "ST-d1-38", driverId: "d1", week: "2026-W38", rides: 19, gross: 42800, commission: 8560, net: 34240, status: "pending" },
  { id: "ST-d1-37", driverId: "d1", week: "2026-W37", rides: 21, gross: 45120, commission: 9024, net: 36096, status: "paid" },
  { id: "ST-d2-38", driverId: "d2", week: "2026-W38", rides: 16, gross: 36120, commission: 7224, net: 28896, status: "pending" },
  { id: "ST-d3-38", driverId: "d3", week: "2026-W38", rides: 22, gross: 51240, commission: 10248, net: 40992, status: "pending" },
  { id: "ST-d4-38", driverId: "d4", week: "2026-W38", rides: 13, gross: 28900, commission: 5780, net: 23120, status: "pending" },
  { id: "ST-d5-38", driverId: "d5", week: "2026-W38", rides: 4, gross: 9800, commission: 1960, net: 7840, status: "pending" },
];

export const kpis = [
  { key: "gmv", label: "GMV (7d)", labelZh: "GMV（7 日）", twd: 18400000, delta: "+12.6%" },
  { key: "dispatch", label: "Dispatch success", labelZh: "派遣成功率", value: "97.4%", delta: "+1.1%" },
  { key: "aov", label: "Avg order", labelZh: "平均客單", twd: 2180, delta: "+8.2%" },
  { key: "empty", label: "Empty miles", labelZh: "空駛率", value: "11.8%", delta: "-2.4%" },
  { key: "nps", label: "Passenger NPS", labelZh: "乘客 NPS", value: "72", delta: "+4" },
  { key: "wait", label: "Avg wait", labelZh: "平均等候", value: "4.6 min", delta: "-0.8" },
  { key: "rides", label: "Completed rides (7d)", labelZh: "完成趟次（7 日）", value: "842", delta: "+9.1%" },
  { key: "switch", label: "Company driver switches", labelZh: "公司代換司機", value: "23", delta: "M25 policy" },
];
