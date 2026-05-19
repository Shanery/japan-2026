#!/usr/bin/env node
// Budget audit + sync. Reads live activities and budgetItems from Convex, then:
//   1) Inserts missing budgetItems from CATALOG (researched costs, May 2026)
//   2) Marks budgetItems as paid for activities that are isBooked OR have attachments
//   3) Flags bookings (attachments / isBooked) that have no linked budgetItem
//
// Usage:
//   node scripts/budget-audit.mjs            # dry-run report (no writes)
//   node scripts/budget-audit.mjs --apply    # perform writes
//
// Requires VITE_CONVEX_URL env var (or falls back to the dev deployment URL).

import { ConvexHttpClient } from "convex/browser";

const CONVEX_URL =
  process.env.VITE_CONVEX_URL || "https://incredible-civet-622.convex.cloud";
const APPLY = process.argv.includes("--apply");

const client = new ConvexHttpClient(CONVEX_URL);

// ─── Researched catalog (May 2026) ────────────────────────────────
// Each entry will be inserted as a budgetItem if no budgetItem is already
// linked to the matching activity. Match is by (day, nameMatch substring).
// Prices are for 2 people unless noted; AUD computed at ~¥114/AUD.
const CATALOG = [
  // Day 4 — DisneySea
  {
    day: 4, match: "Travel to Tokyo DisneySea",
    category: "Transport",
    description: "Disney Resort Line day pass x2 (Day 4)",
    amountJPY: 1400, amountAUD: 12,
    notes: "¥700/person unlimited day pass on the monorail loop. https://www.tokyodisneyresort.jp/en/tdr/resortline/fare.html",
  },

  // Day 7 — Mitake
  {
    day: 7, match: "Travel to Mitake",
    category: "Transport",
    description: "Mitake Tozan cable car round-trip x2 (Day 7)",
    amountJPY: 2260, amountAUD: 20,
    notes: "¥1,130/person round-trip Takimoto → Mitakesan, ~6min each way. https://www.mitaketozan.co.jp/eng2014/index.html",
  },

  // Day 8 — Mt Fuji (the tour itself; transport already in budget)
  {
    day: 8, match: "Mt Fuji Double Lake",
    category: "Activities",
    description: "Mt Fuji Kaba Bus Double Lake tour x2 (Day 8)",
    amountJPY: 30000, amountAUD: 264,
    notes: "Estimate ~¥14,000-¥16,000/person for Klook small-group day tour. VERIFY: Klook activity 177120. Kaba Bus on Lake Yamanaka had low-water suspension in early 2026 — confirm operation before booking.",
  },

  // Day 9 — Kibune lunch
  {
    day: 9, match: "Kawadoko",
    category: "Food",
    description: "Kibune kawadoko river lunch x2 (Day 9)",
    amountJPY: 13000, amountAUD: 114,
    notes: "~¥6,500/person mid-range. Hirobun somen ~¥3,800; Hyoue kaiseki ¥6,480–¥13,000. June is prime season — reserve ahead. https://hyoue.com/meal_en/",
  },

  // Day 10 — Wazuka tea
  {
    day: 10, match: "Wazuka",
    category: "Activities",
    description: "Wazuka tea plantation experience x2 (Day 10)",
    amountJPY: 16000, amountAUD: 140,
    notes: "~¥8,000/person mid estimate. Obubu 4hr guided tour ¥12,000pp; d:matcha shorter tastings ¥5,000–8,000pp. Pick operator before booking. https://obubutea.com/guided-tea-tour/",
  },

  // Day 12 — Tottori sand dunes
  {
    day: 12, match: "Tottori Sand Dunes",
    category: "Activities",
    description: "Tottori Sand Museum + camel ride x2 (Day 12)",
    amountJPY: 4800, amountAUD: 42,
    notes: "Sand Museum ¥800/person (2026 Spain exhibit). Camel ride ¥1,600/person (walk-along). Dunes themselves free. Bring cash. https://hiddenjapan-gems.com/tottori-sand-dunes-guide/",
  },

  // Day 12 — Matsue Castle (currently lumped into "misc buffer")
  {
    day: 12, match: "Check in to Matsue",
    category: "Activities",
    description: "Matsue Castle entry x2 (Day 12)",
    amountJPY: 1600, amountAUD: 14,
    notes: "¥800/person main keep entry. National Treasure castle. https://www.japan-guide.com/e/e5801.html",
  },

  // Day 13 — Hakata yatai dinner (currently no cost)
  {
    day: 13, match: "Hakata Yatai",
    category: "Food",
    description: "Hakata yatai dinner x2 (Day 13)",
    amountJPY: 5000, amountAUD: 44,
    notes: "~¥2,500/person mid (1 main + small + drink). Stall-hopping for 2 runs ¥8,000–¥12,000. https://www.japan-guide.com/e/e4803.html",
  },

  // Day 13 — Hiroshima okonomiyaki lunch
  {
    day: 13, match: "Hiroshima Okonomiyaki",
    category: "Food",
    description: "Hiroshima okonomiyaki lunch x2 (Day 13)",
    amountJPY: 2400, amountAUD: 21,
    notes: "~¥1,200/person at a teppan counter. Standard Hiroshima-style layered okonomiyaki.",
  },

  // Day 11 — Hida beef lunch in Takayama
  {
    day: 11, match: "Lunch in Takayama",
    category: "Food",
    description: "Takayama Hida beef lunch x2 (Day 11)",
    amountJPY: 10000, amountAUD: 88,
    notes: "~¥5,000/person sit-down lunch set near JR Takayama. Sukiyaki/shabu courses run higher.",
  },

  // Kyoto local transit (Days 9-10)
  {
    day: 9, match: "Check in to Kyoto",
    category: "Transport",
    description: "Kyoto subway+bus day passes x2 (Days 9-10)",
    amountJPY: 4400, amountAUD: 39,
    notes: "¥1,100/person/day Subway & Bus 1-Day Pass × 2 days × 2 people. https://www2.city.kyoto.lg.jp/kotsu/webguide/en/ticket/regular_1day_card_comm.html",
  },

  // Fukuoka local transit (Day 14)
  {
    day: 14, match: "Explore Fukuoka",
    category: "Transport",
    description: "Fukuoka subway day pass x2 (Day 14)",
    amountJPY: 1320, amountAUD: 12,
    notes: "¥660/person Subway 1-Day Pass. Car will be parked in Fukuoka. https://subway.city.fukuoka.lg.jp/eng/fare/one/",
  },
];

// Catalog entries that UPDATE existing budgetItems (matched by description fragment)
// — for items where seed.ts inserted a placeholder with cost TBD.
const UPDATES = [
  {
    matchDescription: "Kanpachi Ichiroku",
    amountJPY: 36000, amountAUD: 316,
    notes: "¥18,000/person sofa/box seat (all-inclusive trip fee, no Green Class). Light meal included. Hakata↔Yufuin/Beppu/Oita, 1 trip/day. https://www.jrkyushu.co.jp/english/train/kanroku.html",
  },
  {
    matchDescription: "Aru Ressha",
    amountJPY: 70000, amountAUD: 614,
    notes: "¥35,000/person — one-way JR ticket + full course meal + drinks. Operates select weekends. https://www.jrkyushu-aruressha.jp/en/price/",
  },
];

// Trip-wide line item not tied to any specific day
const GLOBAL_ITEMS = [
  {
    category: "Food",
    description: "Daily food allowance (breakfast + lunch + dinner, 2 ppl × ~16 days)",
    amountJPY: 208000, amountAUD: 1825,
    notes: "Planning midpoint ~¥13,000/day for 2 (conbini breakfast + casual lunch + mid-range izakaya/restaurant dinner). Excludes the named special meals already itemised (Kibune kawadoko, Hida beef, Hiroshima okonomiyaki, Hakata yatai, DisneySea lunch/dinner).",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────
function fmtMoney(jpy, aud) {
  const parts = [];
  if (jpy) parts.push(`¥${jpy.toLocaleString()}`);
  if (aud) parts.push(`A$${aud}`);
  return parts.join(" / ") || "(no amount)";
}

async function loadEverything() {
  const days = await client.query("days:list", {});
  days.sort((a, b) => a.dayNumber - b.dayNumber);
  const budget = await client.query("budget:list", {});
  const byDay = {};
  for (const d of days) {
    const acts = await client.query("activities:listByDay", { dayId: d._id });
    byDay[d.dayNumber] = { day: d, activities: acts };
  }
  return { days, budget, byDay };
}

function findActivity(byDay, dayNumber, match) {
  const bucket = byDay[dayNumber];
  if (!bucket) return null;
  return bucket.activities.find((a) => a.name.includes(match)) || null;
}

function isBooking(activity) {
  return activity.isBooked === true || (activity.attachments?.length ?? 0) > 0;
}

// ─── Audit ────────────────────────────────────────────────────────
async function audit() {
  console.log(`Connecting to ${CONVEX_URL}`);
  console.log(APPLY ? "Mode: APPLY (will write)\n" : "Mode: DRY-RUN (no writes)\n");

  const { byDay, budget } = await loadEverything();
  const linked = new Set(budget.filter((b) => b.activityId).map((b) => b.activityId));
  const budgetByActivity = new Map();
  for (const b of budget) {
    if (b.activityId) {
      if (!budgetByActivity.has(b.activityId)) budgetByActivity.set(b.activityId, []);
      budgetByActivity.get(b.activityId).push(b);
    }
  }

  const inserts = [];   // { args, label }
  const patches = [];   // { id, patch, label }
  const warnings = [];

  // 1) CATALOG → ensure budgetItem exists
  for (const entry of CATALOG) {
    const act = findActivity(byDay, entry.day, entry.match);
    if (!act) {
      warnings.push(`Day ${entry.day}: no activity matching "${entry.match}" — skipped "${entry.description}"`);
      continue;
    }
    if (linked.has(act._id)) {
      continue; // already have a budgetItem linked
    }
    inserts.push({
      args: {
        category: entry.category,
        description: entry.description,
        amountJPY: entry.amountJPY,
        amountAUD: entry.amountAUD,
        isPaid: false,
        dayNumber: entry.day,
        activityId: act._id,
        notes: entry.notes,
      },
      label: `+ Day ${entry.day} [${entry.category}] ${entry.description} — ${fmtMoney(entry.amountJPY, entry.amountAUD)}`,
    });
  }

  // 2) UPDATES → patch existing placeholders
  for (const upd of UPDATES) {
    const matches = budget.filter((b) => b.description.includes(upd.matchDescription));
    if (matches.length === 0) {
      warnings.push(`No existing budgetItem matched "${upd.matchDescription}" — skipped update`);
      continue;
    }
    for (const b of matches) {
      const changed = b.amountJPY !== upd.amountJPY || b.amountAUD !== upd.amountAUD;
      if (!changed) continue;
      patches.push({
        id: b._id,
        patch: { id: b._id, amountJPY: upd.amountJPY, amountAUD: upd.amountAUD, notes: upd.notes },
        label: `~ Update "${b.description}" — was ${fmtMoney(b.amountJPY, b.amountAUD)}, now ${fmtMoney(upd.amountJPY, upd.amountAUD)}`,
      });
    }
  }

  // 3) Bookings (isBooked OR attachments) → ensure linked budgetItem + mark paid
  for (const dayNumber of Object.keys(byDay)) {
    for (const act of byDay[dayNumber].activities) {
      if (!isBooking(act)) continue;
      const linkedItems = budgetByActivity.get(act._id) ?? [];
      if (linkedItems.length === 0) {
        warnings.push(
          `Day ${dayNumber}: BOOKING with no budget link → "${act.name}" ` +
          `(isBooked=${act.isBooked}, attachments=${act.attachments?.length ?? 0}). ` +
          `Consider adding a budgetItem manually.`
        );
        continue;
      }
      for (const b of linkedItems) {
        if (b.isPaid) continue;
        patches.push({
          id: b._id,
          patch: { id: b._id, isPaid: true },
          label: `~ Mark PAID: "${b.description}" (linked to booked "${act.name}")`,
        });
      }
    }
  }

  // 4) GLOBAL items — insert if no existing budgetItem has the same description
  for (const g of GLOBAL_ITEMS) {
    const exists = budget.some((b) => b.description === g.description);
    if (exists) continue;
    inserts.push({
      args: { ...g, isPaid: false },
      label: `+ [${g.category}] ${g.description} — ${fmtMoney(g.amountJPY, g.amountAUD)}`,
    });
  }

  // ─── Report ────────────────────────────────────────────────────
  console.log(`── Inserts (${inserts.length}) ──`);
  for (const i of inserts) console.log(`  ${i.label}`);
  console.log(`\n── Patches (${patches.length}) ──`);
  for (const p of patches) console.log(`  ${p.label}`);
  console.log(`\n── Warnings (${warnings.length}) ──`);
  for (const w of warnings) console.log(`  ! ${w}`);

  // Totals delta
  let deltaJPY = 0, deltaAUD = 0;
  for (const i of inserts) {
    if (i.args.amountJPY) deltaJPY += i.args.amountJPY;
    if (i.args.amountAUD) deltaAUD += i.args.amountAUD;
  }
  console.log(`\n── Net change from inserts: +${fmtMoney(deltaJPY, deltaAUD)} ──`);

  if (!APPLY) {
    console.log("\n(Dry run — re-run with --apply to write.)");
    return;
  }

  // ─── Apply ─────────────────────────────────────────────────────
  console.log("\nApplying…");
  for (const i of inserts) {
    await client.mutation("budget:create", i.args);
    console.log(`  ✓ ${i.label}`);
  }
  for (const p of patches) {
    await client.mutation("budget:update", p.patch);
    console.log(`  ✓ ${p.label}`);
  }
  console.log("Done.");
}

audit().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
