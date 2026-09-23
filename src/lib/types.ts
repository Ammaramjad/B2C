export type Locale = "en" | "zh";
export type Currency = "TWD" | "USD";
export type Role = "guest" | "passenger" | "driver" | "ops";

export type ServiceType =
  | "airport"
  | "point"
  | "charter"
  | "taxi"
  | "rental"
  | "designated"
  | "experience";

export type BookingStatus =
  | "draft"
  | "confirmed"
  | "assigned"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export type VehicleClass = "sedan" | "business" | "mpv" | "van" | "ev";

export type SwitchStatus = "open" | "approved" | "declined";
export type TicketStatus = "open" | "l2" | "resolved";
export type DriverStatus = "approved" | "pending" | "suspended";

export interface Vehicle {
  id: VehicleClass;
  name: string;
  seats: number;
  luggage: number;
  tag: string;
  tagZh: string;
  multiplier: number;
}

export interface Driver {
  id: string;
  name: string;
  nameZh: string;
  rating: number;
  trips: number;
  vehicle: string;
  plate: string;
  city: string;
  online: boolean;
  languages: string[];
  photo: string;
  phone: string;
  license: string;
  fleet: "owned" | "franchise" | "partner";
  status: DriverStatus;
  joined: string;
  acceptRate: number;
  rejectRate: number;
  emptyKmWeek: number;
  commissionRate: number;
  earningsToday: number;
  earningsWeek: number;
  earningsMonth: number;
  earningsYtd: number;
  pendingPayout: number;
  completedWeek: number;
  cancelledWeek: number;
}

export interface PassengerProfile {
  id: string;
  name: string;
  nameZh: string;
  email: string;
  phone: string;
  city: string;
  lastDriverId?: string;
  lastContactAt?: string;
  points: number;
  rfm: "champion" | "loyal" | "new" | "risk";
  trips: number;
  spendTwd: number;
  prefs: { quiet: boolean; ac: number; vehicle: VehicleClass };
}

export interface Destination {
  id: string;
  city: string;
  cityZh: string;
  country: string;
  countryZh: string;
  tag: string;
  tagZh: string;
  image: string;
  routes: number;
  from: number;
}

export interface Experience {
  id: string;
  title: string;
  titleZh: string;
  city: string;
  hours: number;
  price: number;
  rating: number;
  image: string;
  category: string;
}

export interface Attraction {
  id: string;
  name: string;
  nameZh: string;
  hours: number;
  cost: number;
  city: string;
}

export interface LineItem {
  label: string;
  labelZh: string;
  amount: number;
}

export interface Booking {
  id: string;
  service: ServiceType;
  status: BookingStatus;
  pickup: string;
  pickupZh: string;
  dropoff: string;
  dropoffZh: string;
  when: string;
  vehicle: VehicleClass;
  passengers: number;
  luggage: number;
  flight?: string;
  flightEta?: string;
  hours?: number;
  driverId?: string;
  preferredDriver?: boolean;
  passengerId: string;
  otp: string;
  price: number;
  currency: Currency;
  breakdown: LineItem[];
  createdAt: string;
  passengerName: string;
  passengerPhone: string;
  notes?: string;
  commission: number;
  driverNet: number;
  channel: "app" | "ops" | "referral";
}

export interface SwitchRequest {
  id: string;
  bookingId?: string;
  passengerId: string;
  fromDriverId: string;
  toDriverId?: string;
  reason: string;
  reasonZh: string;
  status: SwitchStatus;
  createdAt: string;
  decidedAt?: string;
  note?: string;
}

export interface Ticket {
  id: string;
  passengerId: string;
  bookingId?: string;
  level: "L1" | "L2" | "L3";
  topic: string;
  topicZh: string;
  status: TicketStatus;
  createdAt: string;
}

export interface Settlement {
  id: string;
  driverId: string;
  week: string;
  rides: number;
  gross: number;
  commission: number;
  net: number;
  status: "paid" | "pending";
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  points: number;
  wallet: Record<Currency, number>;
  referralCode: string;
  lastDriverId?: string;
  prefs: {
    quiet: boolean;
    ac: number;
    vehicle: VehicleClass;
  };
}

export interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
}
