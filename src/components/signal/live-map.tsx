"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, TileLayer, CircleMarker, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TAIPEI_101, TPE_T1 } from "@/lib/live/geo";
import type { DriverMarkerState, GeoPoint, LiveDriver } from "@/lib/live/types";
import { useLive } from "@/lib/live/engine";
import { resolveGeoProvider } from "@/lib/maps";

const tiles = resolveGeoProvider("simulation").tiles;

function pin(state: DriverMarkerState | "passenger" | "airport" | "incident") {
  const color =
    state === "available"
      ? "#1F8A4C"
      : state === "busy"
        ? "#C98512"
        : state === "to_pickup"
          ? "#E31C23"
          : state === "waiting"
            ? "#E31C23"
            : state === "onboard"
              ? "#E31C23"
              : state === "incident" || state === "emergency"
                ? "#FF4D3A"
                : state === "airport"
                  ? "#0B1220"
                  : state === "passenger"
                    ? "#2B5BFF"
                    : "#8A93A3";
  const label = state === "airport" ? "TPE" : state === "passenger" ? "P" : state === "incident" ? "!" : "";
  return L.divIcon({
    className: "zf-marker",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<span class="zf-pin" data-state="${state}" style="background:${color}">${label}</span>`,
  });
}

function Fit({ points }: { points: GeoPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) {
      map.setView([TPE_T1.lat, TPE_T1.lng], 12);
      return;
    }
    const b = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(b.pad(0.18));
  }, [map, points]);
  return null;
}

export function LiveMap({
  mode = "day",
  showFleet = true,
  height = "100%",
}: {
  mode?: "day" | "night";
  showFleet?: boolean;
  height?: string | number;
}) {
  const { live } = useLive();
  const assigned = live.drivers.find((d) => d.id === live.assignedId);
  const route = useMemo(() => live.route.map((p) => [p.lat, p.lng] as [number, number]), [live.route]);
  const focus: GeoPoint[] = assigned ? [assigned.loc, TPE_T1, TAIPEI_101] : [TPE_T1, TAIPEI_101];

  return (
    <div className="zf-map" style={{ height }}>
      <MapContainer center={[25.05, 121.4]} zoom={11} zoomControl={false} attributionControl={false} className="h-full w-full" style={{ height: "100%", minHeight: 320 }}>
        <TileLayer url={tiles[mode]} attribution={mode === "day" ? "© OpenStreetMap" : "Esri"} />
        <Fit points={focus} />
        {route.length > 1 ? <Polyline positions={route} pathOptions={{ color: "#E31C23", weight: 4, opacity: 0.9 }} /> : null}
        {live.traffic === "heavy" && assigned ? (
          <CircleMarker center={[assigned.loc.lat, assigned.loc.lng]} radius={28} pathOptions={{ color: "#C98512", weight: 1, fillOpacity: 0.08 }} />
        ) : null}
        <Marker position={[TPE_T1.lat, TPE_T1.lng]} icon={pin("airport")}>
          <Tooltip permanent direction="right" className="zf-tip">
            TPE T2
          </Tooltip>
        </Marker>
        <Marker position={[TAIPEI_101.lat, TAIPEI_101.lng]} icon={pin("passenger")}>
          <Tooltip direction="left" className="zf-tip">
            Xinyi
          </Tooltip>
        </Marker>
        {(showFleet ? live.drivers : live.drivers.filter((d) => d.id === live.assignedId || live.candidates.some((c) => c.id === d.id))).map((d) => (
          <DriverMark key={d.id} d={d} highlight={d.id === live.assignedId} />
        ))}
        {live.incident ? (
          <Marker position={[live.incident.loc.lat, live.incident.loc.lng]} icon={pin("incident")}>
            <Tooltip permanent className="zf-tip">
              INCIDENT
            </Tooltip>
          </Marker>
        ) : null}
      </MapContainer>
      <div className="zf-map-legend">
        <i data-s="available" /> Available
        <i data-s="to_pickup" /> Assigned
        <i data-s="incident" /> Incident
      </div>
      {live.sim ? <div className="zf-sim">SIMULATED REALTIME · same event interface as production GPS</div> : null}
    </div>
  );
}

function DriverMark({ d, highlight }: { d: LiveDriver; highlight: boolean }) {
  return (
    <Marker position={[d.loc.lat, d.loc.lng]} icon={pin(d.state)} zIndexOffset={highlight ? 400 : 0}>
      <Tooltip className="zf-tip">
        {d.name} · {d.klass} · {d.state.replace("_", " ")}
      </Tooltip>
    </Marker>
  );
}

export function LiveMapClient(props: { mode?: "day" | "night"; showFleet?: boolean; height?: string | number }) {
  return <LiveMap {...props} />;
}
