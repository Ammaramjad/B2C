import type { EventType, LiveEvent, LiveRole, Severity } from "./types";

let seq = 1;

export function resetEventSeq() {
  seq = 1;
}

export function makeEvent(
  clock: string,
  type: EventType,
  severity: Severity,
  audience: LiveRole[],
  title: string,
  body: string,
  extra: Partial<LiveEvent> = {},
): LiveEvent {
  return { id: `E-${seq++}`, at: Date.now(), clock, type, severity, audience, title, body, ...extra };
}

export function nowClock(d = new Date()) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
