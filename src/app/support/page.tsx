"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Btn, Panel } from "@/components/ui";

export default function SupportPage() {
  const { messages, askHalo } = useStore();
  const [text, setText] = useState("What is the cancellation policy?");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="display text-4xl">Halo · L1 agent</h1>
      <p className="text-white/55">
        RAG knowledge cell for 70% of routine questions. Say escalate for L2 human or SOS for L3 incident.
      </p>
      <Panel className="space-y-4">
        <div className="max-h-[480px] space-y-3 overflow-auto">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user" ? "ml-auto bg-cyan-300/15" : "bg-white/5 text-white/75"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            askHalo(text);
            setText("");
          }}
        >
          <input value={text} onChange={(e) => setText(e.target.value)} />
          <Btn type="submit">Send</Btn>
        </form>
        <div className="flex flex-wrap gap-2 text-xs">
          {["cancel policy", "flight CI101", "price factors", "SOS help", "driver dispatch"].map((q) => (
            <button key={q} className="rounded-full border border-white/10 px-3 py-1 text-white/50" onClick={() => askHalo(q)}>
              {q}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
