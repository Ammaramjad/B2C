import { rankReplacements } from "./rank.ts";
import { CUSTOMER_REASSIGN_COPY, PREFERRED_CONFIRMED_COPY } from "./preferred.ts";
import { makeEvent } from "./events.ts";
import type { LiveSnapshot } from "./types";

export function applyIncident(s: LiveSnapshot, category: string, note: string): LiveSnapshot {
  const d = s.drivers.find((x) => x.id === s.assignedId) ?? s.drivers[0];
  const candidates = rankReplacements(s.drivers, {
    pax: 5,
    bags: 4,
    excludeIds: [d.id],
  });
  return {
    ...s,
    phase: "disrupted",
    incident: {
      id: `INC-${String(s.events.length + 441)}`,
      category,
      note,
      severity: "critical",
      bookingId: s.bookingId,
      driverId: d.id,
      loc: d.loc,
      at: Date.now(),
      clock: s.clock,
      tripPhase: s.phase,
      ack: false,
    },
    candidates,
    traffic: "incident",
    trafficNote: "Driver reported a problem. Assignment paused pending company action.",
    counters: { ...s.counters, incidents: s.counters.incidents + 1 },
    drivers: s.drivers.map((x) => (x.id === d.id ? { ...x, state: "incident" as const } : x)),
    events: [
      makeEvent(s.clock, "driver.incident.reported", "critical", ["ops", "system"], "CRITICAL · Unable to continue", `${d.name} · ${category} · ${s.bookingId}`, {
        bookingId: s.bookingId,
        driverId: d.id,
        lat: d.loc.lat,
        lng: d.loc.lng,
      }),
      makeEvent(s.clock, "dispatch.search.started", "action", ["ops"], "Replacement search", `${candidates.length} eligible nearby`),
      makeEvent(s.clock, "dispatch.candidates.updated", "info", ["ops"], "Candidates ranked", candidates.map((c) => c.id).join(" · ")),
      ...s.events,
    ],
  };
}

export const OFFER_TTL_MS = 45_000;

export function applySendOffer(s: LiveSnapshot, driverId: string, kind: NonNullable<LiveSnapshot["offerKind"]> = "replacement"): LiveSnapshot {
  const d = s.drivers.find((x) => x.id === driverId);
  return {
    ...s,
    phase: kind === "replacement" ? "reassigning" : s.phase,
    offerTo: driverId,
    offerKind: kind,
    offerExpiresAt: Date.now() + OFFER_TTL_MS,
    offerRemainSec: OFFER_TTL_MS / 1000,
    events: [
      makeEvent(s.clock, "dispatch.offer.sent", "action", ["driver", "ops"], kind === "replacement" ? "Replacement offer sent" : "Company offer sent", `${d?.name ?? driverId} · ${kind} · ${OFFER_TTL_MS / 1000}s`),
      ...s.events,
    ],
  };
}

export function applyRejectOffer(s: LiveSnapshot, driverId?: string): LiveSnapshot {
  const id = driverId ?? s.offerTo ?? s.assignedId ?? s.drivers[0]?.id;
  if (!id) return s;
  const rejects = { ...s.rejects, [id]: (s.rejects[id] ?? 0) + 1 };
  return {
    ...s,
    offerTo: s.offerTo === id ? null : s.offerTo,
    offerKind: s.offerTo === id ? null : s.offerKind,
    offerExpiresAt: s.offerTo === id ? null : s.offerExpiresAt,
    offerRemainSec: s.offerTo === id ? null : s.offerRemainSec,
    rejects,
    events: [
      makeEvent(s.clock, "dispatch.offer.rejected", "warning", ["ops", "driver"], "Offer rejected", `${id} · ${s.bookingId} · rejects ${rejects[id]}`),
      ...s.events,
    ],
  };
}

export function applyExpireOffer(s: LiveSnapshot): LiveSnapshot {
  if (!s.offerTo || !s.offerExpiresAt || s.offerExpiresAt > Date.now()) return s;
  return {
    ...s,
    offerTo: null,
    offerKind: null,
    offerExpiresAt: null,
    offerRemainSec: 0,
    events: [makeEvent(s.clock, "dispatch.offer.expired", "warning", ["ops", "driver"], "Offer expired", s.bookingId), ...s.events],
  };
}

export function applyShareTrip(s: LiveSnapshot, token: string): LiveSnapshot {
  return {
    ...s,
    shareToken: token,
    events: [makeEvent(s.clock, "trip.shared", "info", ["passenger", "ops"], "Trip share link created", token), ...s.events],
  };
}

export function applyAcceptOffer(s: LiveSnapshot): LiveSnapshot {
  const next = s.offerTo ?? s.candidates[0]?.id;
  if (!next) return s;
  const d = s.drivers.find((x) => x.id === next);
  const from = s.assignedId;
  return {
    ...s,
    phase: "reassigned",
    assignedId: next,
    replacementId: next,
    offerTo: null,
    offerKind: null,
    offerExpiresAt: null,
    offerRemainSec: null,
    customerNotice: CUSTOMER_REASSIGN_COPY,
    traffic: "clear",
    trafficNote: "Replacement driver en route. Assignment is company-owned.",
    etaMin: d?.etaMin ?? 7,
    distanceKm: d?.km ?? 2.8,
    incident: s.incident ? { ...s.incident, ack: true } : s.incident,
    drivers: s.drivers.map((x) =>
      x.id === next ? { ...x, state: "to_pickup" as const } : x.id === from ? { ...x, state: "incident" as const } : x,
    ),
    events: [
      makeEvent(s.clock, "dispatch.offer.accepted", "info", ["ops", "driver"], "Replacement accepted", d?.name ?? next),
      makeEvent(s.clock, "dispatch.reassigned", "action", ["ops", "passenger"], "Booking reassigned", `${s.bookingId} → ${next}`),
      makeEvent(s.clock, "notify.customer", "info", ["passenger"], "Passenger notified", CUSTOMER_REASSIGN_COPY),
      makeEvent(s.clock, "eta.updated", "info", ["passenger", "ops"], "ETA recalculated", `${d?.etaMin ?? 7} min`),
      ...s.events,
    ],
  };
}

export function applyAck(s: LiveSnapshot): LiveSnapshot {
  if (!s.incident) return s;
  return { ...s, incident: { ...s.incident, ack: true } };
}

export function applySos(s: LiveSnapshot): LiveSnapshot {
  return {
    ...s,
    counters: { ...s.counters, sos: s.counters.sos + 1 },
    events: [makeEvent(s.clock, "sos.triggered", "critical", ["ops", "passenger"], "SOS opened", `${s.bookingId} · ${s.passenger}`), ...s.events],
  };
}

export function applyConfirmAirport(
  s: LiveSnapshot,
  input: { flight: string; pax: number; bags: number; vehicle: string; fare: number; bookingId?: string; name?: string },
): LiveSnapshot {
  const bookingId = input.bookingId ?? s.bookingId;
  return {
    ...s,
    flight: input.flight,
    fare: input.fare,
    bookingId,
    passenger: input.name ?? s.passenger,
    phase: "booked",
    events: [
      makeEvent(s.clock, "booking.created", "action", ["ops", "passenger"], "Airport pickup confirmed", `${bookingId} · ${input.flight} · ${input.pax} pax / ${input.bags} bags · ${input.vehicle}`),
      makeEvent(s.clock, "payment.updated", "info", ["passenger"], "Payment confirmed", `NT$${input.fare.toLocaleString()}`),
      ...s.events,
    ],
  };
}

export function applyPreferredRequest(s: LiveSnapshot, driverId: string): LiveSnapshot {
  return {
    ...s,
    scenario: "preferred",
    preferred: {
      id: `PR-${String(s.events.length + 88)}`,
      driverId,
      customer: s.passenger,
      status: "requested",
      premiumPct: 18,
      service: "airport_pickup",
      schedule: `${s.flight} · ${s.clock}`,
    },
    events: [
      makeEvent(s.clock, "preferred.request.created", "action", ["ops", "passenger"], "Preferred driver requested", "Request routed to Zoufeng — not a private booking"),
      makeEvent(s.clock, "preferred.requested", "action", ["ops", "passenger"], "Preferred request received", "Company intermediary only"),
      ...s.events,
    ],
  };
}

export function applyPreferredStatus(
  s: LiveSnapshot,
  status: NonNullable<LiveSnapshot["preferred"]>["status"],
): LiveSnapshot {
  if (!s.preferred) return s;
  const next = { ...s.preferred, status };
  if (status === "validating") {
    return {
      ...s,
      preferred: next,
      events: [
        makeEvent(s.clock, "preferred.request.validated", "info", ["ops"], "Company validation", "Availability, area, vehicle, schedule, premium, conflicts"),
        makeEvent(s.clock, "preferred.validated", "info", ["ops"], "Preferred validated", "Company gate passed"),
        ...s.events,
      ],
    };
  }
  if (status === "offered") {
    return {
      ...s,
      preferred: next,
      events: [makeEvent(s.clock, "preferred.offer.sent", "action", ["driver", "ops"], "Company offer issued", "Official Zoufeng offer — not a private handshake"), ...s.events],
    };
  }
  if (status === "confirmed") {
    return {
      ...s,
      assignedId: s.preferred.driverId,
      preferred: next,
      phase: "driver_assigned",
      customerNotice: PREFERRED_CONFIRMED_COPY,
      events: [
        makeEvent(s.clock, "preferred.offer.accepted", "info", ["ops", "driver"], "Driver accepted company offer", s.preferred.driverId),
        makeEvent(s.clock, "preferred.confirmed", "info", ["passenger"], PREFERRED_CONFIRMED_COPY, "Company-mediated assignment"),
        ...s.events,
      ],
    };
  }
  if (status === "unavailable") {
    return {
      ...s,
      preferred: next,
      events: [
        makeEvent(s.clock, "preferred.unavailable", "warning", ["ops", "passenger"], "Preferred driver unavailable", "Fallback: nearest similar class via company dispatch"),
        ...s.events,
      ],
    };
  }
  if (status === "declined") {
    return {
      ...s,
      preferred: next,
      customerNotice: "Preferred request declined. Company will assign the next eligible vehicle.",
      events: [makeEvent(s.clock, "preferred.declined", "warning", ["ops", "passenger"], "Preferred declined", "Company decision — no private booking"), ...s.events],
    };
  }
  return { ...s, preferred: next };
}

export function applyDuty(s: LiveSnapshot, driverId: string, duty: LiveSnapshot["drivers"][number]["duty"]): LiveSnapshot {
  return {
    ...s,
    drivers: s.drivers.map((d) =>
      d.id === driverId
        ? { ...d, duty, state: duty === "offline" ? "offline" : duty === "busy" ? "busy" : duty === "break" ? "offline" : "available" }
        : d,
    ),
    events: [makeEvent(s.clock, "driver.duty.changed", "info", ["ops", "driver"], "Duty changed", `${driverId} · ${duty}`), ...s.events],
  };
}

export function applyArrive(s: LiveSnapshot): LiveSnapshot {
  return {
    ...s,
    phase: "arrived",
    events: [makeEvent(s.clock, "booking.status.changed", "info", ["ops", "passenger"], "Driver arrived", s.pickup), ...s.events],
  };
}

export function applyVerifyOtp(s: LiveSnapshot, code: string): LiveSnapshot {
  if (code !== s.otp) return s;
  return {
    ...s,
    phase: "trip_started",
    events: [makeEvent(s.clock, "trip.started", "info", ["ops", "passenger", "driver"], "Passenger verified · trip started", `OTP ${code}`), ...s.events],
    drivers: s.drivers.map((d) => (d.id === s.assignedId ? { ...d, state: "onboard" as const } : d)),
  };
}

export function applyCompleteTrip(s: LiveSnapshot): LiveSnapshot {
  return {
    ...s,
    phase: "completed",
    events: [makeEvent(s.clock, "trip.completed", "info", ["ops", "passenger", "driver"], "Trip completed", s.bookingId), ...s.events],
  };
}

export function applyBindBooking(
  s: LiveSnapshot,
  input: { bookingId: string; service: string; pickup: string; dropoff: string; fare: number; flight?: string; name?: string; chauffeur: boolean },
): LiveSnapshot {
  if (!input.chauffeur) {
    return {
      ...s,
      events: [makeEvent(s.clock, "booking.created", "action", ["ops", "passenger"], `${input.service} reserved`, `${input.bookingId} · depot / no live chauffeur`), ...s.events],
    };
  }
  return {
    ...s,
    bookingId: input.bookingId,
    pickup: input.pickup,
    dropoff: input.dropoff,
    fare: input.fare,
    flight: input.flight ?? s.flight,
    passenger: input.name ?? s.passenger,
    phase: "booked",
    events: [
      makeEvent(s.clock, "booking.created", "action", ["ops", "passenger"], `${input.service} confirmed`, input.bookingId),
      makeEvent(s.clock, "payment.updated", "info", ["passenger"], "Payment confirmed", `NT$${input.fare.toLocaleString()}`),
      ...s.events,
    ],
  };
}

export function applyNotify(s: LiveSnapshot, title: string, body: string): LiveSnapshot {
  return {
    ...s,
    events: [makeEvent(s.clock, "notification.created", "info", ["passenger", "ops"], title, body), ...s.events],
  };
}
