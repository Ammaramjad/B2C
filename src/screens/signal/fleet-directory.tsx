"use client";

import Link from "next/link";
import { drivers } from "@/lib/data";
import { vehicles } from "@/lib/catalog";
import { useLive } from "@/lib/live/engine";
import { useCopy } from "@/lib/copy";

export function FleetDirectory() {
  const { L } = useCopy();
  const { live } = useLive();
  return (
    <div className="zf-site-wrap">
      <div className="kicker">{L("Company fleet", "公司車隊")}</div>
      <h1 className="display mt-2 text-5xl">{L("Drivers directory", "司機名錄")}</h1>
      <p className="mt-3 max-w-xl text-[#8b93a0]">
        {L("Company-mediated only. Request a preferred driver from booking — no private LINE or phone.", "僅公司仲介。從預訂申請指定司機——沒有私人 LINE 或電話。")}
      </p>
      <div className="zf-site-fleet mt-8">
        {drivers.map((d) => {
          const liveD = live.drivers.find((x) => x.plate === d.plate || x.name === d.name);
          const v = vehicles.find((x) => x.id === d.vehicleClass);
          return (
            <article key={d.id} className="zf-site-card">
              <i style={{ backgroundImage: `url(${v?.image ?? ""})` }} />
              <div className="p-4">
                <b>{d.name}</b>
                <p>{d.vehicle} · {d.plate} · {d.city}</p>
                <p>{L("Rating", "評分")} {d.rating} · {d.trips} {L("trips", "趟")} · {d.languages.join(" / ")}</p>
                <p>{L("Duty", "執勤")} {liveD?.duty ?? d.work} · {L("Fleet", "車隊")} {d.fleet}</p>
                <Link href={`/go?service=airport_pickup`} className="zf-btn mt-3" style={{ minHeight: 36 }}>
                  {L("Request via company", "透過公司申請")}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
