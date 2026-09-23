"use client";

import { Suspense } from "react";
import { ServiceBook } from "@/screens/signal/services";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading booking…</div>}>
      <ServiceBook />
    </Suspense>
  );
}
