"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Field } from "@/components/ui";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const { login, locale } = useStore();
  const [email, setEmail] = useState("amara@zoudian.travel");
  const router = useRouter();
  function enter(role: Role) {
    login(email, role);
    router.push(role === "driver" ? "/driver" : role === "dispatcher" ? "/ops" : "/");
  }
  return (
    <div className="mx-auto max-w-md space-y-5 py-10">
      <h1 className="display text-4xl">{loc(locale, "Enter ZOUDIAN", "進入走癲")}</h1>
      <p className="text-[var(--muted)]">{loc(locale, "Four experiences. Simulated sign-in for the design prototype.", "四個體驗。設計原型模擬登入。")}</p>
      <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => enter("passenger")}>{loc(locale, "Customer", "顧客")}</Btn>
        <Btn kind="ghost" onClick={() => enter("driver")}>{loc(locale, "Driver", "司機")}</Btn>
        <Btn kind="ghost" onClick={() => enter("dispatcher")}>{loc(locale, "Dispatch", "調度")}</Btn>
        <Btn kind="ghost" onClick={() => { login(email, "ops"); router.push("/admin"); }}>{loc(locale, "Admin", "管理")}</Btn>
      </div>
    </div>
  );
}
