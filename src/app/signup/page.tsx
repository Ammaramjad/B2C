"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Field } from "@/components/ui";

export default function SignupPage() {
  const { signup, locale } = useStore();
  const router = useRouter();
  const [name, setName] = useState("Amara Chen");
  const [email, setEmail] = useState("amara@example.com");
  const [phone, setPhone] = useState("+886 900 000 000");
  return (
    <div className="mx-auto max-w-md space-y-5 py-10">
      <h1 className="display text-4xl">{loc(locale, "Create passenger account", "建立乘客帳號")}</h1>
      <p className="text-[var(--muted)]">{loc(locale, "English names are stored as typed — never translated.", "英文姓名照輸入保存，不翻譯。")}</p>
      <Field label={loc(locale, "Full name", "姓名")}><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label={loc(locale, "Phone", "電話")}><input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      <Btn
        className="w-full"
        onClick={() => {
          signup({ name, email, phone });
          router.push("/me");
        }}
      >
        {loc(locale, "Sign up & open my panel", "註冊並開啟會員中心")}
      </Btn>
      <p className="text-sm text-[var(--muted)]">
        {loc(locale, "Driver or admin? Use", "司機／管理請用")} <a className="underline" href="/login">/login</a>
      </p>
    </div>
  );
}
