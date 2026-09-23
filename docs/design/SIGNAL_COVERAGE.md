# Signal OS route coverage matrix

Status: system-integration increment. **Not** a complete B2C redesign while Atlas-era leftovers or thin admin slices remain.

| Current route | Current function | Target Signal screen | Domain contract | Realtime events | Redesign? | Action |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Mobility home | `PassengerHome` | live snapshot | location / booking | reused | REUSE |
| `/book?service=airport_pickup` | Airport pickup | `AirportBook` | quote + placeBooking + confirmAirport | booking.created, payment.updated | no | REUSE |
| `/book?service=airport_drop` | Airport drop | `AirportDropBook` | quote + placeBooking | booking.created | yes | REPLACE form |
| `/book?service=p2p` | Point-to-point | `P2pBook` | quote + placeBooking | booking.created | yes | REPLACE form |
| `/book?service=hourly` | Hourly charter | `HourlyBook` | hours × rate | booking.created | yes | REPLACE form |
| `/book?service=instant` | Instant taxi | `InstantBook` | taxi catalog ETA | booking.created | yes | REPLACE form |
| `/book?service=rental` | Self-drive | `RentalBook` | days × day + extras | booking.created | yes | REPLACE form |
| `/live` | Live trip | `PassengerLive` | live tape | location, eta, notify | reused | REUSE |
| `/trips` `/trips/[id]` `/trips/[id]/success` | Trips / detail / pay | Signal trips | store bookings | payment.updated | reused | REUSE |
| `/preferred` | Preferred drivers | `PreferredDrivers` | validatePreferred API | preferred.* | reused | REUSE |
| `/wallet` `/loyalty` `/referral` `/planner` `/support` `/help` `/inbox` `/account` `/login` | Life surfaces | `life.tsx` | store + events | notification.created | yes | REPLACE Atlas |
| `/destinations` | City list | Signal list | catalog cities | none | yes | REPLACE |
| `/driver` | Duty | `DriverDutyHome` | applyDuty | driver.duty.changed | yes | REFACTOR |
| `/driver/offer` | Offers | `DriverOffer` | applyAcceptOffer | dispatch.offer.* | reused | REUSE |
| `/driver/run` `/pickup` `/otp` `/trip` | Job cycle | `DriverJobFlow` | arrive / OTP / complete | booking.status, trip.* | yes | REFACTOR |
| `/driver/incident` | Incident | `DriverIncident` | applyIncident | driver.incident.reported | reused | REUSE |
| `/driver/performance` | Scorecard | `DriverScore` | metrics.ts | incidents | yes | REPLACE |
| `/driver/earnings` `/settlement` `/documents` `/history` `/safety` `/inbox` `/support` | Driver OS rest | `driver-desk.tsx` | Driver + settlements | notify | yes | REPLACE |
| `/ops` | Command | `CommandCenter` | live + inspectors | all ops events | reused | REUSE |
| `/ops/dispatch` `/replace` | Dispatch / replace | `DispatchBoard` | rankReplacements | dispatch.* | reused | REUSE |
| `/ops/incident` | Incident | `IncidentCommand` | applyAck | incident / sos | reused | REUSE |
| `/ops/airport` `/flights` | Airport + board | `AirportCommand` `FlightOps` | live + flights catalog | flight.status.changed, eta.updated | yes | REFACTOR |
| `/ops/queue` | Booking queue | `BookingQueue` | store bookings | booking.status.changed | yes | REPLACE |
| `/ops/drivers` `/ops/drivers/[id]` | Directory / 360 | `DriverDirectory` `Driver360Page` | metrics + live GPS | location / duty | yes | REPLACE 360 |
| `/ops/fleet` `/vehicles` `/fleets` | Fleet / vehicles | Signal map + tables | drivers catalog | location | yes | REFACTOR |
| `/ops/manual` `/support` `/safety` `/exceptions` | Desks | `ops-desk.tsx` | store tickets / SOS | sos, payment | yes | REPLACE |
| `/admin/*` | Config / finance / CRM / analytics | `platform.tsx` | catalog, quote, cancelFee, store | audit via live tape | yes | REPLACE Atlas admin |
| `/design` `/demo` | Design gate | Signal design | director | scenario beats | reused | REUSE |

## Outstanding (do not call the redesign complete)

- Production GPS / routing / traffic vendor not wired (`productionProvider` throws).
- Late-minute / rejected-offer production metrics are **not** in the domain (`—` on scorecards).
- Atlas screens remain in `src/screens/{admin,ops,driver,passenger}` as unused fallbacks; not deleted.
- Destinations still lack live corridor demand.
- Admin feature flags / roles are documented, not an auth system.
- Partner settlements beyond `seedSettlements` are thin.
- NPS is not in the domain — customer analytics uses RFM counts only.
