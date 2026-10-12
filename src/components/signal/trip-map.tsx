"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useLive } from "@/lib/live/engine";
import { TAIPEI_101, TPE_T1 } from "@/lib/live/geo";
import { MapMount } from "./map-mount";

export default function TripMap() {
  const { live } = useLive();
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const vehicle = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const line = useRef<google.maps.Polyline | null>(null);
  const pins = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const driver = live.drivers.find((d) => d.id === live.assignedId);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!ready || !host.current) return;
    const g = google.maps;
    map.current = new g.Map(host.current, {
      center: TPE_T1, zoom: 12, mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
      mapTypeControl: false, streetViewControl: false, fullscreenControl: true,
    });
    const bounds = new g.LatLngBounds();
    for (const [position, title] of [[TPE_T1, "Pickup"], [TAIPEI_101, "Destination"]] as const) {
      pins.current.push(new g.marker.AdvancedMarkerElement({ map: map.current, position, title }));
      bounds.extend(position);
    }
    map.current.fitBounds(bounds, 60);
    line.current = new g.Polyline({ map: map.current, strokeColor: "#E31C23", strokeWeight: 4 });
    return () => {
      pins.current.forEach((pin) => { pin.map = null; });
      pins.current = [];
      if (vehicle.current) vehicle.current.map = null;
      vehicle.current = null;
      line.current?.setMap(null);
      map.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (!map.current || !ready) return;
    line.current?.setPath(live.route);
    if (!driver) {
      if (vehicle.current) vehicle.current.map = null;
      vehicle.current = null;
      return;
    }
    if (!vehicle.current) {
      vehicle.current = new google.maps.marker.AdvancedMarkerElement({ map: map.current, position: driver.loc });
    }
    const node = document.createElement("div");
    node.className = "zf-vehicle";
    node.textContent = driver.klass === "Van" ? "🚐" : "🚘";
    node.style.transform = `rotate(${driver.heading}deg)`;
    node.setAttribute("aria-label", `${driver.vehicle}, ${driver.plate}`);
    vehicle.current.replaceChildren(node);
    vehicle.current.title = `${driver.name} · ${driver.vehicle} · ${driver.plate}`;
    const marker = vehicle.current;
    const from = marker.position as google.maps.LatLngLiteral | undefined;
    const start = performance.now();
    let frame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / 650);
      marker.position = from ? { lat: from.lat + (driver.loc.lat - from.lat) * t, lng: from.lng + (driver.loc.lng - from.lng) * t } : driver.loc;
      if (t < 1) frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [driver, live.route, ready]);

  if (!key || failed) return <div className="relative h-full"><MapMount showFleet={false} /><div className="absolute left-3 top-3 z-[1000] rounded bg-white px-3 py-2 text-xs text-black">{failed ? "Google Maps unavailable · alternative map" : "Preview map · Google Maps is not configured"}</div></div>;
  return <>
    <Script id="trip-google-maps" src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=marker&v=weekly`} strategy="afterInteractive" onReady={() => { google.maps.importLibrary("marker").then(() => setReady(true)).catch(() => setFailed(true)); }} onError={() => setFailed(true)} />
    <div ref={host} className="h-full min-h-[420px] w-full" aria-label="Trip tracking map" />
  </>;
}
