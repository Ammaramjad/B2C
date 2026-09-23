"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function InstantRedirect() {
  const router = useRouter();
  const { setDraft } = useStore();
  useEffect(() => {
    setDraft({ service: "instant", vehicle: "taxi", channel: "taxi" });
    router.replace("/book");
  }, [router, setDraft]);
  return <p className="text-[var(--text-secondary)]">Instant ride…</p>;
}
