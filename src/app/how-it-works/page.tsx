"use client";

import Link from "next/link";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function HowPage() {
  const { locale } = useStore();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="display text-4xl">{loc(locale, "How it works", "如何使用")}</h1>
      <ol className="list-decimal space-y-3 pl-5">
        <li>{loc(locale, "Search pickup / drop / time / people.", "搜尋上車、下車、時間、人數。")}</li>
        <li>{loc(locale, "Compare sedan / premium / SUV / MPV / van / taxi / rental.", "比較轎車／豪華／SUV／MPV／廂型／計程車／租車。")}</li>
        <li>{loc(locale, "Add meet, child seat, English driver, pet.", "加購舉牌、兒童座椅、英語司機、寵物。")}</li>
        <li>{loc(locale, "Pay card / LINE / Apple / cash (simulated).", "付款（模擬）。")}</li>
        <li>{loc(locale, "Track on live OSM map. Show OTP to driver.", "OSM 即時地圖。向司機出示 OTP。")}</li>
        <li>{loc(locale, "Switch driver only via company.", "換司機只能透過公司。")}</li>
      </ol>
      <Link href="/book" className="underline">{loc(locale, "Start booking", "開始預訂")}</Link>
    </div>
  );
}
