# Zoufeng Design Foundation — Audit and Specification

**Repository:** Ammaramjad/B2C only  
**Branch:** `cursor/mobility-os-foundation-3654`  
**Baseline:** Product Blueprint v12.1  
**Milestone:** Design foundation (stop for review — not all 26 modules)

This document is the required pre-implementation analysis. Implementation that follows is limited to the foundation screens and shared system.

---

## 1. Existing architecture audit

The current app is a Next.js 16 App Router client prototype (`zoufeng-app`).

| Layer | Today | Verdict |
|---|---|---|
| Experience | One `Shell` for passenger, driver, ops, admin | Rebuild into role shells |
| State | React context + `localStorage` key `zoudian-v2030-web` | Keep as **demo adapter** only; not a production DB |
| Domain | `Booking` in `src/lib/types.ts` | Sound core; missing stops, timezone, safety, refund, designated driver, referral, audit |
| Pricing | `quote()` in `src/lib/pricing.ts` + catalog constants | Reuse; move commercial knobs toward `policy` |
| Dispatch | Sort available drivers by fleet A>B>C + rating | Keep as Dispatch 1.0 seed; add explainability |
| APIs | `/api/quote`, `/catalog`, `/promo`, `/fleet/summary`, `/health` | Keep contracts |
| Maps | Decorative SVG `LiveMap` | Replace with operational map adapter + demo fallback |
| i18n | EN/ZH via `loc()` + small dict | Keep pattern; expand strings |
| Auth/RBAC | Email-string role login | Demo only; document real RBAC |

**Preserve:** catalog baselines (vehicles, taxi, rental, extras, night 20%, hourly NT$880), `quote()`, `cancelFee()`, seed bookings/drivers, flight stubs, store mutations, API routes.

**Do not treat localStorage as production source of truth.**

---

## 2. Existing route inventory

| Route | Role | Keep / redesign |
|---|---|---|
| `/` | Passenger | Redesign — Mobility Hub |
| `/book` | Passenger | Redesign — 3-step Journey / Ride / Confirm |
| `/instant` | Passenger | Fold into book service context |
| `/live` | Passenger | Redirect to trips / live trip |
| `/trips`, `/trips/[id]`, `/trips/[id]/success` | Passenger | Redesign trip detail |
| `/planner` | Passenger | Redesign AI workspace |
| `/destinations`, `/destinations/[id]` | Public | Keep for SEO later (M22) |
| `/account`, `/wallet`, `/loyalty` | Passenger | Keep routes; restyle later |
| `/help`, `/support` | Passenger | Keep |
| `/login` | System | Restyle lightly |
| `/driver` | Driver | Redesign home + split offer/trip |
| `/ops` | Ops | Redesign command center |
| `/admin` | Admin | Keep; pricing/config moves to `/ops/pricing` |
| `/design` | Internal | Point to this foundation |

---

## 3. Module coverage matrix (M01–M26)

| Module | Coverage now | Foundation action |
|---|---|---|
| M01 Unified booking | Partial Booking type | Canonical model + shared identity |
| M02 3-step booking | Exists, weak IA | Rebuild UX |
| M03 Pricing 1.0 | Working quote + breakdown | Reuse engine; transparent UI |
| M04 Dispatch 1.0 | Basic A>B>C | Explain “why this driver” |
| M05 Payment | Simulated methods | Labeled sandbox, itemized checkout |
| M06 Flight | Stub `flights` map | Prominent flight strip |
| M07 Ops console | Tabbed KPI page | Command center + inspector |
| M08 Membership/account | Basic | Profile link only |
| M09 Driver flow | Single page | Home / offer / active trip |
| M10 Charter | Hours 4–12 | Dedicated inputs in book |
| M11 Cancel/refund | `cancelFee` + mid % | Policy object + pre-confirm copy |
| M12 Flight protection | 45-min wait constant | Configurable policy display |
| M13 i18n | EN/ZH | Tokens + locale switch |
| M14 Settlement | Seed earnings | Driver home numbers |
| M15 Live/SOS | OTP + SOS on trip | Map + safety actions |
| M16 AI planner | Thin redirect | Visual DIY editor, no auto-purchase |
| M17 Dynamic pricing 2.0 | Surge flag only | Config screen + shadow note |
| M18 Dispatch 2.0 | Not built | Ops explanation panel only |
| M19 Partners | Labels only | Adapter boundary note |
| M20 Wallet/FX | TWD/USD display | Display only |
| M21 Support AI | FAQ chat | Out of foundation scope |
| M22 SEO/AEO | Destinations | Later |
| M23 Analytics | KPI cards | Overview with labeled demo data |
| M24 Loyalty/CRM | Points page | Later |
| M25 Designated driver | lastDriverId + switch | Preference on checkout |
| M26 Referral | Code on user | Display + labeled prototype |

---

## 4. Existing design weaknesses

Dark neon HUD, glass everywhere, decorative map, equal-weight cards, one chrome for all roles, weak mobile driver UX, KPI walls in ops, status-as-color, buried flight data, capacity warning too weak, AI as chat not workspace.

---

## 5–8. Information architecture

**Passenger:** Home · Book · Trips · Planner · You  
Tasks, never “M17”.

**Driver:** Today · Offer · Trip · Earnings (today numbers on home)

**Operations:** Canvas · Fleet · Pricing · Analytics  
Inspector is a pane, not a new page, for the selected booking.

---

## 9. Canonical Booking Model (proposal)

Single `Booking` identity for all six services. Required fields already present: id, service, channel, passenger, pickup/drop, when, vehicle, pax/luggage, extras, driver, price, payment, status, timestamps.

Foundation adds (optional, non-breaking): `timezone`, `stops[]`, `flightMeta`, `safety` (otp/sos), `refund`, `designatedDriver`, `referralCode`, `audit[]`.

No parallel reservation tables.

---

## 10. State machine (proposal)

Canonical display: Draft → Pending payment → Confirmed → Searching → Assigned → En route → Arrived → In progress → Completed.

Operational: Cancelled, Refund pending, Refunded, Exception.

Existing stored statuses remain; UI maps them. Transitions must be validated (`canTransition`). Foundation writes actor + time on advance.

---

## 11. Design-system specification

**Mood:** 2028–2030 premium travel OS. Paper, ink, forest-teal accent. Calm, precise, spatial.

**Not:** neon glass, crypto, Bootstrap admin, cloned Klook/Uber.

**Tokens:** brand, surface, elevated, text primary/secondary, border, success/warning/danger/info, map, chart, disabled.

**Type:** DM Sans + Noto Sans TC + IBM Plex Sans numerals.

**Theme:** Light first; dark available, not “futuristic.”

**Components:** Button, Field, Price, Notice, Stepper, Timeline, Data row, Inspector section, Operational map, Empty/Error.

**Cards:** only for vehicles, trips, offers, itinerary days, wallet.

---

## 12–13. Screen and component inventory (this milestone)

Screens 1–14 listed in the brief. Shared: Passenger/Driver/Ops shells, operational map, quote rail, booking inspector, vehicle option, flight strip.

---

## 14. Technical architecture

Modular monolith. Experience: passenger / driver / ops. Domain: booking, pricing, dispatch, policy, matching. Adapters: storage (local demo), maps (fallback), flights (stub), payments (sandbox). GCP/prod credentials out of scope.

---

## 15. Reuse vs rebuild

| Reuse | Rebuild |
|---|---|
| `quote`, `cancelFee`, catalog prices | Visual language |
| Store booking/dispatch mutations | Shells |
| Seed data, APIs | Map presentation |
| EN/ZH `loc` | Home, book, trip, planner, driver, ops |

---

## 16. Implementation sequence

1. Domain (policy, matching, state machine)  
2. Tokens + primitives  
3. Shells + map adapter  
4. 14 foundation screens  
5. Lint / build / visual review — **STOP**

---

## 17. Risks / dependencies

No map/payment/flight credentials. Demo data must be labeled. localStorage is not production. Do not pretend Week-8 production gate is met.

---

## 18. Definition of Done — design foundation

The 14 screens exist, respond (passenger mobile / driver phone / ops desktop), use tokens, keep quote/booking working, label mocks, pass lint+build, document gaps. Not a complete 26-module product.
