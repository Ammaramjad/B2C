"use client";

import { useState } from "react";
import { money, quote } from "@/lib/pricing";
import type { Currency } from "@/lib/types";

type Quote = ReturnType<typeof quote>;

export function FareSheet({
  quote,
  currency,
  compact,
}: {
  quote: Quote;
  currency: Currency;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(!compact);
  const rows = quote.items.filter((i) => i.amount !== 0 || i.label.startsWith("Base"));

  return (
    <div className="ticket">
      <button type="button" className="flex w-full items-end justify-between gap-4 text-left" onClick={() => setOpen((v) => !v)}>
        <div>
          <div className="kicker">Fare</div>
          <div className="mt-1 text-sm text-[var(--ink-soft)]">{open ? "Hide breakdown" : "Show breakdown"}</div>
        </div>
        <div className="metric text-3xl">{money(quote.total, currency)}</div>
      </button>
      {open ? (
        <dl className="mt-4 space-y-2 border-t border-[var(--rule)] pt-4 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-4">
              <dt className="text-[var(--ink-soft)]">{r.label}</dt>
              <dd className="metric">{money(r.amount, currency)}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-[var(--rule)] pt-2 font-semibold">
            <dt>Total</dt>
            <dd className="metric">{money(quote.total, currency)}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
