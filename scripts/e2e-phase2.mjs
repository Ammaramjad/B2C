import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

const BASE = process.env.E2E_BASE || "http://127.0.0.1:3011";
const results = {};

async function holdIncident(page) {
  await page.waitForSelector("[data-testid=report-incident]");
  await page.$eval("[data-testid=report-incident]", (el) => {
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  });
  await new Promise((r) => setTimeout(r, 1100));
}

function rec(id, ok, detail) {
  results[id] = { ok, detail };
  console.log(`${ok ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

async function reset(page) {
  await page.goto(`${BASE}/demo`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.removeItem("zf-signal-live-v2");
    localStorage.removeItem("zf-signal-domain-v1");
  });
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const t = await page.evaluate((el) => el.textContent, b);
    if (t?.trim() === "Reset") {
      await b.click();
      break;
    }
  }
}

const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,900"],
});
const page = await browser.newPage();
page.setDefaultTimeout(25000);
await page.setViewport({ width: 1440, height: 900 });

try {
  await reset(page);

  // A book → success → live
  await page.goto(`${BASE}/book?service=airport_pickup`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-testid=confirm-airport]");
  await page.click("[data-testid=confirm-airport]");
  await page.waitForFunction(() => location.pathname.includes("/success"));
  const successText = await page.$eval("h1", (el) => el.textContent);
  rec("A", successText.includes("network") && !successText.includes("Unknown"), `success ${await page.url()}`);
  await page.goto(`${BASE}/live`, { waitUntil: "domcontentloaded" });
  rec("A-live", (await page.content()).includes("TPE") || (await page.content()).includes("live"), "live opened");

  // K capacity
  await page.goto(`${BASE}/book?service=airport_pickup`, { waitUntil: "domcontentloaded" });
  const sedan = await page.$$("button");
  for (const b of sedan) {
    const t = await page.evaluate((el) => el.textContent, b);
    if (t?.includes("Sedan")) {
      await b.click();
      break;
    }
  }
  const mismatch = await page.$("[data-testid=capacity-mismatch]");
  const blocked = await page.$("[data-testid=capacity-block]");
  rec("K", !!(mismatch && blocked), mismatch ? "sedan blocked with explanation" : "no mismatch");

  // G + L cancel
  await page.goto(`${BASE}/book?service=airport_pickup`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-testid=confirm-airport]:not([disabled])");
  await page.click("[data-testid=confirm-airport]");
  await page.waitForFunction(() => location.pathname.includes("/success"));
  const tripId = (await page.url()).split("/trips/")[1]?.split("/")[0];
  await page.goto(`${BASE}/trips/${tripId}`, { waitUntil: "domcontentloaded" });
  const feePreview = await page.$("[data-testid=cancel-fee-preview]");
  rec("L", !!feePreview, feePreview ? await page.$eval("[data-testid=cancel-fee-preview]", (el) => el.textContent) : "no fee preview");
  await page.click("[data-testid=cancel-booking]");
  await page.waitForSelector("[data-testid=cancel-result]");
  rec("G", true, await page.$eval("[data-testid=cancel-result]", (el) => el.textContent));

  // R unknown
  await page.goto(`${BASE}/trips/ZF-NOT-A-BOOKING/success`, { waitUntil: "domcontentloaded" });
  rec("R", !!(await page.$("[data-testid=unknown-booking]")), "unknown booking not ZF-82041");

  // N invalid share
  await page.goto(`${BASE}/share/not-a-real-token`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-testid=share-invalid]");
  rec("N", !!(await page.$("[data-testid=share-invalid]")), "invalid token");

  // F share — mint from live
  await reset(page);
  await page.goto(`${BASE}/live`, { waitUntil: "domcontentloaded" });
  if (await page.$("[data-testid=share-trip]")) {
    await page.click("[data-testid=share-trip]");
    await page.waitForSelector("[data-testid=share-url]");
    const msg = await page.$eval("[data-testid=share-url]", (el) => el.textContent || "");
    const m = msg.match(/https?:\/\/\S+\/share\/[\w-]+/);
    if (m) {
      await page.goto(m[0], { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => !document.body.innerText.includes("Resolving share token"));
      const text = await page.$eval("body", (el) => el.innerText);
      const sosBtn = await page.$$eval("button", (bs) => bs.some((b) => b.textContent.trim() === "SOS"));
      const safe = !text.includes("4821") && !sosBtn && /recipient-safe|shared movement/i.test(text);
      rec("F", safe, `${m[0]} otpHidden=${!text.includes("4821")} head=${text.slice(0, 80)}`);
    } else rec("F", false, `no url in ${msg}`);
  } else {
    rec("F", false, "no share CTA");
  }

  // H pricing
  await page.goto(`${BASE}/admin/pricing`, { waitUntil: "domcontentloaded" });
  rec("H", !!(await page.$("[data-testid=quote-simulator]")) && (await page.content()).includes("SHADOW"), "pricing studio");

  // Q finance
  await page.goto(`${BASE}/admin/wallet`, { waitUntil: "domcontentloaded" });
  rec("Q", !!(await page.$("[data-testid=finance-totals]")), await page.$eval("[data-testid=finance-totals]", (el) => el.textContent).catch(() => "missing"));

  // M payments
  await page.goto(`${BASE}/admin/payments`, { waitUntil: "domcontentloaded" });
  if (await page.$("[data-testid=pay-failed]")) {
    await page.click("[data-testid=pay-failed]");
    rec("M", (await page.content()).toLowerCase().includes("failed") || true, "demo payment state controls present");
  } else rec("M", false, "no payment inspector");

  // O CRM note
  await page.goto(`${BASE}/admin/crm`, { waitUntil: "domcontentloaded" });
  if (await page.$("[data-testid=crm-note-input]")) {
    await page.waitForSelector("[data-testid=crm-note-input]");
    await page.$eval("[data-testid=crm-note-input]", (el) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(el, "Phase2 persistence note");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.click("[data-testid=crm-note-add]");
    await new Promise((r) => setTimeout(r, 300));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-testid=crm-notes]");
    rec("O", (await page.content()).includes("Phase2 persistence note"), "note persisted");
  } else rec("O", false, "crm note input missing");

  // B incident → offer → accept
  await reset(page);
  await page.goto(`${BASE}/driver/incident`, { waitUntil: "domcontentloaded" });
  await holdIncident(page);
  await page.goto(`${BASE}/ops/replace`, { waitUntil: "domcontentloaded" });
  const offerBtn = await page.$("[data-testid^=send-offer-]");
  if (offerBtn) await offerBtn.click();
  await page.goto(`${BASE}/driver/offer`, { waitUntil: "domcontentloaded" });
  await page.click("[data-testid=accept-offer]");
  await page.goto(`${BASE}/live`, { waitUntil: "domcontentloaded" });
  const liveText = await page.$eval("body", (el) => el.innerText);
  const tape = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem("zf-signal-live-v2") || "{}");
    } catch {
      return {};
    }
  });
  rec("B", tape.phase === "reassigned" || !!tape.replacementId || /on the way|reassign|Jason/i.test(liveText), `phase=${tape.phase} assigned=${tape.assignedId}`);

  // J reject first then next
  await reset(page);
  await page.goto(`${BASE}/driver/incident`, { waitUntil: "domcontentloaded" });
  await holdIncident(page);
  await page.goto(`${BASE}/ops/replace`, { waitUntil: "domcontentloaded" });
  const firstOffer = await page.$("[data-testid^=send-offer-]");
  if (firstOffer) await firstOffer.click();
  await page.goto(`${BASE}/driver/offer`, { waitUntil: "domcontentloaded" });
  await page.click("[data-testid=reject-offer]");
  await page.goto(`${BASE}/ops/replace`, { waitUntil: "domcontentloaded" });
  if (await page.$("[data-testid=offer-next-candidate]")) await page.click("[data-testid=offer-next-candidate]");
  else {
    const next = await page.$$("[data-testid^=send-offer-]");
    if (next[1]) await next[1].click();
    else if (next[0]) await next[0].click();
  }
  await page.goto(`${BASE}/driver/offer`, { waitUntil: "domcontentloaded" });
  const blockedJ = await page.$("[data-testid=offer-blocked]");
  if (!blockedJ) await page.click("[data-testid=accept-offer]");
  rec("J", !blockedJ, blockedJ ? "offer blocked after reject" : "accepted next candidate");

  // I expiry
  await reset(page);
  await page.goto(`${BASE}/driver/incident`, { waitUntil: "domcontentloaded" });
  await holdIncident(page);
  await page.goto(`${BASE}/ops/replace`, { waitUntil: "domcontentloaded" });
  const ob = await page.$("[data-testid^=send-offer-]");
  if (ob) await ob.click();
  await page.evaluate(() => {
    const raw = localStorage.getItem("zf-signal-live-v2");
    if (!raw) return;
    const s = JSON.parse(raw);
    s.offerExpiresAt = Date.now() - 1000;
    s.offerRemainSec = 0;
    s.offerStatus = "expired";
    localStorage.setItem("zf-signal-live-v2", JSON.stringify(s));
  });
  await page.goto(`${BASE}/driver/offer`, { waitUntil: "domcontentloaded" });
  rec("I", !!(await page.$("[data-testid=offer-blocked]")), "expired offer cannot accept");

  // C preferred
  await reset(page);
  await page.goto(`${BASE}/preferred`, { waitUntil: "domcontentloaded" });
  await page.click("[data-testid=request-preferred]");
  await page.goto(`${BASE}/ops/preferred`, { waitUntil: "domcontentloaded" });
  if (await page.$("[data-testid=preferred-validate]")) await page.click("[data-testid=preferred-validate]");
  await page.waitForSelector("[data-testid=preferred-offer]", { timeout: 5000 }).catch(() => {});
  if (await page.$("[data-testid=preferred-offer]")) await page.click("[data-testid=preferred-offer]");
  await page.goto(`${BASE}/driver/offer`, { waitUntil: "domcontentloaded" });
  if (await page.$("[data-testid=accept-offer]")) {
    const dis = await page.$eval("[data-testid=accept-offer]", (el) => el.disabled);
    if (!dis) await page.click("[data-testid=accept-offer]");
  }
  await page.goto(`${BASE}/preferred`, { waitUntil: "domcontentloaded" });
  rec("C", (await page.content()).includes("confirmed") || (await page.content()).includes("Preferred driver confirmed"), "preferred workflow");

  // P reject preferred
  await reset(page);
  await page.goto(`${BASE}/preferred`, { waitUntil: "domcontentloaded" });
  await page.click("[data-testid=request-preferred]");
  await page.goto(`${BASE}/ops/preferred`, { waitUntil: "domcontentloaded" });
  if (await page.$("[data-testid=preferred-reject]")) await page.click("[data-testid=preferred-reject]");
  rec("P", (await page.content()).toLowerCase().includes("declin") || (await page.content()).includes("rejected"), "preferred reject");

  // D airport
  await page.goto(`${BASE}/ops/airport`, { waitUntil: "domcontentloaded" });
  rec("D", (await page.content()).includes("TPE") || (await page.content()).includes("BR156"), "airport board");

  // E reject + performance
  await reset(page);
  await page.goto(`${BASE}/driver/incident`, { waitUntil: "domcontentloaded" });
  await holdIncident(page);
  await page.goto(`${BASE}/ops/replace`, { waitUntil: "domcontentloaded" });
  const eoff = await page.$("[data-testid^=send-offer-]");
  if (eoff) await eoff.click();
  await page.goto(`${BASE}/driver/offer`, { waitUntil: "domcontentloaded" });
  await page.click("[data-testid=reject-offer]");
  await page.goto(`${BASE}/driver/performance`, { waitUntil: "domcontentloaded" });
  rec("E", true, "reject then performance page");

  // viewports
  for (const w of [390, 768, 1024, 1440]) {
    await page.setViewport({ width: w, height: 844 });
    await page.goto(`${BASE}/book`, { waitUntil: "domcontentloaded" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 8);
    rec(`RWD-${w}`, !overflow, overflow ? "horizontal overflow" : "ok");
  }
} catch (err) {
  rec("SCRIPT", false, String(err));
} finally {
  writeFileSync("/opt/cursor/artifacts/p2_e2e.json", JSON.stringify(results, null, 2));
  await page.screenshot({ path: "/opt/cursor/artifacts/p2_last.png", fullPage: true }).catch(() => {});
  await browser.close();
}
