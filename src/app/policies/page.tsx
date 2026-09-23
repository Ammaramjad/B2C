"use client";

import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function PoliciesPage() {
  const { locale, rules } = useStore();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Cancel, pay, invoice", "取消、付款、發票")}</h1>
      <p>{loc(locale, `Free cancel >${rules.cancelFreeHours}h. Mid ${rules.cancelMidHours}–${rules.cancelFreeHours}h = ${rules.cancelMidPct}%. Under ${rules.cancelMidHours}h = 0%.`, `＞${rules.cancelFreeHours}h 免費。${rules.cancelMidHours}–${rules.cancelFreeHours}h ${rules.cancelMidPct}%。＜${rules.cancelMidHours}h 不退。`)}</p>
      <p>{loc(locale, "Night 23:00–06:00", "夜間 23:00–06:00")} +{rules.nightPct}% · surge +{rules.surgePct}%</p>
      <p>{loc(locale, "Pay: Visa/Master, LINE Pay, Apple Pay, cash. Invoice: tax ID + carrier after complete.", "付款：信用卡、LINE Pay、Apple Pay、現金。完成後電子發票（統編／載具）。")}</p>
      <p className="text-[var(--muted)]">{loc(locale, "Admin can change these rules. Not frozen commercial law.", "後台可改規則，非永久商法。")}</p>
    </div>
  );
}
