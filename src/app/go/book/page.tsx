"use client";

import { Suspense } from "react";
import { GoBook } from "@/screens/signal/marketplace";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading booking…</div>}>
      <GoBook />
    </Suspense>
  );
}
