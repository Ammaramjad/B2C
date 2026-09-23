# Phase 2 implementation

Branch: `cursor/zoufeng-b2c-phase2-1603` from Phase 1 `4cb48cf`.

## Architecture

Signal OS live tape (`zf-signal-live-v2`) remains the movement clock. Domain store (`zf-signal-domain-v1`) holds bookings, offers, payments, wallet, notes, shares, translations.

Authoritative functions: `quote()`, `cancelFee()`, `vehicleFits()`, `rankReplacements()`, `validatePreferred()`, plus new machines in `offer.ts` and `preferred-flow.ts`.

## Domain / state

- `resolveBooking` synthesizes ZF-82041 only for that exact tape id.
- Offer states: created → offered → viewed → accepted|rejected|expired|withdrawn. Expired cannot accept.
- Preferred: pending → under_review → validated → company_offered → driver_offered → confirmed. Immediate confirm blocked.
- Incident reject → `nextReplacementCandidate` → new offer → accept reassigns the same booking.
- Payments/wallet are typed; finance totals are derived.
- Share tokens expire; invalid tokens do not fall back to the live tape.

## Demo fixtures retained

- Seed bookings `ZD-1801`… and tape `ZF-82041`.
- Punctuality `PU-1`…`PU-3`.
- Live drivers D-118 / D-221 / D-308.
- Translation desk seed rows.

## E2E (production `npm start` :3012)

A–R all passed, plus 390/768/1024/1440 booking viewport checks. Script: `scripts/e2e-phase2.mjs`.

## Remaining production blockers

Server persistence, authentication, production GPS/routing/ETA, flight vendor, PSP credentials, notification providers, fleet write API.
