import type { Booking, BookingStatus } from "../types.ts";
import type { LiveSnapshot, TripPhase } from "../live/types.ts";

export const TAPE_BOOKING_ID = "ZF-82041";

export function phaseToStatus(phase: TripPhase): BookingStatus {
  if (phase === "completed") return "completed";
  if (phase === "trip_started" || phase === "en_route_dest" || phase === "arriving") return "onboard";
  if (phase === "arrived" || phase === "waiting" || phase === "verified") return "arriving";
  if (phase === "driver_assigned" || phase === "driver_preparing" || phase === "en_route_airport" || phase === "near_airport" || phase === "reassigned") {
    return "assigned";
  }
  if (phase === "disrupted" || phase === "reassigning") return "accepted";
  if (phase === "flight_monitoring" || phase === "booked") return "payment_confirmed";
  return "payment_confirmed";
}

export function deriveCounters(live: LiveSnapshot, bookings: Booking[]) {
  const openIncident = live.incident && !live.incident.ack && live.phase !== "reassigned" && live.phase !== "completed";
  const chauffeur = bookings.filter((b) => b.service !== "rental" && b.status !== "cancelled" && b.status !== "completed");
  return {
    active: chauffeur.filter((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status)).length + (live.assignedId && live.phase !== "completed" && live.phase !== "booked" ? 1 : 0),
    unassigned: chauffeur.filter((b) => !b.driverId).length + (!live.assignedId && live.phase !== "completed" ? 1 : 0),
    available: live.drivers.filter((d) => d.state === "available" && d.duty === "online").length,
    busy: live.drivers.filter((d) => d.state === "busy" || d.state === "to_pickup" || d.state === "onboard" || d.duty === "busy").length,
    arrivals: bookings.filter((b) => b.service === "airport_pickup" && !["cancelled", "completed"].includes(b.status)).length + (live.flight ? 1 : 0),
    delayed: (live.delayMin > 0 ? 1 : 0) + bookings.filter((b) => b.flight && live.flight === b.flight && live.delayMin > 0).length,
    incidents: live.events.filter((e) => e.type === "driver.incident.reported").length,
    sos: live.events.filter((e) => e.type === "sos.triggered").length,
    openIncident: openIncident ? 1 : 0,
  };
}

function synthesizeTape(live: LiveSnapshot): Booking {
  return {
    id: TAPE_BOOKING_ID,
    service: "airport_pickup",
    status: phaseToStatus(live.phase),
    pickup: live.pickup,
    pickupZh: live.pickup,
    dropoff: live.dropoff,
    dropoffZh: live.dropoff,
    when: `2026-09-23T${live.clock}`,
    vehicle: "mpv",
    passengers: 5,
    luggage: 4,
    extras: ["meet"],
    flight: live.flight,
    driverId: live.assignedId ?? undefined,
    passengerId: "p-sarah",
    otp: live.otp,
    price: live.fare,
    currency: "TWD",
    breakdown: [{ label: "Quoted fare", labelZh: "報價", amount: live.fare }],
    createdAt: "2026-09-23T12:00:00+08:00",
    passengerName: live.passenger,
    passengerPhone: "",
    commission: Math.round(live.fare * 0.2),
    driverNet: Math.round(live.fare * 0.8),
    channel: "web",
    payment: "card",
  };
}

/** Resolve a booking by exact id. ZF-82041 is only synthesized when it is the live tape booking. */
export function resolveBooking(id: string | undefined, bookings: Booking[], live: LiveSnapshot): Booking | null {
  if (!id) return null;
  const hit = bookings.find((b) => b.id === id);
  if (hit) return hit;
  if (id === TAPE_BOOKING_ID && live.bookingId === TAPE_BOOKING_ID) {
    return synthesizeTape(live);
  }
  return null;
}

export function chauffeurService(service: string) {
  return service !== "rental";
}
