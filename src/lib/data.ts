import { COMMISSION } from "./catalog";
import type { Booking, Driver, PassengerProfile, Settlement, SwitchRequest, Ticket } from "./types";

export const drivers: Driver[] = [
  { id: "d1", name: "Kenji Mori", rating: 4.98, trips: 2140, vehicle: "Mercedes E-Class", vehicleClass: "premium", plate: "TPE-8801", city: "Taipei", work: "available", languages: ["EN", "ZH"], photo: "KM", phone: "+886 912 880 101", license: "TW-DRV-8801", fleet: "A", fuel: "hybrid", vehicleState: "active", status: "approved", joined: "2022-03-12", acceptRate: 0.97, earningsToday: 6240, earningsWeek: 42800, earningsMonth: 168400, earningsYtd: 1240800, pendingPayout: 34240, completedWeek: 19, cancelledWeek: 1, emptyKmWeek: 48, commissionRate: COMMISSION },
  { id: "d2", name: "Aisha Rahman", rating: 4.94, trips: 1688, vehicle: "Tesla Model Y", vehicleClass: "suv", plate: "TPE-2209", city: "Taipei", work: "busy", languages: ["EN", "ZH"], photo: "AR", phone: "+886 933 220 909", license: "TW-DRV-2209", fleet: "A", fuel: "electric", vehicleState: "active", status: "approved", joined: "2023-01-08", acceptRate: 0.94, earningsToday: 4180, earningsWeek: 36120, earningsMonth: 142200, earningsYtd: 980400, pendingPayout: 28896, completedWeek: 16, cancelledWeek: 0, emptyKmWeek: 61, commissionRate: COMMISSION },
  { id: "d3", name: "Wei Chen", rating: 4.91, trips: 3012, vehicle: "Toyota Alphard", vehicleClass: "mpv", plate: "TPE-4410", city: "Taipei", work: "available", languages: ["ZH", "EN"], photo: "WC", phone: "+886 918 441 010", license: "TW-DRV-4410", fleet: "B", fuel: "petrol", vehicleState: "active", status: "approved", joined: "2021-07-22", acceptRate: 0.92, earningsToday: 8900, earningsWeek: 51240, earningsMonth: 201800, earningsYtd: 1562200, pendingPayout: 40992, completedWeek: 22, cancelledWeek: 2, emptyKmWeek: 73, commissionRate: COMMISSION },
  { id: "d4", name: "Lin Yu-ting", rating: 4.96, trips: 990, vehicle: "Toyota Camry", vehicleClass: "sedan", plate: "TPE-1188", city: "Taipei", work: "available", languages: ["ZH", "EN"], photo: "LY", phone: "+886 975 118 812", license: "TW-DRV-1188", fleet: "C", fuel: "hybrid", vehicleState: "active", status: "approved", joined: "2024-02-01", acceptRate: 0.95, earningsToday: 2760, earningsWeek: 28900, earningsMonth: 110400, earningsYtd: 420800, pendingPayout: 23120, completedWeek: 13, cancelledWeek: 0, emptyKmWeek: 39, commissionRate: COMMISSION },
  { id: "d5", name: "Hsu Cheng", rating: 4.72, trips: 540, vehicle: "HiAce", vehicleClass: "van", plate: "TXG-3301", city: "Taichung", work: "offline", languages: ["ZH"], photo: "HC", phone: "+886 922 330 101", license: "TW-DRV-3301", fleet: "B", fuel: "diesel", vehicleState: "maintenance", status: "pending", joined: "2026-08-14", acceptRate: 0.88, earningsToday: 0, earningsWeek: 9800, earningsMonth: 41200, earningsYtd: 41200, pendingPayout: 7840, completedWeek: 4, cancelledWeek: 1, emptyKmWeek: 22, commissionRate: COMMISSION },
  { id: "d6", name: "Mina Park", rating: 4.88, trips: 720, vehicle: "Camry night", vehicleClass: "sedan", plate: "KHH-6602", city: "Kaohsiung", work: "available", languages: ["EN", "ZH"], photo: "MP", phone: "+886 966 660 202", license: "TW-DRV-6602", fleet: "A", fuel: "petrol", vehicleState: "active", status: "approved", joined: "2023-11-02", acceptRate: 0.93, earningsToday: 1980, earningsWeek: 22100, earningsMonth: 88000, earningsYtd: 510000, pendingPayout: 17680, completedWeek: 11, cancelledWeek: 0, emptyKmWeek: 55, commissionRate: COMMISSION },
];

export const passengers: PassengerProfile[] = [
  { id: "p1", name: "Amara Chen", email: "amara@zoudian.travel", phone: "+886 900 880 101", city: "Taipei", lastDriverId: "d1", points: 4280, rfm: "champion", trips: 18, spendTwd: 41200 },
  { id: "p2", name: "James Wu", email: "james.wu@example.com", phone: "+886 911 220 334", city: "Taipei", lastDriverId: "d3", points: 1560, rfm: "loyal", trips: 7, spendTwd: 18600 },
  { id: "p3", name: "Sophie Tan", email: "sophie.tan@example.com", phone: "+65 8123 4400", city: "Kaohsiung", lastDriverId: "d2", points: 820, rfm: "new", trips: 2, spendTwd: 5400 },
  { id: "p4", name: "Hiro Sato", email: "hiro.sato@example.com", phone: "+81 90 4400 1199", city: "Taipei", lastDriverId: "d1", points: 2400, rfm: "loyal", trips: 9, spendTwd: 26800 },
  { id: "p5", name: "Mei-ling Kao", email: "ml.kao@example.com", phone: "+886 988 771 203", city: "Taichung", lastDriverId: "d5", points: 200, rfm: "risk", trips: 1, spendTwd: 2100 },
];

function pack(partial: Omit<Booking, "otp" | "currency" | "commission" | "driverNet">): Booking {
  return {
    ...partial,
    currency: "TWD",
    otp: String(1000 + Math.abs(partial.id.charCodeAt(4) * 19) % 9000),
    commission: Math.round(partial.price * COMMISSION),
    driverNet: Math.round(partial.price * (1 - COMMISSION)),
  };
}

const b = (label: string, labelZh: string, amount: number) => [{ label, labelZh, amount }];

export const seedBookings: Booking[] = [
  pack({ id: "ZD-1801", service: "airport_pickup", status: "completed", pickup: "TPE T1 Arrivals", pickupZh: "桃園機場第一航廈到達", dropoff: "Taipei 101", dropoffZh: "台北 101", when: "2026-09-20T14:40", vehicle: "premium", passengers: 2, luggage: 2, extras: ["meet", "english"], promo: "TPE200", flight: "CI101", driverId: "d1", passengerId: "p1", createdAt: "2026-09-18T10:00:00+08:00", passengerName: "Amara Chen", passengerPhone: "+886 900 880 101", channel: "web", payment: "card", price: 2750, breakdown: b("Base fare", "基礎車資", 2680) }),
  pack({ id: "ZD-1802", service: "p2p", status: "completed", pickup: "Xinyi", pickupZh: "信義", dropoff: "Songshan TSA", dropoffZh: "松山機場", when: "2026-09-15T08:10", vehicle: "sedan", passengers: 1, luggage: 1, extras: [], driverId: "d1", passengerId: "p1", createdAt: "2026-09-14T21:00:00+08:00", passengerName: "Amara Chen", passengerPhone: "+886 900 880 101", channel: "app", payment: "line", price: 1280, breakdown: b("Base fare", "基礎車資", 1280) }),
  pack({ id: "ZD-1803", service: "hourly", status: "completed", pickup: "Hotel", pickupZh: "飯店", dropoff: "Jiufen loop", dropoffZh: "九份環線", when: "2026-09-10T09:00", vehicle: "mpv", passengers: 4, luggage: 3, extras: ["child_seat"], hours: 8, driverId: "d3", passengerId: "p2", createdAt: "2026-09-07T11:00:00+08:00", passengerName: "James Wu", passengerPhone: "+886 911 220 334", channel: "hourly", payment: "card", price: 7240, breakdown: b("Hourly 880×8", "計時 880×8", 7040) }),
  pack({ id: "ZD-1804", service: "instant", status: "onboard", pickup: "Da'an", pickupZh: "大安", dropoff: "Neihu", dropoffZh: "內湖", when: "2026-09-23T10:05", vehicle: "plus", passengers: 1, luggage: 0, extras: [], driverId: "d2", passengerId: "p3", createdAt: "2026-09-23T09:50:00+08:00", passengerName: "Sophie Tan", passengerPhone: "+65 8123 4400", channel: "taxi", payment: "apple", price: 265, breakdown: b("Plus taxi", "舒適型", 265) }),
  pack({ id: "ZD-1805", service: "airport_pickup", status: "arriving", pickup: "TPE T1", pickupZh: "桃園機場 T1", dropoff: "Beitou", dropoffZh: "北投", when: "2026-09-23T16:30", vehicle: "sedan", passengers: 2, luggage: 3, extras: ["meet"], flight: "JL809", driverId: "d1", passengerId: "p4", createdAt: "2026-09-22T09:30:00+08:00", passengerName: "Hiro Sato", passengerPhone: "+81 90 4400 1199", channel: "web", payment: "card", price: 1430, breakdown: b("Camry + meet", "Camry＋舉牌", 1430) }),
  pack({ id: "ZD-1806", service: "airport_drop", status: "accepted", pickup: "Banqiao", pickupZh: "板橋", dropoff: "TPE T2", dropoffZh: "桃園機場 T2", when: "2026-09-24T18:40", vehicle: "van", passengers: 6, luggage: 6, extras: ["meet"], driverId: "d3", passengerId: "p2", createdAt: "2026-09-22T16:00:00+08:00", passengerName: "James Wu", passengerPhone: "+886 911 220 334", channel: "dispatch", payment: "card", price: 2630, breakdown: b("Van + meet", "廂型＋舉牌", 2630) }),
  pack({ id: "ZD-1807", service: "rental", status: "payment_confirmed", pickup: "Nangang depot", pickupZh: "南港車廠", dropoff: "Self-drive 2 days", dropoffZh: "自駕 2 日", when: "2026-09-25T09:00", vehicle: "cross", passengers: 2, luggage: 2, extras: ["insurance"], days: 2, passengerId: "p3", createdAt: "2026-09-22T12:00:00+08:00", passengerName: "Sophie Tan", passengerPhone: "+65 8123 4400", channel: "rental", payment: "card", price: 5010, breakdown: b("Cross ×2 + insurance", "Cross×2＋保險", 5010) }),
  pack({ id: "ZD-1808", service: "p2p", status: "new", pickup: "Tamsui", pickupZh: "淡水", dropoff: "Taipei Main", dropoffZh: "台北車站", when: "2026-09-24T13:00", vehicle: "sedan", passengers: 2, luggage: 1, extras: [], passengerId: "p5", createdAt: "2026-09-23T09:00:00+08:00", passengerName: "Mei-ling Kao", passengerPhone: "+886 988 771 203", channel: "web", payment: "cash", price: 1280, breakdown: b("Sedan", "轎車", 1280) }),
  pack({ id: "ZD-1809", service: "airport_pickup", status: "cancelled", pickup: "TPE T2", pickupZh: "桃園機場 T2", dropoff: "Da'an", dropoffZh: "大安", when: "2026-09-16T13:00", vehicle: "suv", passengers: 2, luggage: 1, extras: ["meet"], driverId: "d2", passengerId: "p5", createdAt: "2026-09-16T09:00:00+08:00", passengerName: "Mei-ling Kao", passengerPhone: "+886 988 771 203", channel: "app", payment: "line", price: 0, breakdown: b("Cancelled >24h", "24h 前取消", 0) }),
  pack({ id: "ZD-1810", service: "hourly", status: "assigned", pickup: "Kaohsiung KHH", pickupZh: "高雄小港", dropoff: "Kenting day", dropoffZh: "墾丁一日", when: "2026-09-26T08:00", vehicle: "mpv", passengers: 5, luggage: 4, extras: ["english"], hours: 10, driverId: "d6", passengerId: "p4", createdAt: "2026-09-20T14:00:00+08:00", passengerName: "Hiro Sato", passengerPhone: "+81 90 4400 1199", channel: "hourly", payment: "card", price: 8920, breakdown: b("880×10 + EN", "880×10＋英語", 8920) }),
  pack({
    id: "ZF-82041",
    service: "airport_pickup",
    status: "payment_confirmed",
    pickup: "TPE T2 Arrivals · Door 8",
    pickupZh: "桃園機場 T2 到達 8 號門",
    dropoff: "Taipei 101 / Xinyi",
    dropoffZh: "台北 101 / 信義",
    when: "2026-09-23T16:40",
    vehicle: "mpv",
    passengers: 5,
    luggage: 4,
    extras: ["meet", "child_seat"],
    flight: "BR156",
    passengerId: "p-sarah",
    createdAt: "2026-09-23T12:00:00+08:00",
    passengerName: "Sarah Chen",
    passengerPhone: "+886 900 820 041",
    channel: "web",
    payment: "card",
    price: 2280,
    breakdown: b("Airport MPV", "機場 MPV", 2280),
  }),
];

export const seedSwitches: SwitchRequest[] = [
  { id: "SW-01", bookingId: "ZD-1805", passengerId: "p4", fromDriverId: "d1", reason: "Need MPV — request via company only.", reasonZh: "需改 MPV，僅能透過公司申請。", status: "open", createdAt: "2026-09-22T20:10:00+08:00" },
];

export const seedTickets: Ticket[] = [
  { id: "TK-110", passengerId: "p1", bookingId: "ZD-1801", category: "Airport Pickup", categoryZh: "機場接送", message: "Confirm 45-min free wait after CI101.", status: "resolved", createdAt: "2026-09-20T14:50:00+08:00" },
  { id: "TK-111", passengerId: "p5", bookingId: "ZD-1809", category: "Cancellation", categoryZh: "取消", message: "Need refund receipt.", status: "l2", createdAt: "2026-09-16T14:20:00+08:00" },
];

export const seedSettlements: Settlement[] = [
  { id: "ST-d1-38", driverId: "d1", week: "2026-W38", rides: 19, gross: 42800, commission: 8560, net: 34240, status: "pending" },
  { id: "ST-d2-38", driverId: "d2", week: "2026-W38", rides: 16, gross: 36120, commission: 7224, net: 28896, status: "pending" },
  { id: "ST-d3-38", driverId: "d3", week: "2026-W38", rides: 22, gross: 51240, commission: 10248, net: 40992, status: "pending" },
];

export const attractions = [
  { id: "a1", name: "Chiang Kai-shek Memorial", nameZh: "中正紀念堂", hours: 1.5, cost: 0, city: "Taipei" },
  { id: "a2", name: "Shilin Night Market", nameZh: "士林夜市", hours: 2, cost: 600, city: "Taipei" },
  { id: "a3", name: "Jiufen Old Street", nameZh: "九份老街", hours: 3, cost: 400, city: "Taipei" },
  { id: "a5", name: "Taipei 101", nameZh: "台北 101", hours: 1.5, cost: 600, city: "Taipei" },
];

export const flights: Record<string, { eta: string; status: string; statusZh: string; terminal: string; origin: string }> = {
  CI101: { eta: "14:35", status: "On time", statusZh: "準時", terminal: "T1", origin: "NRT" },
  BR856: { eta: "16:10", status: "Delayed +22m", statusZh: "延誤 +22 分", terminal: "T2", origin: "SFO" },
  JL809: { eta: "11:05", status: "Early -8m", statusZh: "提早 -8 分", terminal: "T1", origin: "HND" },
};

export const kpis = [
  { key: "bookings", label: "Bookings", labelZh: "總訂單", value: "1,284" },
  { key: "pending", label: "Pending", labelZh: "待處理", value: "37" },
  { key: "active", label: "Active rides", labelZh: "進行中", value: "18" },
  { key: "gmv", label: "GMV", labelZh: "GMV", twd: 18400000 },
  { key: "avg", label: "Avg ticket", labelZh: "平均客單", twd: 1860 },
  { key: "online", label: "Drivers online", labelZh: "線上司機", value: "64" },
  { key: "vehicles", label: "Vehicles", labelZh: "車輛總數", value: "112" },
  { key: "conv", label: "Conversion", labelZh: "轉換率", value: "6.8%" },
];
