"use client";

import { useState } from "react";
import { helpCats } from "@/lib/catalog";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Panel } from "@/components/ui";

export default function HelpPage() {
  const { locale, messages, askHalo } = useStore();
  const [text, setText] = useState("45 min wait?");
  const [cat, setCat] = useState("Booking");
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="display text-4xl">{loc(locale, "AI help + 8 categories", "AI 客服＋8 分類")}</h1>
      <div className="flex flex-wrap gap-2">
        {helpCats.map((c) => (
          <button key={c.id} onClick={() => { setCat(c.id); askHalo(c.id); }} className={`rounded-full px-3 py-1 text-xs ${cat === c.id ? "bg-cyan-300 text-[#070014]" : "bg-white/8"}`}>
            {locale === "zh" ? c.zh : c.id}
          </button>
        ))}
      </div>
      <Panel className="space-y-3">
        <div className="max-h-[420px] space-y-2 overflow-auto">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "ml-auto bg-cyan-300/15" : "bg-white/5"}`}>
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
          <Btn type="submit">{locale === "zh" ? "送出" : "Send"}</Btn>
        </form>
      </Panel>
    </div>
  );
}
