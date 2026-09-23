import type { ReactNode } from "react";
import Link from "next/link";

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="kicker">{children}</div>;
}

export function Display({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`serif leading-[1.05] ${className}`}>{children}</h1>;
}

export function Money({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`metric ${className}`}>{children}</span>;
}

export function Stamp({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "copper" | "pine" | "alert" | "warn" | "mute";
}) {
  const color = {
    ink: "text-[var(--ink)]",
    copper: "text-[var(--copper)]",
    pine: "text-[var(--pine)]",
    alert: "text-[var(--alert)]",
    warn: "text-[var(--warn)]",
    mute: "text-[var(--mute)]",
  }[tone];
  return <span className={`stamp ${color}`}>{children}</span>;
}

export function Ticket({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`ticket p-5 ${className}`}>{children}</section>;
}

export function Paper({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`paper p-5 ${className}`}>{children}</section>;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold">{label}</span>
        {hint ? <span className="text-[12px] text-[var(--mute)]">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function Btn({
  children,
  href,
  onClick,
  kind = "solid",
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  kind?: "solid" | "ghost" | "pine" | "alert";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const cls = `atlas-btn focus-ring ${kind} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-[var(--rule)] px-6 py-16 text-center">
      <h2 className="serif text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-[var(--ink-soft)]">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skel h-4 rounded-[2px] ${className}`} />;
}

export function StatusMark({ status }: { status: string }) {
  const map: Record<string, { tone: Parameters<typeof Stamp>[0]["tone"]; label: string }> = {
    payment_pending: { tone: "warn", label: "Payment pending" },
    payment_confirmed: { tone: "pine", label: "Paid" },
    new: { tone: "copper", label: "Unassigned" },
    assigned: { tone: "copper", label: "Assigned" },
    accepted: { tone: "pine", label: "Accepted" },
    arriving: { tone: "copper", label: "En route" },
    onboard: { tone: "pine", label: "In trip" },
    completed: { tone: "mute", label: "Completed" },
    cancelled: { tone: "alert", label: "Cancelled" },
  };
  const s = map[status] ?? { tone: "ink" as const, label: status };
  return <Stamp tone={s.tone}>{s.label}</Stamp>;
}
