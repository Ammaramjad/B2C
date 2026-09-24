import type { ExtraId, ServiceType } from "../types.ts";
import type { GeoPoint } from "../live/types.ts";
import type { GeoProviderId, RouteResult } from "../maps/types.ts";

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;
export type BookingMode = "now" | "schedule" | "multi";
export type PayMethod = "card" | "line" | "cash";

export type PlacePick = {
  label: string;
  point: GeoPoint | null;
  source: GeoProviderId | "catalog" | "map-click" | "user";
};

export type BookingCommand = {
  step: BookingStep;
  mode: BookingMode;
  service: ServiceType;
  from: PlacePick;
  to: PlacePick;
  stops: PlacePick[];
  when: string;
  vehicle: string;
  passengers: number;
  luggage: number;
  extras: ExtraId[];
  flight: string;
  notes: string;
  name: string;
  phone: string;
  payment: PayMethod;
  compare: boolean;
  route: RouteResult | null;
  routeError: string | null;
  locating: boolean;
};

export const STEPS: { id: BookingStep; en: string; zh: string }[] = [
  { id: 1, en: "Route", zh: "路線" },
  { id: 2, en: "Service", zh: "服務" },
  { id: 3, en: "Vehicle", zh: "車款" },
  { id: 4, en: "Details", zh: "細節" },
  { id: 5, en: "Payment", zh: "付款" },
  { id: 6, en: "Confirm", zh: "確認" },
];

export const emptyPlace = (): PlacePick => ({ label: "", point: null, source: "user" });

export function initialCommand(partial?: Partial<BookingCommand>): BookingCommand {
  return {
    step: 1,
    mode: "now",
    service: "airport_pickup",
    from: { label: "TPE T2 Arrivals · Door 8", point: { lat: 25.0765, lng: 121.232 }, source: "catalog" },
    to: { label: "Taipei 101", point: { lat: 25.03396, lng: 121.56447 }, source: "catalog" },
    stops: [],
    when: "",
    vehicle: "mpv",
    passengers: 2,
    luggage: 2,
    extras: ["meet"],
    flight: "BR156",
    notes: "",
    name: "",
    phone: "",
    payment: "card",
    compare: false,
    route: null,
    routeError: null,
    locating: false,
    ...partial,
  };
}

export type CommandAction =
  | { type: "step"; step: BookingStep }
  | { type: "next" }
  | { type: "back" }
  | { type: "mode"; mode: BookingMode }
  | { type: "patch"; patch: Partial<BookingCommand> }
  | { type: "from"; place: PlacePick }
  | { type: "to"; place: PlacePick }
  | { type: "swap" }
  | { type: "addStop" }
  | { type: "removeStop"; index: number }
  | { type: "toggleExtra"; id: ExtraId }
  | { type: "route"; route: RouteResult | null; error?: string | null };

export function canAdvance(state: BookingCommand): boolean {
  if (state.step === 1) return Boolean(state.from.label && state.to.label);
  if (state.step === 3) return Boolean(state.vehicle);
  if (state.step === 4) return state.passengers >= 1;
  return true;
}

export function reduceCommand(state: BookingCommand, action: CommandAction): BookingCommand {
  switch (action.type) {
    case "step":
      return { ...state, step: action.step };
    case "next":
      return canAdvance(state) ? { ...state, step: Math.min(6, state.step + 1) as BookingStep } : state;
    case "back":
      return { ...state, step: Math.max(1, state.step - 1) as BookingStep };
    case "mode":
      return { ...state, mode: action.mode };
    case "patch":
      return { ...state, ...action.patch };
    case "from":
      return { ...state, from: action.place, route: null };
    case "to":
      return { ...state, to: action.place, route: null };
    case "swap":
      return { ...state, from: state.to, to: state.from, route: null };
    case "addStop":
      return { ...state, stops: [...state.stops, emptyPlace()] };
    case "removeStop":
      return { ...state, stops: state.stops.filter((_, i) => i !== action.index) };
    case "toggleExtra":
      return {
        ...state,
        extras: state.extras.includes(action.id) ? state.extras.filter((x) => x !== action.id) : [...state.extras, action.id],
      };
    case "route":
      return { ...state, route: action.route, routeError: action.error ?? null };
    default:
      return state;
  }
}

export const CATALOG_PLACES: { label: string; labelZh: string; point: GeoPoint }[] = [
  { label: "TPE T1 Arrivals", labelZh: "桃園機場第一航廈到達", point: { lat: 25.0772, lng: 121.2326 } },
  { label: "TPE T2 Arrivals · Door 8", labelZh: "桃園機場 T2 到達 · 8 號門", point: { lat: 25.0765, lng: 121.232 } },
  { label: "Taipei 101", labelZh: "台北 101", point: { lat: 25.03396, lng: 121.56447 } },
  { label: "Taipei Main Station", labelZh: "台北車站", point: { lat: 25.0478, lng: 121.517 } },
  { label: "Xinyi", labelZh: "信義", point: { lat: 25.0368, lng: 121.567 } },
  { label: "Songshan TSA", labelZh: "松山機場", point: { lat: 25.0694, lng: 121.5519 } },
  { label: "Banqiao", labelZh: "板橋", point: { lat: 25.0138, lng: 121.463 } },
];
