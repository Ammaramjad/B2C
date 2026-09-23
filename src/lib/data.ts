import type { Attraction, Destination, Driver, Experience, Vehicle } from "./types";

export const vehicles: Vehicle[] = [
  { id: "sedan", name: "Aether Sedan", seats: 3, luggage: 2, tag: "City pulse", multiplier: 1 },
  { id: "business", name: "Orbit Business", seats: 3, luggage: 2, tag: "Silent cabin", multiplier: 1.35 },
  { id: "mpv", name: "Halo MPV", seats: 5, luggage: 4, tag: "Family orbit", multiplier: 1.55 },
  { id: "van", name: "Nexus Van", seats: 8, luggage: 8, tag: "Crew lift", multiplier: 1.9 },
  { id: "ev", name: "Lumen EV", seats: 4, luggage: 3, tag: "Zero wake", multiplier: 1.2 },
];

export const destinations: Destination[] = [
  { id: "taipei", city: "Taipei", country: "Taiwan", tag: "Night markets · TPE", image: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=1400&q=80", routes: 48, from: 890 },
  { id: "tokyo", city: "Tokyo", country: "Japan", tag: "Neon rails · HND/NRT", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400&q=80", routes: 62, from: 1680 },
  { id: "seoul", city: "Seoul", country: "Korea", tag: "Han river · ICN", image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1400&q=80", routes: 41, from: 1420 },
  { id: "singapore", city: "Singapore", country: "Singapore", tag: "Gardens · SIN", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1400&q=80", routes: 36, from: 2100 },
  { id: "bangkok", city: "Bangkok", country: "Thailand", tag: "Canals · BKK", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&q=80", routes: 55, from: 760 },
  { id: "dubai", city: "Dubai", country: "UAE", tag: "Skyline · DXB", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=80", routes: 29, from: 3200 },
];

export const experiences: Experience[] = [
  { id: "ex-1", title: "Jiufen night ridge + driver-guide", city: "Taipei", hours: 8, price: 6800, rating: 4.92, image: "https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=900&q=80", category: "Charter" },
  { id: "ex-2", title: "TPE arrivals — priority meet & greet", city: "Taipei", hours: 2, price: 1680, rating: 4.88, image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80", category: "Airport" },
  { id: "ex-3", title: "Tokyo dawn Tsukiji + Asakusa loop", city: "Tokyo", hours: 6, price: 12400, rating: 4.95, image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=900&q=80", category: "Itinerary" },
  { id: "ex-4", title: "ICN lounge transfer + SIM desk", city: "Seoul", hours: 3, price: 2400, rating: 4.81, image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=900&q=80", category: "Airport" },
  { id: "ex-5", title: "Bangkok river temples by EV van", city: "Bangkok", hours: 7, price: 4200, rating: 4.86, image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900&q=80", category: "Charter" },
  { id: "ex-6", title: "Dubai desert dusk + designated driver", city: "Dubai", hours: 5, price: 9800, rating: 4.9, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&q=80", category: "Designated" },
];

export const drivers: Driver[] = [
  { id: "d1", name: "Kenji Mori", rating: 4.98, trips: 2140, vehicle: "Orbit Business", plate: "TPE-8801", city: "Taipei", online: true, languages: ["EN", "ZH", "JA"], photo: "KM", earningsWeek: 42800 },
  { id: "d2", name: "Aisha Rahman", rating: 4.94, trips: 1688, vehicle: "Lumen EV", plate: "TPE-2209", city: "Taipei", online: true, languages: ["EN", "HI", "ZH"], photo: "AR", earningsWeek: 36120 },
  { id: "d3", name: "Wei Chen", rating: 4.91, trips: 3012, vehicle: "Halo MPV", plate: "TPE-4410", city: "Taipei", online: true, languages: ["ZH", "EN"], photo: "WC", earningsWeek: 51240 },
  { id: "d4", name: "Mina Park", rating: 4.96, trips: 990, vehicle: "Aether Sedan", plate: "ICN-1188", city: "Seoul", online: false, languages: ["KO", "EN"], photo: "MP", earningsWeek: 28900 },
];

export const attractions: Attraction[] = [
  { id: "a1", name: "Chiang Kai-shek Memorial", hours: 1.5, cost: 0, city: "Taipei" },
  { id: "a2", name: "Shilin Night Market", hours: 2, cost: 600, city: "Taipei" },
  { id: "a3", name: "Jiufen Old Street", hours: 3, cost: 400, city: "Taipei" },
  { id: "a4", name: "Yehliu Geopark", hours: 2.5, cost: 180, city: "Taipei" },
  { id: "a5", name: "Taipei 101 Observatory", hours: 1.5, cost: 600, city: "Taipei" },
  { id: "a6", name: "Beitou Hot Springs", hours: 2, cost: 450, city: "Taipei" },
  { id: "a7", name: "Tamsui Sunset Pier", hours: 2, cost: 200, city: "Taipei" },
  { id: "a8", name: "National Palace Museum", hours: 2.5, cost: 350, city: "Taipei" },
];

export const popularRoutes = [
  { from: "TPE Terminal 1", to: "Xinyi / Taipei 101", km: 42, mins: 45, price: 1450 },
  { from: "TPE Terminal 2", to: "Ximending", km: 40, mins: 48, price: 1380 },
  { from: "Songshan TSA", to: "Neihu", km: 12, mins: 22, price: 780 },
  { from: "HND", to: "Shibuya", km: 23, mins: 40, price: 4200 },
];

export const kpis = [
  { key: "gmv", label: "GMV (7d)", value: "NT$ 18.4M", delta: "+12.6%" },
  { key: "dispatch", label: "Dispatch success", value: "97.4%", delta: "+1.1%" },
  { key: "aov", label: "Avg order", value: "NT$ 2,180", delta: "+8.2%" },
  { key: "empty", label: "Empty miles", value: "11.8%", delta: "-2.4%" },
  { key: "nps", label: "Passenger NPS", value: "72", delta: "+4" },
  { key: "wait", label: "Avg wait", value: "4.6 min", delta: "-0.8" },
];

export const flights: Record<string, { eta: string; status: string; terminal: string; origin: string }> = {
  CI101: { eta: "14:35", status: "On time", terminal: "T1", origin: "NRT" },
  BR856: { eta: "16:10", status: "Delayed +22m", terminal: "T2", origin: "SFO" },
  JL809: { eta: "11:05", status: "Early -8m", terminal: "T1", origin: "HND" },
  KE185: { eta: "19:42", status: "On time", terminal: "T2", origin: "ICN" },
  SQ877: { eta: "21:15", status: "Boarding origin", terminal: "T1", origin: "SIN" },
};
