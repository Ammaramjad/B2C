import type { ServiceType, VehicleClass } from "./types";

export interface TransferProduct {
  id: string;
  service: ServiceType;
  vehicle: VehicleClass;
  title: string;
  titleZh: string;
  from: string;
  fromZh: string;
  to: string;
  toZh: string;
  city: string;
  hours: string;
  duration: string;
  seats: number;
  luggage: number;
  price: number;
  rating: number;
  reviews: number;
  booked: string;
  cancel: string;
  cancelZh: string;
  image: string;
  includes: string[];
  includesZh: string[];
}

export const transfers: TransferProduct[] = [
  {
    id: "tpe-city-sedan",
    service: "airport_pickup",
    vehicle: "sedan",
    title: "TPE Airport → Taipei city private sedan",
    titleZh: "桃園機場 → 台北市區 舒適轎車",
    from: "TPE T1/T2 arrivals",
    fromZh: "桃園機場 1／2 航廈到達",
    to: "Taipei city hotel / 101",
    toZh: "台北市區飯店／101",
    city: "Taipei",
    hours: "04:00–23:30",
    duration: "45–70 min",
    seats: 3,
    luggage: 3,
    price: 1280,
    rating: 4.9,
    reviews: 2144,
    booked: "12K+",
    cancel: "Free cancel >24h",
    cancelZh: "24 小時前免費取消",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1400&q=80",
    includes: ["Meet & greet +150 optional", "45-min free wait", "Flight tracking", "Bottled water"],
    includesZh: ["舉牌可加購 150", "45 分免費等候", "航班追蹤", "瓶裝水"],
  },
  {
    id: "tpe-city-alphard",
    service: "airport_pickup",
    vehicle: "mpv",
    title: "TPE → Taipei Alphard (6 seats)",
    titleZh: "桃機 → 台北 阿爾法 (6 人)",
    from: "TPE arrivals",
    fromZh: "桃園機場到達",
    to: "Taipei / New Taipei hotel",
    toZh: "台北／新北飯店",
    city: "Taipei",
    hours: "00:00–24:00",
    duration: "45–75 min",
    seats: 6,
    luggage: 6,
    price: 2280,
    rating: 4.96,
    reviews: 980,
    booked: "6.4K+",
    cancel: "Free cancel >24h",
    cancelZh: "24 小時前免費取消",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1400&q=80",
    includes: ["Child seat optional", "English driver optional", "Night +20% 23:00–06:00"],
    includesZh: ["兒童座椅可加購", "英語司機可加購", "夜間 23:00–06:00 +20%"],
  },
  {
    id: "city-tpe-drop",
    service: "airport_drop",
    vehicle: "sedan",
    title: "Taipei city → TPE Airport drop-off",
    titleZh: "台北市區 → 桃園機場送機",
    from: "Taipei / New Taipei",
    fromZh: "台北／新北",
    to: "TPE T1/T2",
    toZh: "桃園機場",
    city: "Taipei",
    hours: "03:00–22:00",
    duration: "40–65 min",
    seats: 3,
    luggage: 3,
    price: 1280,
    rating: 4.88,
    reviews: 1560,
    booked: "9.1K+",
    cancel: "Free cancel >24h",
    cancelZh: "24 小時前免費取消",
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=1400&q=80",
    includes: ["Door-to-terminal", "Flight check", "Tolls extra (actual)"],
    includesZh: ["飯店到航廈", "航班核對", "過路費另計"],
  },
  {
    id: "jiufen-day",
    service: "hourly",
    vehicle: "mpv",
    title: "Jiufen + Yehliu private charter 8h",
    titleZh: "九份＋野柳 包車 8 小時",
    from: "Taipei hotel",
    fromZh: "台北飯店",
    to: "Jiufen / Yehliu loop",
    toZh: "九份／野柳環線",
    city: "New Taipei",
    hours: "08:00–20:00",
    duration: "8 hours",
    seats: 6,
    luggage: 4,
    price: 7040,
    rating: 4.93,
    reviews: 640,
    booked: "3.2K+",
    cancel: "Free cancel >24h",
    cancelZh: "24 小時前免費取消",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&q=80",
    includes: ["880 × 8 hours", "Driver-guide waiting", "Fuel included"],
    includesZh: ["880×8 小時", "司機等候", "油資含"],
  },
  {
    id: "khh-kenting",
    service: "p2p",
    vehicle: "mpv",
    title: "Kaohsiung KHH → Kenting private transfer",
    titleZh: "高雄小港 → 墾丁 專車",
    from: "KHH Airport",
    fromZh: "高雄小港",
    to: "Kenting hotels",
    toZh: "墾丁飯店",
    city: "Kaohsiung",
    hours: "07:00–21:00",
    duration: "2–2.5 h",
    seats: 6,
    luggage: 6,
    price: 4280,
    rating: 4.85,
    reviews: 412,
    booked: "1.8K+",
    cancel: "Free cancel >24h",
    cancelZh: "24 小時前免費取消",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80",
    includes: ["Highway tolls extra", "Child seat optional"],
    includesZh: ["高架過路費另計", "兒童座椅可加購"],
  },
  {
    id: "txg-charter",
    service: "hourly",
    vehicle: "suv",
    title: "Taichung city charter 6h",
    titleZh: "台中市區包車 6 小時",
    from: "Taichung hotel / RMQ",
    fromZh: "台中飯店／清泉崗",
    to: "City + Rainbow Village",
    toZh: "市區＋彩虹眷村",
    city: "Taichung",
    hours: "08:00–20:00",
    duration: "6 hours",
    seats: 4,
    luggage: 4,
    price: 5280,
    rating: 4.8,
    reviews: 220,
    booked: "890+",
    cancel: "Free cancel >24h",
    cancelZh: "24 小時前免費取消",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1400&q=80",
    includes: ["880 × 6", "Parking extra"],
    includesZh: ["880×6", "停車另計"],
  },
];

export const reviews = [
  { id: "r1", name: "Mina Chen", product: "tpe-city-sedan", stars: 5, text: "Sign was clear. Flight delay — they waited.", textZh: "舉牌清楚，航班延誤也有等。", route: "TPE → Taipei 101" },
  { id: "r2", name: "Ken Sato", product: "tpe-city-alphard", stars: 5, text: "Alphard is wide. All luggage fit.", textZh: "Alphard 很寬，行李全放下。", route: "TPE → Jiufen" },
  { id: "r3", name: "Alicia", product: "khh-kenting", stars: 4, text: "Transparent NT$ checkout.", textZh: "價格透明，新台幣結帳方便。", route: "KHH → Kenting" },
  { id: "r4", name: "James Wu", product: "city-tpe-drop", stars: 5, text: "On time for a 07:10 flight.", textZh: "趕 07:10 準時到。", route: "Xinyi → TPE" },
  { id: "r5", name: "Hiro Sato", product: "jiufen-day", stars: 5, text: "Driver waited at Yehliu without rush.", textZh: "野柳等候不催。", route: "8h charter" },
];
