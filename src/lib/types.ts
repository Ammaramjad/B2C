export type Locale = "en" | "zh";
export type Currency = "TWD" | "USD";
export type Role = "guest" | "passenger" | "driver" | "ops" | "dispatcher";

export type ServiceType =
  | "airport_pickup"
  | "airport_drop"
  | "p2p"
  | "hourly"
  | "rental"
  | "instant";

export type BookingStatus =
  | "payment_pending"
  | "payment_confirmed"
  | "new"
  | "assigned"
  | "accepted"
  | "arriving"
  | "onboard"
  | "completed"
  | "cancelled";

export type VehicleClass = "sedan" | "premium" | "suv" | "mpv" | "van" | "shuttle";
export type TaxiClass = "taxi" | "plus" | "xl" | "black";
export type RentalClass = "yaris" | "cross" | "sienta";
export type ExtraId = "meet" | "child_seat" | "english" | "pet" | "one_way_rental" | "insurance";
export type Channel = "web" | "app" | "dispatch" | "taxi" | "hourly" | "rental";
export type FilterId = "instant" | "ev" | "prem" | "wheel" | "meet";
export type SortId = "price" | "phigh" | "rate" | "pop";
export type SwitchStatus = "open" | "approved" | "declined";
export type TicketStatus = "open" | "l2" | "resolved";
export type DriverWork = "available" | "busy" | "offline";
export type FleetTier = "A" | "B" | "C";

export interface Vehicle {
  id: VehicleClass;
  name: string;
  nameZh: string;
  model: string;
  seats: number;
  luggage: number;
  base: number;
  ev?: boolean;
  wheel?: boolean;
  meet?: boolean;
}

export interface Taxi {
  id: TaxiClass;
  name: string;
  nameZh: string;
  eta: number;
  base: number;
}

export interface RentalCar {
  id: RentalClass;
  name: string;
  nameZh: string;
  seats: number;
  day: number;
}

export interface Extra {
  id: ExtraId;
  name: string;
  nameZh: string;
  price: number;
  only?: ServiceType[];
}

export interface LineItem {
  label: string;
  labelZh: string;
  amount: number;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  vehicle: string;
  vehicleClass: VehicleClass;
  plate: string;
  city: string;
  work: DriverWork;
  languages: string[];
  photo: string;
  phone: string;
  license: string;
  fleet: FleetTier;
  fuel: "petrol" | "hybrid" | "diesel" | "electric";
  vehicleState: "active" | "maintenance";
  status: "approved" | "pending" | "suspended";
  joined: string;
  acceptRate: number;
  earningsToday: number;
  earningsWeek: number;
  earningsMonth: number;
  earningsYtd: number;
  pendingPayout: number;
  completedWeek: number;
  cancelledWeek: number;
  emptyKmWeek: number;
  commissionRate: number;
}

export interface PassengerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  lastDriverId?: string;
  points: number;
  rfm: "champion" | "loyal" | "new" | "risk";
  trips: number;
  spendTwd: number;
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
  vehicle: VehicleClass | TaxiClass | RentalClass;
  passengers: number;
  luggage: number;
  extras: ExtraId[];
  promo?: string;
  flight?: string;
  hours?: number;
  days?: number;
  driverId?: string;
  passengerId: string;
  otp: string;
  price: number;
  currency: Currency;
  breakdown: LineItem[];
  createdAt: string;
  passengerName: string;
  passengerPhone: string;
  commission: number;
  driverNet: number;
  channel: Channel;
  payment: "card" | "line" | "apple" | "cash";
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
  category: string;
  categoryZh: string;
  message: string;
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
}

export interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
}

export interface Destination {
  id: string;
  city: string;
  cityZh: string;
  tag: string;
  tagZh: string;
  image: string;
  from: number;
}

export interface Attraction {
  id: string;
  name: string;
  nameZh: string;
  hours: number;
  cost: number;
  city: string;
}
