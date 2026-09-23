import { APPROACH_DAVID, ROUTE_TPE_TPE101, TAIPEI_101, TPE_T1, along, haversine, heading } from "./geo.ts";
import { rankReplacements } from "./rank.ts";
import { CUSTOMER_REASSIGN_COPY, PREFERRED_CONFIRMED_COPY } from "./preferred.ts";
import { makeEvent } from "./events.ts";
import type { LiveSnapshot } from "./types";

export function animateTick(s: LiveSnapshot): LiveSnapshot {
  if (s.phase === "en_route_airport" || s.phase === "near_airport") {
    const progress = Math.min(0.98, (s.distanceKm > 0 ? 1 - s.distanceKm / 18 : 0.2) + 0.035);
    const loc = along(APPROACH_DAVID, progress);
    const km = Number(haversine(loc, TPE_T1).toFixed(1));
    const etaMin = Math.max(2, Math.round(km * 1.35));
    return {
      ...s,
      distanceKm: km,
      etaMin,
      route: APPROACH_DAVID,
      drivers: s.drivers.map((d) => (d.id === s.assignedId ? { ...d, loc, km, etaMin, heading: heading(d.loc, loc), state: "to_pickup" } : d)),
    };
  }
  if (s.phase === "en_route_dest" || s.phase === "arriving") {
    const loc = along(ROUTE_TPE_TPE101, Math.min(0.98, 1 - s.distanceKm / 40 + 0.02));
    const km = Number(haversine(loc, TAIPEI_101).toFixed(1));
    const etaMin = Math.max(3, Math.round(km * 1.7));
    return {
      ...s,
      distanceKm: km,
      etaMin,
      route: ROUTE_TPE_TPE101,
      drivers: s.drivers.map((d) => (d.id === s.assignedId ? { ...d, loc, km, etaMin, heading: heading(d.loc, loc), state: "onboard" } : d)),
    };
  }
  if (s.phase === "reassigned" && s.replacementId) {
    const d0 = s.drivers.find((d) => d.id === s.replacementId);
    if (!d0) return s;
    const loc = along([d0.loc, TPE_T1], 0.35);
    const km = Number(haversine(loc, TPE_T1).toFixed(1));
    return {
      ...s,
      distanceKm: km,
      etaMin: Math.max(2, Math.round(km * 2.4)),
      drivers: s.drivers.map((d) => (d.id === s.replacementId ? { ...d, loc, km, etaMin: Math.max(2, Math.round(km * 2.4)), state: "to_pickup" } : d)),
    };
  }
  return s;
}

export function pickupBeat(s: LiveSnapshot, n: number): LiveSnapshot {
  const clock = ["19:28", "19:29", "19:30", "19:31", "19:32", "19:33", "19:34", "19:34", "19:35", "19:35", "19:36", "19:38", "19:41", "19:48"][Math.min(n, 13)];
  if (n === 1) {
    return {
      ...s,
      clock,
      phase: "flight_monitoring",
      events: [makeEvent(clock, "flight.status.changed", "info", ["passenger", "ops"], "Flight monitored", "BR156 NRT → TPE T2 · on time"), ...s.events],
    };
  }
  if (n === 2) {
    return {
      ...s,
      clock,
      phase: "driver_assigned",
      assignedId: "D-118",
      etaMin: 24,
      distanceKm: 18,
      drivers: s.drivers.map((d) => (d.id === "D-118" ? { ...d, state: "to_pickup" } : d)),
      events: [makeEvent(clock, "booking.status.changed", "info", ["passenger", "ops"], "David Chen assigned", "MPV · TPE-4410 · company dispatch"), ...s.events],
    };
  }
  if (n === 3) {
    return {
      ...s,
      clock,
      phase: "driver_preparing",
      events: [makeEvent(clock, "driver.status.changed", "info", ["ops", "passenger"], "Driver preparing", "David Chen · departing depot"), ...s.events],
    };
  }
  if (n === 4) {
    return {
      ...s,
      clock,
      phase: "en_route_airport",
      distanceKm: 17.4,
      etaMin: 22,
      events: [makeEvent(clock, "driver.location.updated", "info", ["passenger", "ops"], "En route to airport", "17.4 km · 22 min"), ...s.events],
    };
  }
  if (n === 5) {
    return {
      ...s,
      clock,
      phase: "en_route_airport",
      delayMin: 18,
      flightStatus: "Delayed +18m · ETD 19:50",
      events: [
        makeEvent(clock, "flight.status.changed", "warning", ["ops", "passenger"], "BR156 delayed +18m", "Pickup window held · 45 min free wait"),
        makeEvent(clock, "eta.updated", "info", ["ops"], "Pickup recalculated", "Wait clock starts at actual arrival"),
        ...s.events,
      ],
    };
  }
  if (n === 6) {
    return {
      ...s,
      clock,
      phase: "en_route_airport",
      traffic: "heavy",
      trafficNote: "Congestion on Freeway 1 north. Provider-reported delay +6 min.",
      etaMin: s.etaMin + 2,
      events: [makeEvent(clock, "traffic.incident.detected", "warning", ["ops", "driver"], "Route congestion", "Estimated delay +6 min · original 18:42 → 18:48"), ...s.events],
    };
  }
  if (n === 7) {
    const d = s.drivers.find((x) => x.id === "D-118") ?? s.drivers[0];
    const candidates = rankReplacements(s.drivers, { pax: 5, bags: 4, excludeIds: ["D-118"] });
    return {
      ...s,
      clock,
      phase: "disrupted",
      incident: {
        id: "INC-441",
        category: "Vehicle problem / Unable to continue",
        note: "Warning light · not safe to continue assignment",
        severity: "critical",
        bookingId: s.bookingId,
        driverId: "D-118",
        loc: d.loc,
        at: Date.now(),
        clock,
        tripPhase: s.phase,
        ack: false,
      },
      candidates,
      traffic: "incident",
      counters: { ...s.counters, incidents: 1 },
      drivers: s.drivers.map((x) => (x.id === "D-118" ? { ...x, state: "incident" } : x)),
      events: [
        makeEvent(clock, "driver.incident.reported", "critical", ["ops"], "CRITICAL · Unable to continue", "D-118 vehicle problem · ZF-82041", { driverId: "D-118" }),
        makeEvent(clock, "dispatch.search.started", "action", ["ops"], `${candidates.length} replacement drivers identified`, "MPV/Van · T2 radius"),
        ...s.events,
      ],
    };
  }
  if (n === 8) {
    return {
      ...s,
      clock,
      phase: "reassigning",
      offerTo: "D-221",
      events: [makeEvent(clock, "dispatch.offer.sent", "action", ["driver", "ops"], "Replacement offer → D-221", "Jason Wu · company-issued"), ...s.events],
    };
  }
  if (n === 9) {
    return {
      ...s,
      clock,
      phase: "reassigned",
      assignedId: "D-221",
      replacementId: "D-221",
      offerTo: null,
      customerNotice: CUSTOMER_REASSIGN_COPY,
      etaMin: 4,
      distanceKm: 1.2,
      drivers: s.drivers.map((x) => (x.id === "D-221" ? { ...x, state: "to_pickup" } : x.id === "D-118" ? { ...x, state: "incident" } : x)),
      events: [
        makeEvent(clock, "dispatch.offer.accepted", "info", ["ops"], "D-221 accepted", "Jason Wu"),
        makeEvent(clock, "dispatch.reassigned", "action", ["ops", "passenger"], "Booking reassigned", "ZF-82041 → D-221"),
        makeEvent(clock, "notify.customer", "info", ["passenger"], "Passenger notified", CUSTOMER_REASSIGN_COPY),
        makeEvent(clock, "eta.updated", "info", ["passenger", "ops"], "ETA recalculated", "4 min"),
        ...s.events,
      ],
    };
  }
  if (n === 10) {
    return { ...s, clock, phase: "near_airport", events: [makeEvent(clock, "driver.location.updated", "info", ["passenger", "ops"], "Replacement near airport", "Jason Wu · 0.8 km"), ...s.events] };
  }
  if (n === 11) {
    return { ...s, clock, phase: "arrived", events: [makeEvent(clock, "booking.status.changed", "info", ["passenger", "ops"], "Driver arrived T2 Door 8", "Waiting policy 45 min"), ...s.events] };
  }
  if (n === 12) {
    return { ...s, clock, phase: "waiting", drivers: s.drivers.map((d) => (d.id === s.assignedId ? { ...d, state: "waiting" } : d)) };
  }
  if (n === 13) {
    return {
      ...s,
      clock,
      phase: "trip_started",
      events: [makeEvent(clock, "trip.started", "info", ["ops", "passenger"], "Passenger verified · trip started", `OTP ${s.otp}`), ...s.events],
      drivers: s.drivers.map((d) => (d.id === s.assignedId ? { ...d, state: "onboard" } : d)),
    };
  }
  return { ...s, clock, phase: n > 13 ? "en_route_dest" : s.phase };
}

export function preferredBeat(s: LiveSnapshot, n: number): LiveSnapshot {
  const clock = ["10:12", "10:12", "10:13", "10:14", "10:15", "10:16"][Math.min(n, 5)];
  if (n === 1) {
    return {
      ...s,
      clock,
      preferred: { id: "PR-88", driverId: "D-118", customer: s.passenger, status: "requested", premiumPct: 18 },
      events: [makeEvent(clock, "preferred.request.created", "action", ["ops", "passenger"], "Sarah requested David Chen", "Company intermediary — no private contact"), ...s.events],
    };
  }
  if (n === 2) {
    return {
      ...s,
      clock,
      preferred: s.preferred ? { ...s.preferred, status: "validating" } : s.preferred,
      events: [makeEvent(clock, "preferred.request.validated", "info", ["ops"], "Rules check passed", "Area · MPV · schedule · +18% premium · no conflict"), ...s.events],
    };
  }
  if (n === 3) {
    return {
      ...s,
      clock,
      preferred: s.preferred ? { ...s.preferred, status: "offered" } : s.preferred,
      events: [makeEvent(clock, "preferred.offer.sent", "action", ["driver"], "Official company offer", "D-118 David Chen"), ...s.events],
    };
  }
  if (n === 4) {
    return {
      ...s,
      clock,
      assignedId: "D-118",
      phase: "driver_assigned",
      preferred: s.preferred ? { ...s.preferred, status: "confirmed" } : s.preferred,
      customerNotice: PREFERRED_CONFIRMED_COPY,
      events: [
        makeEvent(clock, "preferred.offer.accepted", "info", ["ops"], "David accepted", "Company-issued offer"),
        makeEvent(clock, "preferred.confirmed", "info", ["passenger"], PREFERRED_CONFIRMED_COPY, "David Chen · +18%"),
        ...s.events,
      ],
    };
  }
  return s;
}
