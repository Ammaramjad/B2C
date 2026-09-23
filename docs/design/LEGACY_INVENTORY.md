# Legacy inventory (Phase 1)

| Path | Class | Action |
| --- | --- | --- |
| `src/screens/signal/*` | REUSED | Signal OS product |
| `src/components/signal/*` | REUSED | Chrome + maps |
| `src/lib/atlas.ts` | REFERENCE ONLY | Old 47-screen inventory / copy |
| `src/screens/passenger/*` | SUPERSEDED | Unused by App Router |
| `src/screens/admin/*` | SUPERSEDED | Unused |
| `src/screens/ops/*` | SUPERSEDED | Unused |
| `src/screens/driver/*` | SUPERSEDED | Unused leftover invented KPIs |
| `src/components/atlas/*` | SUPERSEDED | Unused |
| `src/components/live-map.tsx` | SUPERSEDED | Decorative SVG |
| `zoufeng-atlas-v1` localStorage | MIGRATED | Read once, write `zf-signal-domain-v1` |
