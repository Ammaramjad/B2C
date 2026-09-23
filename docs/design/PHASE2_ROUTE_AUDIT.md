# Phase 2 route audit

Classification is behavioral, not visual. COMPLETE requires real domain writes or an explicit unavailable production adapter.

Product routes counted: **85** (App Router `page.tsx` files + destination dynamic).

## Summary (after Phase 2)

| Class | Count |
| --- | ---: |
| COMPLETE | 28 |
| PARTIAL | 43 |
| PLACEHOLDER | 0 |
| LEGACY | 0 |
| DEMO | 4 |
| REDIRECT / alias | 6 |
| DEAD | 0 |

Demo: `/demo`, `/design`, `/login` (local role switch), `/instant` (alias of book instant).

Redirect/alias: `/ops/replace` → dispatch board, `/ops/fleet` → live map, several admin growth pages share `CrmGrowth`.

## COMPLETE (working domain or labeled adapter)

`/`, `/book` (six services), `/live`, `/preferred`, `/ops/preferred`, `/driver/offer`, `/driver/incident`, `/ops/incident`, `/ops/replace`, `/ops/dispatch`, `/trips`, `/trips/[id]`, `/trips/[id]/success`, `/share/[token]`, `/admin/pricing`, `/admin/cancellation`, `/admin/capacity`, `/admin/payments`, `/admin/wallet`, `/admin/crm`, `/admin/notifications`, `/admin/i18n`, `/ops/fleets`, `/destinations`, `/destinations/[id]`, `/ops`, `/admin/integrations`, `/admin/roles` (docs-only, explicitly unavailable auth).

## PARTIAL (renders real data but missing production or secondary actions)

Passenger life: `/account`, `/wallet`, `/loyalty`, `/referral`, `/inbox`, `/planner`, `/help`, `/support`.

Driver desk: `/driver`, `/driver/run`, `/driver/pickup`, `/driver/otp`, `/driver/trip`, `/driver/performance`, `/driver/history`, `/driver/earnings`, `/driver/settlement`, `/driver/inbox`, `/driver/safety`, `/driver/support`, `/driver/documents`.

Ops: `/ops/airport`, `/ops/flights`, `/ops/queue`, `/ops/drivers`, `/ops/drivers/[id]`, `/ops/vehicles`, `/ops/exceptions`, `/ops/manual`, `/ops/safety`, `/ops/support`.

Admin: `/admin`, `/admin/services`, `/admin/vehicles`, `/admin/airports`, `/admin/dynamic`, `/admin/dispatch`, `/admin/audit`, `/admin/refunds`, `/admin/settlements`, `/admin/recon`, `/admin/analytics`, `/admin/loyalty`, `/admin/promotions`, `/admin/referrals`.

These stay PARTIAL because GPS/PSP/auth/server persist are unconfigured, or because they inspect catalog/live without a full write path.

## PLACEHOLDER

**0.** Roles, growth tables, and fleet companies are either implemented against domain/catalog or marked unavailable.

## Booking chain source of truth

Passenger book → `placeBooking` + demo payment → success (`resolveBooking`) → live tape (`bindBooking` / `confirmAirport`) → incident (`applyIncident` + `rankReplacements`) → offer machine → accept/reject/expiry → passenger notice → cancel (`cancelFee`) → finance ledger → CRM notes.

`ZF-82041` is only synthesized when the requested id **and** `live.bookingId` are the seed tape id.
