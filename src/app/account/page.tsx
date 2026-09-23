"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Field } from "@/components/ui";

export default function AccountPage() {
  const { user, logout, locale, lastDriverId, requestSwitch, switches } = useStore();
  const router = useRouter();
  const [reason, setReason] = useState("Need a different vehicle. Please reassign through the company.");
  const last = drivers.find((x) => x.id === lastDriverId());
  const mine = switches.filter((s) => s.passengerId === (user?.id ?? "p1"));

  if (!user) {
    return (
      <p>
        <a className="underline" href="/login">{loc(locale, "Sign in", "登入")}</a>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <header>
        <div className="label">{loc(locale, "You", "我的")}</div>
        <h1 className="display text-4xl">{user.name}</h1>
        <p className="text-[var(--muted)]">{user.email} · {user.referralCode}</p>
      </header>
      <section className="space-y-3">
        <h2 className="display text-2xl">{loc(locale, "Last driver", "上次司機")}</h2>
        <p>{last ? `${last.name} · ${last.plate}` : "—"}</p>
        <p className="text-sm text-[var(--muted)]">{loc(locale, "Change drivers only through the company.", "更換司機只能透過公司。")}</p>
        <Field label={loc(locale, "Reason", "原因")}><input value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        {last && (
          <Btn
            kind="ghost"
            onClick={() => requestSwitch({ fromDriverId: last.id, reason, reasonZh: reason })}
          >
            {loc(locale, "Request switch", "申請更換")}
          </Btn>
        )}
        {mine.map((s) => (
          <p key={s.id} className="text-sm text-[var(--muted)]">{s.id} · {s.status}</p>
        ))}
      </section>
      <nav className="grid gap-3 text-lg">
        <a href="/wallet">{loc(locale, "Wallet", "錢包")}</a>
        <a href="/loyalty">{loc(locale, "Loyalty", "會員")}</a>
        <a href="/help">{loc(locale, "Help", "客服")}</a>
        <a href="/design">{loc(locale, "Design system", "設計系統")}</a>
      </nav>
      <Btn
        kind="ghost"
        onClick={() => {
          logout();
          router.push("/");
        }}
      >
        {loc(locale, "Sign out", "登出")}
      </Btn>
    </div>
  );
}
