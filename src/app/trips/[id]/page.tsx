"use client";
import { use } from "react";
import { TripDetail } from "@/views/trips";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TripDetail id={id} />;
}
