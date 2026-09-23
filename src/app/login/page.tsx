"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Field, Panel } from "@/components/ui";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const { login, locale } = useStore();
  const [email, setEmail] = useState("amara@zoudian.travel");
  const router = useRouter();
  function enter(role: Role) {
    login(email, role);
    router.push(role === "driver" ? "/driver" : role === "ops" || role === "dispatcher" ? "/ops" : "/account");
  }
  return (
    <div className="mx-auto max-w-lg">
      <Panel className="space-y-4">
        <h1 className="display text-4xl">{loc(locale, "Enter 走癲", "進入走癲")}</h1>
        <p className="text-sm text-white/55">{loc(locale, "4 roles: customer / driver / admin / dispatcher. Google + Apple ready.", "四角色：顧客／司機／管理員／調度。支援 Google＋Apple。")}</p>
        <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={() => enter("passenger")}>{locale === "zh" ? "乘客" : "Customer"}</Btn>
          <Btn kind="ghost" onClick={() => enter("driver")}>{locale === "zh" ? "司機" : "Driver"}</Btn>
          <Btn kind="ghost" onClick={() => enter("ops")}>Admin</Btn>
          <Btn kind="ghost" onClick={() => enter("dispatcher")}>{locale === "zh" ? "調度" : "Dispatch"}</Btn>
        </div>
      </Panel>
    </div>
  );
}
