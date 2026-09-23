"use client";

import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Panel, Stat } from "@/components/ui";
import type { Currency } from "@/lib/types";
import { useState } from "react";

export default function WalletPage() {
  const { user, login, currency } = useStore();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  if (!user) {
    return (
      <Panel>
        <h1 className="display text-3xl">Wallet locked</h1>
        <p className="mt-2 text-white/55">Enter the mesh to open multi-currency ledger.</p>
        <Btn className="mt-4" onClick={() => login("amara@zoufeng.travel")}>
          Demo passenger
        </Btn>
      </Panel>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">E-wallet & FX</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(user.wallet) as Currency[]).map((c) => (
          <Stat key={c} k={c} v={money(user.wallet[c], c)} />
        ))}
      </div>
      <Panel className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Coupon / referral credit</div>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="AETHER-88K" />
        <Btn
          kind="ghost"
          onClick={() =>
            setMsg(
              code.toUpperCase() === user.referralCode
                ? "Self-referral blocked. Anti-fraud fingerprint holds."
                : code
                  ? `Code ${code} staged. Reward credits after first completed trip.`
                  : "Enter a code.",
            )
          }
        >
          Apply
        </Btn>
        {msg && <p className="text-sm text-cyan-100/80">{msg}</p>}
        <p className="text-sm text-white/50">
          Display {currency}. Settlement posts in New Taiwan Dollar, with US Dollar display.
        </p>
        <a href="/loyalty" className="text-sm text-cyan-200">
          Open loyalty / RFM →
        </a>
      </Panel>
      <Panel>
        <div className="display text-2xl">Your code {user.referralCode}</div>
        <p className="mt-2 text-sm text-white/55">
          Driver, passenger and enterprise codes. One account / one code. Device fingerprint + delayed credit after
          completion.
        </p>
      </Panel>
    </div>
  );
}
