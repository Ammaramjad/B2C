# Persistence contract

## Modes

| Adapter | Writes | Reads |
| --- | --- | --- |
| `demoPersist` | Browser `zf-signal-domain-v1` via `StoreProvider` | Same key; legacy read of `zoufeng-atlas-v1` |
| `productionPersist` | **Throws** until configured | **Throws** |

There is no silent fallback from production to demo.

## Entities

Booking, Trip (live snapshot + booking status), Driver offer, Incident, Preferred-company request, Payment, Cancellation, Wallet transaction, CRM note, Notification event.

See `src/lib/domain/persist.ts` for TypeScript shapes.

## Required server API (not implemented)

```
PUT  /v1/domain              body: DomainState
GET  /v1/domain
POST /v1/bookings
POST /v1/offers/:id/accept|reject
POST /v1/incidents
POST /v1/preferred/:id/transition
POST /v1/payments/:id/capture|refund
POST /v1/notes
POST /v1/notifications        # returns queued; delivered only after provider ack
```

Auth, idempotency keys, and multi-device sync are out of scope until credentials exist.

## Write rule

New writes always go to `zf-signal-domain-v1`. Legacy key is read-only compatibility.
