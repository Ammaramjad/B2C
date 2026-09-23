"use client";

import Link from "next/link";
import { useState } from "react";
import { AtlasMap } from "@/components/zf/map";
import { useActiveTrip } from "@/views/trips";
import { drivers } from "@/lib/data";
import { tx, vehicleLabel } from "@/lib/present";
import { useStore } from "@/lib/store";

export function LiveTrip() {
  const { locale } = useStore();
  const booking = useActiveTrip();
  const [share, setShare] = useState(false);
  const [sos, setSos] = useState(false);
  const driver = drivers.find((d) => d.id === booking?.driverId);
  if (!booking || !driver) {
    return (
      <div className="zf-page">
        <h1>{tx(locale, "No live trip", "目前沒有進行中的行程")}</h1>
        <p>{tx(locale, "When a driver is on the way, the map, boarding code, and safety actions open here.", "司機出發後，地圖、上車碼與安全動作會出現在這裡。")}</p>
        <Link className="zf-btn zf-btn-primary" href="/trips">
          {tx(locale, "See trips", "查看行程")}
        </Link>
      </div>
    );
  }
  return (
    <div className="zf-live">
      <AtlasMap
        tall
        showRoute
        markers={[
          { id: driver.id, x: 48, y: 44, kind: "enroute", label: driver.name },
          { id: "p", x: 30, y: 50, kind: "pickup", label: booking.pickup },
          { id: "d", x: 70, y: 34, kind: "drop", label: booking.dropoff },
        ]}
      />
      <aside className="zf-action">
        <p className="zf-kicker">{tx(locale, "Live", "即時")}</p>
        <h1 style={{ fontSize: "2rem" }}>{tx(locale, "On the way", "行程中")}</h1>
        <p>
          {booking.pickup} → {booking.dropoff}
        </p>
        <p className="zf-num">{tx(locale, "ETA 12 min", "預計 12 分鐘")}</p>
        <p>
          {driver.name} · {driver.rating} · {vehicleLabel(booking.vehicle, locale)} · {driver.plate}
        </p>
        <p className="zf-kicker">{tx(locale, "Boarding code", "上車碼")}</p>
        <p className="zf-otp">{booking.otp}</p>
        <p className="zf-note">{tx(locale, "Show this only to the driver at the car.", "只在車上給司機看。")}</p>
        <div className="zf-safety">
          <a className="zf-btn zf-btn-line" href={`tel:${driver.phone}`}>
            {tx(locale, "Contact", "聯絡")}
          </a>
          <button type="button" className="zf-btn zf-btn-line" onClick={() => setShare(true)}>
            {tx(locale, "Share trip", "分享行程")}
          </button>
          <button type="button" className="zf-btn zf-btn-danger" onClick={() => setSos(true)}>
            SOS
          </button>
        </div>
        <Link href="/support">{tx(locale, "Support", "支援")}</Link>
        {share && <p className="zf-alert">{tx(locale, "Link copied for this trip. It shows the car, driver, and route. It expires when the trip ends.", "已複製這趟的分享連結。內容包含車輛、司機與路線，行程結束後失效。")}</p>}
        {sos && (
          <div className="zf-alert zf-alert-bad">
            <strong>{tx(locale, "Safety desk is on this trip.", "安全席已接入這趟行程。")}</strong>
            <p>{tx(locale, "Stay on the line if you can. Your location, driver, and vehicle are already attached. Emergency services are contacted when you ask, or immediately if the call drops.", "若可以請保持通話。你的位置、司機與車輛已經附上。你要求時會聯絡緊急服務；若通話中斷也會立即聯絡。")}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
