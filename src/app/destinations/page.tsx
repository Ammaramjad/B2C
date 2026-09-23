"use client";

import Link from "next/link";
import { cities } from "@/lib/catalog";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="kicker">Corridors</div>
      <h1 className="display mt-2 text-5xl">Cities on the network.</h1>
      <div className="mt-6 grid gap-2">
        {cities.map((c) => (
          <Link key={c.id} href={`/destinations/${c.id}`} className="zf-panel p-4">
            <b>{c.city}</b>
            <div className="text-sm text-[var(--ink-2)]">
              {c.tag} · from NT${c.from}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
