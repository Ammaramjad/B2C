"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Btn, Field, Panel } from "@/components/ui";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const { login, locale } = useStore();
  const [email, setEmail] = useState("amara@zoufeng.travel");
  const router = useRouter();

  function enter(role?: Role) {
    login(email, role);
    router.push(role === "driver" ? "/driver" : role === "ops" ? "/ops" : "/account");
  }

  return (
    <div className="mx-auto max-w-lg">
      <Panel className="space-y-5">
        <h1 className="display text-4xl">{locale === "zh" ? "進入網格" : "Enter the mesh"}</h1>
        <p className="text-sm text-white/55">
          {locale === "zh"
            ? "示範登入（M08）。乘客／司機／後台三角色。"
            : "Demo session (M08). Passenger, driver, or admin."}
        </p>
        <Field label="Email or phone">
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Btn onClick={() => enter("passenger")}>{locale === "zh" ? "乘客" : "Passenger"}</Btn>
          <Btn kind="ghost" onClick={() => enter("driver")}>
            {locale === "zh" ? "司機" : "Driver"}
          </Btn>
          <Btn kind="ghost" onClick={() => enter("ops")}>
            {locale === "zh" ? "後台管理" : "Admin"}
          </Btn>
        </div>
        <p className="text-xs text-white/40">
          Hint: emails containing driver or ops auto-route. Quiet ride, AC 22°C and Orbit Business are preloaded.
        </p>
      </Panel>
    </div>
  );
}
