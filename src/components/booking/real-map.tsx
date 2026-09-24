"use client";

import { useEffect, useMemo, useRef } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TPE_T1 } from "@/lib/live/geo";
import type { GeoPoint } from "@/lib/live/types";
import { useLive } from "@/lib/live/engine";
import { googleMapsKey } from "@/lib/maps";
import type { GeoProviderId, RouteResult } from "@/lib/maps/types";

function pin(kind: "from" | "to" | "car", heading = 0) {
  const color = kind === "from" ? "#3d7eff" : kind === "to" ? "#ef233c" : "#f4f7fb";
  const rot = kind === "car" ? `transform:rotate(${heading}deg)` : "";
  return L.divIcon({
    className: "zf-marker",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<span class="zf-pin" style="background:${color};${rot}"></span>`,
  });
}

function Camera({ from, to, route }: { from: GeoPoint | null; to: GeoPoint | null; route: GeoPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = [...(from ? [from] : []), ...(to ? [to] : []), ...route];
    if (pts.length >= 2) {
      map.flyToBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lng])).pad(0.18), { duration: 0.85 });
      return;
    }
    if (from) map.flyTo([from.lat, from.lng], 14, { duration: 0.7 });
  }, [map, from, to, route]);
  return null;
}

function Clicks({ onPick }: { onPick: (p: GeoPoint) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Controls({ onMe, satellite }: { onMe: () => void; satellite: boolean }) {
  const map = useMap();
  return (
    <div className="zf-cmd-float" style={{ right: 12, bottom: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <button type="button" onClick={onMe} aria-label="My location">Locate</button>
      <button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in">+</button>
      <button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out">−</button>
      <span className="zf-src">{satellite ? "Satellite · Esri" : "Map · OSM"}</span>
    </div>
  );
}

export function LeafletBookingMap({
  from,
  to,
  route,
  onPick,
  showFleet,
}: {
  from: GeoPoint | null;
  to: GeoPoint | null;
  route: RouteResult | null;
  onPick: (p: GeoPoint) => void;
  showFleet: boolean;
}) {
  const { live } = useLive();
  const path = useMemo(() => (route?.path ?? []).map((p) => [p.lat, p.lng] as [number, number]), [route]);
  return (
    <MapContainer center={[TPE_T1.lat, TPE_T1.lng]} zoom={11} zoomControl={false} className="h-full w-full" style={{ height: "100%", minHeight: 320 }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles © Esri — World Imagery (not an illustrated map)"
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution="Esri labels"
        opacity={0.85}
      />
      <Camera from={from} to={to} route={route?.path ?? []} />
      <Clicks onPick={onPick} />
      {path.length > 1 ? <Polyline positions={path} pathOptions={{ color: "#ef233c", weight: 5, opacity: 0.92 }} /> : null}
      {from ? (
        <Marker position={[from.lat, from.lng]} icon={pin("from")}>
        </Marker>
      ) : null}
      {to ? <Marker position={[to.lat, to.lng]} icon={pin("to")} /> : null}
      {showFleet
        ? live.drivers.filter((d) => d.duty !== "offline").map((d) => (
            <Marker key={d.id} position={[d.loc.lat, d.loc.lng]} icon={pin("car", d.heading)}>
              <CircleMarker center={[d.loc.lat, d.loc.lng]} radius={2} pathOptions={{ color: "#fff", opacity: 0 }} />
            </Marker>
          ))
        : null}
      <Controls
        satellite
        onMe={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition((pos) => onPick({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        }}
      />
    </MapContainer>
  );
}

export function GoogleBookingMap({
  from,
  to,
  route,
  onPick,
}: {
  from: GeoPoint | null;
  to: GeoPoint | null;
  route: RouteResult | null;
  onPick: (p: GeoPoint) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{
    panTo: (p: GeoPoint) => void;
    setZoom: (n: number) => void;
    fitBounds: (b: unknown, p: number) => void;
    addListener: (e: string, fn: (ev: { latLng?: { lat: () => number; lng: () => number } }) => void) => void;
  } | null>(null);
  const key = googleMapsKey();
  useEffect(() => {
    if (!key || !ref.current) return;
    let cancelled = false;
    const existing = document.getElementById("zf-gmaps");
    const boot = () => {
      const g = (window as unknown as { google?: { maps?: { Map: new (el: HTMLElement, opts: object) => typeof mapRef.current; LatLngBounds: new () => { extend: (p: GeoPoint) => void } } } }).google;
      if (cancelled || !ref.current || !g?.maps) return;
      const map = new g.maps.Map(ref.current, {
        center: { lat: TPE_T1.lat, lng: TPE_T1.lng },
        zoom: 12,
        mapTypeId: "hybrid",
        tilt: 45,
        heading: 24,
        disableDefaultUI: true,
        zoomControl: true,
      });
      mapRef.current = map;
      map?.addListener("click", (e: { latLng?: { lat: () => number; lng: () => number } }) => {
        if (e.latLng) onPick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
    };
    if ((window as unknown as { google?: { maps?: unknown } }).google?.maps) boot();
    else if (!existing) {
      const s = document.createElement("script");
      s.id = "zf-gmaps";
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places,maps3d&v=weekly`;
      s.async = true;
      s.onload = boot;
      document.head.appendChild(s);
    } else existing.addEventListener("load", boot);
    return () => {
      cancelled = true;
    };
  }, [key, onPick]);

  useEffect(() => {
    const map = mapRef.current;
    const g = (window as unknown as { google?: { maps?: { LatLngBounds: new () => { extend: (p: GeoPoint) => void } } } }).google;
    if (!map || !g?.maps) return;
    const pts = [...(from ? [from] : []), ...(to ? [to] : []), ...(route?.path ?? [])];
    if (pts.length >= 2) {
      const b = new g.maps.LatLngBounds();
      pts.forEach((p) => b.extend(p));
      map.fitBounds(b, 80);
    } else if (from) {
      map.panTo(from);
      map.setZoom(14);
    }
  }, [from, to, route]);

  return <div ref={ref} className="h-full w-full" role="application" aria-label="Google map" />;
}

export function BookingMapCanvas(props: {
  from: GeoPoint | null;
  to: GeoPoint | null;
  route: RouteResult | null;
  onPick: (p: GeoPoint) => void;
  source: GeoProviderId;
}) {
  const key = googleMapsKey();
  if (key) return <GoogleBookingMap {...props} />;
  return <LeafletBookingMap {...props} showFleet />;
}
