"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mismatchCopy, vehicleFits } from "@/lib/live/capacity";
import { useLive } from "@/lib/live/engine";
import { quote } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { MapMount } from "@/components/signal/map-mount";
import type { ExtraId, ServiceType } from "@/lib/types";
import { useCopy } from "@/lib/copy";

function usePhases() {
  const { L } = useCopy();
  return [
    { id: "booked", label: L("Booked", "已預訂") },
    { id: "flight_monitoring", label: L("Flight monitoring", "航班監控") },
    { id: "driver_assigned", label: L("Driver assigned", "已指派司機") },
    { id: "driver_preparing", label: L("Preparing", "準備中") },
    { id: "en_route_airport", label: L("En route to airport", "前往機場") },
    { id: "near_airport", label: L("Near airport", "接近機場") },
    { id: "arrived", label: L("Arrived", "已到達") },
    { id: "waiting", label: L("Waiting", "等候中") },
    { id: "verified", label: L("Verified", "已驗證") },
    { id: "trip_started", label: L("Trip started", "行程開始") },
    { id: "en_route_dest", label: L("En route", "前往目的地") },
    { id: "arriving", label: L("Arriving", "即將到達") },
    { id: "completed", label: L("Completed", "已完成") },
    { id: "disrupted", label: L("Operational issue", "營運異常") },
    { id: "reassigning", label: L("Reassigning", "重新指派") },
    { id: "reassigned", label: L("New driver", "新司機") },
  ];
}

export function PassengerHome() {
  const { live } = useLive();
  const { L } = useCopy();
  const nearby = live.drivers.filter((d) => d.duty === "online" || d.duty === "busy").length;
  return (
    <div className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative min-h-[52vh]">
        <MapMount mode="day" height="100%" />
      </div>
      <div className="flex flex-col justify-between p-6 lg:p-10">
        <div>
          <div className="kicker">{L("Live mobility · Taiwan corridors", "即時移動 · 台灣廊帶")}</div>
          <h1 className="display mt-3 text-5xl md:text-6xl">{L("The car is already on the network.", "車已在網路上。")}</h1>
          <p className="mt-4 max-w-md text-[var(--ink-2)]">{L("Airport, private transfer, charter, taxi. Once you book, this becomes a live pickup — not a confirmation email.", "接機、包車、計時、計程車。一經預訂，就是現場接送——不是確認信。")}</p>
          <p className="mt-3 text-sm" data-testid="nearby-cars">{L(`${nearby} cars moving in your area right now.`, `你的區域現有 ${nearby} 輛車在移動。`)}</p>
        </div>
        <div className="mt-8 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              ["/book?service=airport_pickup", L("Airport pickup", "機場接機")],
              ["/book?service=airport_drop", L("Airport drop-off", "機場送機")],
              ["/book?service=p2p", L("Private transfer", "點對點")],
              ["/book?service=hourly", L("Hourly", "計時包車")],
              ["/book?service=instant", L("Instant", "即時計程車")],
              ["/book?service=rental", L("Self-drive", "自駕租車")],
            ].map(([href, s]) => (
              <Link key={href} href={href} className="zf-panel px-3 py-3 text-sm font-semibold">
                {s}
              </Link>
            ))}
          </div>
          <Link href="/go" className="zf-btn wide">
            {L("Open guest booking", "開啟旅客預訂")}
          </Link>
          <Link href="/book" className="zf-btn ghost wide">
            {L("Start airport pickup", "開始機場接機")}
          </Link>
          {live.assignedId ? (
            <Link href="/live" className="zf-btn ghost wide">
              {L("Open live pickup", "開啟即時接送")} · {live.bookingId}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const klassToId: Record<string, string> = { Sedan: "sedan", MPV: "mpv", Van: "van" };

export function AirportBook() {
  const { live, confirmAirport } = useLive();
  const { setDraft, placeBooking } = useStore();
  const router = useRouter();
  const [pax, setPax] = useState(5);
  const [bags, setBags] = useState(4);
  const [flight, setFlight] = useState("BR156");
  const [klass, setKlass] = useState("MPV");
  const [child, setChild] = useState(true);
  const extras: ExtraId[] = child ? ["child_seat", "meet"] : ["meet"];
  const q = useMemo(
    () =>
      quote({
        service: "airport_pickup" as ServiceType,
        vehicle: klassToId[klass],
        extras: child ? ["child_seat", "meet"] : ["meet"],
        when: "2026-09-23T16:40",
      }),
    [klass, child],
  );
  const fare = q.total;
  const fit = vehicleFits(klass, pax, bags);

  function confirm() {
    const payload = {
      service: "airport_pickup" as const,
      flight,
      passengers: pax,
      luggage: bags,
      vehicle: klassToId[klass],
      extras,
      pickup: "TPE T2 Arrivals · Door 8",
      dropoff: "Taipei 101 / Xinyi",
      name: "Sarah Chen",
    };
    setDraft(payload);
    const b = placeBooking(payload);
    confirmAirport({ flight, pax, bags, vehicle: klass, fare, bookingId: b.id, name: "Sarah Chen" });
    router.push(`/trips/${b.id}/success`);
  }

  return (
    <div className="grid min-h-[calc(100vh-56px)] lg:grid-cols-[1fr_420px]">
      <div className="min-h-[360px]">
        <MapMount mode="day" height="100%" />
      </div>
      <div className="space-y-4 overflow-auto p-5">
        <div className="kicker">Airport pickup · reacts as you decide</div>
        <h1 className="display text-4xl">BR156 into TPE</h1>
        <label className="zf-field">
          <span>Flight</span>
          <input value={flight} onChange={(e) => setFlight(e.target.value.toUpperCase())} />
        </label>
        <p className="text-sm text-[var(--ink-2)]">
          {flight === "BR156" ? live.flightStatus : "Flight lookup pending"} · Terminal {live.terminal} · Door 8
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="zf-field">
            <span>Passengers</span>
            <input type="number" value={pax} onChange={(e) => setPax(Number(e.target.value))} />
          </label>
          <label className="zf-field">
            <span>Bags</span>
            <input type="number" value={bags} onChange={(e) => setBags(Number(e.target.value))} />
          </label>
        </div>
        <div className="grid gap-2">
          {["Sedan", "MPV", "Van"].map((k) => (
            <button
              key={k}
              onClick={() => setKlass(k)}
              className={`zf-panel p-3 text-left ${klass === k ? "outline outline-1 outline-[var(--signal)]" : ""}`}
            >
              <b>{k}</b>
              {!vehicleFits(k, pax, bags) ? (
                <p className="mt-1 text-sm text-[var(--warn)]" data-testid="capacity-mismatch">{mismatchCopy(k, pax, bags)}</p>
              ) : (
                <p className="mt-1 text-sm text-[var(--ink-2)]">Compatible with this party.</p>
              )}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={child} onChange={(e) => setChild(e.target.checked)} />
          Child seat · +NT$200
        </label>
        <Link href="/preferred" className="block text-sm text-[var(--signal)]">
          Request a preferred driver →
        </Link>
        <div className="flex items-end justify-between">
          <div>
            <div className="kicker">Quote updates live</div>
            <div className="zf-metric text-3xl">NT${fare.toLocaleString()}</div>
          </div>
          <div>
            {!fit ? (
              <p className="mb-2 text-sm text-[var(--warn)]" data-testid="capacity-block">
                Confirm is disabled. {mismatchCopy(klass, pax, bags)}
              </p>
            ) : null}
            <button type="button" className="zf-btn" disabled={!fit} data-testid="confirm-airport" onClick={confirm}>
              Confirm & pay NT${fare.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PassengerLive() {
  const { live, triggerSos, shareTrip } = useLive();
  const { L } = useCopy();
  const phases = usePhases();
  const [shareMsg, setShareMsg] = useState("");
  const d = live.drivers.find((x) => x.id === live.assignedId);
  const idx = phases.findIndex((p) => p.id === live.phase);
  async function onShare() {
    const token = shareTrip();
    const url = `${window.location.origin}/share/${token}`;
    try {
      if (navigator.share) await navigator.share({ title: "Zoufeng trip", url });
      else await navigator.clipboard.writeText(url);
      setShareMsg(`Share link ready · ${url}`);
    } catch {
      setShareMsg(url);
    }
  }
  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      <div className="absolute inset-0">
        <MapMount mode="day" height="100%" showFleet={false} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-14 z-[2000] flex justify-between px-4 md:top-3">
        <span className="zf-chip live">LIVE PICKUP</span>
        <div className="pointer-events-auto flex gap-2">
          <button type="button" className="zf-btn ghost" data-testid="share-trip" onClick={() => void onShare()}>
            {L("Share trip", "分享行程")}
          </button>
          <button className="zf-btn" onClick={triggerSos}>
            SOS
          </button>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-20 z-[2000] md:bottom-4">
        <div className="mx-auto max-w-xl zf-panel p-4">
          {shareMsg ? <p className="mb-2 text-xs text-[var(--signal)]" data-testid="share-url">{shareMsg}</p> : null}
          <div className="flex justify-between gap-4">
            <div>
              <div className="kicker">{live.bookingId} · {live.flight}</div>
              <div className="mt-1 text-lg font-semibold">{phases[Math.max(0, idx)]?.label}</div>
              <p className="text-sm text-[var(--ink-2)]">
                {live.pickup} → {live.dropoff}
              </p>
            </div>
            <div className="text-right">
              <div className="kicker">ETA</div>
              <div className="zf-metric text-4xl">{live.etaMin || "—"}</div>
              <div className="text-xs">{live.distanceKm ? `${live.distanceKm} km` : ""}</div>
            </div>
          </div>
          {live.customerNotice ? <p className="mt-3 text-sm font-semibold text-[var(--signal)]">{live.customerNotice}</p> : null}
          {d ? (
            <div className="mt-3 flex justify-between text-sm">
              <div>
                <b>{d.name}</b>
                <div>
                  {d.vehicle} · {d.plate} · {d.rating}
                </div>
              </div>
              <div className="mono text-2xl tracking-[0.18em]">{live.otp}</div>
            </div>
          ) : (
            <p className="mt-3 text-sm">{L("Flight monitoring. Driver assignment follows company dispatch — not a private handshake.", "航班監控中。司機由公司派遣指派——不是私下約定。")}</p>
          )}
          <p className="mt-2 text-xs text-[var(--mute)]">{live.trafficNote}</p>
          <ol className="mt-3 flex gap-1 overflow-x-auto">
            {phases.slice(0, 12).map((p, i) => (
              <li key={p.id} className={`h-1 min-w-6 flex-1 ${i <= idx ? "bg-[var(--signal)]" : "bg-[var(--line)]"}`} />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function PreferredDrivers() {
  const { live, requestPreferred } = useLive();
  const { bookings, lastDriverId } = useStore();
  const { L } = useCopy();
  const david = live.drivers[0];
  const st = live.preferred?.status;
  const history = [...bookings]
    .filter((b) => b.driverId && b.status === "completed")
    .sort((a, b) => b.when.localeCompare(a.when));
  const seen = new Set<string>();
  const previous = history
    .map((b) => {
      if (!b.driverId || seen.has(b.driverId)) return null;
      seen.add(b.driverId);
      const liveD = live.drivers.find((d) => d.id === b.driverId);
      const catalog = { id: b.driverId, name: liveD?.name ?? b.driverId, plate: liveD?.plate ?? "—", vehicle: liveD?.vehicle ?? b.vehicle, klass: liveD?.klass ?? b.vehicle, rating: liveD?.rating ?? 4.9, onTime: liveD?.onTime ?? 0.96, rides: history.filter((x) => x.driverId === b.driverId).length, last: b.when.slice(0, 10) };
      return catalog;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  const cards = [
    {
      id: david.id,
      name: david.name,
      plate: david.plate,
      vehicle: david.vehicle,
      klass: david.klass,
      rating: david.rating,
      onTime: david.onTime,
      rides: david.ridesWithSarah || previous.find((p) => p.id === david.id)?.rides || 12,
      last: previous.find((p) => p.id === david.id)?.last ?? "2026-03-20",
    },
    ...previous.filter((p) => p.id !== david.id),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-24">
      <div className="kicker">{L("Company-mediated preference · M25", "公司仲介指定司機 · M25")}</div>
      <h1 className="display mt-2 text-5xl">{L("My previous drivers", "我的歷史司機")}</h1>
      <p className="mt-3 max-w-xl text-[var(--ink-2)]">{L("Six months later you can still request the same driver. Zoufeng contacts them — you never get a private LINE or phone.", "六個月後仍可申請同一位司機。由走癲聯絡對方——不會給你私人 LINE 或電話。")}</p>
      <p className="mt-2 text-sm">{L("Last company driver on file", "公司紀錄的上次司機")} · {lastDriverId("p-sarah") ?? lastDriverId() ?? "D-118"}</p>
      {cards.map((d) => (
        <div key={d.id} className="zf-panel mt-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-semibold">{d.name}</div>
              <div className="mt-1 text-sm text-[var(--ink-2)]">
                {d.rating} ★ · {d.rides} {L("rides with you", "次同行")} · {L("last", "上次")} {d.last} · {d.klass} · {d.vehicle} · {d.plate} · {Math.round(d.onTime * 100)}% {L("on-time", "準時")}
              </div>
            </div>
            <button type="button" className="zf-btn" data-testid={d.id === david.id ? "request-preferred" : undefined} onClick={() => requestPreferred(d.id.startsWith("D-") ? d.id : david.id)}>
              {L("Request this driver", "申請這位司機")}
            </button>
          </div>
          <p className="mt-3 text-sm">{L("Preferred Driver premium +18% (configurable 15–20%). Fallback: nearest similar class if unavailable.", "指定司機加成 +18%（可設 15–20%）。若檔期不足，改派最近同級車輛。")}</p>
          <div className="mt-3 zf-panel p-3 text-sm">
            <div className="kicker">{L("Contact", "聯絡")}</div>
            <p className="mt-1">{L("Company LINE desk @zoufeng.ops · relay +886 800 820 041. Private LINE / WeChat / phone of the driver is not released.", "公司 LINE 櫃檯 @zoufeng.ops · 代轉 +886 800 820 041。不提供司機私人 LINE／微信／電話。")}</p>
          </div>
        </div>
      ))}
      <div className="zf-panel mt-4 p-5">
        <div className="kicker">{L("Request status", "申請狀態")}</div>
        <ol className="mt-3 space-y-2 text-sm">
          {[
            ["pending", L("Request received by Zoufeng", "走癲已收到申請")],
            ["under_review", L("Ops reviewing availability / vehicle / schedule", "調度審核檔期／車款／時間")],
            ["validated", L("Company validation passed", "公司驗證通過")],
            ["company_offered", L("Official company offer issued", "公司正式指派已發出")],
            ["driver_offered", L("Offer on the driver desk", "指派已到司機端")],
            ["confirmed", L("Preferred driver confirmed", "指定司機已確認")],
            ["rejected", L("Rejected / cancelled", "已拒絕／已取消")],
          ].map(([k, l]) => (
            <li key={k} className={st === k ? "text-[var(--signal)]" : "text-[var(--mute)]"}>
              {l}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-[var(--ink-2)]">{L("Company validation and the official offer happen on the operations preferred queue — not on this passenger screen.", "公司驗證與正式指派在調度指定佇列完成——不在此乘客畫面。")}</p>
        <Link href="/ops/preferred" className="zf-btn ghost mt-3" data-testid="preferred-ops-link">
          {L("Open company queue", "開啟公司佇列")}
        </Link>
        {st === "confirmed" ? <p className="mt-3 font-semibold">{live.customerNotice}</p> : null}
      </div>
    </div>
  );
}

