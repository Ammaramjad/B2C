"use client";

import Link from "next/link";
import { screens } from "@/design/screens";
import { Status } from "@/components/zf/ui";
import { AtlasMap } from "@/components/zf/map";

const tokens = [
  ["Paper", "--paper"],
  ["Raised", "--paper-raised"],
  ["Sunk", "--paper-sunk"],
  ["Ink", "--ink"],
  ["Pine", "--pine"],
  ["Cinnabar", "--signal"],
  ["Brass", "--brass"],
  ["Sea", "--sea"],
];

export function Studio() {
  const groups = ["Passenger", "Driver", "Operations", "Admin", "Public", "System"];
  return (
    <div className="zf-page">
      <p className="zf-kicker">Design foundation · not approved for full development</p>
      <h1>Harbor</h1>
      <p>Zoufeng is a travel commerce surface for guests, a task tool for drivers, and a dispatch desk for operations. They share tokens and do not share a layout.</p>
      <h2>Tokens</h2>
      <div className="zf-studio-grid">
        {tokens.map(([name, token]) => (
          <div key={name}>
            <div className="zf-swatch" style={{ background: `var(${token})` }} />
            <span>
              {name} {token}
            </span>
          </div>
        ))}
      </div>
      <h2>Type</h2>
      <p className="zf-display" style={{ fontSize: "3rem", margin: 0 }}>
        Where are you going?
      </p>
      <p>Passenger headlines use Newsreader. Driver and operations use Instrument Sans. Figures on the desk use IBM Plex Mono. Traditional Chinese uses Noto Serif TC and Noto Sans TC.</p>
      <h2>Components</h2>
      <div className="zf-inline">
        <button type="button" className="zf-btn zf-btn-primary">Primary</button>
        <button type="button" className="zf-btn zf-btn-ink">Ink</button>
        <button type="button" className="zf-btn zf-btn-line">Line</button>
        <button type="button" className="zf-btn zf-btn-danger">SOS</button>
        <Status status="arriving" />
        <Status status="completed" />
        <Status status="cancelled" />
      </div>
      <div style={{ maxWidth: 520, marginTop: 12 }}>
        <AtlasMap showRoute markers={[{ id: "a", x: 28, y: 46, kind: "pickup", label: "Pickup" }, { id: "b", x: 62, y: 36, kind: "available", label: "Driver" }]} />
      </div>
      <h2>Navigation</h2>
      <p>Passenger: Discover, Trips, Plan, Wallet, Support. Mobile adds Live and You. Driver: Duty, Job, Pay, Papers, with one dominant action. Operations: map, queue, inspector. Administration is a separate desk: commerce, finance, care, system.</p>
      <h2>Density</h2>
      <p>Passenger is open. Driver is one action. Operations and finance are dense tables and a map. Analytics uses one chart per role, not a wall of metrics.</p>
      <h2>Breakpoints</h2>
      <p>Passenger booking is form plus map from 1100px. Below that, the map follows the form and a bottom tab bar appears. Operations keeps a limited queue on a phone and the full control room on a desk.</p>
      <h2>Screen inventory</h2>
      {groups.map((group) => (
        <section key={group}>
          <h2>{group}</h2>
          <table className="zf-table">
            <tbody>
              {screens
                .filter((s) => s.group === group)
                .map((s) => (
                  <tr key={s.href + s.name}>
                    <td className="zf-mono">{s.n ?? "—"}</td>
                    <td>
                      <Link href={s.href}>{s.name}</Link>
                    </td>
                    <td className="zf-mono">{s.href}</td>
                    <td>{s.note}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

export function StatesGallery() {
  return (
    <div className="zf-page">
      <h1>States</h1>
      <div className="zf-two">
        <div>
          <p className="zf-kicker">Loading</p>
          <div className="zf-skel" />
          <div className="zf-skel" />
          <div className="zf-skel" style={{ width: "60%" }} />
        </div>
        <div className="zf-empty">
          <p className="zf-kicker">Empty</p>
          <p>No upcoming trips. Book an airport pickup when you have a flight number.</p>
        </div>
        <div className="zf-alert zf-alert-bad">Payment failed. The card was declined. Nothing was booked.</div>
        <div className="zf-alert zf-alert-warn">Flight feed unavailable. You can still book.</div>
        <div className="zf-alert">You are offline. Offers are paused. Scheduled jobs remain.</div>
        <div className="zf-alert">No driver is close enough. Try XL in a few minutes, or schedule a pickup.</div>
        <div className="zf-alert">Map unavailable. Addresses and dispatch still work.</div>
        <div className="zf-alert zf-alert-bad">Permission denied. This desk cannot publish fares.</div>
        <div className="zf-alert">Session expired. Sign in again to pay.</div>
        <div className="zf-alert zf-alert-warn">Partial data. Driver location is 4 minutes old.</div>
      </div>
    </div>
  );
}
