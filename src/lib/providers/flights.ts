export type FlightSnapshot = {
  id: string;
  scheduled: string;
  estimated: string;
  terminal: string;
  delayMin: number;
  status: string;
  origin?: string;
  destination?: string;
  source: "simulation" | "production";
};

export type FlightProvider = {
  id: "simulation" | "production";
  lookup(code: string): Promise<FlightSnapshot | null>;
};

const SIM: Record<string, Omit<FlightSnapshot, "source">> = {
  BR156: { id: "BR156", scheduled: "16:40", estimated: "16:40", terminal: "T2", delayMin: 0, status: "On time · NRT", origin: "NRT", destination: "TPE" },
  BR157: { id: "BR157", scheduled: "18:40", estimated: "18:40", terminal: "T2", delayMin: 0, status: "On time · outbound", origin: "TPE", destination: "NRT" },
  CI101: { id: "CI101", scheduled: "14:35", estimated: "14:35", terminal: "T1", delayMin: 0, status: "On time", origin: "NRT", destination: "TPE" },
};

export const simulationFlightProvider: FlightProvider = {
  id: "simulation",
  async lookup(code) {
    const row = SIM[code.toUpperCase()];
    if (!row) return { id: code.toUpperCase(), scheduled: "—", estimated: "—", terminal: "T2", delayMin: 0, status: "Flight lookup pending", source: "simulation" };
    return { ...row, source: "simulation" };
  },
};

export const productionFlightProvider: FlightProvider = {
  id: "production",
  async lookup() {
    throw new Error("Production flight provider is not configured");
  },
};

export function resolveFlightProvider(id = process.env.NEXT_PUBLIC_FLIGHT_PROVIDER ?? "simulation"): FlightProvider {
  return id === "production" ? productionFlightProvider : simulationFlightProvider;
}
