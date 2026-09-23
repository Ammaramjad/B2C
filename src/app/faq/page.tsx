"use client";

import { faqs } from "@/lib/routes";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn } from "@/components/ui";

export default function FaqPage() {
  const { locale } = useStore();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="display text-4xl">FAQ</h1>
      {faqs.map((f) => (
        <details key={f.q} className="border-b border-[var(--border)] py-3">
          <summary className="display text-xl">{locale === "zh" ? f.qz : f.q}</summary>
          <p className="mt-2 text-[var(--muted)]">{locale === "zh" ? f.az : f.a}</p>
        </details>
      ))}
      <Btn href="/help">{loc(locale, "Still need help", "還需要協助")}</Btn>
    </div>
  );
}
