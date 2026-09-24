import type {
  Destination,
  Extra,
  RentalCar,
  ServiceType,
  Taxi,
  Vehicle,
} from "./types.ts";

export const services: { id: ServiceType; en: string; zh: string; formula: string }[] = [
  { id: "airport_pickup", en: "Airport pickup", zh: "機場接機", formula: "base + extras + night" },
  { id: "airport_drop", en: "Airport drop-off", zh: "機場送機", formula: "base + extras + night" },
  { id: "p2p", en: "Point to point", zh: "點對點接送", formula: "base + extras + night" },
  { id: "hourly", en: "Hourly charter", zh: "計時包車", formula: "880 × hours" },
  { id: "rental", en: "Self-drive rental", zh: "租車自駕", formula: "day_price × days" },
  { id: "instant", en: "Instant taxi", zh: "即時計程車", formula: "taxi class auto-assign" },
];

export const vehicles: Vehicle[] = [
  { id: "sedan", name: "Sedan", nameZh: "舒適轎車", model: "Toyota Camry", seats: 3, luggage: 3, base: 1280, meet: true, image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=1200&q=80", panoramic: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&q=80" },
  { id: "premium", name: "Premium", nameZh: "豪華轎車", model: "Mercedes E-Class", seats: 3, luggage: 3, base: 2680, meet: true, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80", panoramic: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1600&q=80" },
  { id: "suv", name: "SUV", nameZh: "休旅車", model: "RAV4 / CR-V", seats: 4, luggage: 4, base: 1680, meet: true, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80", panoramic: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600&q=80" },
  { id: "mpv", name: "MPV", nameZh: "商務車", model: "Toyota Alphard", seats: 6, luggage: 6, base: 2280, meet: true, image: "https://images.unsplash.com/photo-1544620341-11cb2cd7c323?w=1200&q=80", panoramic: "https://images.unsplash.com/photo-1469289759076-d148ef7ac1a9?w=1600&q=80" },
  { id: "van", name: "Van", nameZh: "九人座廂型車", model: "HiAce", seats: 8, luggage: 8, base: 2480, wheel: true, image: "https://images.unsplash.com/photo-1527786356703-4b100097af00?w=1200&q=80", panoramic: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1600&q=80" },
  { id: "shuttle", name: "Shuttle", nameZh: "共享接駁", model: "Shared", seats: 10, luggage: 1, base: 380, image: "https://images.unsplash.com/photo-1544620341-11cb2cd7c323?w=1200&q=80", panoramic: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1600&q=80" },
];

export const taxis: Taxi[] = [
  { id: "taxi", name: "Taxi", nameZh: "一般計程車", eta: 3, base: 185 },
  { id: "plus", name: "Plus", nameZh: "舒適型", eta: 5, base: 265 },
  { id: "xl", name: "XL", nameZh: "六人座", eta: 7, base: 420 },
  { id: "black", name: "Black", nameZh: "尊榮黑卡", eta: 9, base: 880 },
];

export const rentals: RentalCar[] = [
  { id: "yaris", name: "Yaris", nameZh: "Toyota Yaris 或同級", seats: 5, day: 1680 },
  { id: "cross", name: "Corolla Cross", nameZh: "Toyota Corolla Cross", seats: 5, day: 2280 },
  { id: "sienta", name: "Sienta", nameZh: "Toyota Sienta 七人座", seats: 7, day: 2680 },
];

export const extras: Extra[] = [
  { id: "meet", name: "Meet & greet sign", nameZh: "舉牌迎接", price: 150 },
  { id: "child_seat", name: "Child seat", nameZh: "兒童座椅", price: 200 },
  { id: "english", name: "English-speaking driver", nameZh: "英語司機", price: 120 },
  { id: "pet", name: "Pet friendly", nameZh: "可攜寵物", price: 200 },
  { id: "one_way_rental", name: "One-way rental", nameZh: "甲租乙還", price: 250, only: ["rental"] },
  { id: "insurance", name: "Extra insurance", nameZh: "加強保險", price: 450, only: ["rental"] },
];

export const promos = {
  WELCOME: { type: "flat" as const, amount: 100, en: "New guest NT$100 off", zh: "新客折 NT$100" },
  TPE200: { type: "flat" as const, amount: 200, en: "Airport NT$200 off", zh: "機場接送折 NT$200" },
  FAMILY: { type: "pct" as const, amount: 0.1, en: "Family 10% off", zh: "家庭 9 折" },
};

export const cities: Destination[] = [
  { id: "taipei", city: "Taipei", cityZh: "台北", tag: "TPE / TSA", tagZh: "桃機／松山", image: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=1400&q=80", from: 1280 },
  { id: "newtaipei", city: "New Taipei", cityZh: "新北", tag: "Jiufen · Tamsui", tagZh: "九份 · 淡水", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&q=80", from: 1680 },
  { id: "taoyuan", city: "Taoyuan", cityZh: "桃園", tag: "TPE hub", tagZh: "桃園機場樞紐", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=80", from: 1280 },
  { id: "taichung", city: "Taichung", cityZh: "台中", tag: "RMQ", tagZh: "清泉崗", image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80", from: 1680 },
  { id: "tainan", city: "Tainan", cityZh: "台南", tag: "Old city", tagZh: "古都", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1400&q=80", from: 1880 },
  { id: "kaohsiung", city: "Kaohsiung", cityZh: "高雄", tag: "KHH", tagZh: "小港", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&q=80", from: 1880 },
  { id: "hualien", city: "Hualien", cityZh: "花蓮", tag: "Taroko", tagZh: "太魯閣", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=80", from: 2280 },
  { id: "kenting", city: "Kenting", cityZh: "墾丁", tag: "South coast", tagZh: "南島", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80", from: 2480 },
];

export const entries = [
  { id: "line", en: "LINE Official", zh: "LINE@ 官方帳號", phase: "P1" },
  { id: "web", en: "Official RWD site", zh: "官網 RWD", phase: "P1" },
  { id: "app", en: "Traveler app · 5 tabs", zh: "旅客 APP · 五頁籤", phase: "P1" },
  { id: "market", en: "Marketplace cards", zh: "商城化展示", phase: "P1" },
  { id: "instant", en: "Instant taxi entry", zh: "即時計程車入口", phase: "P1" },
  { id: "messenger", en: "Messenger", zh: "Facebook Messenger", phase: "P2" },
];

export const channels = ["web", "app", "dispatch", "taxi", "hourly", "rental"] as const;

export const statuses = [
  "payment_pending",
  "payment_confirmed",
  "new",
  "assigned",
  "accepted",
  "arriving",
  "onboard",
  "completed",
  "cancelled",
] as const;

export const helpCats = [
  { id: "Booking", zh: "訂單" },
  { id: "Payment", zh: "付款" },
  { id: "Cancellation", zh: "取消" },
  { id: "Driver", zh: "司機" },
  { id: "Airport Pickup", zh: "機場接送" },
  { id: "Lost Property", zh: "遺失物" },
  { id: "Refund", zh: "退款" },
  { id: "Account", zh: "帳戶" },
];

export const zones = [
  { id: "n", en: "Taipei / New Taipei / Taoyuan", zh: "北北桃", load: 78, empty: 12 },
  { id: "c", en: "Taichung / Changhua / Nantou", zh: "台中彰投", load: 54, empty: 18 },
  { id: "s", en: "Kaohsiung / Kenting", zh: "高雄墾丁", load: 61, empty: 22 },
];

export const demandSlots = [
  { t: "09:00", n: 18 },
  { t: "12:00", n: 22 },
  { t: "18:00", n: 31 },
  { t: "22:00", n: 14 },
];

export const imports = ["KLOOK", "Trip.com", "kkday", "Agency API", "Enterprise API", "Web / App"];

export const HOURLY_RATE = 880;
export const NIGHT_RATE = 0.2;
export const SURGE = 1.15;
export const FREE_WAIT = 45;
export const COMMISSION = 0.2;
