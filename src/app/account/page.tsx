"use client";

import { useStore } from "@/lib/store";
import { Btn, Panel, Stat } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, logout, bookings } = useStore();
  const router = useRouter();
  if (!user) {
    return (
      <Panel>
        <a className="text-cyan-200" href="/login">
          Sign into Aether
        </a>
      </Panel>
    );
  }
  return (
    <div className="space-y-6">
      <h1 className="display text-4xl">{user.name}</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat k="Role" v={user.role} />
        <Stat k="Points" v={String(user.points)} />
        <Stat k="Trips on device" v={String(bookings.length)} />
      </div>
      <Panel>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">Cabin preferences</div>
        <p className="mt-2 text-white/70">
          Quiet ride {user.prefs.quiet ? "on" : "off"} · AC {user.prefs.ac}°C · preferred vessel {user.prefs.vehicle}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {user.email} · {user.phone} · referral {user.referralCode}
        </p>
        <div className="mt-4 flex gap-3">
          <Btn href="/wallet" kind="ghost">
            Wallet
          </Btn>
          <Btn href="/loyalty" kind="ghost">
            Loyalty
          </Btn>
          <Btn
            kind="ghost"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Exit mesh
          </Btn>
        </div>
      </Panel>
    </div>
  );
}
