"use client";

import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn } from "@/components/ui";

export default function SafetyPage() {
  const { locale } = useStore();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Safety center", "安全中心")}</h1>
      <ul className="list-disc space-y-2 pl-5">
        <li>{loc(locale, "4-digit boarding OTP", "4 位數上車 OTP")}</li>
        <li>{loc(locale, "Share trip (plate + OTP) with family", "與親友分享行程（車牌＋OTP）")}</li>
        <li>{loc(locale, "Live GPS about every 10 seconds", "GPS 約每 10 秒")}</li>
        <li>{loc(locale, "SOS: crash / breakdown / medical → ops incident. This is not 110/119.", "SOS：事故／拋錨／醫療 → 調度。不能取代 110／119。")}</li>
      </ul>
      <Btn href="/trips">{loc(locale, "Open a live trip", "開啟即時行程")}</Btn>
    </div>
  );
}
