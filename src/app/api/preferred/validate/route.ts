import { NextResponse } from "next/server";
import { validatePreferred } from "@/lib/live/preferred";

export async function POST(req: Request) {
  const body = await req.json();
  const result = validatePreferred({
    available: body.available !== false,
    inServiceArea: body.inServiceArea !== false,
    klass: body.klass ?? "MPV",
    pax: body.pax ?? 5,
    bags: body.bags ?? 4,
    scheduleConflict: Boolean(body.scheduleConflict),
    companyRuleOk: body.companyRuleOk !== false,
    premiumPct: body.premiumPct ?? 18,
  });
  return NextResponse.json({ ...result, companyMediated: true, autoBook: false });
}
