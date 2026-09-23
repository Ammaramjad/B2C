"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { drivers } from "./data";
import { cancelFee, quote } from "./pricing";
import type {
  Booking,
  BookingStatus,
  Currency,
  Locale,
  Message,
  Role,
  ServiceType,
  User,
  VehicleClass,
} from "./types";

const KEY = "zoufeng-aether-v1";

const demoUser = (role: Role, name: string, email: string): User => ({
  name,
  email,
  phone: "+886 900 880 101",
  role,
  points: 4280,
  wallet: { TWD: 12600, USD: 240, JPY: 18000, KRW: 88000, INR: 6200 },
  referralCode: "AETHER-88K",
  prefs: { quiet: true, ac: 22, vehicle: "business" },
});

interface Draft {
  service: ServiceType;
  pickup: string;
  dropoff: string;
  when: string;
  vehicle: VehicleClass;
  passengers: number;
  luggage: number;
  flight: string;
  hours: number;
  preferredDriver: boolean;
  name: string;
  phone: string;
}

interface Store {
  locale: Locale;
  setLocale: (l: Locale) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  user: User | null;
  login: (email: string, role?: Role) => void;
  logout: () => void;
  draft: Draft;
  setDraft: (p: Partial<Draft>) => void;
  bookings: Booking[];
  placeBooking: () => Booking;
  advance: (id: string, status?: BookingStatus) => void;
  cancel: (id: string) => void;
  assignDriver: (id: string, driverId: string) => void;
  messages: Message[];
  askHalo: (text: string) => void;
  itinerary: string[];
  setItinerary: (ids: string[]) => void;
  planFromPrompt: (prompt: string) => void;
}

const defaultDraft: Draft = {
  service: "airport",
  pickup: "TPE Terminal 1 Arrivals",
  dropoff: "Xinyi / Taipei 101",
  when: "",
  vehicle: "business",
  passengers: 2,
  luggage: 2,
  flight: "CI101",
  hours: 8,
  preferredDriver: false,
  name: "Amara Chen",
  phone: "+886 900 880 101",
};

const Ctx = createContext<Store | null>(null);

function load() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [currency, setCurrency] = useState<Currency>("TWD");
  const [user, setUser] = useState<User | null>(null);
  const [draft, setDraftState] = useState<Draft>(defaultDraft);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "agent",
      text: "Halo online. I can quote transfers, explain cancellation tiers, track flights, or escalate L2.",
    },
  ]);
  const [itinerary, setItinerary] = useState<string[]>(["a5", "a2", "a3"]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = load();
    if (s) {
      setLocale(s.locale ?? "en");
      setCurrency(s.currency ?? "TWD");
      setUser(s.user ?? null);
      setDraftState({ ...defaultDraft, ...s.draft });
      setBookings(s.bookings ?? []);
      setItinerary(s.itinerary ?? ["a5", "a2", "a3"]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({ locale, currency, user, draft, bookings, itinerary }),
    );
  }, [locale, currency, user, draft, bookings, itinerary, hydrated]);

  const value = useMemo<Store>(
    () => ({
      locale,
      setLocale,
      currency,
      setCurrency,
      user,
      login: (email, role) => {
        const e = email.toLowerCase();
        const r: Role =
          role ??
          (e.includes("ops") ? "ops" : e.includes("driver") ? "driver" : "passenger");
        const name = r === "ops" ? "Nova Lin" : r === "driver" ? "Kenji Mori" : "Amara Chen";
        setUser(demoUser(r, name, email || `${r}@zoufeng.travel`));
      },
      logout: () => setUser(null),
      draft,
      setDraft: (p) => setDraftState((d) => ({ ...d, ...p })),
      bookings,
      placeBooking: () => {
        const q = quote({
          service: draft.service,
          vehicle: draft.vehicle,
          airport: draft.service === "airport",
          night: new Date(draft.when || Date.now()).getHours() >= 22,
          hours: draft.hours,
          preferredDriver: draft.preferredDriver,
        });
        const online = drivers.filter((d) => d.online);
        const driver = draft.preferredDriver ? online[0] : online[Math.floor(Math.random() * online.length)];
        const b: Booking = {
          id: `ZF-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          service: draft.service,
          status: "assigned",
          pickup: draft.pickup,
          dropoff: draft.dropoff,
          when: draft.when || new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
          vehicle: draft.vehicle,
          passengers: draft.passengers,
          luggage: draft.luggage,
          flight: draft.service === "airport" ? draft.flight : undefined,
          flightEta: draft.service === "airport" ? "14:35 T1" : undefined,
          hours: draft.service === "charter" || draft.service === "designated" ? draft.hours : undefined,
          driverId: driver?.id,
          preferredDriver: draft.preferredDriver,
          otp: String(1000 + Math.floor(Math.random() * 9000)),
          price: q.total,
          currency: "TWD",
          breakdown: q.items,
          createdAt: new Date().toISOString(),
          passengerName: draft.name,
          passengerPhone: draft.phone,
        };
        setBookings((xs) => [b, ...xs]);
        if (user) {
          setUser({ ...user, points: user.points + Math.round(q.total / 20) });
        }
        return b;
      },
      advance: (id, status) =>
        setBookings((xs) =>
          xs.map((b) => {
            if (b.id !== id) return b;
            const order: BookingStatus[] = [
              "draft",
              "confirmed",
              "assigned",
              "en_route",
              "arrived",
              "in_progress",
              "completed",
            ];
            const next = status ?? order[Math.min(order.indexOf(b.status) + 1, order.length - 1)];
            return { ...b, status: next };
          }),
        ),
      cancel: (id) =>
        setBookings((xs) =>
          xs.map((b) => {
            if (b.id !== id || b.status === "completed") return b;
            const hours = Math.max(0, (new Date(b.when).getTime() - Date.now()) / 36e5);
            const fee = cancelFee(hours, b.price);
            return {
              ...b,
              status: "cancelled",
              breakdown: [...b.breakdown, { label: "Cancellation tier", amount: fee }],
              price: fee,
            };
          }),
        ),
      assignDriver: (id, driverId) =>
        setBookings((xs) => xs.map((b) => (b.id === id ? { ...b, driverId, status: "assigned" } : b))),
      messages,
      askHalo: (text) => {
        const reply = haloReply(text);
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "user", text },
          { id: crypto.randomUUID(), role: "agent", text: reply },
        ]);
      },
      itinerary,
      setItinerary,
      planFromPrompt: (prompt) => {
        const p = prompt.toLowerCase();
        if (p.includes("family") || p.includes("परिवार") || p.includes("家庭")) {
          setItinerary(["a1", "a5", "a8", "a2"]);
        } else if (p.includes("night") || p.includes("रात") || p.includes("夜")) {
          setItinerary(["a5", "a2", "a3"]);
        } else if (p.includes("nature") || p.includes("प्रकृति") || p.includes("自然")) {
          setItinerary(["a4", "a6", "a7"]);
        } else {
          setItinerary(["a5", "a3", "a7", "a2"]);
        }
      },
    }),
    [locale, currency, user, draft, bookings, messages, itinerary],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function haloReply(text: string) {
  const q = text.toLowerCase();
  if (q.includes("cancel") || q.includes("रद्द") || q.includes("取消")) {
    return "L1 policy: full refund >24h before pickup; 50% between 12–24h; inside 12h the fare is captured. I can fire a one-click refund on a confirmed trip.";
  }
  if (q.includes("flight") || q.includes("फ्लाइट") || q.includes("航班")) {
    return "Flight mesh is live. CI101 NRT→TPE is on time 14:35 T1. Free-wait window is 60 minutes after wheels-down, then overtime pulses.";
  }
  if (q.includes("price") || q.includes("कीमत") || q.includes("價格") || q.includes("价格")) {
    return "Quotes use 16 factors: base, distance/time, airport, night, demand, weather, festivals, vehicle, designated-driver premium, and risk caps. Breakdown is always visible before seal.";
  }
  if (q.includes("sos") || q.includes("help") || q.includes("emergency")) {
    return "SOS is one tap on a live trip. L3 incident cell is paged, share-link freezes last GPS, and nearby units are flagged. Escalating is available now.";
  }
  if (q.includes("driver") || q.includes("ड्राइवर")) {
    return "Dispatch 2.0 ranks eligibility → service score → empty miles → fleet priority → willingness → timeout reassignment. You can also lock a designated driver for +18%.";
  }
  return "Halo (L1 RAG) understood. I can handle quotes, delays, refunds, wallet FX, and loyalty. Say escalate if you want a human L2.";
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("store");
  return ctx;
}
