# B2C International Mobility — Architecture assessment

**Mode:** Design-complete platform (all functions visible and wired to the client domain store).  
**Not in this increment:** Postgres, Stripe live keys, native WebSocket servers, SMS gateways. Those stay behind adapters.

---

## A. Existing architecture

| Layer | Today |
|---|---|
| App | Next.js 16.3.6, React 19, TypeScript, Tailwind 4 |
| State | Client `StoreProvider` + `localStorage` (`zoudian-v2030-web`) |
| Data | Seed catalogs in `src/lib/catalog.ts`, `data.ts`, `transfers.ts` |
| Auth | Demo login/signup roles: passenger, driver, ops, dispatcher |
| APIs | `/api/catalog`, `/api/quote`, `/api/promo/[code]`, `/api/fleet/summary`, `/api/health` |
| Map | Leaflet + OSM/Carto, moving cars |
| i18n | EN + 繁中 via `loc()` / small dict |
| Money | TWD settlement, USD display |
| Payments | Simulated card / LINE / Apple / cash — no PAN stored |

No SQL migrations, no Prisma, no real payment provider.

## B. Reusable modules

Unified `Booking` type, `quote()`, 6 services, extras, promos, cancel tiers, seed bookings, LiveMap, four shells (customer / driver / ops / admin), Klook-style `/cars` catalog, `/me` and `/driver` panels.

## C. Missing vs production spec

Server RBAC, canonical UTC persistence, payment tokens, WebSocket locations, flight provider adapter, wallet ledger tables, queue workers, GDPR export jobs, E2E CI, 10 named org roles.

## D. Target architecture (progressive)

```
UI (4 experiences)
  → Domain store / later API v1
    → Pricing engine (rules, not hard-coded)
    → Dispatch engine (score + timeout)
    → Booking state machine + audit
    → Adapters: payments, flights, maps, notify
```

Keep **one booking object**. Subtypes (hourly hours, rental days, flight) are fields — not new tables yet.

## E. Database later (not applied)

When approved: `users`, `bookings`, `booking_status_history`, `quotes`, `pricing_rules`, `dispatches`, `payments`, `wallet_transactions`, `audit_logs`. Soft-delete people; never rewrite financial rows.

## F. API later

Version as `/api/v1/*`. Current unversioned routes stay as fixtures.

## G. Frontend now

Show **all** admin/ops/customer/driver modules. Every control writes store + audit.

## H. RBAC (design matrix)

| Role | booking.* | dispatch.* | pricing.manage | payment.refund | driver.approve | system.configure |
|---|---|---|---|---|---|---|
| SUPER ADMIN | all | all | yes | yes | yes | yes |
| ADMIN | all | all | yes | yes | yes | yes |
| OPERATIONS | view/modify/assign | yes | no | no | no | no |
| DISPATCHER | view/assign | yes | no | no | no | no |
| CS | view | no | no | no | no | no |
| FINANCE | view | no | no | yes | no | no |
| FLEET | view | no | no | no | yes | no |
| DRIVER | own trips | accept/reject | no | no | no | no |
| PARTNER | fleet trips | no | no | no | no | no |
| CUSTOMER | own create/cancel | no | no | no | no | no |

## I. Phase 1 order (when production starts)

1 Canonical booking  2 Auth/RBAC  3 Three-step book  4 Capacity  5 Pricing 1.0  6 Payments adapter  7 Dispatch 1.0  8 Driver accept  9 Flight adapter  10 Ops console

## J. Risks

trycloudflare hostnames expire. No secrets in repo. Flight/payment adapters must fail closed.

## K. Checklist (design increment)

- [x] Assessment  
- [x] Pricing rules in store (not only hard-coded UI)  
- [x] Audit trail on assign/cancel/refund/config  
- [x] Admin: all modules visible  
- [x] Ops: live map + assign + incidents  
- [x] Customer + driver already present  
- [ ] Server DB / Stripe / WS (production phase)
