export const popularRoutes = [
  { id: "tpe-101", from: "TPE Airport", fromZh: "桃園機場", to: "Taipei 101", toZh: "台北 101", mins: 55, price: 1280, service: "airport_pickup" as const },
  { id: "tpe-jiufen", from: "TPE Airport", fromZh: "桃園機場", to: "Jiufen", toZh: "九份", mins: 80, price: 2280, service: "airport_pickup" as const },
  { id: "xinyi-tpe", from: "Xinyi", fromZh: "信義", to: "TPE Airport", toZh: "桃園機場", mins: 50, price: 1280, service: "airport_drop" as const },
  { id: "tsa-beitou", from: "Songshan TSA", fromZh: "松山機場", to: "Beitou", toZh: "北投", mins: 35, price: 1280, service: "airport_pickup" as const },
  { id: "khh-kenting", from: "KHH Airport", fromZh: "高雄小港", to: "Kenting", toZh: "墾丁", mins: 130, price: 4280, service: "p2p" as const },
  { id: "rmq-taichung", from: "RMQ", fromZh: "清泉崗", to: "Taichung city", toZh: "台中市區", mins: 40, price: 1680, service: "airport_pickup" as const },
];

export const airports = [
  { id: "tpe", code: "TPE", name: "Taiwan Taoyuan", nameZh: "桃園國際機場", city: "Taoyuan", wait: 45 },
  { id: "tsa", code: "TSA", name: "Taipei Songshan", nameZh: "台北松山機場", city: "Taipei", wait: 30 },
  { id: "rmq", code: "RMQ", name: "Taichung", nameZh: "台中清泉崗", city: "Taichung", wait: 30 },
  { id: "khh", code: "KHH", name: "Kaohsiung", nameZh: "高雄小港", city: "Kaohsiung", wait: 40 },
];

export const faqs = [
  { q: "Is meet & greet included?", qz: "含舉牌嗎？", a: "Optional add-on NT$150. Airport flow prepares signs from 20:00 the night before.", az: "加購 NT$150。機場舉牌前一晚 20:00 準備。" },
  { q: "Free waiting?", qz: "免費等候？", a: "Airport default 45 minutes after landing, configurable by admin.", az: "接機預設落地後 45 分，後台可調。" },
  { q: "Cancel policy?", qz: "取消規定？", a: ">24h full refund · 6–24h partial (admin %) · <6h none.", az: "＞24h 全退 · 6–24h 部分 · ＜6h 不退。" },
  { q: "Night surcharge?", qz: "夜間加成？", a: "23:00–06:00 +20% on base.", az: "23:00–06:00 基本車資 +20%。" },
  { q: "Can I change driver?", qz: "能換司機嗎？", a: "Only through the company after first assignment. No private contact.", az: "指派後只能透過公司更換，不可私下聯絡。" },
  { q: "Do you sell hotels?", qz: "有賣飯店嗎？", a: "No. This system is cars only: transfer, charter, taxi, rental.", az: "沒有。只做專車：接送、包車、計程車、租車。" },
];
