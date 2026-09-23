"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function LiveRedirect() {
  const router = useRouter();
  const { bookings, user } = useStore();
  useEffect(() => {
    const live = bookings.find((b) => ["assigned", "accepted", "arriving", "onboard"].includes(b.status) && (!user || b.passengerId === user.id || user.role !== "passenger"));
    router.replace(live ? `/trips/${live.id}` : "/trips");
  }, [bookings, router, user]);
  return <p className="text-[var(--text-secondary)]">Opening trip…</p>;
}
