"use client";

import { useStore } from "@/lib/store";
import { Btn, Stat } from "@/components/ui";

export default function LoyaltyPage() {
  const { user, login } = useStore();
  if (!user) return <Btn onClick={() => login("amara@zoudian.travel")}>Sign in</Btn>;
  const pct = Math.min(100, Math.round((user.points / 6000) * 100));
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">Membership</h1>
      <Stat k="Pulse" v={`${user.points.toLocaleString()} pts`} d={`${pct}% to Orbit`} />
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
        <div className="h-full bg-[var(--primary)]" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[var(--muted)]">Priority meet · 45-min wait. No gamification chrome.</p>
    </div>
  );
}
