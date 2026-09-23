# Zoufeng Signal OS — Implementation

**Status:** Design approved. First implementation increment.  
**Realtime:** Simulated GPS/traffic through production-shaped events. Labeled on the map.  
**Domain:** `src/lib/live/{capacity,rank,preferred,actions,scenario}` — booking, incident, and reassignment share the same rules.  
**APIs:** `/api/quote`, `/api/dispatch/candidates`, `/api/preferred/validate`  
**Store:** `placeBooking(override)` writes `ZF-*` bookings; live `assignedId` syncs onto the matching booking.

## Scenarios

1. ZF-82041 — Sarah Chen airport pickup, David Chen disruption, Jason Wu replacement.
2. Preferred driver — Sarah requests David; company validates; official offer; confirmation.

Play from the header on any screen, or `/demo`.
