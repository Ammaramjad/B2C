"use client";
import Link from "next/link";
const items = [
  ["/book/airport", "Airport pickup", "Flight, terminal, meeting point"],
  ["/book/airport?mode=drop", "Airport drop-off", "When to leave"],
  ["/book/transfer", "Point to point", "Stops and a direct route"],
  ["/book/charter", "Hourly charter", "Duration and overtime"],
  ["/book/taxi", "Taxi now", "Cars already nearby"],
  ["/book/rental", "Self-drive", "Depot, deposit, terms"],
];
export default function Page() {
  return (
    <div className="zf-page">
      <p className="zf-kicker">Book</p>
      <h1>Choose the kind of ride.</h1>
      {items.map(([href, title, note]) => (
        <p key={href}><Link href={href}>{title}</Link> <span className="zf-note">{note}</span></p>
      ))}
    </div>
  );
}
