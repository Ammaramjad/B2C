"use client";

import { Suspense } from "react";
import { LiveTripScreen } from "@/screens/passenger/rest";

export default function Page() {
  return (
    <Suspense>
      <LiveTripScreen />
    </Suspense>
  );
}
