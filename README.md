# Zoufeng Signal — Live Mobility OS

Design-checkpoint prototype. **Not approved for production implementation.**

This is a realtime, map-first operating system preview:

- Passenger live pickup
- Driver incident + duty
- Operations command / airport / replacement
- Two connected scenarios (ZF-82041 disruption, preferred driver)

GPS and traffic in this preview are **simulated** through the same event names production will use.

## Run

```bash
npm install
npm run dev
```

- `/design` — inventory, motion, map approach
- `/demo` — scenario director
- `/` `/book` `/live` `/preferred`
- `/driver` `/driver/incident`
- `/ops` `/ops/incident` `/ops/replace`

Header: Play scenario / Next beat / Reset.

```bash
npm run lint
npm run build
```
