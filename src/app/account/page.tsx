"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { drivers } from "@/lib/data";
import { loc, t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Btn, Field, Panel, Stat } from "@/components/ui";

export default function AccountPage() {
  const { user, logout, bookings, locale, lastDriverId, requestSwitch, switches } = useStore();
  const d = t(locale);
  const router = useRouter();
  const [reason, setReason] = useState(
    locale === "zh"
      ? "希望更換車型／語言，請公司改派，我不直接聯絡其他司機。"
      : "Need a different vehicle/language. Please reassign through the company — I will not contact another driver privately.",
  );
  const [sent, setSent] = useState("");
  const last = drivers.find((x) => x.id === lastDriverId());
  const mine = switches.filter((s) => s.passengerId === (user?.id ?? "p1"));

  if (!user) {
    return (
      <Panel>
        <a className="text-cyan-200" href="/login">
          {loc(locale, "Sign into Aether", "登入 Aether")}
        </a>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{user.name}</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat k={loc(locale, "Role", "角色")} v={user.role} />
        <Stat k={loc(locale, "Points", "點數")} v={String(user.points)} />
        <Stat k={loc(locale, "Trips in ledger", "帳本行程")} v={String(bookings.filter((b) => b.passengerId === user.id || user.role !== "passenger").length)} />
      </div>

      <Panel className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{d.lastCaptain}</div>
        <p className="text-white/80">
          {last ? `${locale === "zh" ? last.nameZh : last.name} · ${last.plate} · ${last.vehicle}` : "—"}
        </p>
        <p className="text-sm text-white/55">{d.switchPolicy}</p>
        <p className="text-xs text-cyan-100/70">{d.maskedPhone}</p>
        {last && (
          <>
            <Field label={loc(locale, "Reason for company switch", "公司代換原因")}>
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <Btn
              onClick={() => {
                const r = requestSwitch({
                  fromDriverId: last.id,
                  reason,
                  reasonZh: reason,
                });
                setSent(r.id);
              }}
            >
              {d.requestSwitch}
            </Btn>
            {sent && <p className="text-sm text-lime-300">{d.switchOpen} · {sent}</p>}
          </>
        )}
        {mine.length > 0 && (
          <div className="space-y-2 pt-2">
            {mine.map((s) => (
              <div key={s.id} className="text-sm text-white/55">
                {s.id} · {s.status} · {locale === "zh" ? s.reasonZh : s.reason}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
          {loc(locale, "Cabin preferences", "座艙偏好")}
        </div>
        <p className="mt-2 text-white/70">
          {loc(locale, "Quiet ride", "安靜行程")} {user.prefs.quiet ? "on" : "off"} · AC {user.prefs.ac}°C · {user.prefs.vehicle}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {user.email} · {user.phone} · {user.referralCode}
        </p>
        <div className="mt-4 flex gap-3">
          <Btn href="/wallet" kind="ghost">
            {d.wallet}
          </Btn>
          <Btn href="/loyalty" kind="ghost">
            RFM
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            {loc(locale, "Exit", "登出")}
          </Btn>
        </div>
      </Panel>
    </div>
  );
}
