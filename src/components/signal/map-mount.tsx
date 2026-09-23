"use client";

import dynamic from "next/dynamic";

export const MapMount = dynamic(() => import("./live-map").then((m) => m.LiveMapClient), {
  ssr: false,
  loading: () => <div className="zf-map-skel" />,
});
