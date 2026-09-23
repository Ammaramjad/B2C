"use client";

import { use } from "react";
import Link from "next/link";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Status } from "@/components/ui";

export default function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bookings, locale, currency } = useStore();
  const b = bookings.find((x) => x.id === id);
  if (!b) {
    return (
      <p>
        <Link href="/trips">{loc(locale, "Back to trips", "回到行程")}</Link>
      </p>
    );
  }
  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <Status kind="assigned">{loc(locale, "Booking confirmed", "預訂已確認")}</Status>
      <h1 className="display text-5xl">{b.id}</h1>
      <p className="text-lg">
        {b.pickup} → {b.dropoff}
      </p>
      <p className="text-[var(--muted)]">
        {b.when} · {b.vehicle} · {b.payment} · {money(convert(b.price, currency), currency)}
      </p>
      <div className="flex flex-wrap gap-2">
        <Btn href={`/trips/${b.id}`}>{loc(locale, "Open live trip", "開啟即時行程")}</Btn>
        <Btn kind="ghost" href="/trips">
          {loc(locale, "All trips", "全部行程")}
        </Btn>
      </div>
    </div>
  );
}
