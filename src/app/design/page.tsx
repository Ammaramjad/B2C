import Link from "next/link";

export default function DesignPage() {
  return (
    <div className="space-y-4 py-8">
      <h1 className="display text-3xl">Design foundation</h1>
      <p className="max-w-xl text-[var(--text-secondary)]">
        Specification: <code>docs/design/FOUNDATION_AUDIT_v12.md</code>. Review the 14 foundation screens before scaling remaining modules.
      </p>
      <ul className="space-y-2 text-sm">
        {[
          ["/", "Passenger home"],
          ["/book", "Three-step booking"],
          ["/trips/ZD-1805", "Live trip"],
          ["/planner", "AI planner"],
          ["/driver", "Driver home"],
          ["/driver/offer", "Driver offer"],
          ["/driver/trip", "Driver trip"],
          ["/ops", "Ops canvas + inspector"],
          ["/ops/fleet", "Fleet"],
          ["/ops/pricing", "Pricing config"],
          ["/ops/analytics", "Analytics"],
        ].map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="underline underline-offset-4">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
