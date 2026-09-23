"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useStore } from "../store";
import { phaseToStatus } from "../domain/booking";
import {
  applyAcceptOffer,
  applyAck,
  applyArrive,
  applyBindBooking,
  applyCompleteTrip,
  applyConfirmAirport,
  applyDuty,
  applyExpireOffer,
  applyIncident,
  applyNotify,
  applyPreferredRequest,
  applyPreferredStatus,
  applyRejectOffer,
  applySendOffer,
  applyShareTrip,
  nextReplacementCandidate,
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
  cancelPreferred: () => void;
  offerPreferred: () => void;
  acceptPreferred: () => void;
  sendNextReplacement: () => void;
  confirmAirport: (input: {
    flight: string;
    pax: number;
    bags: number;
    vehicle: string;
    fare: number;
    bookingId?: string;
    name?: string;
  }) => void;
  bindBooking: (input: {
    bookingId: string;
    service: string;
    pickup: string;
    dropoff: string;
    fare: number;
    flight?: string;
    name?: string;
    chauffeur: boolean;
  }) => void;
  rejectOffer: (driverId?: string) => void;
  shareTrip: () => string;
  setDuty: (driverId: string, duty: LiveSnapshot["drivers"][number]["duty"]) => void;
  markArrived: () => void;
  verifyOtp: (code: string) => boolean;
  completeTrip: () => void;
  notify: (title: string, body: string) => void;
};

const Ctx = createContext<LiveApi | null>(null);
const KEY = "zf-signal-live-v2";

export function LiveProvider({ children }: { children: ReactNode }) {
  const { assignDriver, bookings, patchBooking, recordReject, createShare } = useStore();
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
          offerExpiresAt: parsed.offerExpiresAt ?? null,
          offerRemainSec: parsed.offerRemainSec ?? null,
          offerStatus: parsed.offerStatus ?? null,
          rejectedOfferIds: parsed.rejectedOfferIds ?? [],
          offerKind: parsed.offerKind ?? null,
          shareToken: parsed.shareToken ?? null,
          rejects: parsed.rejects ?? {},
          drivers: (parsed.drivers ?? []).map((d) => ({ ...d, duty: d.duty ?? "online" })),
          preferred: parsed.preferred
            ? { ...parsed.preferred, customer: parsed.preferred.customer ?? parsed.passenger }
            : null,
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
    if (!live.bookingId) return;
    const b = bookings.find((x) => x.id === live.bookingId);
    const status = phaseToStatus(live.phase);
    if (!b) return;
    if (live.assignedId && b.driverId !== live.assignedId) assignDriver(live.bookingId, live.assignedId);
    if (b.status !== status && b.status !== "cancelled") patchBooking(live.bookingId, { status, driverId: live.assignedId ?? b.driverId, pickup: live.pickup, dropoff: live.dropoff, flight: live.flight, price: live.fare || b.price });
  }, [assignDriver, bookings, live.assignedId, live.bookingId, live.dropoff, live.fare, live.flight, live.phase, live.pickup, patchBooking]);

  useEffect(() => {
    if (!live.offerExpiresAt) return;
    const id = window.setInterval(() => {
      setLive((s) => {
        const next = applyExpireOffer(s);
        if (!next.offerExpiresAt) return next;
        return { ...next, offerRemainSec: Math.max(0, Math.ceil((next.offerExpiresAt - Date.now()) / 1000)) };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [live.offerExpiresAt]);

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
      sendReplacement: (driverId) => setLive((s) => applySendOffer(s, driverId, "replacement")),
      acceptReplacement: () => setLive((s) => applyAcceptOffer(s)),
      sendNextReplacement: () =>
        setLive((s) => {
          const nxt = nextReplacementCandidate(s);
          return nxt ? applySendOffer(s, nxt.id, "replacement") : s;
        }),
      rejectOffer: (driverId) =>
        setLive((s) => {
          const next = applyRejectOffer(s, driverId);
          recordReject(driverId ?? s.offerTo ?? s.assignedId ?? "D-118", s.bookingId);
          return next;
        }),
      shareTrip: () => {
        const rec = createShare(live.bookingId);
        setLive((s) => applyShareTrip(s, rec.token));
        return rec.token;
      },
      bindBooking: (input) => setLive((s) => applyBindBooking(s, input)),
      ackIncident: () => setLive((s) => applyAck(s)),
      triggerSos: () => setLive((s) => applySos(s)),
      requestPreferred: (id) => setLive((s) => applyPreferredRequest(s, id)),
      validatePreferred: () => setLive((s) => applyPreferredStatus(s, "validating")),
      rejectPreferred: () => setLive((s) => applyPreferredStatus(s, "rejected")),
      cancelPreferred: () => setLive((s) => applyPreferredStatus(s, "cancelled")),
      offerPreferred: () =>
        setLive((s) => {
          const next = applyPreferredStatus(s, "offered");
          if (!next.preferred) return next;
          return applySendOffer(next, next.preferred.driverId, "preferred");
        }),
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
    [createShare, live, recordReject, step],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useLive() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("live");
  return ctx;
}
