"use client";

import dynamic from "next/dynamic";

export const BookingMap = dynamic(() => import("./real-map").then((m) => m.BookingMapCanvas), {
  ssr: false,
  loading: () => <div className="zf-map-skel" style={{ height: "100%" }} />,
});
