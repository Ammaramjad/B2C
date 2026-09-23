import type { ReactNode } from "react";
import Link from "next/link";

export function Label({ children }: { children: ReactNode }) {
  return <div className="label">{children}</div>;
}

export function Surface({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "aside";
}) {
  return <Tag className={`surface rounded-[20px] p-5 md:p-6 ${className}`}>{children}</Tag>;
}

/** @deprecated use Surface — kept for leftover screens */
export const Panel = Surface;

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ai" | "live" }) {
  const t =
    tone === "ai" || tone === "live"
      ? "bg-[color-mix(in_srgb,var(--ai)_14%,transparent)] text-[var(--ai)]"
      : "bg-[color-mix(in_srgb,var(--muted)_12%,transparent)] text-[var(--muted)]";
  return <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-medium ${t}`}>{children}</span>;
}

export function Btn({
  children,
  onClick,
  href,
  kind = "primary",
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  kind?: "primary" | "ghost" | "danger" | "ai";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-[var(--primary)] text-[var(--primary-ink)]",
    ghost: "bg-transparent text-[var(--fg)] hairline",
    danger: "bg-[color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]",
    ai: "bg-[color-mix(in_srgb,var(--ai)_16%,transparent)] text-[var(--ai)]",
  }[kind];
  const cls = `focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[16px] font-semibold transition disabled:opacity-40 ${styles} ${className}`;
  if (href) {
    return (
      <Link className={cls} href={href} onClick={onClick}>
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

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function Stat({ k, v, d }: { k: string; v: string; d?: string }) {
  return (
    <div className="rise min-w-0">
      <div className="label">{k}</div>
      <div className="display metric mt-1 text-2xl md:text-3xl">{v}</div>
      {d && <div className="mt-1 text-xs text-[var(--muted)]">{d}</div>}
    </div>
  );
}

export function Status({ kind, children }: { kind: string; children: ReactNode }) {
  const k = ["live", "active", "assigned", "completed", "cancelled"].includes(kind) ? kind : "";
  return <span className={`status ${k}`}>{children}</span>;
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="py-16 text-center">
      <h2 className="display text-2xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[var(--muted)]">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
