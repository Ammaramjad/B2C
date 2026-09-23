import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    product: "ZOUFENG AETHER",
    version: "12.1-demo",
    modules: 26,
  });
}
