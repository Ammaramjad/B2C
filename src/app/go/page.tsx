"use client";

import { Suspense } from "react";
import { BookingExperience } from "@/screens/signal/booking-command";

export default function Page() {
  return (
    <Suspense fallback={<div className="zf-cmd p-6">Loading booking…</div>}>
      <BookingExperience />
    </Suspense>
  );
}
