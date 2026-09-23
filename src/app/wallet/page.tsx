"use client";

import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Stat } from "@/components/ui";

export default function WalletPage() {
  const { user, login, locale } = useStore();
  if (!user) {
    return <Btn onClick={() => login("amara@zoudian.travel")}>{locale === "zh" ? "登入" : "Sign in"}</Btn>;
  }
  return (
    <div className="space-y-8">
      <h1 className="display text-4xl">{locale === "zh" ? "錢包" : "Wallet"}</h1>
      <div className="grid gap-8 sm:grid-cols-2">
        <Stat k="TWD" v={money(user.wallet.TWD, "TWD")} />
        <Stat k="USD" v={money(user.wallet.USD, "USD")} />
      </div>
      <p className="text-[var(--muted)]">{locale === "zh" ? "結算以新台幣為主。此為原型。" : "Settlement is NT$. Simulated credits."}</p>
    </div>
  );
}
