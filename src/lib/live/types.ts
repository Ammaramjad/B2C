export type LiveRole = "passenger" | "driver" | "ops" | "system";

export type EventType =
  | "driver.location.updated"
  | "driver.status.changed"
  | "driver.incident.reported"
  | "booking.created"
  | "booking.status.changed"
  | "dispatch.search.started"
  | "dispatch.offer.sent"
  | "dispatch.offer.accepted"
  | "dispatch.offer.rejected"
  | "dispatch.offer.expired"
  | "dispatch.reassigned"
  | "trip.shared"
  | "flight.status.changed"
  | "eta.updated"
  | "traffic.incident.detected"
  | "trip.started"
  | "trip.completed"
  | "sos.triggered"
  | "payment.updated"
  | "preferred.request.created"
  | "preferred.request.validated"
  | "preferred.offer.sent"
  | "preferred.offer.accepted"
  | "preferred.confirmed"
  | "preferred.unavailable"
  | "preferred.requested"
  | "preferred.validated"
  | "preferred.declined"
  | "notify.customer"
  | "notify.ops"
  | "notification.created"
  | "dispatch.candidates.updated"
  | "refund.updated"
  | "driver.duty.changed";

export type Severity = "info" | "action" | "warning" | "critical";

export type TripPhase =
  | "booked"
  | "flight_monitoring"
  | "driver_assigned"
  | "driver_preparing"
  | "en_route_airport"
  | "near_airport"
  | "arrived"
  | "waiting"
  | "verified"
  | "trip_started"
  | "en_route_dest"
  | "arriving"
  | "completed"
  | "disrupted"
  | "reassigning"
  | "reassigned";

export type DriverMarkerState =
  | "available"
  | "busy"
  | "to_pickup"
  | "waiting"
  | "onboard"
  | "offline"
  | "incident"
  | "emergency"
  | "delayed"
  | "reassignment";

export type LiveEvent = {
  id: string;
  at: number;
  clock: string;
  type: EventType;
  severity: Severity;
  audience: LiveRole[];
  title: string;
  body: string;
  bookingId?: string;
  driverId?: string;
  lat?: number;
  lng?: number;
};

export type GeoPoint = { lat: number; lng: number };

export type LiveDriver = {
  id: string;
  name: string;
  plate: string;
  vehicle: string;
  klass: string;
  rating: number;
  accept: number;
  onTime: number;
  ridesWithSarah: number;
  lastRide: string;
  state: DriverMarkerState;
  loc: GeoPoint;
  heading: number;
  km: number;
  etaMin: number;
  fleet: "A" | "B" | "C";
  onlineHours: number;
  duty: "online" | "offline" | "busy" | "break";
};

export type Candidate = LiveDriver & { why: string[] };

export type Incident = {
  id: string;
  category: string;
  note: string;
  severity: Severity;
  bookingId: string;
  driverId: string;
  loc: GeoPoint;
  at: number;
  clock: string;
  tripPhase: TripPhase;
  ack: boolean;
};

export type PreferredRequest = {
  id: string;
  driverId: string;
  customer: string;
  status: "draft" | "requested" | "validating" | "offered" | "confirmed" | "unavailable" | "declined";
  premiumPct: number;
  service?: string;
  schedule?: string;
};

export type LiveSnapshot = {
  scenario: "pickup" | "preferred";
  playing: boolean;
  sim: boolean;
  clock: string;
  phase: TripPhase;
  bookingId: string;
  passenger: string;
  flight: string;
  flightStatus: string;
  delayMin: number;
  terminal: string;
  pickup: string;
  dropoff: string;
  assignedId: string | null;
  replacementId: string | null;
  otp: string;
  fare: number;
  etaMin: number;
  distanceKm: number;
  traffic: "clear" | "heavy" | "incident";
  trafficNote: string;
  route: GeoPoint[];
  drivers: LiveDriver[];
  events: LiveEvent[];
  incident: Incident | null;
  candidates: Candidate[];
  offerTo: string | null;
  offerExpiresAt: number | null;
  offerRemainSec: number | null;
  offerKind: "assignment" | "replacement" | "preferred" | null;
  customerNotice: string | null;
  preferred: PreferredRequest | null;
  shareToken: string | null;
  rejects: Record<string, number>;
  counters: {
    active: number;
    unassigned: number;
    available: number;
    busy: number;
    arrivals: number;
    delayed: number;
    incidents: number;
    sos: number;
  };
};
