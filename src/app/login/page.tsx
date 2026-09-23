"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Field } from "@/components/ui";
import type { Role } from "@/lib/types";

const desks: { role: Role; dest: string; en: string; zh: string; email: string }[] = [
  { role: "passenger", dest: "/customer", en: "Customer dashboard", zh: "旅客後台", email: "amara@zoudian.travel" },
  { role: "driver", dest: "/driver", en: "Driver dashboard", zh: "司機後台", email: "kenji@zoudian.travel" },
  { role: "dispatcher", dest: "/ops", en: "Dispatch board", zh: "派遣看板", email: "desk@zoudian.travel" },
  { role: "ops", dest: "/admin", en: "Admin console", zh: "管理後台", email: "nova@zoudian.travel" },
  { role: "finance", dest: "/admin", en: "Finance", zh: "財務", email: "finance@zoudian.travel" },
  { role: "support", dest: "/admin", en: "Support", zh: "客服", email: "support@zoudian.travel" },
  { role: "fleet_manager", dest: "/admin", en: "Fleet manager", zh: "車隊主管", email: "fleet@zoudian.travel" },
];

export default function LoginPage() {
  const { login, locale } = useStore();
  const [email, setEmail] = useState("amara@zoudian.travel");
  const router = useRouter();
  return (
    <div className="mx-auto max-w-lg space-y-5 py-10">
      <h1 className="display text-4xl">{loc(locale, "Choose a workspace", "選擇工作區")}</h1>
      <p className="text-[var(--muted)]">
        {loc(locale, "Customer, driver, and staff consoles are separate. Simulated sign-in.", "旅客、司機與內部後台分開。模擬登入。")}
      </p>
      <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <div className="grid gap-2 sm:grid-cols-2">
        {desks.map((d) => (
          <Btn
            key={d.role}
            kind={d.role === "passenger" ? "primary" : "ghost"}
            onClick={() => {
              login(d.email, d.role);
              router.push(d.dest);
            }}
          >
            {locale === "zh" ? d.zh : d.en}
          </Btn>
        ))}
      </div>
    </div>
  );
}
