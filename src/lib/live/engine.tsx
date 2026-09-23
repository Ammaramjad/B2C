"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useStore } from "../store";
import {
  applyAcceptOffer,
  applyAck,
  applyArrive,
  applyCompleteTrip,
  applyConfirmAirport,
  applyDuty,
  applyIncident,
  applyNotify,
  applyPreferredRequest,
  applyPreferredStatus,
  applySendOffer,
  applySos,
  applyVerifyOtp,
} from "./actions";
import { resetEventSeq } from "./events";
import { animateTick, pickupBeat, preferredBeat } from "./scenario";
import { initialSnapshot, seedDrivers } from "./seed";
import type { LiveSnapshot } from "./types";

type LiveApi = {
  live: LiveSnapshot;
  play: () => void;
  pause: () => void;
  reset: (scenario?: LiveSnapshot["scenario"]) => void;
  step: () => void;
  setScenario: (s: LiveSnapshot["scenario"]) => void;
  reportIncident: (category: string, note: string) => void;
  sendReplacement: (driverId: string) => void;
  acceptReplacement: () => void;
  ackIncident: () => void;
  triggerSos: () => void;
  requestPreferred: (driverId: string) => void;
  validatePreferred: () => void;
  rejectPreferred: () => void;
  offerPreferred: () => void;
  acceptPreferred: () => void;
  confirmAirport: (input: {
    flight: string;
    pax: number;
    bags: number;
    vehicle: string;
    fare: number;
    bookingId?: string;
    name?: string;
  }) => void;
  setDuty: (driverId: string, duty: LiveSnapshot["drivers"][number]["duty"]) => void;
  markArrived: () => void;
  verifyOtp: (code: string) => boolean;
  completeTrip: () => void;
  notify: (title: string, body: string) => void;
};

const Ctx = createContext<LiveApi | null>(null);
const KEY = "zf-signal-live-v2";

export function LiveProvider({ children }: { children: ReactNode }) {
  const { assignDriver, bookings } = useStore();
  const [live, setLive] = useState<LiveSnapshot>(initialSnapshot);
  const tRef = useRef(0);
  const beat = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LiveSnapshot & { beat?: number };
        beat.current = parsed.beat ?? 0;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate shared event tape
        setLive({
          ...parsed,
          playing: false,
          drivers: (parsed.drivers ?? []).map((d) => ({ ...d, duty: d.duty ?? "online" })),
        });
      }
    } catch {
      /* ignore */
    }
    const on = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      const parsed = JSON.parse(e.newValue) as LiveSnapshot & { beat?: number };
      beat.current = parsed.beat ?? beat.current;
      setLive({ ...parsed, playing: false });
    };
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...live, beat: beat.current, playing: false }));
    } catch {
      /* ignore */
    }
  }, [live]);

  const step = useCallback(() => {
    setLive((s) => {
      const n = beat.current + 1;
      beat.current = n;
      return s.scenario === "preferred" ? preferredBeat(s, n) : pickupBeat(s, n);
    });
  }, []);

  useEffect(() => {
    if (!live.bookingId || !live.assignedId) return;
    const b = bookings.find((x) => x.id === live.bookingId);
    if (b && b.driverId !== live.assignedId) assignDriver(live.bookingId, live.assignedId);
  }, [assignDriver, bookings, live.assignedId, live.bookingId]);

  useEffect(() => {
    if (!live.playing) return;
    const id = window.setInterval(() => {
      setLive((s) => animateTick(s));
      tRef.current += 1;
      if (tRef.current % 5 === 0) step();
    }, 900);
    return () => window.clearInterval(id);
  }, [live.playing, step]);

  const api = useMemo<LiveApi>(
    () => ({
      live,
      play: () => setLive((s) => ({ ...s, playing: true })),
      pause: () => setLive((s) => ({ ...s, playing: false })),
      reset: (scenario) => {
        beat.current = 0;
        tRef.current = 0;
        resetEventSeq();
        localStorage.removeItem(KEY);
        setLive({ ...initialSnapshot(), scenario: scenario ?? "pickup", drivers: seedDrivers.map((d) => ({ ...d })) });
      },
      step,
      setScenario: (scenario) => {
        beat.current = 0;
        setLive({ ...initialSnapshot(), scenario });
      },
      reportIncident: (category, note) => setLive((s) => applyIncident(s, category, note)),
      sendReplacement: (driverId) => setLive((s) => applySendOffer(s, driverId)),
      acceptReplacement: () => setLive((s) => applyAcceptOffer(s)),
      ackIncident: () => setLive((s) => applyAck(s)),
      triggerSos: () => setLive((s) => applySos(s)),
      requestPreferred: (id) => setLive((s) => applyPreferredRequest(s, id)),
      validatePreferred: () => setLive((s) => applyPreferredStatus(s, "validating")),
      rejectPreferred: () => setLive((s) => applyPreferredStatus(s, "unavailable")),
      offerPreferred: () => setLive((s) => applyPreferredStatus(s, "offered")),
      acceptPreferred: () => setLive((s) => applyPreferredStatus(s, "confirmed")),
      confirmAirport: (input) => setLive((s) => applyConfirmAirport(s, input)),
      setDuty: (driverId, duty) => setLive((s) => applyDuty(s, driverId, duty)),
      markArrived: () => setLive((s) => applyArrive(s)),
      verifyOtp: (code) => {
        let ok = false;
        setLive((s) => {
          ok = code === s.otp;
          return applyVerifyOtp(s, code);
        });
        return ok;
      },
      completeTrip: () => setLive((s) => applyCompleteTrip(s)),
      notify: (title, body) => setLive((s) => applyNotify(s, title, body)),
    }),
    [live, step],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useLive() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("live");
  return ctx;
}
