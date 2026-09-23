import { vehicleFits } from "./capacity";

export type PreferredCheck = {
  available: boolean;
  inServiceArea: boolean;
  klass: string;
  pax: number;
  bags: number;
  scheduleConflict: boolean;
  companyRuleOk: boolean;
  premiumPct: number;
};

export function validatePreferred(c: PreferredCheck) {
  const reasons: string[] = [];
  if (!c.available) reasons.push("Driver is not available");
  if (!c.inServiceArea) reasons.push("Outside service area");
  if (!vehicleFits(c.klass, c.pax, c.bags)) reasons.push("Vehicle cannot take this party");
  if (c.scheduleConflict) reasons.push("Schedule conflict");
  if (!c.companyRuleOk) reasons.push("Company rule blocked the request");
  if (c.premiumPct < 15 || c.premiumPct > 20) reasons.push("Preferred premium must be 15–20%");
  return {
    ok: reasons.length === 0,
    reasons,
    message: reasons.length
      ? reasons.join(" · ")
      : "Availability, area, vehicle, schedule, premium, and company rules passed",
  };
}

export const CUSTOMER_REASSIGN_COPY =
  "Your assigned vehicle has changed due to an operational issue. Your new driver is on the way.";

export const PREFERRED_CONFIRMED_COPY = "Preferred driver confirmed.";
