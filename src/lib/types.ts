export type Locale = "en" | "hi" | "zh";
export type Currency = "TWD" | "USD" | "JPY" | "KRW" | "INR";
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

export interface Vehicle {
  id: VehicleClass;
  name: string;
  seats: number;
  luggage: number;
  tag: string;
  multiplier: number;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  vehicle: string;
  plate: string;
  city: string;
  online: boolean;
  languages: string[];
  photo: string;
  earningsWeek: number;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  tag: string;
  image: string;
  routes: number;
  from: number;
}

export interface Experience {
  id: string;
  title: string;
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
  hours: number;
  cost: number;
  city: string;
}

export interface LineItem {
  label: string;
  amount: number;
}

export interface Booking {
  id: string;
  service: ServiceType;
  status: BookingStatus;
  pickup: string;
  dropoff: string;
  when: string;
  vehicle: VehicleClass;
  passengers: number;
  luggage: number;
  flight?: string;
  flightEta?: string;
  hours?: number;
  driverId?: string;
  preferredDriver?: boolean;
  otp: string;
  price: number;
  currency: Currency;
  breakdown: LineItem[];
  createdAt: string;
  passengerName: string;
  passengerPhone: string;
  notes?: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  role: Role;
  points: number;
  wallet: Record<Currency, number>;
  referralCode: string;
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
