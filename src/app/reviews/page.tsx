"use client";

import { reviews } from "@/lib/transfers";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function ReviewsPage() {
  const { locale } = useStore();
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{loc(locale, "Reviews · 6 dimensions", "評價 · 六維")}</h1>
      <p className="text-[var(--muted)]">{loc(locale, "Clean · on-time · comfort · safety · value · recommend. 1-star opens CS.", "潔／準／舒／安／值／推。1 星開客服。")}</p>
      {reviews.map((r) => (
        <article key={r.id} className="border-b border-[var(--border)] py-4">
          <div className="display text-2xl">{r.name}</div>
          <p className="text-sm text-[var(--muted)]">{r.route} · {"★".repeat(r.stars)}</p>
          <p>{locale === "zh" ? r.textZh : r.text}</p>
        </article>
      ))}
    </div>
  );
}
