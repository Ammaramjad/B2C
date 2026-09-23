# Integration matrix

| Concern | Status | Notes |
| --- | --- | --- |
| GPS | SIMULATED/DEMO | `simulationProvider`. Labeled simulated realtime. |
| Routing | SIMULATED/DEMO | Local polyline / haversine. |
| ETA | SIMULATED/DEMO | Derived from distance, not a vendor. |
| Traffic | SIMULATED/DEMO | Event-tape flags. |
| Road incidents | SIMULATED/DEMO | Tape + driver report. |
| Flight lookup | SIMULATED/DEMO + AWAITING CREDENTIALS | `productionFlightProvider` throws. |
| Payment authorization | SIMULATED/DEMO + AWAITING CREDENTIALS | Demo ledger states. Production PSP throws. |
| Payment capture/refund | SIMULATED/DEMO + AWAITING CREDENTIALS | Same. |
| Server persistence | AWAITING CREDENTIALS / NOT IMPLEMENTED | `productionPersist` throws. |
| Authentication | NOT IMPLEMENTED | `/login` is a local role switch. |
| Maps/tiles | REAL (OSM/Esri tiles) | No paid vendor. |
| Notifications | SIMULATED/DEMO | Status stays `generated` unless a provider confirms. |

Do not describe a simulated integration as real.
