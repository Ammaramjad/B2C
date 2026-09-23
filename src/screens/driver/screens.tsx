"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { drivers, seedBookings, seedSettlements } from "@/lib/data";
import { useStore } from "@/lib/store";
import { AtlasMap } from "@/components/atlas/map";
import { Btn, Kicker, Stamp, Ticket } from "@/components/atlas/primitives";

const me = drivers[0];
const job = seedBookings[4];

export function DriverHome() {
  const [on, setOn] = useState(true);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Kicker>Duty</Kicker>
          <h1 className="serif text-4xl">{on ? "On the board" : "Off duty"}</h1>
        </div>
        <button onClick={() => setOn((v) => !v)} className={`min-h-12 px-4 ${on ? "atlas-btn solid" : "atlas-btn ghost"}`}>
          {on ? "Online" : "Go online"}
        </button>
      </div>
      <Ticket>
        <Kicker>Today</Kicker>
        <div className="metric text-5xl">NT${me.earningsToday.toLocaleString()}</div>
        <div className="mt-1 text-sm text-[var(--mute)]">{me.completedWeek} trips this week</div>
      </Ticket>
      <Ticket>
        <Kicker>Current / next</Kicker>
        <div className="mt-2 serif text-3xl">
          {job.pickup} → {job.dropoff}
        </div>
        <div className="text-sm">JL809 delayed −8m · T1 · 2 pax / 3 bags</div>
        <Btn href="/driver/pickup" className="mt-4 wide">
          Navigate to pickup
        </Btn>
      </Ticket>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Ticket>Service area · Taipei basin</Ticket>
        <Ticket>3 scheduled jobs</Ticket>
      </div>
    </div>
  );
}

export function DriverOffer() {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Kicker>Incoming job</Kicker>
        <div className="metric text-5xl text-[var(--copper)]">0:18</div>
      </div>
      <Ticket>
        <Stamp tone="copper">Airport pickup</Stamp>
        <h1 className="serif mt-3 text-4xl">
          TPE T1 → Beitou
        </h1>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Distance to pickup</dt><dd>14 km</dd></div>
          <div className="flex justify-between"><dt>Schedule</dt><dd>16:30 · flight JL809</dd></div>
          <div className="flex justify-between"><dt>Party</dt><dd>2 pax · 3 bags</dd></div>
          <div className="flex justify-between"><dt>Vehicle</dt><dd>Sedan / Camry class</dd></div>
          <div className="flex justify-between"><dt>Est. net</dt><dd className="metric">NT$1,144</dd></div>
        </dl>
      </Ticket>
      <div className="grid grid-cols-[1fr_1.4fr] gap-2">
        <Btn kind="ghost" className="min-h-20 text-xl" onClick={() => router.push("/driver")}>
          Reject
        </Btn>
        <Btn className="min-h-20 text-xl" onClick={() => router.push("/driver/pickup")}>
          ACCEPT
        </Btn>
      </div>
    </div>
  );
}

export function DriverPickup() {
  return (
    <div className="-mx-4">
      <AtlasMap pickup={job.pickup} dropoff={job.dropoff} height={360} live eta="11 min" />
      <div className="space-y-3 px-4 pt-4">
        <Kicker>State · Navigate to pickup</Kicker>
        <h1 className="serif text-3xl">TPE T1 Arrivals · Door 8</h1>
        <p className="text-sm text-[var(--ink-soft)]">JL809 early −8m. Meet-and-greet sign. 45-min wait clock starts at actual arrival.</p>
        <Btn href="/driver/otp" className="wide min-h-14">
          Arrived
        </Btn>
      </div>
    </div>
  );
}

export function DriverOtp() {
  const [code, setCode] = useState("");
  const router = useRouter();
  return (
    <div className="space-y-4">
      <Kicker>Verify passenger</Kicker>
      <h1 className="serif text-4xl">Enter the four-digit boarding code.</h1>
      <input
        className="atlas-input metric text-center text-5xl tracking-[0.4em]"
        maxLength={4}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="••••"
      />
      <p className="text-sm text-[var(--mute)]">Passenger sees {job.otp}. Do not ask them to skip verification.</p>
      <Btn className="wide min-h-14" disabled={code.length < 4} onClick={() => router.push("/driver/trip")}>
        Verify & start
      </Btn>
    </div>
  );
}

export function DriverTrip() {
  const { advance } = useStore();
  return (
    <div className="-mx-4">
      <AtlasMap pickup={job.pickup} dropoff={job.dropoff} height={360} live eta="22 min" />
      <div className="space-y-3 px-4 pt-4">
        <Kicker>State · On trip</Kicker>
        <h1 className="serif text-3xl">To Beitou</h1>
        <div className="flex gap-2">
          <Btn kind="ghost">Contact via Atlas</Btn>
          <Btn kind="alert">Emergency</Btn>
        </div>
        <Btn
          className="wide min-h-14"
          onClick={() => {
            advance(job.id, "completed");
          }}
          href="/driver/earnings"
        >
          Complete trip
        </Btn>
      </div>
    </div>
  );
}

export function DriverEarnings() {
  return (
    <div className="space-y-4">
      <h1 className="serif text-4xl">Earnings</h1>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Today", me.earningsToday],
          ["Week", me.earningsWeek],
          ["Month", me.earningsMonth],
        ].map(([k, v]) => (
          <Ticket key={String(k)}>
            <Kicker>{k}</Kicker>
            <div className="metric text-xl">NT${Number(v).toLocaleString()}</div>
          </Ticket>
        ))}
      </div>
      <Ticket>
        Pending payout NT${me.pendingPayout.toLocaleString()} · referral bonus NT$400
      </Ticket>
      <Btn href="/driver/settlement" kind="ghost" className="wide">
        Settlement statement
      </Btn>
    </div>
  );
}

export function DriverSettlement() {
  const s = seedSettlements[0];
  return (
    <div className="space-y-4">
      <h1 className="serif text-4xl">Settlement</h1>
      <Ticket>
        <div className="kicker">{s.week}</div>
        <div className="mt-2 text-sm">Gross NT${s.gross.toLocaleString()}</div>
        <div className="text-sm">Commission NT${s.commission.toLocaleString()}</div>
        <div className="metric mt-2 text-3xl">Net NT${s.net.toLocaleString()}</div>
        <Stamp tone="warn">{s.status}</Stamp>
      </Ticket>
      <Btn kind="ghost" className="wide">
        Export CSV
      </Btn>
    </div>
  );
}

export function DriverDocuments() {
  const docs = [
    ["Driver license", "Valid · 2028-03", "ok"],
    ["Vehicle registration", "Valid · 2027-01", "ok"],
    ["Insurance", "Expires 34 days", "warn"],
    ["Commercial permit", "Rejected — recapture page 2", "alert"],
  ];
  return (
    <div className="space-y-3">
      <h1 className="serif text-4xl">Documents</h1>
      {docs.map(([n, s, t]) => (
        <Ticket key={n} className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{n}</div>
            <div className="text-sm text-[var(--ink-soft)]">{s}</div>
          </div>
          <Stamp tone={t === "ok" ? "pine" : t === "warn" ? "warn" : "alert"}>{t}</Stamp>
        </Ticket>
      ))}
      <Btn className="wide">Re-upload permit</Btn>
    </div>
  );
}
