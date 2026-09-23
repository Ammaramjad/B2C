"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  drivers,
  passengers,
  seedBookings,
  seedSettlements,
  seedSwitches,
  seedTickets,
} from "./data";
import { loc } from "./i18n";
import { cancelFee, COMMISSION, quote } from "./pricing";
import type {
  Booking,
  BookingStatus,
  Currency,
  Locale,
  Message,
  Role,
  ServiceType,
  Settlement,
  SwitchRequest,
  SwitchStatus,
  Ticket,
  User,
  VehicleClass,
} from "./types";

const KEY = "zoufeng-aether-v2";

const demoUser = (role: Role, name: string, email: string): User => ({
  id: role === "passenger" ? "p1" : role === "driver" ? "d1" : "ops",
  name,
  email,
  phone: "+886 900 880 101",
  role,
  points: 4280,
  wallet: { TWD: 12600, USD: 240 },
  referralCode: "AETHER-88K",
  lastDriverId: role === "passenger" ? "d1" : undefined,
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
  driverMode: "company" | "same";
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
  switches: SwitchRequest[];
  requestSwitch: (opts: { bookingId?: string; fromDriverId: string; reason: string; reasonZh: string }) => SwitchRequest;
  decideSwitch: (id: string, status: SwitchStatus, toDriverId?: string, note?: string) => void;
  tickets: Ticket[];
  settlements: Settlement[];
  messages: Message[];
  askHalo: (text: string) => void;
  itinerary: string[];
  setItinerary: (ids: string[]) => void;
  planFromPrompt: (prompt: string) => void;
  lastDriverId: (passengerId?: string) => string | undefined;
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
  driverMode: "company",
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
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [switches, setSwitches] = useState<SwitchRequest[]>(seedSwitches);
  const [tickets] = useState<Ticket[]>(seedTickets);
  const [settlements] = useState<Settlement[]>(seedSettlements);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "agent",
      text: "Halo / 光環 online. Quotes, cancellation tiers, flights, or company driver-switch policy.",
    },
  ]);
  const [itinerary, setItinerary] = useState<string[]>(["a5", "a2", "a3"]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = load();
    if (s) {
      setLocale(s.locale === "zh" ? "zh" : "en");
      setCurrency(s.currency === "USD" ? "USD" : "TWD");
      setUser(s.user ?? null);
      setDraftState({ ...defaultDraft, ...s.draft, driverMode: s.draft?.driverMode ?? "company" });
      if (Array.isArray(s.bookings) && s.bookings.length >= seedBookings.length) setBookings(s.bookings);
      if (Array.isArray(s.switches)) setSwitches(s.switches);
      setItinerary(s.itinerary ?? ["a5", "a2", "a3"]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      KEY,
      JSON.stringify({ locale, currency, user, draft, bookings, switches, itinerary }),
    );
  }, [locale, currency, user, draft, bookings, switches, itinerary, hydrated]);

  const lastDriverId = (passengerId?: string) => {
    const pid = passengerId ?? user?.id ?? "p1";
    const fromUser = user?.id === pid ? user.lastDriverId : undefined;
    const fromProfile = passengers.find((p) => p.id === pid)?.lastDriverId;
    const lastTrip = bookings.find((b) => b.passengerId === pid && b.driverId && b.status !== "cancelled");
    return fromUser ?? fromProfile ?? lastTrip?.driverId;
  };

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
          role ?? (e.includes("ops") || e.includes("admin") ? "ops" : e.includes("driver") ? "driver" : "passenger");
        const name = r === "ops" ? "Nova Lin" : r === "driver" ? "Kenji Mori" : "Amara Chen";
        setUser(demoUser(r, name, email || `${r}@zoufeng.travel`));
      },
      logout: () => setUser(null),
      draft,
      setDraft: (p) => setDraftState((d) => ({ ...d, ...p })),
      bookings,
      placeBooking: () => {
        const preferred = draft.driverMode === "same";
        const q = quote({
          service: draft.service,
          vehicle: draft.vehicle,
          airport: draft.service === "airport",
          night: new Date(draft.when || Date.now()).getHours() >= 22,
          hours: draft.hours,
          preferredDriver: preferred,
        });
        const pid = user?.id && user.role === "passenger" ? user.id : "p1";
        const last = lastDriverId(pid);
        const online = drivers.filter((d) => d.online && d.status === "approved");
        const driver = preferred && last ? drivers.find((d) => d.id === last) : online[0];
        const b: Booking = {
          id: `ZF-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          service: draft.service,
          status: "assigned",
          pickup: draft.pickup,
          pickupZh: draft.pickup,
          dropoff: draft.dropoff,
          dropoffZh: draft.dropoff,
          when: draft.when || new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
          vehicle: draft.vehicle,
          passengers: draft.passengers,
          luggage: draft.luggage,
          flight: draft.service === "airport" ? draft.flight : undefined,
          flightEta: draft.service === "airport" ? "14:35 T1" : undefined,
          hours: draft.service === "charter" || draft.service === "designated" ? draft.hours : undefined,
          driverId: driver?.id,
          preferredDriver: preferred,
          passengerId: pid,
          otp: String(1000 + Math.floor(Math.random() * 9000)),
          price: q.total,
          currency: "TWD",
          breakdown: q.items,
          createdAt: new Date().toISOString(),
          passengerName: draft.name,
          passengerPhone: draft.phone,
          commission: Math.round(q.total * COMMISSION),
          driverNet: Math.round(q.total * (1 - COMMISSION)),
          channel: "app",
        };
        setBookings((xs) => [b, ...xs]);
        if (user) {
          setUser({
            ...user,
            points: user.points + Math.round(q.total / 20),
            lastDriverId: driver?.id ?? user.lastDriverId,
          });
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
              breakdown: [...b.breakdown, { label: "Cancellation tier", labelZh: "取消費級距", amount: fee }],
              price: fee,
              commission: Math.round(fee * COMMISSION),
              driverNet: Math.round(fee * (1 - COMMISSION)),
            };
          }),
        ),
      assignDriver: (id, driverId) =>
        setBookings((xs) => xs.map((b) => (b.id === id ? { ...b, driverId, status: "assigned" } : b))),
      switches,
      requestSwitch: ({ bookingId, fromDriverId, reason, reasonZh }) => {
        const req: SwitchRequest = {
          id: `SW-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          bookingId,
          passengerId: user?.id ?? "p1",
          fromDriverId,
          reason,
          reasonZh,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        setSwitches((xs) => [req, ...xs]);
        return req;
      },
      decideSwitch: (id, status, toDriverId, note) => {
        setSwitches((xs) =>
          xs.map((s) =>
            s.id === id
              ? { ...s, status, toDriverId, note, decidedAt: new Date().toISOString() }
              : s,
          ),
        );
        const sw = switches.find((s) => s.id === id);
        if (status === "approved" && sw?.bookingId && toDriverId) {
          setBookings((xs) =>
            xs.map((b) => (b.id === sw.bookingId ? { ...b, driverId: toDriverId, preferredDriver: false } : b)),
          );
        }
      },
      tickets,
      settlements,
      messages,
      askHalo: (text) => {
        const reply = haloReply(text, locale);
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
        if (p.includes("family") || p.includes("家庭")) setItinerary(["a1", "a5", "a8", "a2"]);
        else if (p.includes("night") || p.includes("夜")) setItinerary(["a5", "a2", "a3"]);
        else if (p.includes("nature") || p.includes("自然")) setItinerary(["a4", "a6", "a7"]);
        else setItinerary(["a5", "a3", "a7", "a2"]);
      },
      lastDriverId,
    }),
    [locale, currency, user, draft, bookings, switches, tickets, settlements, messages, itinerary],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function haloReply(text: string, locale: Locale) {
  const q = text.toLowerCase();
  if (q.includes("switch") || q.includes("another driver") || q.includes("換司") || q.includes("更換")) {
    return loc(
      locale,
      "Policy M25: after first assignment you cannot privately message another driver. Open a company switch request. Ops reassigns, both parties are notified, and the audit stays on the booking.",
      "政策 M25：首次指派後不得私下聯絡其他司機。請提交公司代換申請。由調度改派、雙方通知，並寫入訂單稽核。",
    );
  }
  if (q.includes("cancel") || q.includes("取消")) {
    return loc(
      locale,
      "L1 policy: full refund >24h before pickup; 50% between 12–24h; inside 12h the fare is captured. One-click refund is available on confirmed trips.",
      "L1 政策：出發前 24 小時以上全額退款；12–24 小時收 50%；12 小時內收取全額。已確認訂單可一鍵退款。",
    );
  }
  if (q.includes("flight") || q.includes("航班")) {
    return loc(
      locale,
      "Flight mesh is live. CI101 NRT→TPE on time 14:35 T1. Free-wait is 60 minutes after wheels-down.",
      "航班監控已連線。CI101 成田→桃園準時 14:35 T1。落地後免費等候 60 分鐘。",
    );
  }
  if (q.includes("price") || q.includes("價格") || q.includes("價錢")) {
    return loc(
      locale,
      "Quotes use 16 factors and always show an itemized breakdown in TWD (USD display optional).",
      "報價採用 16 因子，明細以新臺幣為準（可切換美元顯示）。",
    );
  }
  return loc(
    locale,
    "Halo (L1) understood. I can handle quotes, delays, refunds, wallet FX (TWD/USD), loyalty, and company driver switches.",
    "光環（L1）已理解。可處理報價、延誤、退款、新臺幣／美元錢包、會員與公司代換司機。",
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("store");
  return ctx;
}
