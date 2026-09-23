import { NextResponse } from "next/server";
import { demandSlots, zones } from "@/lib/catalog";
import { drivers, seedBookings } from "@/lib/data";

export function GET() {
  return NextResponse.json({
    bookings: seedBookings.length,
    pending: seedBookings.filter((b) => b.status === "new" || b.status === "payment_confirmed").length,
    active: seedBookings.filter((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status)).length,
    gmv: seedBookings.reduce((s, b) => s + b.price, 0),
    driversOnline: drivers.filter((d) => d.work !== "offline").length,
    vehicles: drivers.length,
    zones,
    demandSlots,
  });
}
