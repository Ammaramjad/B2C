# Zoufeng Signal OS

Live mobility OS prototype (B2C). **Not production-ready.** GPS, flights, payments, and server persistence are demo or unconfigured.

## Run

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm start   # E2E against the production build
```

## Architecture

- App Router + React 19. Domain store: `zf-signal-domain-v1` (legacy read `zoufeng-atlas-v1`).
- Live tape: `zf-signal-live-v2`.
- Authoritative domain: `quote`, `cancelFee`, `vehicleFits`, `rankReplacements`, `validatePreferred`, offer + preferred state machines.

## Docs

- `docs/design/SIGNAL_OS.md`
- `docs/design/PHASE2_ROUTE_AUDIT.md`
- `docs/design/PHASE2_IMPLEMENTATION.md`
- `docs/integrations/PERSISTENCE_CONTRACT.md`
- `docs/integrations/INTEGRATION_MATRIX.md`

## Credentials still required

Production GPS/routing, flight vendor, PSP, server persist, auth, SMS/email/push.

Do not merge this branch to `main`.
