import { NextResponse } from "next/server";
import { promos } from "@/lib/catalog";

export function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  return ctx.params.then(({ code }) => {
    const p = promos[code.toUpperCase() as keyof typeof promos];
    return NextResponse.json(p ?? { error: "not found" }, { status: p ? 200 : 404 });
  });
}
