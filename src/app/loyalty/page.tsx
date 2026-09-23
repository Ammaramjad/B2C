"use client";

import { useStore } from "@/lib/store";
import { Btn, Panel, Stat } from "@/components/ui";

const tiers = [
  { name: "Ion", points: 0, perk: "Standard dispatch" },
  { name: "Pulse", points: 2000, perk: "Priority meet + late wait" },
  { name: "Orbit", points: 6000, perk: "Designated driver discount" },
  { name: "Nova", points: 12000, perk: "Concierge + empty-seat hold" },
];

export default function LoyaltyPage() {
  const { user, login } = useStore();
  if (!user) {
    return (
      <Panel>
        <Btn onClick={() => login("amara@zoufeng.travel")}>Enter to view RFM</Btn>
      </Panel>
    );
  }
  const tier = [...tiers].reverse().find((t) => user.points >= t.points) ?? tiers[0];
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">Loyalty mesh</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat k="Points" v={user.points.toLocaleString()} />
        <Stat k="RFM cell" v="Champion" d="Recency 3d · Frequency 9 · Monetary high" />
        <Stat k="Tier" v={tier.name} d={tier.perk} />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {tiers.map((t) => (
          <Panel key={t.name} className={t.name === tier.name ? "neon" : ""}>
            <div className="display text-2xl">{t.name}</div>
            <div className="text-sm text-white/50">{t.points}+ pts</div>
            <p className="mt-2 text-sm text-white/65">{t.perk}</p>
          </Panel>
        ))}
      </div>
      <Panel>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Churn radar</div>
        <p className="mt-2 text-sm text-white/60">
          No churn alert. Quiet-ride preference and 22°C cabin remembered. Next offer: Jiufen night ridge after 3 airport
          completions.
        </p>
      </Panel>
    </div>
  );
}
