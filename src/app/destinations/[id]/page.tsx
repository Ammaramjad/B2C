"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { cities } from "@/lib/catalog";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const c = cities.find((x) => x.id === id) ?? cities[0];
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="kicker">{c.tag}</div>
      <h1 className="display mt-2 text-5xl">{c.city}</h1>
      <Link href="/book?service=p2p" className="zf-btn mt-6">
        Book a transfer
      </Link>
    </div>
  );
}
