import type { Locale } from "./types";

const dict = {
  en: {
    brand: "ZOUFENG",
    product: "AETHER",
    tag: "International mobility OS",
    hero: "Move like the city already knows you.",
    heroSub:
      "Airport transfers, point-to-point, charter, taxi, self-drive and AI itineraries — one booking object, sixteen-factor pricing, live safety. Settled in New Taiwan Dollar, shown also in US Dollar.",
    ctaBook: "Open booking",
    ctaPlan: "Design an itinerary",
    services: "Service constellation",
    destinations: "Cities in the mesh",
    experiences: "Signature routes",
    live: "Live network",
    book: "Book",
    trips: "Trips",
    planner: "Planner",
    wallet: "Wallet",
    driver: "Driver",
    ops: "Admin",
    support: "Halo",
    login: "Enter",
    step1: "Route",
    step2: "Vehicle",
    step3: "Pay",
    pickup: "Pickup",
    drop: "Drop-off",
    when: "Time",
    pay: "Authorize & launch",
    admin: "Admin dashboard",
    driverDash: "Driver dashboard",
    lastCaptain: "Last captain (company record)",
    switchPolicy:
      "After you have been assigned a driver, you cannot privately contact another driver. Request a change only through ZOUFENG. We reassign, notify both sides, and keep a full audit.",
    requestSwitch: "Request different driver via company",
    sameDriver: "Book the same designated driver (+18%)",
    anyDriver: "Company dispatch (no private selection)",
    switchOpen: "Company switch request sent",
    maskedPhone: "Relay via ZOUFENG — driver number is not shared",
  },
  zh: {
    brand: "ZOUFENG",
    product: "AETHER",
    tag: "國際移動作業系統",
    hero: "讓城市先認識你，再為你移動。",
    heroSub:
      "接機、點對點、包車、計程車、自駕與 AI 行程——單一訂單模型、十六因子定價、即時安全。以新臺幣結算，並同步顯示美元。",
    ctaBook: "開始預訂",
    ctaPlan: "生成行程",
    services: "服務星群",
    destinations: "網格城市",
    experiences: "招牌路線",
    live: "即時網絡",
    book: "預訂",
    trips: "行程",
    planner: "規劃",
    wallet: "錢包",
    driver: "司機",
    ops: "後台",
    support: "光環",
    login: "進入",
    step1: "路線",
    step2: "車型",
    step3: "付款",
    pickup: "上車點",
    drop: "下車點",
    when: "時間",
    pay: "授權並出發",
    admin: "管理儀表板",
    driverDash: "司機儀表板",
    lastCaptain: "上次司機（公司紀錄）",
    switchPolicy:
      "一旦已指派司機，乘客不得私下聯絡其他司機。更換司機必須透過 ZOUFENG 公司提出。由公司改派、雙向通知，並完整留存稽核紀錄。",
    requestSwitch: "透過公司申請更換司機",
    sameDriver: "指定同一位司機（+18%）",
    anyDriver: "公司派遣（不可私下點選）",
    switchOpen: "公司代換申請已送出",
    maskedPhone: "由 ZOUFENG 代轉 — 不提供司機私人號碼",
  },
};

export type Dict = typeof dict.en;

export function t(locale: Locale): Dict {
  return locale === "zh" ? dict.zh : dict.en;
}

export function loc(locale: Locale, en: string, zh: string) {
  return locale === "zh" ? zh : en;
}
