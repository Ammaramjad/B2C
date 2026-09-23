"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { PassengerChrome } from "./chrome-passenger";
import { DriverChrome } from "./chrome-driver";
import { OpsChrome } from "./chrome-ops";
import { AdminChrome } from "./chrome-admin";

function osFromPath(path: string): "passenger" | "driver" | "ops" | "admin" | "system" {
  if (path.startsWith("/driver")) return "driver";
  if (path.startsWith("/ops")) return "ops";
  if (path.startsWith("/admin") || path.startsWith("/design")) return path.startsWith("/design") ? "system" : "admin";
  if (path.startsWith("/login")) return "system";
  return "passenger";
}

export function AtlasRoot({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { theme } = useStore();
  const os = osFromPath(path);
  const dataOs = os === "system" ? (path.startsWith("/design") ? "admin" : "passenger") : os;
  const themeForOs = os === "driver" || os === "ops" ? "dark" : theme;

  return (
    <div data-os={dataOs} data-theme={themeForOs} className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      {os === "passenger" ? <PassengerChrome>{children}</PassengerChrome> : null}
      {os === "driver" ? <DriverChrome>{children}</DriverChrome> : null}
      {os === "ops" ? <OpsChrome>{children}</OpsChrome> : null}
      {os === "admin" ? <AdminChrome>{children}</AdminChrome> : null}
      {os === "system" ? (
        <div>
          <header className="flex items-center justify-between border-b border-[var(--rule)] px-5 py-3">
            <Link href="/" className="serif text-2xl">
              Zoufeng
            </Link>
            <Link href="/design" className="kicker">
              Atlas review
            </Link>
          </header>
          <div className="px-5 py-8">{children}</div>
        </div>
      ) : null}
    </div>
  );
}
