import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    product: "ZOUFENG SIGNAL OS",
    version: "phase1-demo",
    modules: 26,
    persist: "demo",
  });
}
