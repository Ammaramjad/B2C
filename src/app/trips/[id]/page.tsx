"use client";

import { use, useState } from "react";
import { drivers, flights as flightDb } from "@/lib/data";
import { cancellationConsequence } from "@/lib/domain/policy";
import { statusLabel, timelineOrder } from "@/lib/domain/state-machine";
import { loc } from "@/lib/i18n";
import { convert, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { Alert, Button, EmptyState } from "@/components/system";
import { OpsMap } from "@/components/ops-map";

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
    return <EmptyState title={loc(locale, "Trip not on this device", "此裝置沒有這筆行程")} body={loc(locale, "Bookings created here stay in the local demo adapter.", "此處建立的訂單存在本機示範轉接器。")} action={<Button href="/trips">{loc(locale, "My trips", "我的行程")}</Button>} />;
  }

  const consequence = cancellationConsequence(b.when, b.price);
  const zh = locale === "zh";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <OpsMap locale={locale} height={360} pickup={b.pickup} dropoff={b.dropoff} eta={loc(locale, "Demo ETA 9 min", "示範 ETA 9 分")} caption={loc(locale, "Live trip geometry is demo data, not production GPS.", "即時行程幾何為示範資料，非正式 GPS。")} />
      </div>
      <div className="space-y-5">
        <div>
          <p className="label">{b.id}</p>
          <h1 className="display text-3xl">{b.pickup} → {b.dropoff}</h1>
          <p className="mt-1 font-semibold">{zh ? statusLabel[b.status].zh : statusLabel[b.status].en}</p>
        </div>
        <div className="metric text-3xl">{money(convert(b.price, currency), currency)}</div>
        {b.flight && (
          <Alert tone={flight?.status.includes("Delay") ? "warn" : "info"}>
            {loc(locale, "Flight", "航班")} {b.flight} · {flight ? (zh ? flight.statusZh : flight.status) : loc(locale, "Verify manually — flight adapter unavailable", "請人工核實——航班轉接器未連線")} · {flight?.terminal}
          </Alert>
        )}
        <ol className="timeline">
          {timelineOrder.map((st) => (
            <li key={st}>
              <span className={`dot ${timelineOrder.indexOf(st) <= timelineOrder.indexOf(b.status) ? "on" : ""}`} />
              <span className="text-sm">{zh ? statusLabel[st].zh : statusLabel[st].en}</span>
            </li>
          ))}
        </ol>
        <div>
          <div className="label">{loc(locale, "Driver", "司機")}</div>
          <p className="display text-xl">{driver ? driver.name : loc(locale, "Company assigning…", "公司指派中…")}</p>
          <p className="text-sm text-[var(--text-secondary)]">{driver ? `${driver.vehicle} · ${driver.plate}` : loc(locale, "Private numbers are not shared.", "不提供私人電話。")}</p>
        </div>
        <div>
          <div className="label">OTP</div>
          <div className="metric text-4xl tracking-[0.18em]">{b.otp}</div>
          <div className="mt-2 flex gap-2">
            <input placeholder={loc(locale, "Driver entry", "司機輸入")} value={code} onChange={(e) => setCode(e.target.value)} />
            <Button
              kind="ghost"
              disabled={code.length < 4}
              title={code.length < 4 ? loc(locale, "Enter the 4-digit code", "請輸入 4 位數") : undefined}
              onClick={() => {
                if (code === b.otp) {
                  setOtpOk(true);
                  advance(b.id, "onboard");
                }
              }}
            >
              {loc(locale, "Verify", "驗證")}
            </Button>
          </div>
          {otpOk && <p className="mt-2 text-sm text-[var(--success)]">{loc(locale, "Passenger verified.", "乘客已驗證。")}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button kind="ghost" onClick={() => setShare(true)}>{loc(locale, "Share trip", "分享行程")}</Button>
          <Button kind="danger" onClick={() => setSos(true)}>{loc(locale, "SOS — escalate to ops", "SOS — 升級調度")}</Button>
        </div>
        {share && <Alert tone="ok">{loc(locale, "Share link is a prototype (copy from this device).", "分享連結為原型（僅此裝置）。")}</Alert>}
        {sos && <Alert tone="danger">{loc(locale, "SOS marked on this booking. Operations can see the exception in the command center.", "已標記 SOS。調度可在指揮中心看到此異常。")}</Alert>}
        {b.status !== "completed" && b.status !== "cancelled" && (
          <div className="space-y-2 border-t border-[var(--border)] pt-4">
            <p className="text-sm">
              {loc(locale, "Cancel now:", "現在取消：")} {consequence.tier === "free" ? loc(locale, "full refund", "全額退款") : consequence.tier === "partial" ? loc(locale, `fee ${money(consequence.fee, "TWD")}`, `手續費 ${money(consequence.fee, "TWD")}`) : loc(locale, "no refund", "不予退款")}
            </p>
            <Button kind="ghost" onClick={() => cancel(b.id)}>{loc(locale, "Cancel this booking", "取消此預訂")}</Button>
            <Button
              kind="plain"
              onClick={() => {
                if (!driver) return;
                const req = requestSwitch({ bookingId: b.id, fromDriverId: driver.id, reason: "Passenger requested company switch", reasonZh: "旅客申請公司代換" });
                setSw(req.id);
              }}
            >
              {loc(locale, "Request different driver via company", "透過公司申請更換司機")}
            </Button>
            {sw && <p className="text-sm">{loc(locale, "Switch request", "更換申請")} {sw}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
