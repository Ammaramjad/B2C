"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Button, Field } from "@/components/system";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const { login, locale } = useStore();
  const [email, setEmail] = useState("amara@zoudian.travel");
  const router = useRouter();
  function enter(role: Role, dest: string) {
    login(email, role);
    router.push(dest);
  }
  return (
    <div className="mx-auto max-w-md space-y-5 py-10">
      <h1 className="display text-4xl">{loc(locale, "Enter Zoufeng", "進入走癲")}</h1>
      <p className="text-[var(--text-secondary)]">{loc(locale, "Simulated sign-in for the design foundation. Not production identity.", "設計基礎的模擬登入，非正式身分系統。")}</p>
      <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => enter("passenger", "/")}>{loc(locale, "Traveler", "旅客")}</Button>
        <Button kind="ghost" onClick={() => enter("driver", "/driver")}>{loc(locale, "Driver", "司機")}</Button>
        <Button kind="ghost" onClick={() => enter("dispatcher", "/ops")}>{loc(locale, "Operations", "營運")}</Button>
        <Button kind="ghost" onClick={() => enter("ops", "/ops/pricing")}>{loc(locale, "Admin / config", "管理／設定")}</Button>
      </div>
    </div>
  );
}
