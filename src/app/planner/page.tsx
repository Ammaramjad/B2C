"use client";

import { useRouter } from "next/navigation";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Panel } from "@/components/ui";

export default function PlannerRedirect() {
  const { locale, setDraft } = useStore();
  const router = useRouter();
  return (
    <Panel className="space-y-4">
      <h1 className="display text-3xl">{loc(locale, "Hourly charter planner", "計時包車規劃")}</h1>
      <p className="text-white/60">{loc(locale, "v10 P1 uses hourly 880 × hours. AI itinerary is Phase 2.", "第一階段以 880×小時包車。AI 行程屬第二階段。")}</p>
      <Btn
        onClick={() => {
          setDraft({ service: "hourly", hours: 8, vehicle: "mpv" });
          router.push("/book");
        }}
      >
        {loc(locale, "Open hourly booking", "開啟計時包車")}
      </Btn>
    </Panel>
  );
}
