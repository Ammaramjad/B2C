import { NextResponse } from "next/server";
import { rankReplacements } from "@/lib/live/rank";
import { seedDrivers } from "@/lib/live/seed";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { pax?: number; bags?: number; excludeIds?: string[] };
  const ranked = rankReplacements(seedDrivers, {
    pax: body.pax ?? 5,
    bags: body.bags ?? 4,
    excludeIds: body.excludeIds ?? ["D-118"],
  });
  return NextResponse.json({
    sim: true,
    autoAssign: false,
    candidates: ranked.map((c) => ({
      id: c.id,
      name: c.name,
      km: c.km,
      etaMin: c.etaMin,
      klass: c.klass,
      rating: c.rating,
      accept: c.accept,
      why: c.why,
    })),
  });
}
