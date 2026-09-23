import type { ReactNode } from "react";
import Link from "next/link";

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100/80">
      {children}
    </span>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass rounded-[28px] p-5 md:p-6 ${className}`}>{children}</div>;
}

export function Btn({
  children,
  onClick,
  href,
  kind = "primary",
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  kind?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-[linear-gradient(120deg,#4ef2ff,#b08cff_55%,#ff4fd8)] text-[#070014] shadow-[0_10px_40px_rgba(78,242,255,0.25)]",
    ghost: "border border-white/15 bg-white/5 text-white hover:bg-white/10",
    danger: "border border-rose-400/40 bg-rose-500/15 text-rose-100",
  }[kind];
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition hover:scale-[1.02] active:scale-[0.99] ${styles} ${className}`;
  if (href) {
    return (
      <Link className={cls} href={href} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</span>
      {children}
    </label>
  );
}

export function Stat({ k, v, d }: { k: string; v: string; d?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{k}</div>
      <div className="display mt-1 text-2xl">{v}</div>
      {d && <div className="mt-1 text-xs text-lime-300/80">{d}</div>}
    </div>
  );
}
