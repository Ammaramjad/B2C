"use client";

import { useState } from "react";
import { helpCats } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Chip } from "@/components/ui";

export default function HelpPage() {
  const { locale, messages, askHalo } = useStore();
  const [text, setText] = useState("Explain this price");
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Chip tone="ai">{loc(locale, "Ask AI", "問 AI")}</Chip>
      <h1 className="display text-4xl">{loc(locale, "Help", "客服")}</h1>
      <div className="flex flex-wrap gap-2">
        {helpCats.map((c) => (
          <button key={c.id} onClick={() => askHalo(c.id)} className="rounded-xl hairline px-3 py-2 text-sm">
            {locale === "zh" ? c.zh : c.id}
          </button>
        ))}
      </div>
      <div className="max-h-[400px] space-y-3 overflow-auto">
        {messages.map((m) => (
          <div key={m.id} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "ml-auto bg-[var(--surface)]" : "text-[var(--muted)]"}`}>
            {m.text}
          </div>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          askHalo(text);
          setText("");
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <Btn type="submit">{loc(locale, "Send", "送出")}</Btn>
      </form>
    </div>
  );
}
