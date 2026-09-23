"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { attractions, drivers, flights, seedBookings } from "@/lib/data";
import { services } from "@/lib/catalog";
import { cancelFee, money } from "@/lib/pricing";
import { extraLabel, useStore } from "@/lib/store";
import { AtlasMap } from "@/components/atlas/map";
import { Btn, Empty, Kicker, Stamp, StatusMark, Ticket } from "@/components/atlas/primitives";
import { serviceCopy } from "@/lib/atlas";

export function ConfirmationScreen() {
  const { id } = useParams<{ id: string }>();
  const { bookings } = useStore();
  const b = bookings.find((x) => x.id === id) ?? seedBookings[4];
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Stamp tone="pine">Confirmed</Stamp>
      <h1 className="serif mt-4 text-5xl">Your movement is on the board.</h1>
      <p className="mt-3 text-[var(--ink-soft)]">Reference {b.id}. Next: we match a driver and watch the flight if this is airport.</p>
      <Ticket className="mt-8 space-y-3">
        <div className="flex justify-between">
          <Kicker>{serviceCopy[b.service].en}</Kicker>
          <span className="metric text-2xl">{money(b.price, b.currency)}</span>
        </div>
        <div className="serif text-3xl">
          {b.pickup} → {b.dropoff}
        </div>
        <div className="text-sm">{b.when.replace("T", " ")} · Asia/Taipei</div>
        <div className="text-sm">
          {b.passengerName} · {b.vehicle} · {b.payment}
        </div>
        {b.flight ? <div className="text-sm">Flight {b.flight}</div> : null}
        <div className="text-sm text-[var(--ink-soft)]">Driver status: {b.driverId ? "Assigned — Kenji Mori" : "Matching fleet A → B → C"}</div>
      </Ticket>
      <div className="mt-6 flex flex-wrap gap-2">
        <Btn href={`/trips/${b.id}`}>Manage booking</Btn>
        <Btn href="/support" kind="ghost">
          Support
        </Btn>
        <Btn href="/trips" kind="ghost">
          All trips
        </Btn>
      </div>
    </div>
  );
}

export function TripsScreen() {
  const { bookings, locale } = useStore();
  const [tab, setTab] = useState("Upcoming");
  const groups: Record<string, string[]> = {
    Upcoming: ["payment_confirmed", "new", "assigned", "accepted"],
    Active: ["arriving", "onboard"],
    Completed: ["completed"],
    Cancelled: ["cancelled"],
  };
  const rows = bookings.filter((b) => groups[tab].includes(b.status));
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Kicker>My trips</Kicker>
      <h1 className="serif mt-2 text-5xl">Movements</h1>
      <div className="mt-6 flex gap-4 text-sm">
        {Object.keys(groups).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "border-b border-[var(--copper)]" : "text-[var(--mute)]"}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {rows.length === 0 ? <Empty title="Nothing in this tray" body="Book a corridor or switch trays." action={<Btn href="/">Discover</Btn>} /> : null}
        {rows.map((b) => (
          <Link key={b.id} href={`/trips/${b.id}`} className="ticket flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="kicker">{b.id}</div>
              <div className="font-semibold">
                {locale === "zh" ? serviceCopy[b.service].zh : serviceCopy[b.service].en} · {b.pickup} → {b.dropoff}
              </div>
              <div className="text-sm text-[var(--ink-soft)]">
                {b.when.replace("T", " ")} · {b.vehicle}
                {b.driverId ? ` · ${drivers.find((d) => d.id === b.driverId)?.name}` : ""}
              </div>
            </div>
            <div className="text-right">
              <StatusMark status={b.status} />
              <div className="metric mt-2">{money(b.price, b.currency)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BookingDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { bookings, cancel, locale } = useStore();
  const [cancelOpen, setCancelOpen] = useState(false);
  const b = bookings.find((x) => x.id === id) ?? seedBookings[4];
  const driver = drivers.find((d) => d.id === b.driverId);
  const [now] = useState(() => Date.now());
  const hours = Math.max(0, (new Date(b.when).getTime() - now) / 36e5);
  const fee = cancelFee(hours, b.price);
  const events = ["Created", "Payment confirmed", "Driver assigned", "Driver en route", "Driver arrived", "Trip started", "Completed"];
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <Kicker>{b.id}</Kicker>
          <h1 className="serif mt-2 text-5xl">
            {b.pickup} → {b.dropoff}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusMark status={b.status} />
            <Stamp>{serviceCopy[b.service].en}</Stamp>
          </div>
          <div className="mt-6">
            <AtlasMap pickup={b.pickup} dropoff={b.dropoff} height={280} />
          </div>
          <ol className="mt-6 space-y-3 border-l border-[var(--rule)] pl-4">
            {events.map((e, i) => (
              <li key={e} className={i < 4 ? "" : "text-[var(--mute)]"}>
                <div className="text-sm font-semibold">{e}</div>
                <div className="text-xs text-[var(--mute)]">{i < 4 ? "Logged" : "Awaiting"}</div>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <Ticket>
            <Kicker>Passenger</Kicker>
            <div className="mt-2 font-semibold">{b.passengerName}</div>
            <div className="text-sm">{b.passengers} pax · {b.luggage} bags</div>
            <div className="text-sm">{b.extras.map((x) => extraLabel(x, locale)).join(" · ") || "No extras"}</div>
          </Ticket>
          {driver ? (
            <Ticket>
              <Kicker>Driver</Kicker>
              <div className="mt-2 font-semibold">{driver.name}</div>
              <div className="text-sm">
                {driver.vehicle} · {driver.plate} · {driver.rating}
              </div>
            </Ticket>
          ) : null}
          {b.flight ? (
            <Ticket>
              <Kicker>Flight</Kicker>
              <div className="mt-2 font-semibold">
                {b.flight} · {flights[b.flight]?.status}
              </div>
            </Ticket>
          ) : null}
          <Ticket>
            <div className="flex justify-between">
              <Kicker>Total</Kicker>
              <span className="metric text-2xl">{money(b.price, b.currency)}</span>
            </div>
          </Ticket>
          <Btn href={`/live?id=${b.id}`}>Open live trip</Btn>
          <Btn kind="ghost" onClick={() => setCancelOpen(true)}>
            Cancel trip
          </Btn>
          {cancelOpen ? (
            <Ticket>
              <h3 className="serif text-2xl">Cancel consequence</h3>
              <p className="mt-2 text-sm">
                {hours >= 24 ? "Full refund to original payment." : hours >= 6 ? `Partial fee ${money(fee, b.currency)}.` : `Fare retained ${money(fee, b.currency)}.`}
              </p>
              <Fieldish />
              <div className="mt-3 flex gap-2">
                <Btn
                  kind="alert"
                  onClick={() => {
                    cancel(b.id);
                    setCancelOpen(false);
                  }}
                >
                  Confirm cancel
                </Btn>
                <Btn kind="ghost" onClick={() => setCancelOpen(false)}>
                  Keep trip
                </Btn>
              </div>
            </Ticket>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Fieldish() {
  return (
    <label className="mt-3 block text-sm">
      Reason
      <select className="atlas-select mt-1">
        <option>Plans changed</option>
        <option>Flight cancelled</option>
        <option>Found another ride</option>
      </select>
    </label>
  );
}

export function LiveTripScreen() {
  const params = useSearchParams();
  const { bookings } = useStore();
  const id = params.get("id") ?? "ZD-1805";
  const b = bookings.find((x) => x.id === id) ?? seedBookings[4];
  const driver = drivers.find((d) => d.id === b.driverId) ?? drivers[0];
  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      <AtlasMap pickup={b.pickup} dropoff={b.dropoff} live eta="11 min" height={720} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4">
        <Stamp tone="copper">LIVE</Stamp>
        <div className="pointer-events-auto flex gap-2">
          <Btn kind="ghost" className="min-h-10 bg-[var(--paper)]">
            Share trip
          </Btn>
          <Btn kind="alert" className="min-h-10">
            SOS
          </Btn>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-16 md:bottom-6">
        <div className="mx-auto max-w-xl ticket">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Kicker>Boarding code</Kicker>
              <div className="metric text-5xl tracking-[0.2em]">{b.otp}</div>
            </div>
            <div className="text-right">
              <Kicker>Driver</Kicker>
              <div className="font-semibold">{driver.name}</div>
              <div className="text-sm text-[var(--ink-soft)]">
                {driver.vehicle} · {driver.plate}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="border border-[var(--rule)] p-2">Contact via Atlas</div>
            <div className="border border-[var(--rule)] p-2">Support</div>
            <div className="border border-[var(--copper)] p-2 text-[var(--copper)]">Safety</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WalletScreen() {
  const { user, currency } = useStore();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Kicker>Wallet · M20</Kicker>
      <h1 className="serif mt-2 text-5xl">Credits that behave like money.</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Ticket>
          <Kicker>Balance</Kicker>
          <div className="metric mt-2 text-4xl">{money(user?.wallet[currency] ?? 12600, currency)}</div>
        </Ticket>
        <Ticket>
          <Kicker>Coupons</Kicker>
          <div className="mt-2">TPE200 · FAMILY</div>
        </Ticket>
        <Ticket>
          <Kicker>Referral pending</Kicker>
          <div className="metric mt-2 text-3xl">NT$200</div>
        </Ticket>
      </div>
      <table className="dense mt-8 w-full">
        <thead>
          <tr>
            <th>When</th>
            <th>Type</th>
            <th>Expiry</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>23 Sep</td>
            <td>Refund credit ZD-1809</td>
            <td>23 Dec</td>
            <td className="metric">+NT$0</td>
          </tr>
          <tr>
            <td>20 Sep</td>
            <td>Trip spend ZD-1801</td>
            <td>—</td>
            <td className="metric">−NT$2,750</td>
          </tr>
          <tr>
            <td>12 Sep</td>
            <td>Welcome credit</td>
            <td>12 Oct</td>
            <td className="metric">+NT$100</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function ReferralScreen() {
  const { user } = useStore();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Kicker>Referral · M26</Kicker>
      <h1 className="serif mt-2 text-5xl">Invite a traveler. Keep the corridor warm.</h1>
      <Ticket className="mt-8">
        <Kicker>Your code</Kicker>
        <div className="metric mt-2 text-4xl">{user?.referralCode ?? "ZOUFENG-88"}</div>
        <div className="mt-4 flex gap-2">
          <Btn>Share link</Btn>
          <Btn kind="ghost">Copy</Btn>
        </div>
      </Ticket>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ["Driver → Customer", "2 pending"],
          ["Customer → Customer", "5 completed"],
          ["B2B → Customer", "1 campaign"],
        ].map(([k, v]) => (
          <Ticket key={k}>
            <Kicker>{k}</Kicker>
            <div className="mt-2">{v}</div>
          </Ticket>
        ))}
      </div>
    </div>
  );
}

export function PlannerScreen() {
  const [view, setView] = useState("Timeline");
  const days = [
    { day: "Day 1", items: ["Taipei 101", "Chiang Kai-shek Memorial", "Shilin Night Market"] },
    { day: "Day 2", items: ["Jiufen Old Street", "Tamsui sunset"] },
    { day: "Day 3", items: ["Beitou spring", "Songshan TSA drop"] },
  ];
  const fare = 8920;
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
      <Kicker>AI trip planner · M16</Kicker>
      <h1 className="serif mt-2 text-5xl">Plan a 3-day Taipei family trip for five.</h1>
      <p className="mt-3 max-w-xl text-[var(--ink-soft)]">Atlas recommends. It does not buy rides. Review transportation is explicit.</p>
      <div className="mt-6 flex gap-4 text-sm">
        {["Map", "Timeline", "Budget"].map((v) => (
          <button key={v} onClick={() => setView(v)} className={view === v ? "border-b border-[var(--copper)]" : "text-[var(--mute)]"}>
            {v} view
          </button>
        ))}
      </div>
      {view === "Map" ? (
        <div className="mt-6">
          <AtlasMap pickup="Hotel" dropoff="Jiufen" height={420} />
        </div>
      ) : null}
      {view === "Budget" ? (
        <Ticket className="mt-6">
          <div className="flex justify-between">
            <div>Estimated transport</div>
            <div className="metric text-3xl">NT${fare.toLocaleString()}</div>
          </div>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">MPV recommended for 5 pax / 4 bags. Sedan cannot accommodate this party.</p>
        </Ticket>
      ) : null}
      {view !== "Map" && view !== "Budget" ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {days.map((d) => (
            <Ticket key={d.day}>
              <Kicker>{d.day}</Kicker>
              <ol className="mt-3 space-y-3">
                {d.items.map((item, i) => (
                  <li key={item} className="border border-[var(--rule)] p-3">
                    <div className="font-semibold">{item}</div>
                    <div className="text-xs text-[var(--mute)]">
                      {9 + i * 3}:00 · {attractions[i % attractions.length]?.hours ?? 2}h · drag to reorder
                    </div>
                  </li>
                ))}
              </ol>
            </Ticket>
          ))}
        </div>
      ) : null}
      <div className="sticky bottom-20 mt-8 flex justify-end md:bottom-6">
        <Btn href="/book?service=hourly">Review & book transportation</Btn>
      </div>
    </div>
  );
}

export function SupportScreen() {
  const { messages, askHalo } = useStore();
  const [text, setText] = useState("");
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[1fr_280px]">
      <div>
        <Kicker>Support · M21</Kicker>
        <h1 className="serif mt-2 text-5xl">Ask about a booking, not a bot.</h1>
        <div className="mt-6 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-lg ${m.role === "user" ? "ml-auto ticket" : "paper p-4"}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) askHalo(text);
            setText("");
          }}
        >
          <input className="atlas-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cancel policy? Flight delay?" />
          <Btn type="submit">Send</Btn>
        </form>
      </div>
      <aside className="space-y-3">
        {["Booking", "Payment", "Refund", "Airport", "Emergency"].map((c) => (
          <button key={c} className="ticket w-full text-left">
            {c}
          </button>
        ))}
        <Btn kind="alert" className="wide">
          Escalate to human
        </Btn>
      </aside>
    </div>
  );
}

export function ProfileScreen() {
  const { user, locale, currency } = useStore();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Kicker>Membership · M08</Kicker>
      <h1 className="serif mt-2 text-5xl">{user?.name ?? "Amara Chen"}</h1>
      <div className="mt-2 text-[var(--ink-soft)]">Atlas Circle · {user?.points ?? 4280} pts · {locale.toUpperCase()} · {currency}</div>
      <div className="mt-8 grid gap-3">
        {[
          ["Saved passengers", "Amara Chen, James Wu"],
          ["Saved locations", "Taipei 101, Banqiao residence"],
          ["Payment methods", "Visa ••4410 · Apple Pay"],
          ["Ride preferences", "Quiet cabin · English driver"],
          ["Safety", "Trusted contacts · trip share default on"],
          ["Corporate", "Northwind Travel policy"],
        ].map(([k, v]) => (
          <Ticket key={k} className="flex justify-between gap-4">
            <div>
              <div className="font-semibold">{k}</div>
              <div className="text-sm text-[var(--ink-soft)]">{v}</div>
            </div>
            <span className="text-sm text-[var(--copper)]">Edit</span>
          </Ticket>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link href="/wallet" className="underline">
          Wallet
        </Link>
        <Link href="/referral" className="underline">
          Referrals
        </Link>
        <Link href="/driver" className="underline">
          Driver OS
        </Link>
        <Link href="/ops" className="underline">
          Operations
        </Link>
      </div>
    </div>
  );
}

export function DestinationsScreen() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Kicker>SEO / AEO · M22</Kicker>
      <h1 className="serif mt-2 text-5xl">Airport and city corridors</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {services.map((s) => (
          <Link key={s.id} href={`/book?service=${s.id}`} className="ticket">
            <div className="serif text-3xl">{s.en}</div>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Structured landing with booking CTA, FAQ, and destination copy.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DestinationCity({ id }: { id: string }) {
  return (
    <div>
      <div className="relative h-[42vh] overflow-hidden border-b border-[var(--rule)]">
        <img src="https://images.unsplash.com/photo-1470004912531-91af144e4a8b?w=1800&q=80" alt="" className="h-full w-full object-cover" />
        <div className="absolute bottom-6 left-6 text-[#f7f1e6]">
          <Kicker>Corridor</Kicker>
          <h1 className="serif text-6xl capitalize">{id}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-lg text-[var(--ink-soft)]">Airport pickup from TPE, private transfers across the basin, and hourly loops to Jiufen. Book from the page — this is a travel-commerce template, not a blog.</p>
        <Btn href="/book?service=airport_pickup" className="mt-6">
          Book Taipei airport pickup
        </Btn>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { login } = useStore();
  return (
    <div className="mx-auto max-w-md">
      <Kicker>Role gate</Kicker>
      <h1 className="serif mt-2 text-5xl">Enter Atlas</h1>
      <div className="mt-8 grid gap-2">
        {[
          ["passenger", "Passenger"],
          ["driver", "Driver"],
          ["ops", "Operations"],
          ["dispatcher", "Dispatch"],
        ].map(([role, label]) => (
          <Btn key={role} href={role === "driver" ? "/driver" : role === "passenger" ? "/" : "/ops"} onClick={() => login(`${role}@zoufeng.travel`, role as never)}>
            Continue as {label}
          </Btn>
        ))}
      </div>
    </div>
  );
}

