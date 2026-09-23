"use client";

import { use, useState } from "react";
import { flights as flightDb } from "@/lib/data";
import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { LiveMap } from "@/components/live-map";
import { Btn, Status } from "@/components/ui";

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
  const flight = b?.flight ? flightDb[b.flight] : undefined;

  if (!b) {
    return <p className="text-[var(--muted)]">{loc(locale, "This trip is not on this device.", "此裝置沒有這筆行程。")}</p>;
  }

  const airport = b.service.startsWith("airport");

  return (
    <div className="relative lg:-mx-4">
      <LiveMap
        locale={locale}
        mode="trip"
        height={typeof window !== "undefined" && window.innerWidth < 768 ? 520 : 560}
        focusDriverId={driver?.id}
        pickup={b.pickup}
        dropoff={b.dropoff}
        eta={loc(locale, "9 min", "9 分")}
      />
      <div className="sheet relative z-10 mx-auto -mt-16 max-w-2xl p-5 md:rounded-[24px] md:border md:border-[var(--border)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Status kind={["arriving", "onboard", "accepted"].includes(b.status) ? "active" : b.status}>{b.status}</Status>
          <span className="metric text-2xl">{money(convert(b.price, currency), currency)}</span>
        </div>
        <h1 className="display text-3xl">{b.pickup} → {b.dropoff}</h1>
        {airport && (
          <ol className="mt-4 space-y-2 text-sm">
            <li>Flight {b.flight} · {flight ? (locale === "zh" ? flight.statusZh : flight.status) : "—"}</li>
            <li className="text-[var(--muted)]">{loc(locale, "Arrival → driver ready → pickup · 45-min wait", "抵達 → 司機就緒 → 接送 · 45 分等候")}</li>
          </ol>
        )}
        <div className="mt-4 flex items-center gap-3">
          <div className="avatar">{driver?.photo ?? "—"}</div>
          <div>
            <div className="display text-xl">{driver ? driver.name : loc(locale, "Assigning…", "指派中…")}</div>
            <div className="text-sm text-[var(--muted)]">{driver ? `${driver.vehicle} · ${driver.plate}` : loc(locale, "Company dispatch", "公司派遣")}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="label">OTP</div>
          <div className="display metric text-4xl tracking-[0.2em]">{b.otp}</div>
          <div className="mt-2 flex gap-2">
            <input placeholder={loc(locale, "Driver entry", "司機輸入")} value={code} onChange={(e) => setCode(e.target.value)} />
            <Btn
              kind="ghost"
              onClick={() => {
                if (code === b.otp) {
                  setOtpOk(true);
                  advance(b.id, "onboard");
                }
              }}
            >
              {loc(locale, "Verify", "驗證")}
            </Btn>
          </div>
          {otpOk && <p className="mt-2 text-sm text-[var(--success)]">{loc(locale, "Passenger verified.", "乘客已驗證。")}</p>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Btn kind="ghost" onClick={() => setShare(true)}>{loc(locale, "Share trip", "分享行程")}</Btn>
          <Btn kind="danger" onClick={() => setSos(true)}>SOS</Btn>
          {driver && (
            <Btn
              kind="ghost"
              onClick={() => {
                const r = requestSwitch({
                  bookingId: b.id,
                  fromDriverId: driver.id,
                  reason: "Request a different driver through the company.",
                  reasonZh: "透過公司申請更換司機。",
                });
                setSw(r.id);
              }}
            >
              {loc(locale, "Switch via company", "透過公司更換")}
            </Btn>
          )}
          {b.status !== "completed" && b.status !== "cancelled" && (
            <Btn kind="ghost" onClick={() => cancel(b.id)}>{loc(locale, "Cancel", "取消")}</Btn>
          )}
        </div>
        {share && <p className="mt-3 text-sm text-[var(--muted)]">{typeof window !== "undefined" ? window.location.href : ""}</p>}
        {sw && <p className="mt-3 text-sm text-[var(--ai)]">{loc(locale, "Company switch sent", "公司代換已送出")} · {sw}</p>}
        {sos && <p className="mt-3 text-sm text-[var(--danger)]">{loc(locale, "SOS sent to operations.", "SOS 已送交調度。")}</p>}
      </div>
    </div>
  );
}
