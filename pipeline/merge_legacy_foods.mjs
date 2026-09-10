/**
 * Merge the full 387-food "carb factor" list from the old apps into CarbTab.
 *
 *   node pipeline/merge_legacy_foods.mjs
 *
 * Source of the 387: pipeline/legacy-carbpal/server/services.ts  FALLBACK_USDA_FOODS
 *   (the App Inventor carbs.csv list, categorised, carbRatio = g total carb per g)
 *
 * The 151 curated foods (pipeline/curated_foods.json, produced by
 * convert_seed_foods.mjs) have better names and serving sizes, so where a legacy
 * food matches a curated one, the curated entry wins and the legacy name is kept
 * as a search alias. Nothing curated is lost. Re-runnable.
 *
 * Output: app/src/data/foods.json  (regenerated, ~400+ foods, sorted by name)
 *
 * Legacy values are total-carb density and predate a USDA check, so anything not
 * covered by the curated set is marked confidence: "low" pending the accuracy
 * and fiber passes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const TODAY = "2026-09-09";

const CAT = {
  Fruits: "Fruit",
  Vegetables: "Vegetable",
  "Nuts/Seeds": "Nuts",
  "Grains/Snacks": "Grain",
  Other: "Other",
};

// ---- 1. parse the 387 legacy foods ----
const svc = readFileSync(join(root, "pipeline/legacy-carbpal/server/services.ts"), "utf8");
const start = svc.indexOf("FALLBACK_USDA_FOODS");
const end = svc.indexOf("\n];", start);
const block = svc.slice(start, end);
const legacy = [...block.matchAll(/name:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*carbRatio:\s*([\d.]+)/g)].map(
  (m) => ({ name: m[1].trim(), cat: m[2], ratio: parseFloat(m[3]) }),
);
if (legacy.length !== 387) console.warn(`Note: parsed ${legacy.length} legacy foods, expected 387`);

// ---- 2. load the curated set ----
const curated = JSON.parse(readFileSync(join(root, "pipeline/curated_foods.json"), "utf8"));

// ---- 3. name matching ----
const sing = (w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(sing)
    .sort()
    .join(" ");
const wordSet = (s) => new Set(norm(s).split(" ").filter(Boolean));
const subset = (a, b) => a.size > 0 && [...a].every((x) => b.has(x));

const curatedByNorm = new Map(curated.map((c) => [norm(c.name), c]));

function matchCurated(name) {
  const k = norm(name);
  if (curatedByNorm.has(k)) return curatedByNorm.get(k);
  const lw = wordSet(name);
  for (const c of curated) {
    const cw = wordSet(c.name);
    // only trust multi-word overlaps so "Corn" doesn't collapse into "Sweet Corn, kernels"
    if (lw.size >= 2 && subset(lw, cw)) return c;
    if (cw.size >= 2 && subset(cw, lw)) return c;
  }
  return null;
}

// ---- 4. build the merged list ----
const slug = (s) =>
  s.toLowerCase().replace(/[()]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const usedCurated = new Set();
const out = [];
let matched = 0;
let addedLegacy = 0;

for (const L of legacy) {
  const c = matchCurated(L.name);
  if (c) {
    matched++;
    if (!usedCurated.has(c.id)) {
      usedCurated.add(c.id);
      const alias = L.name.toLowerCase();
      if (alias !== c.name.toLowerCase() && !(c.aliases || []).includes(alias)) {
        c.aliases = [...(c.aliases || []), alias];
      }
      out.push(c);
    } else {
      // second legacy food that maps to an already-added curated entry: drop, keep name as alias
      const alias = L.name.toLowerCase();
      if (!(c.aliases || []).includes(alias)) c.aliases = [...(c.aliases || []), alias];
    }
    continue;
  }
  addedLegacy++;
  out.push({
    id: slug(L.name),
    name: L.name,
    aliases: [],
    category: CAT[L.cat] || "Other",
    carbFactorTotal: Math.round(L.ratio * 1000) / 1000,
    source: {
      type: "USDA",
      note: "Legacy carb-factor list from the prior app. Total-carb density; USDA accuracy check and fiber pass pending.",
      retrievedAt: TODAY,
    },
    confidence: "low",
    updatedAt: TODAY,
  });
}

// curated foods that never matched a legacy entry stay in
let curatedOnly = 0;
for (const c of curated) {
  if (!usedCurated.has(c.id)) {
    curatedOnly++;
    out.push(c);
  }
}

// de-dupe ids
const seen = new Map();
for (const item of out) {
  const n = (seen.get(item.id) || 0) + 1;
  seen.set(item.id, n);
  if (n > 1) item.id = `${item.id}-${n}`;
  if (item.aliases && item.aliases.length === 0) delete item.aliases;
}

out.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(join(root, "app/src/data/foods.json"), JSON.stringify(out, null, 2) + "\n");

const byCat = out.reduce((a, f) => ((a[f.category] = (a[f.category] || 0) + 1), a), {});
const byConf = out.reduce((a, f) => ((a[f.confidence] = (a[f.confidence] || 0) + 1), a), {});
console.log(`Legacy parsed:        ${legacy.length}`);
console.log(`  matched to curated: ${matched}`);
console.log(`  added as new:       ${addedLegacy}`);
console.log(`Curated-only kept:    ${curatedOnly}`);
console.log(`TOTAL foods:          ${out.length}  -> app/src/data/foods.json`);
console.log(`By category:`, byCat);
console.log(`By confidence:`, byConf);
console.log(`With serving size:   ${out.filter((f) => f.serving).length}`);
