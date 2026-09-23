import { NextResponse } from "next/server";
import { cities, extras, rentals, services, taxis, vehicles } from "@/lib/catalog";

export function GET() {
  return NextResponse.json({ services, vehicles, taxis, rentals, extras, cities });
}
