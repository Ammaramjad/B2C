import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cities } from "@/lib/catalog";

const COPY: Record<string, { lead: string; faq: [string, string][]; service: string }> = {
  taipei: {
    lead: "TPE and TSA sit on the same company dispatch. Xinyi and Songshan are quoted as airport pickup or p2p, never a handshake.",
    faq: [
      ["Which airport?", "TPE T1/T2 for most long-haul; TSA for domestic and some short-haul. Pickup zone is Door 8 on T2."],
      ["Free wait?", "45 minutes after actual arrival on airport pickup."],
    ],
    service: "airport_pickup",
  },
  newtaipei: {
    lead: "Jiufen and Tamsui loops are usually hourly. Capacity matching still uses vehicleFits().",
    faq: [
      ["Hourly or p2p?", "Coastal loops should be hourly so the driver stays. A single drop to Tamsui can be p2p."],
      ["Named driver?", "Preferred requests still go through /ops/preferred."],
    ],
    service: "hourly",
  },
  taoyuan: {
    lead: "TPE hub landings start here. Flight status on the live tape is simulated until a vendor is wired.",
    faq: [
      ["Delay handling?", "Assignment is held; ETA is recalculated. Production flight lookup is unconfigured."],
      ["Meet and greet?", "Extra SKU on airport pickup — quote() includes it."],
    ],
    service: "airport_pickup",
  },
  taichung: {
    lead: "RMQ arrivals and city p2p share the same quote engine. Fleet C/B coverage is catalog-derived.",
    faq: [
      ["Airport?", "RMQ. Free-wait policy matches TPE airport pickup."],
      ["Self-drive?", "Depot rental is available; no chauffeur is fabricated."],
    ],
    service: "p2p",
  },
  tainan: {
    lead: "Old-city loops are hourly. Night +20% still comes from quote() 23:00–06:00.",
    faq: [
      ["Charter minimum?", "Hourly catalog starts at 4 hours."],
      ["Preferred?", "Company-mediated only."],
    ],
    service: "hourly",
  },
  kaohsiung: {
    lead: "KHH pickup and Kenting day charters. Driver 360 here is catalog + live tape, not invented KPIs.",
    faq: [
      ["Kenting in one day?", "Use hourly from KHH. Rental is depot-only."],
      ["English driver?", "Extra SKU — still company assigned."],
    ],
    service: "airport_pickup",
  },
  hualien: {
    lead: "Taroko days need van/MPV capacity. Sedans fail vehicleFits() for 5/4 parties.",
    faq: [
      ["Why was sedan blocked?", "Seats/bags come from capacityFor(). The UI must explain the mismatch."],
      ["Flight?", "HUN when scheduled — production flight vendor still throws."],
    ],
    service: "hourly",
  },
  kenting: {
    lead: "South-coast days usually start as KHH hourly or a Kaohsiung depot rental. No fake chauffeur on rental.",
    faq: [
      ["How to book?", "Hourly from Kaohsiung, or self-drive from a depot."],
      ["Live map?", "Only chauffeur services bind the live tape."],
    ],
    service: "hourly",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = cities.find((x) => x.id === id);
  if (!c) return { title: "Unknown destination · Zoufeng" };
  const copy = COPY[id];
  return {
    title: `${c.city} ${copy?.service.replace("_", " ") ?? "transfers"} · Zoufeng`,
    description: copy?.lead ?? `${c.tag}. Company-dispatched cars.`,
    alternates: { canonical: `/destinations/${id}` },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = cities.find((x) => x.id === id);
  if (!c) notFound();
  const copy = COPY[id] ?? { lead: c.tag, faq: [["Bookable?", "Yes — company dispatch."]] as [string, string][], service: "p2p" };
  return (
    <div className="zf-site-wrap max-w-3xl">
      <div className="overflow-hidden rounded-[22px] border border-[#e6ebf2] bg-white">
        <i className="block h-48 bg-[#eef2f7] bg-cover bg-center" style={{ backgroundImage: `url(${c.image})` }} />
        <div className="p-6">
      <div className="kicker">{c.tag}</div>
      <h1 className="display mt-2 text-5xl">{c.city}</h1>
      <p className="mt-3 text-[var(--ink-2)]">{copy.lead}</p>
      <h2 className="mt-8 text-lg font-semibold">FAQ</h2>
      <dl className="mt-3 space-y-3 text-sm">
        {copy.faq.map(([q, a]) => (
          <div key={q}>
            <dt className="font-semibold">{q}</dt>
            <dd>{a}</dd>
          </div>
        ))}
      </dl>
      <Link href={`/go?service=${copy.service}`} className="zf-btn mt-6">
        Book {copy.service.replaceAll("_", " ")}
      </Link>
      <Link href="/go?service=p2p" className="zf-btn ghost mt-2">
        Book a city transfer
      </Link>
        </div>
      </div>
    </div>
  );
}
