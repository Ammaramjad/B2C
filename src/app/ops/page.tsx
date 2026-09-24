"use client";

import { Suspense } from "react";
import { CommandCenter } from "@/screens/ops/screens";

export default function Page() {
  return (
    <Suspense>
      <CommandCenter />
    </Suspense>
  );
}
