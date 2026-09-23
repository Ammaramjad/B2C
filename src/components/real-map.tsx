"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Locale } from "@/lib/types";
import { FLEET_ROUTES, POI, along } from "@/lib/geo";
import { loc } from "@/lib/i18n";
import { drivers } from "@/lib/data";

export function RealMap({
  locale,
  mode = "fleet",
  height = 420,
  focusDriverId,
  pickup,
  dropoff,
  eta,
}: {
  locale: Locale;
  mode?: "fleet" | "trip" | "nav";
  height?: number;
  focusDriverId?: string;
  pickup?: string;
  dropoff?: string;
  eta?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const focus = drivers.find((d) => d.id === focusDriverId) ?? drivers[0];

  useEffect(() => {
    let dead = false;
    const timers: number[] = [];
    (async () => {
      const L = (await import("leaflet")).default;
      if (dead || !el.current) return;

      const dark = document.documentElement.dataset.theme !== "light";
      const tiles = dark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

      const map = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(POI.xinyi, mode === "fleet" ? 11 : 12);
      L.tileLayer(tiles, { attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 19 }).addTo(map);

      const trip = FLEET_ROUTES[0];
      if (mode !== "fleet") {
        L.polyline(trip, { color: "#2f6bff", weight: 4, opacity: 0.85 }).addTo(map);
        L.circleMarker(trip[0], { radius: 7, color: "#2f6bff", fillOpacity: 1 }).addTo(map);
        L.circleMarker(trip[trip.length - 1], { radius: 7, color: "#3ee0c8", fillOpacity: 1 }).addTo(map);
        map.fitBounds(L.latLngBounds(trip), { padding: [40, 40] });
      }

      const carIcon = (color: string) =>
        L.divIcon({
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          html: `<div style="width:22px;height:22px;border-radius:7px;background:${color};box-shadow:0 0 0 4px ${color}33,0 6px 16px #0006;transform:rotate(var(--r,0deg))"></div>`,
        });

      const routes = mode === "fleet" ? FLEET_ROUTES : [trip];
      const colors = ["#2f6bff", "#3ee0c8", "#4c8dff", "#2f6bff", "#3ee0c8", "#2458e0"];
      const markers = routes.map((path, i) => {
        const m = L.marker(path[0], { icon: carIcon(colors[i % colors.length]), zIndexOffset: 400 }).addTo(map);
        return { m, path, speed: 0.04 + i * 0.008, t: i * 0.12 };
      });

      const tick = () => {
        markers.forEach((c) => {
          c.t += c.speed / 60;
          const p = along(c.path, c.t);
          const n = along(c.path, c.t + 0.01);
          c.m.setLatLng(p);
          const el = c.m.getElement();
          if (el) {
            const deg = (Math.atan2(n[1] - p[1], n[0] - p[0]) * 180) / Math.PI;
            const box = el.firstElementChild as HTMLElement | null;
            if (box) box.style.setProperty("--r", `${deg}deg`);
          }
        });
      };
      const id = window.setInterval(tick, 80);
      timers.push(id);
      (el.current as HTMLDivElement & { _map?: L.Map })._map = map;
    })();

    return () => {
      dead = true;
      timers.forEach((t) => clearInterval(t));
      const node = el.current as (HTMLDivElement & { _map?: { remove: () => void } }) | null;
      node?._map?.remove();
    };
  }, [mode, focusDriverId]);

  return (
    <div className="relative overflow-hidden rounded-[28px]" style={{ height }}>
      <div ref={el} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute left-4 top-4 z-[400] flex flex-col gap-2">
        <span className="elevated inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs">
          <span className="live-dot" />
          {mode === "fleet" ? loc(locale, "Live Taiwan fleet · OSM", "台灣即時車隊 · OSM") : loc(locale, "Live trip", "即時行程")}
        </span>
        {eta && <span className="elevated rounded-xl px-3 py-2 text-xs">{eta}</span>}
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-[400] flex flex-wrap items-end justify-between gap-3">
        <div className="elevated flex items-center gap-3 rounded-2xl px-3 py-3">
          <div className="avatar">{focus.photo}</div>
          <div>
            <div className="label">{focus.plate}</div>
            <div className="display text-lg">{focus.name}</div>
            <div className="text-xs text-[var(--muted)]">{focus.vehicle} · ★ {focus.rating}</div>
          </div>
        </div>
        <div className="elevated max-w-[240px] rounded-2xl px-3 py-3 text-xs">
          <div className="label">{pickup || loc(locale, "Pickup", "上車")}</div>
          <div>{dropoff || "Taipei 101"}</div>
        </div>
      </div>
    </div>
  );
}
