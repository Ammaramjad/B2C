# AI Mobility 2030 — Design Discovery

**Status:** Design foundation only. **Not approved for implementation.**  
**Product:** 走癲派車 / ZOUDIAN — B2C International Mobility Platform  
**Phase:** Design-only master prompt, Step 35 (discovery).  
**Next gate:** explicit human approval — `DESIGN APPROVED — BEGIN IMPLEMENTATION`

This document does **not** start production engineering, databases, payments, or APIs.

---

## 1. Existing UI assessment

The current Next.js demo (`src/app`, `src/components`, `src/lib`) is a **dark, neon-glass prototype** built to prove v10 product scope (6 services, NT$ quote, EN/ZH, three roles). It is useful as a **content inventory**, not as the 2030 visual system.

| Dimension | Current | Target (AI Mobility 2030) |
|---|---|---|
| Mood | Cyber / HUD / magenta–cyan glow | Calm, premium, spatial OS |
| Surfaces | Almost every block is a `.glass` card | Layered planes, whitespace, few cards |
| Color | `#030014` + cyan `#4ef2ff` + magenta `#ff4fd8` + lime | Midnight + cobalt + aqua accent; violet rare |
| Theme | Dark only | Dark first-class **and** Light |
| Motion | Continuous scanlines, spin-glow, hover lift | State-driven, reduced-motion safe |
| Typography | Outfit + Syne, Latin-only subsets | Variable CJK + Latin; metric numerals |
| Navigation | Marketing-ish top bar + 5-tab mobile | Four distinct product shells, same tokens |
| Maps | SVG HUD illustration (`LiveMap`) | Edge-to-edge map, floating HUD, bottom sheet |
| AI | Corner FAQ chat (`/help`) | Native “Ask / Plan / Explain” surfaces |
| Ops / Admin | One `/ops` tab strip, card KPI grid | Command-center map + progressive disclosure |
| Driver | Desktop page with many stats | One-hand mobile, one primary action |
| Accessibility | Weak contrast on muted text; color-only live dots | WCAG 2.1 AA, focus rings, non-color status |
| Roles | guest / passenger / driver / ops / dispatcher mixed in one shell | Four experiences, one language |

**Verdict:** Keep catalog *content* (services, extras, 9 states, 8 cities). **Retire** the current visual language as the production look. It reads as 2022–2024 “neon glass demo,” which the brief explicitly forbids.

---

## 2. Existing screens (as-built)

| Route | Role | What it is today |
|---|---|---|
| `/` | Public / customer | Hero HUD map + 6 service tiles + 6 entries + 8 city cards + extras list |
| `/book` | Customer | 3-step book (route / vehicle / pay) + side quote |
| `/instant` | Customer | 4 taxi classes, hail now |
| `/live` | Customer | Fleet list + live bookings |
| `/trips` | Customer | 5 tabs, list of glass panels |
| `/trips/[id]` | Customer | Live map, OTP, SOS, switch driver |
| `/destinations` | Public | City grid |
| `/destinations/[id]` | Public | City hero + one route CTA |
| `/planner` | Customer | Redirect copy to hourly book (AI planner not designed) |
| `/account` | Customer | Profile + company switch |
| `/wallet` | Customer | TWD/USD balances |
| `/loyalty` | Customer | Point tiers |
| `/help` `/support` | Customer | Chat FAQ + 8 categories |
| `/login` | System | 4 role buttons |
| `/driver` | Driver | Status + grab pool + jobs + earnings |
| `/ops` | Ops + Admin | Tabs: overview, orders, drivers, users, switch, finance, tickets, rules |

**Missing vs product brief:** dedicated dispatch spatial UI, admin IA (20+ modules), flight-aware airport story, booking-success command screen, passenger bottom-sheet live trip, itinerary canvas, light mode, empty/error/offline states, component library, map interaction system.

---

## 3. Existing reusable components

| File | Exports | Notes |
|---|---|---|
| `src/components/ui.tsx` | `Chip`, `Panel`, `Btn`, `Field`, `Stat` | Too few; `Panel` used as default container |
| `src/components/live-map.tsx` | `LiveMap` | Decorative SVG, not a map system |
| `src/components/charts.tsx` | `AreaChart`, `Bars` | Demo-only |
| `src/components/shell.tsx` | Global chrome | One shell for all roles |
| `src/app/globals.css` | Tokens `--bg --ink --cyan --violet --magenta --lime` | Incomplete semantic set; no light theme |

**Not present:** LocationInput, DateTime, VehicleSelector, Price, BookingStatus, FlightStatus, TripTimeline, BottomSheet, Drawer, CommandBar, AIInput, AISuggestion, Toast, Skeleton, EmptyState, DataTable, MapMarker, MapControls.

---

## 4. UX problems (design, not engineering)

1. **Homepage is a brochure.** Marketing sections (6 entries, extras price list) delay “Where are you going?”
2. **Everything is a card.** Hierarchy comes from borders, not space.
3. **Neon + grid + scanlines** compete with trip information.
4. **Four experiences share one chrome.** Driver and ops feel like passenger pages with more tables.
5. **Live trip is a two-column desktop form**, not map-first + sheet.
6. **Airport pickup does not tell the flight → arrival → driver → pickup story.**
7. **AI is a support chat**, not a planner workspace.
8. **Vehicle pick is a text list**, no capacity intelligence.
9. **Trips look like admin rows**, not passenger timelines.
10. **Ops overview is a KPI card wall**, not a command map.
11. **Dispatch is hidden inside order buttons**, no spatial assign panel.
12. **Admin and ops are the same page.**
13. **Driver home is information-dense** for one-hand use; grab + next-status compete.
14. **No light mode.** Dark-only feels “demo night.”
15. **Motion is decorative** and ignores `prefers-reduced-motion`.
16. **English/Chinese only in UI**; fonts do not load CJK.
17. **Status is color-only** (green live-dot).
18. **No designed empty / error / offline / no-drivers states.**
19. **Company switch policy is copy-heavy**, not a guided flow.
20. **Price breakdown is a 9-line dump**; should be progressive (total first, details on demand).

---

## 5. Complete proposed screen inventory

IDs are stable for design files and later prototypes. **Design only.**

### PUBLIC

| ID | Screen | Purpose |
|---|---|---|
| PUB-001 | Splash / brand moment | First paint, locale |
| PUB-002 | Customer home | Immediate mobility: where to |
| PUB-003 | Service explainer sheet | Airport / P2P / hourly / taxi / rental / planner |
| PUB-004 | City / corridor landing | SEO destination, still bookable |
| PUB-005 | Legal / privacy | Trust |

### CUSTOMER

| ID | Screen |
|---|---|
| CUS-001 | Home (signed-in) |
| CUS-002 | Recent / saved places |
| CUS-003 | Notifications |
| CUS-004 | Safety center |

### BOOKING

| ID | Screen |
|---|---|
| BOK-001 | Step 1 — Trip |
| BOK-002 | Location search / map pick |
| BOK-003 | Date-time + flight attach |
| BOK-004 | Step 2 — Ride / vehicle compare |
| BOK-005 | Capacity guidance (too small) |
| BOK-006 | Step 3 — Confirm + add-ons + pay method (simulated) |
| BOK-007 | Price explain (AI / breakdown sheet) |
| BOK-008 | Booking success command |
| BOK-009 | Instant taxi hail |
| BOK-010 | Hourly duration picker |
| BOK-011 | Rental days + extras |

### TRIPS

| ID | Screen |
|---|---|
| TRP-001 | My trips — Upcoming |
| TRP-002 | My trips — Active |
| TRP-003 | My trips — Completed |
| TRP-004 | My trips — Cancelled |
| TRP-005 | Trip detail (upcoming) |
| TRP-006 | Live trip (map + sheet) |
| TRP-007 | Flight-aware airport story |
| TRP-008 | OTP / boarding verify |
| TRP-009 | Share trip |
| TRP-010 | Modify time |
| TRP-011 | Cancel policy |
| TRP-012 | Rate 6 dimensions |
| TRP-013 | Company driver-switch request |

### AI PLANNER

| ID | Screen |
|---|---|
| AIP-001 | Planner home — “Plan my trip” |
| AIP-002 | Generative canvas (timeline + map + budget) |
| AIP-003 | Day editor |
| AIP-004 | Attraction add / reorder |
| AIP-005 | Transport requirement summary |
| AIP-006 | Confirm book transportation |

### ACCOUNT

| ID | Screen |
|---|---|
| ACC-001 | Account hub |
| ACC-002 | Profile (English names never translated) |
| ACC-003 | Passengers |
| ACC-004 | Saved places |
| ACC-005 | Payment methods (visual only) |
| ACC-006 | Preferences / language / currency |
| ACC-007 | Loyalty membership |
| ACC-008 | Wallet credits |
| ACC-009 | Notifications & security |

### DRIVER

| ID | Screen |
|---|---|
| DRV-001 | Home — online/offline |
| DRV-002 | Incoming job (dominant) |
| DRV-003 | Going to pickup |
| DRV-004 | Arrived |
| DRV-005 | Passenger verify |
| DRV-006 | Trip started |
| DRV-007 | Complete |
| DRV-008 | Earnings today / week |
| DRV-009 | Settlement |
| DRV-010 | Documents (visual) |
| DRV-011 | Grab pool (secondary) |
| DRV-012 | Offline / no signal |

### OPERATIONS / DISPATCH

| ID | Screen |
|---|---|
| OPS-001 | Control center (live map + context) |
| OPS-002 | Spatial dispatch |
| OPS-003 | Order inspector panel |
| OPS-004 | Eligible drivers + AI recommend |
| OPS-005 | Reassign / override |
| OPS-006 | Flight alerts |
| OPS-007 | Incidents / SOS |
| OPS-008 | Unassigned queue |
| OPS-009 | Alert center (Critical / Attention / Info) |
| OPS-010 | Phone-in create booking (dispatcher) |

### SUPPORT

| ID | Screen |
|---|---|
| SUP-001 | Help home (8 categories) |
| SUP-002 | Contextual AI help |
| SUP-003 | Ticket compose |
| SUP-004 | Ticket thread |

### ADMIN

| ID | Screen |
|---|---|
| ADM-001 | Overview |
| ADM-002 | Bookings |
| ADM-003 | Customers |
| ADM-004 | Drivers |
| ADM-005 | Vehicles |
| ADM-006 | Fleet / partners |
| ADM-007 | Pricing rules (visual) |
| ADM-008 | Payments / settlements (visual) |
| ADM-009 | Flights |
| ADM-010 | Support queue |
| ADM-011 | CRM |
| ADM-012 | Loyalty config |
| ADM-013 | Content |
| ADM-014 | Configuration |
| ADM-015 | Users / roles |
| ADM-016 | Audit log |

### FINANCE / CRM / ANALYTICS / SYSTEM

| ID | Screen |
|---|---|
| FIN-001 | GMV / settlements board |
| CRM-001 | Passenger 360 |
| ANL-001 | Executive analytics |
| ANL-002 | Operational analytics |
| SYS-001 | Login / OAuth visual |
| SYS-002 | 4-role gate |
| SYS-003 | Loading / empty / error / offline / permission / no-drivers / AI unavailable |

**Count:** ~90 designed surfaces (including states). Design in ID order within each family.

---

## 6. Proposed information architecture

```
ZOUDIAN 2030
├── Customer OS          (mobile-first)
│   ├── Go               Home: Where are you going?
│   ├── Book             3-step + instant / hourly / rental
│   ├── Live             Active trip only (empty → planner)
│   ├── Trips            Upcoming / Active / Done / Cancelled
│   └── You              Account + loyalty + wallet + help
├── Driver OS            (mobile-first, one-hand)
│   ├── Duty             Online + next job
│   ├── Navigate         Map-first active trip
│   └── Pay              Earnings / settlement
├── Operations OS        (desktop-first)
│   ├── Map              Live mesh
│   ├── Dispatch         Spatial assign
│   ├── Alerts           Priority inbox
│   └── Queue            Unassigned / phone-in
└── Admin OS             (desktop-first)
    ├── Today            Overview
    ├── Network          Bookings, people, fleet
    ├── Commerce         Pricing, pay, settle (visual)
    ├── Care             Support, CRM, loyalty
    └── System           Config, roles, audit
```

**Shared objects:** Booking, Trip, Driver, Vehicle, Flight, Invoice (visual), Ticket.  
**Cross-experience rule:** same tokens, same status language, different composition.

**Customer journey (design):** Discover → Where → Service → Vehicle → Confirm → Success → Assign → Live / Airport story → Complete → Rate → Loyalty.

**Driver journey:** Offline → Online → Incoming (accept/decline) → To pickup → Arrived → OTP → Onboard → Complete → Earnings.

**Operations journey:** Watch map → Alert or unassigned → Inspect → AI suggest → Assign / override → Monitor flight/SOS → Close.

**Admin journey:** Overview → drill module via progressive nav → inspect record → configure rule (visual) → audit.

---

## 7. Proposed “AI Mobility 2030” visual direction

**Name:** AI Mobility 2030  
**Metaphor:** A quiet airport control glass — not a nightclub, not a game HUD.

**Principles**

1. **Map is architecture**, not a widget. Customer live + ops + driver: edge-to-edge.
2. **Whitespace is a feature.** One focal action per viewport.
3. **Surfaces, not boxes.** Soft elevation, 1px hairline only when needed.
4. **Intelligence is inline.** Suggestions sit next to the decision, not in a chat bubble by default.
5. **Calm data.** Metrics are large type, not chrome.
6. **International quiet luxury.** English names stay Latin; CJK is first-class, not an afterthought.
7. **Trust over spectacle.** SOS, OTP, price, flight status get more visual weight than decoration.

**Anti-patterns (banned in design files)**

- Neon outlines on every card  
- Magenta scanlines / cyber grid  
- Full-page glass panels  
- Rainbow gradient buttons  
- Bootstrap table as the passenger trip list  
- Gaming achievement badges for loyalty  

**Reference tone (not clones):** mature maps (Apple Maps / Uber 2026 restraint) + editorial type + spatial HUDs used *sparingly*.

---

## 8. Proposed color / token system

Semantic tokens only. Values are **design direction** for Figma/CSS later — not production theme code in this phase.

### Dark (default, first-class)

| Token | Role | Direction |
|---|---|---|
| `bg` | Background | Deep midnight `#0B1016` (not purple-black) |
| `surface` | Default plane | Carbon `#121820` |
| `surface.elevated` | Sheets, HUD | `#1A222C` @ 80% + blur 20 |
| `text.primary` | Body | `#F3F6F8` |
| `text.secondary` | Meta | `#8B97A5` |
| `border` | Hairline | `#FFFFFF14` |
| `primary` | Actions | Electric cobalt `#2F6BFF` |
| `secondary` | Quiet action | Slate `#3D4A58` |
| `ai` | Intelligence | Aqua `#3EE0C8` |
| `accent.violet` | Rare emphasis | `#7A6CFF` (AI canvas only) |
| `success` | OK | `#2BB673` |
| `warning` | Attention | `#E0A lap` → `#E0A14B` |
| `danger` | SOS / fail | `#E24B4B` |
| `info` | Neutral notice | `#4C8DFF` |
| `live` | Live pulse | `#3EE0C8` + motion, **plus** label “LIVE” |
| `status.assigned` | Driver assigned | Cobalt chip + icon |
| `status.active` | Trip active | Aqua chip + icon |
| `status.completed` | Done | Success + check |
| `status.cancelled` | Cancelled | Neutral + strike, not only red |

### Light

| Token | Direction |
|---|---|
| `bg` | Warm paper `#F4F6F8` |
| `surface` | `#FFFFFF` |
| `surface.elevated` | White + shadow y:8 blur:24 `#0B101614` |
| `text.primary` | `#121820` |
| `text.secondary` | `#5C6773` |
| `primary` | `#2458E0` (slightly deeper for contrast) |
| `ai` | `#0F9E8A` |

Do **not** invert dark purple into light purple. Light is a daylight ops/customer mode.

**Usage rules:** Primary for one CTA. AI aqua only on AI surfaces and live. Violet ≤ 5% of a screen. No gradient fills on large areas; optional 8% wash behind maps.

---

## 9. Typography direction

**Families (to specify in design system, not ship yet)**

- **Latin / numbers:** Variable grotesque — *Inter* or *Geist* (body), *Geist Mono* or *tabular Inter* for metrics.  
- **CJK:** *Noto Sans TC / SC / JP / KR* — same weights, never auto-translate English person names.

**Scale (rem @ 16)**

| Role | Size / weight | Use |
|---|---|---|
| Display | 40–56 / 560 | Home “Where are you going?” |
| H1 | 32 / 560 | Screen title |
| H2 | 24 / 520 | Section |
| H3 | 20 / 520 | Card-less group |
| Title | 17 / 560 | List primary |
| Body | 16 / 400 | Default |
| Label | 12 / 520 · +2% tracking | Field, status |
| Caption | 12 / 400 | Secondary |
| Metric | 28–40 / 560 tabular | ETA, price, GMV |
| Navigation | 13 / 520 | Tabs |
| Button | 16 / 560 | CTA |

Line length ≤ 68ch on reading surfaces. Trip price and ETA always tabular lining numerals.

---

## 10. Customer navigation architecture

**Mobile (primary):** 5 destinations only.

| Tab | Default | Empty |
|---|---|---|
| Go | Home + map + “Where?” | — |
| Book | Resume draft or new trip | Start BOK-001 |
| Live | Active trip map | Soft empty → Plan / Book |
| Trips | Upcoming first | Illustration + book |
| You | Hub | Sign in |

**Desktop:** Same IA. Left or top **text nav**, not a marketing mega-menu. Booking uses **main + contextual summary rail**. Live uses **map canvas + right inspector**.

**Global overlays:** AI command (`Ask` / `Explain price` / `Plan`), Safety, Language/currency.

**Not in chrome:** Destinations marketing, wallet, loyalty (live under You).

---

## 11. Driver navigation architecture

**Mobile-only composition (tablet = large phone).**

| Tab | Role |
|---|---|
| Duty | Online toggle, today earnings, next booking |
| Job | Active trip **or** incoming request (full takeover) |
| Pay | Today / week / settlement |

**Incoming job** is a **modal layer**, not a list row.  
**One primary button** per state: Accept → Arrived → Verify → Start → Complete. Decline is secondary.

Grab pool is **not** a tab; it is a sheet on Duty when idle.

---

## 12. Operations navigation architecture

**Desktop-first. Large display optional.**

```
[ Alert rail ] [ Live map 60–70% ] [ Context panel 30–40% ]
[ Collapse: queue / flights / incidents ]
```

Top command bar: search booking / driver / flight.  
Left **icon rail** (Map, Dispatch, Alerts, Queue, Phone-in) — not a 20-item sidebar.

Selecting a pin opens the **dispatch panel** (eligible drivers, AI score highlighted, assign / override).

---

## 13. Admin navigation architecture

Same tokens as Ops, **denser type**, tables allowed.

**Progressive sidebar groups** (one group expanded):

1. Today — Overview, Analytics  
2. Network — Bookings, Dispatch (deep-link Ops), Customers, Drivers, Vehicles, Fleet, Partners  
3. Commerce — Pricing, Payments, Settlements  
4. Care — Support, CRM, Loyalty, Flights  
5. System — Content, Configuration, Users, Roles, Audit  

Default: Overview + last-used module. Never 20 links permanently open.

---

## 14. Design implementation sequence

**Do not code production until the approval line.** Sequence for **design files / clickable prototype only:**

| Step | Deliverable | Exit |
|---|---|---|
| 1 | This discovery (done) | Review |
| 2 | IA diagrams + journey maps (CUS / DRV / OPS) | Review |
| 3 | Tokens: color, type, space 4/8/12/16/24/32/48, radius 4/8/12/20, elevation 0–3, blur 8/20 | Review |
| 4 | Icon family spec (Lucide-compatible geometric set) | Review |
| 5 | Component library frames + all states | Review |
| 6 | Customer: Home → Book 3-step → Success → Trips → Live + Airport | Review |
| 7 | AI Planner canvas | Review |
| 8 | Driver: Duty → Incoming → Active states → Earnings | Review |
| 9 | Ops command + dispatch + alerts | Review |
| 10 | Admin overview + 2 dense modules (Bookings, Drivers) as pattern | Review |
| 11 | Responsive: 390 / 768 / 1280 / 1600 / 2560 ops wall | Review |
| 12 | Light + dark on 6 signature screens | Review |
| 13 | SYS-003 states | Review |
| 14 | Motion + a11y spec | Review |
| 15 | Clickable prototype navigation (frontend mock **if requested**) | Review |
| 16 | Consistency audit + this folder updated | **STOP** |

**After Step 16: wait.**  
Resume engineering only after: **`DESIGN APPROVED — BEGIN IMPLEMENTATION`**

---

## Design review rule (reaffirmed)

- No production backend, migrations, payment processing, or new public APIs in this phase.  
- Existing demo APIs stay frozen; they are not the design system.  
- Frontend work after approval of *this foundation* may be **prototype-only** (static routes, mock data) when the next design task asks for screens — not before this review.

---

## Open questions for stakeholders (non-blocking)

1. Confirm brand lock: 走癲 / ZOUDIAN vs 走丰 / ZOUFENG on chrome.  
2. Light mode required at launch for customer only, or all four OS?  
3. Map vendor preference for *visual* mock (neutral tiles vs branded).  
4. Loyalty visual: metal card vs quiet progress only.

---

*End of discovery. Awaiting design review.*
