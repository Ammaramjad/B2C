"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Btn, Field, Panel } from "@/components/ui";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState("amara@zoufeng.travel");
  const router = useRouter();

  function enter(role?: Role) {
    login(email, role);
    router.push(role === "driver" ? "/driver" : role === "ops" ? "/ops" : "/account");
  }

  return (
    <div className="mx-auto max-w-lg">
      <Panel className="space-y-5">
        <h1 className="display text-4xl">Enter the mesh</h1>
        <p className="text-sm text-white/55">
          JWT-style demo session. Phone/email identity. No password — this is a preview of membership M08.
        </p>
        <Field label="Email or phone">
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Btn onClick={() => enter("passenger")}>Passenger</Btn>
          <Btn kind="ghost" onClick={() => enter("driver")}>
            Driver
          </Btn>
          <Btn kind="ghost" onClick={() => enter("ops")}>
            Operations
          </Btn>
        </div>
        <p className="text-xs text-white/40">
          Hint: emails containing driver or ops auto-route. Quiet ride, AC 22°C and Orbit Business are preloaded.
        </p>
      </Panel>
    </div>
  );
}
