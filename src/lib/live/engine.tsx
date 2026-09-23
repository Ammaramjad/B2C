"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { APPROACH_DAVID, ROUTE_TPE_TPE101, TAIPEI_101, TPE_T1, along, haversine, heading } from "./geo";
import { initialSnapshot, seedDrivers } from "./seed";
import type { Candidate, EventType, LiveEvent, LiveSnapshot, Severity } from "./types";

type LiveApi = {
  live: LiveSnapshot;
  play: () => void;
  pause: () => void;
  reset: (scenario?: LiveSnapshot["scenario"]) => void;
  step: () => void;
  setScenario: (s: LiveSnapshot["scenario"]) => void;
  reportIncident: (category: string, note: string) => void;
  sendReplacement: (driverId: string) => void;
  acceptReplacement: () => void;
  requestPreferred: (driverId: string) => void;
  validatePreferred: () => void;
  offerPreferred: () => void;
  acceptPreferred: () => void;
};

const Ctx = createContext<LiveApi | null>(null);

let seq = 1;
function ev(
  clock: string,
  type: EventType,
  severity: Severity,
  audience: LiveEvent["audience"],
  title: string,
  body: string,
  extra: Partial<LiveEvent> = {},
): LiveEvent {
  return { id: `E-${seq++}`, at: Date.now(), clock, type, severity, audience, title, body, ...extra };
}

function rank(drivers: LiveSnapshot["drivers"]): Candidate[] {
  return drivers
    .filter((d) => d.state === "available" && (d.klass === "MPV" || d.klass === "Van") && d.id !== "D-118")
    .map((d) => ({
      ...d,
      km: Number(haversine(d.loc, TPE_T1).toFixed(1)),
      etaMin: Math.max(3, Math.round(haversine(d.loc, TPE_T1) * 2.6)),
      why: [
        `${haversine(d.loc, TPE_T1).toFixed(1)} km to T2`,
        `${d.klass} fits 5 pax / 4 bags`,
        `Fleet ${d.fleet} priority`,
        `${Math.round(d.accept * 100)}% accept`,
      ],
    }))
    .sort((a, b) => a.km - b.km || b.rating - a.rating)
    .slice(0, 3);
}

export function LiveProvider({ children }: { children: ReactNode }) {
  const [live, setLive] = useState<LiveSnapshot>(initialSnapshot);
  const tRef = useRef(0);
  const beat = useRef(0);

  const step = useCallback(() => {
    setLive((s) => {
      const n = beat.current + 1;
      beat.current = n;
      if (s.scenario === "preferred") return preferredBeat(s, n);
      return pickupBeat(s, n);
    });
  }, []);

  const reportIncident = useCallback(
    (category: string, note: string) => {
      setLive((s) => {
        const d = s.drivers.find((x) => x.id === s.assignedId) ?? s.drivers[0];
        const incident = {
          id: "INC-441",
          category,
          note,
          severity: "critical" as const,
          bookingId: s.bookingId,
          driverId: d.id,
          loc: d.loc,
          at: Date.now(),
          clock: s.clock,
          tripPhase: s.phase,
          ack: false,
        };
        const candidates = rank(s.drivers);
        const events = [
          ev(s.clock, "driver.incident.reported", "critical", ["ops", "system"], "CRITICAL · Unable to continue", `${d.name} · ${category} · ${s.bookingId}`, {
            bookingId: s.bookingId,
            driverId: d.id,
            lat: d.loc.lat,
            lng: d.loc.lng,
          }),
          ev(s.clock, "dispatch.search.started", "action", ["ops"], "Replacement search", `${candidates.length} eligible nearby`),
          ...s.events,
        ];
        return {
          ...s,
          phase: "disrupted",
          incident,
          candidates,
          traffic: "incident",
          trafficNote: "Driver reported vehicle problem. Assignment paused.",
          counters: { ...s.counters, incidents: s.counters.incidents + 1 },
          drivers: s.drivers.map((x) => (x.id === d.id ? { ...x, state: "incident" as const } : x)),
          events,
        };
      });
    },
    [],
  );

  const sendReplacement = useCallback((driverId: string) => {
    setLive((s) => {
      const d = s.drivers.find((x) => x.id === driverId);
      return {
        ...s,
        phase: "reassigning",
        offerTo: driverId,
        events: [
          ev(s.clock, "dispatch.offer.sent", "action", ["driver", "ops"], "Replacement offer sent", `${d?.name ?? driverId} · urgent`),
          ...s.events,
        ],
      };
    });
  }, []);

  const acceptReplacement = useCallback(() => {
    setLive((s) => {
      const next = s.offerTo ?? s.candidates[0]?.id;
      if (!next) return s;
      const d = s.drivers.find((x) => x.id === next);
      const notice = "Your assigned vehicle has changed due to an operational issue. Your new driver is on the way.";
      return {
        ...s,
        phase: "reassigned",
        assignedId: next,
        replacementId: next,
        offerTo: null,
        customerNotice: notice,
        etaMin: d?.etaMin ?? 7,
        distanceKm: d?.km ?? 2.8,
        drivers: s.drivers.map((x) =>
          x.id === next
            ? { ...x, state: "to_pickup" as const }
            : x.id === "D-118"
              ? { ...x, state: "incident" as const }
              : x,
        ),
        events: [
          ev(s.clock, "dispatch.offer.accepted", "info", ["ops", "driver"], "Replacement accepted", d?.name ?? next),
          ev(s.clock, "dispatch.reassigned", "action", ["ops", "passenger"], "Booking reassigned", `${s.bookingId} → ${next}`),
          ev(s.clock, "notify.customer", "info", ["passenger"], "Passenger notified", notice),
          ev(s.clock, "eta.updated", "info", ["passenger", "ops"], "ETA recalculated", `${d?.etaMin ?? 7} min`),
          ...s.events,
        ],
      };
    });
  }, []);

  const requestPreferred = useCallback((driverId: string) => {
    setLive((s) => ({
      ...s,
      scenario: "preferred",
      preferred: { id: "PR-88", driverId, status: "requested", premiumPct: 18 },
      events: [
        ev(s.clock, "preferred.request.created", "action", ["ops", "passenger"], "Preferred driver requested", "Request routed to Zoufeng — not a private booking"),
        ...s.events,
      ],
    }));
  }, []);

  const validatePreferred = useCallback(() => {
    setLive((s) => ({
      ...s,
      preferred: s.preferred ? { ...s.preferred, status: "validating" } : s.preferred,
      events: [
        ev(s.clock, "preferred.request.validated", "info", ["ops"], "Company validation", "Availability, area, vehicle, schedule, premium, conflicts"),
        ...s.events,
      ],
    }));
  }, []);

  const offerPreferred = useCallback(() => {
    setLive((s) => ({
      ...s,
      preferred: s.preferred ? { ...s.preferred, status: "offered" } : s.preferred,
      events: [
        ev(s.clock, "preferred.offer.sent", "action", ["driver", "ops"], "Company offer issued", "David Chen receives official Zoufeng offer"),
        ...s.events,
      ],
    }));
  }, []);

  const acceptPreferred = useCallback(() => {
    setLive((s) => ({
      ...s,
      assignedId: "D-118",
      preferred: s.preferred ? { ...s.preferred, status: "confirmed" } : s.preferred,
      phase: "driver_assigned",
      customerNotice: "Preferred driver confirmed.",
      events: [
        ev(s.clock, "preferred.offer.accepted", "info", ["ops", "driver"], "David accepted company offer", "D-118"),
        ev(s.clock, "preferred.confirmed", "info", ["passenger"], "Preferred driver confirmed", "Sarah Chen"),
        ...s.events,
      ],
    }));
  }, []);

  useEffect(() => {
    if (!live.playing) return;
    const id = window.setInterval(() => {
      setLive((s) => animateTick(s));
      tRef.current += 1;
      if (tRef.current % 5 === 0) step();
    }, 900);
    return () => window.clearInterval(id);
  }, [live.playing, step]);

  const api = useMemo<LiveApi>(
    () => ({
      live,
      play: () => setLive((s) => ({ ...s, playing: true })),
      pause: () => setLive((s) => ({ ...s, playing: false })),
      reset: (scenario) => {
        beat.current = 0;
        tRef.current = 0;
        seq = 1;
        const base = initialSnapshot();
        setLive({ ...base, scenario: scenario ?? base.scenario, drivers: seedDrivers.map((d) => ({ ...d })) });
      },
      step,
      setScenario: (scenario) => {
        beat.current = 0;
        setLive({ ...initialSnapshot(), scenario });
      },
      reportIncident,
      sendReplacement,
      acceptReplacement,
      requestPreferred,
      validatePreferred,
      offerPreferred,
      acceptPreferred,
    }),
    [live, step, reportIncident, sendReplacement, acceptReplacement, requestPreferred, validatePreferred, offerPreferred, acceptPreferred],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useLive() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("live");
  return ctx;
}

function animateTick(s: LiveSnapshot): LiveSnapshot {
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
      drivers: s.drivers.map((d) =>
        d.id === s.assignedId
          ? { ...d, loc, km, etaMin, heading: heading(d.loc, loc), state: km < 2.2 ? "to_pickup" : "to_pickup" }
          : d,
      ),
    };
  }
  if (s.phase === "en_route_dest" || s.phase === "arriving") {
    const progress = Math.min(0.98, 1 - s.distanceKm / 40 + 0.02);
    const loc = along(ROUTE_TPE_TPE101, Math.max(0.08, progress));
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
    const t = Math.min(1, (3.4 - Math.max(0.4, d0.km - 0.18)) / 3.4);
    const loc = along([d0.loc, TPE_T1], Math.min(0.9, t));
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

function pickupBeat(s: LiveSnapshot, n: number): LiveSnapshot {
  const clock = ["19:28", "19:29", "19:30", "19:31", "19:32", "19:33", "19:34", "19:34", "19:35", "19:35", "19:36", "19:38", "19:41", "19:48"][
    Math.min(n, 13)
  ];
  if (n === 1) {
    return {
      ...s,
      clock,
      phase: "flight_monitoring",
      events: [ev(clock, "flight.status.changed", "info", ["passenger", "ops"], "Flight monitored", "BR156 NRT → TPE T2 · on time"), ...s.events],
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
      events: [ev(clock, "booking.status.changed", "info", ["passenger", "ops"], "David Chen assigned", "MPV · TPE-4410 · company dispatch"), ...s.events],
    };
  }
  if (n === 3) {
    return {
      ...s,
      clock,
      phase: "driver_preparing",
      events: [ev(clock, "driver.status.changed", "info", ["ops", "passenger"], "Driver preparing", "David Chen · departing depot"), ...s.events],
    };
  }
  if (n === 4) {
    return {
      ...s,
      clock,
      phase: "en_route_airport",
      distanceKm: 17.4,
      etaMin: 22,
      events: [ev(clock, "driver.location.updated", "info", ["passenger", "ops"], "En route to airport", "17.4 km · 22 min"), ...s.events],
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
        ev(clock, "flight.status.changed", "warning", ["ops", "passenger"], "BR156 delayed +18m", "Pickup window held · 45 min free wait"),
        ev(clock, "eta.updated", "info", ["ops"], "Pickup recalculated", "Wait clock starts at actual arrival"),
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
      events: [ev(clock, "traffic.incident.detected", "warning", ["ops", "driver"], "Route congestion", "Estimated delay +6 min · original 18:42 → 18:48"), ...s.events],
    };
  }
  if (n === 7) {
    const d = s.drivers.find((x) => x.id === "D-118") ?? s.drivers[0];
    const candidates = rank(s.drivers);
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
        ev(clock, "driver.incident.reported", "critical", ["ops"], "CRITICAL · Unable to continue", "D-118 vehicle problem · ZF-82041", { driverId: "D-118" }),
        ev(clock, "dispatch.search.started", "action", ["ops"], "3 replacement drivers identified", "MPV/Van · T2 radius"),
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
      events: [ev(clock, "dispatch.offer.sent", "action", ["driver", "ops"], "Replacement offer → D-221", "Jason Wu · 1.2 km · 4 min"), ...s.events],
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
      customerNotice: "Your assigned vehicle has changed due to an operational issue. Your new driver is on the way.",
      etaMin: 4,
      distanceKm: 1.2,
      drivers: s.drivers.map((x) =>
        x.id === "D-221" ? { ...x, state: "to_pickup" } : x.id === "D-118" ? { ...x, state: "incident" } : x,
      ),
      events: [
        ev(clock, "dispatch.offer.accepted", "info", ["ops"], "D-221 accepted", "Jason Wu"),
        ev(clock, "dispatch.reassigned", "action", ["ops", "passenger"], "Booking reassigned", "ZF-82041 → D-221"),
        ev(clock, "notify.customer", "info", ["passenger"], "Passenger notified", "New driver on the way"),
        ev(clock, "eta.updated", "info", ["passenger", "ops"], "ETA recalculated", "4 min"),
        ...s.events,
      ],
    };
  }
  if (n === 10) {
    return {
      ...s,
      clock,
      phase: "near_airport",
      events: [ev(clock, "driver.location.updated", "info", ["passenger", "ops"], "Replacement near airport", "Jason Wu · 0.8 km"), ...s.events],
    };
  }
  if (n === 11) {
    return {
      ...s,
      clock,
      phase: "arrived",
      events: [ev(clock, "booking.status.changed", "info", ["passenger", "ops"], "Driver arrived T2 Door 8", "Waiting policy 45 min"), ...s.events],
    };
  }
  if (n === 12) {
    return { ...s, clock, phase: "waiting", drivers: s.drivers.map((d) => (d.id === s.assignedId ? { ...d, state: "waiting" } : d)) };
  }
  if (n === 13) {
    return {
      ...s,
      clock,
      phase: "trip_started",
      events: [ev(clock, "trip.started", "info", ["ops", "passenger"], "Passenger verified · trip started", "OTP 4821"), ...s.events],
      drivers: s.drivers.map((d) => (d.id === s.assignedId ? { ...d, state: "onboard" } : d)),
    };
  }
  return { ...s, clock, phase: n > 13 ? "en_route_dest" : s.phase };
}

function preferredBeat(s: LiveSnapshot, n: number): LiveSnapshot {
  const clock = ["10:12", "10:12", "10:13", "10:14", "10:15", "10:16"][Math.min(n, 5)];
  if (n === 1) {
    return {
      ...s,
      clock,
      preferred: { id: "PR-88", driverId: "D-118", status: "requested", premiumPct: 18 },
      events: [ev(clock, "preferred.request.created", "action", ["ops", "passenger"], "Sarah requested David Chen", "Company intermediary — no private contact"), ...s.events],
    };
  }
  if (n === 2) {
    return {
      ...s,
      clock,
      preferred: s.preferred ? { ...s.preferred, status: "validating" } : s.preferred,
      events: [ev(clock, "preferred.request.validated", "info", ["ops"], "Rules check passed", "Area · MPV · schedule · +18% premium · no conflict"), ...s.events],
    };
  }
  if (n === 3) {
    return {
      ...s,
      clock,
      preferred: s.preferred ? { ...s.preferred, status: "offered" } : s.preferred,
      events: [ev(clock, "preferred.offer.sent", "action", ["driver"], "Official company offer", "D-118 David Chen"), ...s.events],
    };
  }
  if (n === 4) {
    return {
      ...s,
      clock,
      assignedId: "D-118",
      phase: "driver_assigned",
      preferred: s.preferred ? { ...s.preferred, status: "confirmed" } : s.preferred,
      customerNotice: "Preferred driver confirmed.",
      events: [
        ev(clock, "preferred.offer.accepted", "info", ["ops"], "David accepted", "Company-issued offer"),
        ev(clock, "preferred.confirmed", "info", ["passenger"], "Preferred driver confirmed", "David Chen · +18%"),
        ...s.events,
      ],
    };
  }
  return s;
}
