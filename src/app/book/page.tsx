"use client";

import { Suspense } from "react";
import { BookingStudio } from "@/screens/passenger/booking";
import { Skeleton } from "@/components/atlas/primitives";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-40 w-full" /></div>}>
      <BookingStudio />
    </Suspense>
  );
}
