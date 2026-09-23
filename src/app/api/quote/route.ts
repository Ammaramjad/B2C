import { NextResponse } from "next/server";
import { quote } from "@/lib/pricing";
import type { ExtraId, ServiceType } from "@/lib/types";

export async function POST(req: Request) {
  const body = await req.json();
  const q = quote({
    service: body.service as ServiceType,
    vehicle: body.vehicle,
    extras: body.extras as ExtraId[],
    promo: body.promo,
    when: body.when,
    hours: body.hours,
    days: body.days,
    surge: body.surge,
  });
  return NextResponse.json(q);
}
