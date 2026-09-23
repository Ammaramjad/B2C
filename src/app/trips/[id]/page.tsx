"use client";

import { use, useState } from "react";
import { drivers } from "@/lib/data";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Btn, Panel } from "@/components/ui";

export default function TripLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bookings, currency, advance, cancel, locale, requestSwitch } = useStore();
  const b = bookings.find((x) => x.id === id);
  const driver = drivers.find((d) => d.id === b?.driverId);
  const [otpOk, setOtpOk] = useState(false);
  const [code, setCode] = useState("");
  const [sos, setSos] = useState(false);
  const [share, setShare] = useState(false);
  const [sw, setSw] = useState("");

  if (!b) {
    return (
      <Panel>
        Signal lost. This booking is not on this device mesh.{" "}
        <a className="text-cyan-200" href="/trips">
          Back to trips
        </a>
      </Panel>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel className="relative overflow-hidden">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">Live trip · {b.status}</div>
        <div className="display mt-2 text-3xl">
          {b.pickup} → {b.dropoff}
        </div>
        <div className="relative mt-6 h-72 overflow-hidden rounded-[24px] bg-[#05001c]">
          <svg className="h-full w-full" viewBox="0 0 400 280">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop stopColor="#4ef2ff" />
                <stop offset="1" stopColor="#ff4fd8" />
              </linearGradient>
            </defs>
            <path d="M30 230 C 90 80, 170 220, 250 90 S 360 60, 380 140" fill="none" stroke="url(#g)" strokeWidth="2" />
            <circle cx="250" cy="90" r="7" fill="#4ef2ff" />
            <circle cx="30" cy="230" r="5" fill="#ff4fd8" />
          </svg>
          <div className="ring left-[58%] top-[28%] h-10 w-10" />
          <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-lime-300">
            GPS mesh · 4.2 km · 9 min
          </div>
          {sos && (
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-rose-400/40 bg-rose-600/30 p-3 text-sm">
              SOS armed. L3 incident cell paged. Last fix frozen. Nearby units flagged.
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Btn kind="ghost" onClick={() => setShare(true)}>
            Share live link
          </Btn>
          <Btn kind="danger" onClick={() => setSos(true)}>
            SOS
          </Btn>
          {b.status !== "completed" && b.status !== "cancelled" && (
            <Btn kind="ghost" onClick={() => advance(b.id)}>
              Pulse next state
            </Btn>
          )}
          {b.status !== "completed" && b.status !== "cancelled" && (
            <Btn kind="ghost" onClick={() => cancel(b.id)}>
              {locale === "zh" ? "取消／退款" : "Cancel / refund"}
            </Btn>
          )}
          {driver && (
            <Btn
              kind="ghost"
              onClick={() => {
                const r = requestSwitch({
                  bookingId: b.id,
                  fromDriverId: driver.id,
                  reason: "Request a different captain through ZOUFENG. No private contact.",
                  reasonZh: "透過公司申請更換司機，不私下聯絡。",
                });
                setSw(r.id);
              }}
            >
              {locale === "zh" ? "透過公司更換司機" : "Switch driver via company"}
            </Btn>
          )}
        </div>
        {share && (
          <p className="mt-3 text-sm text-cyan-100/80">
            {locale === "zh" ? "家屬連結" : "Family link"}: {typeof window !== "undefined" ? window.location.href : ""}
          </p>
        )}
        {sw && (
          <p className="mt-3 text-sm text-lime-300">
            {locale === "zh" ? "公司代換申請已送出" : "Company switch request sent"} · {sw}
          </p>
        )}
      </Panel>

      <div className="space-y-4">
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Captain</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/15 text-sm">{driver?.photo}</div>
            <div>
              <div className="display text-xl">
                {driver ? (locale === "zh" ? driver.nameZh : driver.name) : locale === "zh" ? "指派中…" : "Assigning…"}
              </div>
              <div className="text-xs text-white/50">
                {driver
                  ? `${driver.rating} ★ · ${driver.vehicle} · ${driver.plate}`
                  : locale === "zh" ? "公司派遣中" : "Company dispatch"}
              </div>
              <div className="mt-1 text-[11px] text-cyan-100/70">
                {locale === "zh" ? "由 ZOUFENG 代轉 — 不提供司機私人號碼" : "Relay via ZOUFENG — driver number is not shared"}
              </div>
            </div>
          </div>
        </Panel>
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Boarding OTP</div>
          <div className="display mt-2 text-4xl tracking-[0.3em]">{b.otp}</div>
          <p className="mt-2 text-sm text-white/50">Show this to the captain. They enter it to start In progress.</p>
          <div className="mt-3 flex gap-2">
            <input placeholder="Driver entry" value={code} onChange={(e) => setCode(e.target.value)} />
            <Btn
              kind="ghost"
              onClick={() => {
                if (code === b.otp) {
                  setOtpOk(true);
                  advance(b.id, "in_progress");
                }
              }}
            >
              Verify
            </Btn>
          </div>
          {otpOk && <div className="mt-2 text-sm text-lime-300">OTP sealed. Cabin is live.</div>}
        </Panel>
        <Panel>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Ledger</div>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            {b.breakdown.map((i) => (
              <li key={i.label} className="flex justify-between">
                <span>{locale === "zh" ? i.labelZh : i.label}</span>
                <span>{money(convert(i.amount, currency), currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between display text-xl">
            <span>Total</span>
            <span>{money(convert(b.price, currency), currency)}</span>
          </div>
          {b.flight && <p className="mt-3 text-xs text-white/45">Flight {b.flight} · {b.flightEta} · 60-min free wait</p>}
        </Panel>
      </div>
    </div>
  );
}
