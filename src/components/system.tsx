import type { ReactNode } from "react";
import Link from "next/link";

export function Button({
  children,
  onClick,
  href,
  kind = "primary",
  type = "button",
  className = "",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  kind?: "primary" | "ghost" | "danger" | "plain";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const styles = {
    primary: "bg-[var(--brand)] text-[var(--brand-ink)]",
    ghost: "bg-transparent text-[var(--text)] hairline",
    danger: "bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]",
    plain: "bg-transparent text-[var(--text-secondary)] underline-offset-4 hover:underline",
  }[kind];
  const cls = `focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${styles} ${className}`;
  if (href && !disabled) {
    return (
      <Link className={cls} href={href} onClick={onClick} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="block text-xs text-[var(--text-secondary)]">{hint}</span>}
    </label>
  );
}

export function Price({ value, note }: { value: string; note?: string }) {
  return (
    <div>
      <div className="metric text-3xl md:text-4xl">{value}</div>
      {note && <div className="mt-1 text-sm text-[var(--text-secondary)]">{note}</div>}
    </div>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "danger" | "ok";
  children: ReactNode;
}) {
  const c = {
    info: "var(--information)",
    warn: "var(--warning)",
    danger: "var(--danger)",
    ok: "var(--success)",
  }[tone];
  return (
    <div className="flex gap-3 border-l-2 py-2 pl-3 text-sm" style={{ borderColor: `var(${c.replace("var(", "").replace(")", "")})` } as never}>
      <div style={{ color: c }}>{children}</div>
    </div>
  );
}

export function Alert({ tone = "info", children }: { tone?: "info" | "warn" | "danger" | "ok"; children: ReactNode }) {
  const color = { info: "var(--information)", warn: "var(--warning)", danger: "var(--danger)", ok: "var(--success)" }[tone];
  return (
    <div className="rounded-[10px] px-3 py-2 text-sm" style={{ background: `color-mix(in srgb, ${color} 10%, transparent)`, color }}>
      {children}
    </div>
  );
}

export function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="flex flex-wrap gap-6 text-sm">
      {labels.map((label, i) => {
        const n = i + 1;
        const on = step === n;
        const done = step > n;
        return (
          <li key={label} className={on ? "text-[var(--text)]" : "text-[var(--text-secondary)]"}>
            <span className="metric mr-2">{n}</span>
            <span className={on || done ? "font-semibold" : ""}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="py-16">
      <h2 className="display text-2xl">{title}</h2>
      <p className="mt-2 max-w-md text-[var(--text-secondary)]">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatusText({ children }: { children: ReactNode }) {
  return <span className="text-sm font-semibold">{children}</span>;
}
