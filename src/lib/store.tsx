"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { extras as extraCat } from "./catalog";
import { drivers, passengers, seedBookings, seedSettlements, seedSwitches, seedTickets } from "./data";
import { emptyDomain, type CrmNote, type DomainState, type ShareRecord } from "./domain/persist";
import { mintShareToken } from "./domain/share";
import { loc } from "./i18n";
import { cancelFee, COMMISSION, quote } from "./pricing";
import type {
  Booking,
  BookingStatus,
  Channel,
  Currency,
  ExtraId,
  Locale,
  Message,
  Role,
  ServiceType,
  Settlement,
  SwitchRequest,
  SwitchStatus,
  Ticket,
  User,
} from "./types";

const KEY = "zf-signal-domain-v1";
const LEGACY_KEY = "zoufeng-atlas-v1";
export type Theme = "dark" | "light";

function subscribePersist(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getPersistSnapshot() {
  try {
    return localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
  } catch {
    return null;
  }
}

function getPersistServerSnapshot() {
  return null;
}

function getIsClientSnapshot() {
  return true;
}

function getIsClientServerSnapshot() {
  return false;
}

interface Draft {
  service: ServiceType;
  pickup: string;
  dropoff: string;
  when: string;
  vehicle: string;
  passengers: number;
  luggage: number;
  extras: ExtraId[];
  promo: string;
  flight: string;
  hours: number;
  days: number;
  payment: Booking["payment"];
  name: string;
  phone: string;
  channel: Channel;
}

interface Store {
  locale: Locale;
  setLocale: (l: Locale) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  user: User | null;
  login: (email: string, role?: Role) => void;
  logout: () => void;
  draft: Draft;
  setDraft: (p: Partial<Draft>) => void;
  bookings: Booking[];
  placeBooking: (override?: Partial<Draft>) => Booking;
  advance: (id: string, status?: BookingStatus) => void;
  cancel: (id: string) => void;
  assignDriver: (id: string, driverId: string) => void;
  grab: (id: string, driverId: string) => void;
  switches: SwitchRequest[];
  requestSwitch: (opts: { bookingId?: string; fromDriverId: string; reason: string; reasonZh: string }) => SwitchRequest;
  decideSwitch: (id: string, status: SwitchStatus, toDriverId?: string) => void;
  tickets: Ticket[];
  settlements: Settlement[];
  messages: Message[];
  askHalo: (text: string) => void;
  recent: string[];
  pushRecent: (q: string) => void;
  lastDriverId: (passengerId?: string) => string | undefined;
  cancelMidPct: number;
  setCancelMidPct: (n: number) => void;
  domain: DomainState;
  patchBooking: (id: string, patch: Partial<Booking>) => void;
  recordReject: (driverId: string, bookingId: string) => void;
  createShare: (bookingId: string) => ShareRecord;
  addNote: (passengerId: string, body: string) => CrmNote;
}

const defaultDraft: Draft = {
  service: "airport_pickup",
  pickup: "TPE T1 Arrivals",
  dropoff: "Taipei 101",
  when: "",
  vehicle: "sedan",
  passengers: 2,
  luggage: 2,
  extras: ["meet"],
  promo: "",
  flight: "CI101",
  hours: 8,
  days: 2,
  payment: "card",
  name: "Amara Chen",
  phone: "+886 900 880 101",
  channel: "web",
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(subscribePersist, getIsClientSnapshot, getIsClientServerSnapshot);
  const persistRaw = useSyncExternalStore(subscribePersist, getPersistSnapshot, getPersistServerSnapshot);
  const persisted = useMemo(() => {
    let parsed: Record<string, unknown> | null = null;
    if (persistRaw) {
      try {
        parsed = JSON.parse(persistRaw) as Record<string, unknown>;
      } catch {
        parsed = null;
      }
    }
    return {
      locale: (parsed?.locale === "zh" ? "zh" : "en") as Locale,
      currency: (parsed?.currency === "USD" ? "USD" : "TWD") as Currency,
      theme: (parsed?.theme === "light" || parsed?.theme === "dark" ? parsed.theme : "light") as Theme,
      user: (parsed?.user as User | null | undefined) ?? null,
      draft: { ...defaultDraft, ...(parsed?.draft as Partial<Draft> | undefined) } as Draft,
      bookings: (() => {
        const raw = Array.isArray(parsed?.bookings) ? (parsed.bookings as Booking[]) : [];
        const ok = raw[0]?.id?.startsWith("ZD-") || raw[0]?.id?.startsWith("ZF-");
        const base = ok ? raw : seedBookings;
        const tape = seedBookings.find((b) => b.id === "ZF-82041");
        return tape && !base.some((b) => b.id === "ZF-82041") ? [tape, ...base] : base;
      })(),
      switches: Array.isArray(parsed?.switches) ? (parsed.switches as SwitchRequest[]) : seedSwitches,
      recent: Array.isArray(parsed?.recent) ? (parsed.recent as string[]) : [],
      cancelMidPct: typeof parsed?.cancelMidPct === "number" ? parsed.cancelMidPct : 0.5,
      domain: {
        ...emptyDomain(),
        ...((parsed?.domain as DomainState | undefined) ?? {}),
        mode: "demo" as const,
      },
    };
  }, [persistRaw]);

  const persistedLocale = persisted.locale;
  const persistedCurrency = persisted.currency;
  const persistedTheme = persisted.theme;
  const persistedUser = persisted.user;
  const persistedDraft = persisted.draft;
  const persistedBookings = persisted.bookings;
  const persistedSwitches = persisted.switches;
  const persistedRecent = persisted.recent;
  const persistedCancelMidPct = persisted.cancelMidPct;
  const persistedDomain = persisted.domain;

  const [localeState, setLocale] = useState<Locale | undefined>(undefined);
  const [currencyState, setCurrency] = useState<Currency | undefined>(undefined);
  const [themeState, setTheme] = useState<Theme | undefined>(undefined);
  const [userState, setUser] = useState<User | null | undefined>(undefined);
  const [draftState, setDraftState] = useState<Draft | undefined>(undefined);
  const [bookingsState, setBookingsState] = useState<Booking[] | undefined>(undefined);
  const [switchesState, setSwitchesState] = useState<SwitchRequest[] | undefined>(undefined);
  const [tickets] = useState<Ticket[]>(seedTickets);
  const [settlements] = useState<Settlement[]>(seedSettlements);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "agent", text: "走癲派車 24h FAQ · price / modify / cancel / complaint. 英文姓名不翻譯。" },
  ]);
  const [recentState, setRecentState] = useState<string[] | undefined>(undefined);
  const [cancelMidPctState, setCancelMidPct] = useState<number | undefined>(undefined);
  const [domainState, setDomainState] = useState<DomainState | undefined>(undefined);

  const locale = localeState ?? persistedLocale;
  const currency = currencyState ?? persistedCurrency;
  const theme = themeState ?? persistedTheme;
  const user = userState !== undefined ? userState : persistedUser;
  const draft = draftState ?? persistedDraft;
  const bookings = bookingsState ?? persistedBookings;
  const switches = switchesState ?? persistedSwitches;
  const recent = recentState ?? persistedRecent;
  const cancelMidPct = cancelMidPctState ?? persistedCancelMidPct;
  const domain = domainState ?? persistedDomain;

  const setBookings = useCallback(
    (updater: (xs: Booking[]) => Booking[]) => setBookingsState((xs) => updater(xs ?? persistedBookings)),
    [persistedBookings],
  );
  const setSwitches = useCallback(
    (updater: (xs: SwitchRequest[]) => SwitchRequest[]) => setSwitchesState((xs) => updater(xs ?? persistedSwitches)),
    [persistedSwitches],
  );

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(KEY, JSON.stringify({ locale, currency, theme, user, draft, bookings, switches, recent, cancelMidPct, domain }));
  }, [isClient, locale, currency, theme, user, draft, bookings, switches, recent, cancelMidPct, domain]);

  const value = useMemo<Store>(
    () => ({
      locale,
      setLocale,
      currency,
      setCurrency,
      theme,
      setTheme,
      user,
      login: (email, role) => {
        const e = email.toLowerCase();
        const r: Role =
          role ??
          (e.includes("ops") || e.includes("admin")
            ? "ops"
            : e.includes("dispatch")
              ? "dispatcher"
              : e.includes("driver")
                ? "driver"
                : "passenger");
        const name = r === "ops" || r === "dispatcher" ? "Nova Lin" : r === "driver" ? "Kenji Mori" : "Amara Chen";
        setUser({
          id: r === "passenger" ? "p1" : r === "driver" ? "d1" : "ops",
          name,
          email: email || `${r}@zoudian.travel`,
          phone: "+886 900 880 101",
          role: r,
          points: 4280,
          wallet: { TWD: 12600, USD: 240 },
          referralCode: "ZOUDIAN-88",
          lastDriverId: r === "passenger" ? "d1" : undefined,
        });
      },
      logout: () => setUser(null),
      draft,
      setDraft: (p) => setDraftState((d) => ({ ...(d ?? persistedDraft), ...p })),
      bookings,
      placeBooking: (override) => {
        const d = { ...draft, ...override };
        const routeCount = bookings.filter((b) => b.pickup === d.pickup && b.dropoff === d.dropoff).length;
        const q = quote({
          service: d.service,
          vehicle: d.vehicle,
          extras: d.extras,
          promo: d.promo,
          when: d.when,
          hours: d.hours,
          days: d.days,
          surge: routeCount >= 2,
        });
        const online = drivers.filter((d) => d.work === "available" && d.status === "approved");
        const preferEn = d.extras.includes("english");
        const scored = [...online].sort((a, b) => {
          const fleet = { A: 3, B: 2, C: 1 };
          const sa = fleet[a.fleet] * 10 + (preferEn && a.languages.includes("EN") ? 2 : 0) + a.rating;
          const sb = fleet[b.fleet] * 10 + (preferEn && b.languages.includes("EN") ? 2 : 0) + b.rating;
          return sb - sa;
        });
        const driver = d.service === "rental" ? undefined : scored[0];
        const ch: Channel =
          d.service === "instant" ? "taxi" : d.service === "hourly" ? "hourly" : d.service === "rental" ? "rental" : d.channel;
        const b: Booking = {
          id: `ZF-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          service: d.service,
          status: d.service === "instant" ? "assigned" : "payment_confirmed",
          pickup: d.pickup,
          pickupZh: d.pickup,
          dropoff: d.dropoff,
          dropoffZh: d.dropoff,
          when: d.when || new Date(Date.now() + 36e5).toISOString().slice(0, 16),
          vehicle: d.vehicle as Booking["vehicle"],
          passengers: d.passengers,
          luggage: d.luggage,
          extras: d.extras,
          promo: d.promo || undefined,
          flight: d.service.startsWith("airport") ? d.flight : undefined,
          hours: d.service === "hourly" ? d.hours : undefined,
          days: d.service === "rental" ? d.days : undefined,
          driverId: driver?.id,
          passengerId: user?.id ?? "p1",
          otp: String(1000 + Math.floor(Math.random() * 9000)),
          price: q.total,
          currency: "TWD",
          breakdown: q.items,
          createdAt: new Date().toISOString(),
          passengerName: d.name,
          passengerPhone: d.phone,
          commission: Math.round(q.total * COMMISSION),
          driverNet: Math.round(q.total * (1 - COMMISSION)),
          channel: ch,
          payment: d.payment,
        };
        setBookings((xs) => [b, ...xs]);
        if (user) setUser({ ...user, lastDriverId: driver?.id ?? user.lastDriverId, points: user.points + 20 });
        return b;
      },
      advance: (id, status) =>
        setBookings((xs) =>
          xs.map((b) => {
            if (b.id !== id) return b;
            const order: BookingStatus[] = [
              "payment_pending",
              "payment_confirmed",
              "new",
              "assigned",
              "accepted",
              "arriving",
              "onboard",
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
            const fee = cancelFee(hours, b.price, cancelMidPct);
            return { ...b, status: "cancelled", price: fee };
          }),
        ),
      assignDriver: (id, driverId) =>
        setBookings((xs) => xs.map((b) => (b.id === id ? { ...b, driverId, status: "assigned" } : b))),
      grab: (id, driverId) =>
        setBookings((xs) => xs.map((b) => (b.id === id && (b.status === "new" || !b.driverId) ? { ...b, driverId, status: "accepted" } : b))),
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
      decideSwitch: (id, status, toDriverId) => {
        setSwitches((xs) => xs.map((s) => (s.id === id ? { ...s, status, toDriverId, decidedAt: new Date().toISOString() } : s)));
        const sw = switches.find((s) => s.id === id);
        if (status === "approved" && sw?.bookingId && toDriverId) {
          setBookings((xs) => xs.map((b) => (b.id === sw.bookingId ? { ...b, driverId: toDriverId } : b)));
        }
      },
      tickets,
      settlements,
      messages,
      askHalo: (text) => {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "user", text },
          { id: crypto.randomUUID(), role: "agent", text: halo(text, locale) },
        ]);
      },
      recent,
      pushRecent: (q) => setRecentState((xs) => [q, ...(xs ?? persistedRecent).filter((x) => x !== q)].slice(0, 6)),
      lastDriverId: (passengerId?: string) => {
        const pid = passengerId ?? user?.id ?? "p1";
        return (
          (user?.id === pid ? user.lastDriverId : undefined) ??
          passengers.find((p) => p.id === pid)?.lastDriverId ??
          bookings.find((b) => b.passengerId === pid && b.driverId)?.driverId
        );
      },
      cancelMidPct,
      setCancelMidPct,
      domain,
      patchBooking: (id, patch) => setBookings((xs) => xs.map((b) => (b.id === id ? { ...b, ...patch } : b))),
      recordReject: (driverId, bookingId) =>
        setDomainState((d) => {
          const cur = d ?? persistedDomain;
          return {
            ...cur,
            rejects: [...cur.rejects, { id: `RJ-${Date.now()}`, driverId, bookingId, at: Date.now() }],
            audit: [{ id: `AU-${Date.now()}`, at: new Date().toISOString(), actor: driverId, action: "offer.rejected", entity: bookingId, detail: "Driver rejected company offer" }, ...cur.audit],
          };
        }),
      createShare: (bookingId) => {
        const rec = mintShareToken(bookingId);
        setDomainState((d) => {
          const cur = d ?? persistedDomain;
          return {
            ...cur,
            shares: [rec, ...cur.shares],
            audit: [{ id: `AU-${Date.now()}`, at: new Date().toISOString(), actor: "passenger", action: "trip.shared", entity: bookingId, detail: rec.token }, ...cur.audit],
          };
        });
        return rec;
      },
      addNote: (passengerId, body) => {
        const note: CrmNote = { id: `NT-${Date.now()}`, passengerId, body, author: "ops", at: new Date().toISOString() };
        setDomainState((d) => ({ ...(d ?? persistedDomain), notes: [note, ...(d ?? persistedDomain).notes] }));
        return note;
      },
    }),
    [locale, currency, theme, user, draft, bookings, switches, tickets, settlements, messages, recent, cancelMidPct, domain, persistedDraft, persistedRecent, persistedDomain, setBookings, setSwitches],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function halo(text: string, locale: Locale) {
  const q = text.toLowerCase();
  if (q.includes("cancel") || q.includes("取消")) {
    return loc(locale, ">24h 100% refund · 6–24h partial (admin %) · <6h no refund.", "＞24h 全退 · 6–24h 部分（後台可調）· ＜6h 不退。");
  }
  if (q.includes("wait") || q.includes("等候") || q.includes("flight") || q.includes("航班")) {
    return loc(locale, "Airport free wait is 45 minutes. Night +20% 23:00–06:00. Names stay in English.", "機場免費等候 45 分鐘。夜間 23:00–06:00 加成 20%。英文姓名不翻譯。");
  }
  if (q.includes("switch") || q.includes("換司")) {
    return loc(locale, "After first contact, change driver only through the company desk.", "首次接觸後，更換司機只能透過公司。");
  }
  return loc(locale, "I can help with quote, extras, LINE Pay, invoice, SOS, and tickets (8 categories).", "可處理報價、加購、LINE Pay、發票、SOS 與 8 類工單。");
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("store");
  return ctx;
}

export function extraLabel(id: ExtraId, locale: Locale) {
  const e = extraCat.find((x) => x.id === id);
  return locale === "zh" ? e?.nameZh : e?.name;
}
