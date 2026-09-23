"use client";

import { drivers } from "@/lib/data";
import { loc } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function FleetPage() {
  const { locale, bookings } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <p className="label">{loc(locale, "Fleet", "車隊")}</p>
        <h1 className="display text-4xl">{loc(locale, "Drivers and supply", "司機與運力")}</h1>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[var(--text-secondary)]">
            <tr>
              <th className="py-2 font-medium">{loc(locale, "Driver", "司機")}</th>
              <th className="font-medium">{loc(locale, "Fleet", "車隊")}</th>
              <th className="font-medium">{loc(locale, "Work", "狀態")}</th>
              <th className="font-medium">{loc(locale, "Docs", "證件")}</th>
              <th className="font-medium">{loc(locale, "Accept", "接單率")}</th>
              <th className="font-medium">{loc(locale, "Active", "進行中")}</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-[var(--border)]">
                <td className="py-3">{d.name}<div className="text-[var(--text-secondary)]">{d.vehicle} · {d.plate}</div></td>
                <td>{d.fleet}</td>
                <td>{d.work}</td>
                <td>{d.status}</td>
                <td className="metric">{Math.round(d.acceptRate * 100)}%</td>
                <td>{bookings.filter((b) => b.driverId === d.id && !["completed", "cancelled"].includes(b.status)).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{loc(locale, "A company · B affiliate · C partner. Approval actions will be privileged and audited.", "A 自營 · B 加盟 · C 合作。核准動作將具權限並寫入稽核。")}</p>
    </div>
  );
}
