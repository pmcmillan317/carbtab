/**
 * Convert the old carbpal curated food list into the CarbTab Food schema.
 *
 *   node pipeline/convert_seed_foods.mjs
 *
 * Input : pipeline/legacy-carbpal/server/data/foods.json  (151 items, USDA-derived,
 *         total-carb density; a copy of the old GramWise/carbpal seed list)
 * Output: pipeline/curated_foods.json       (CarbTab schema; the merge baseline)
 *
 * Then run merge_legacy_foods.mjs to fold in the 387-food list and write the
 * shipped app/src/data/foods.json.
 *
 * These values are a starting point only. They express TOTAL carbohydrate density.
 * Net-carb factors (fiber) still need a pass against USDA FoodData Central.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = JSON.parse(
  readFileSync(join(root, "pipeline/legacy-carbpal/server/data/foods.json"), "utf8")
);

const CATEGORY = {
  Fruits: "Fruit",
  Vegetables: "Vegetable",
  "Nuts/Seeds": "Nuts",
  "Grains/Snacks": "Grain",
  Other: "Other",
};

const TODAY = "2026-09-09";

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// "Apple (with skin)" -> "Apple, with skin"   /   "White Rice (cooked)" -> "White Rice, cooked"
const cleanName = (n) => n.replace(/\s*\(([^)]+)\)/g, ", $1").replace(/\s+,/g, ",").trim();

// "1 medium (182g)" -> { label: "1 medium", grams: 182 }   /   "1 cup (240ml)" -> treat ml as g
function parseServing(s) {
  if (!s) return undefined;
  const m = s.match(/^(.*?)\s*\(([\d.]+)\s*(g|ml)\)\s*$/i);
  if (!m) return { label: s.trim(), grams: undefined };
  const label = m[1].replace(/cupcooked/i, "cup cooked").trim();
  return { label, grams: Math.round(parseFloat(m[2]) * 10) / 10 };
}

const out = src.map((f) => {
  const name = cleanName(f.name);
  const serving = parseServing(f.servingSize);
  return {
    id: slug(name),
    name,
    aliases: [],
    category: CATEGORY[f.category] || "Other",
    carbFactorTotal: Math.round(f.carbRatio * 1000) / 1000,
    // net factor unknown until the fiber pass; omit rather than guess
    serving: serving && serving.grams ? serving : undefined,
    source: {
      type: "USDA",
      note: "CarbTab curated seed, USDA FoodData Central derived. Total-carb density; net pass pending.",
      retrievedAt: TODAY,
    },
    confidence: "medium",
    updatedAt: TODAY,
  };
});

// de-dupe ids
const seen = new Map();
for (const item of out) {
  const n = (seen.get(item.id) || 0) + 1;
  seen.set(item.id, n);
  if (n > 1) item.id = `${item.id}-${n}`;
}

writeFileSync(join(root, "pipeline/curated_foods.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${out.length} foods -> pipeline/curated_foods.json`);
console.log("Categories:", out.reduce((a, f) => ((a[f.category] = (a[f.category] || 0) + 1), a), {}));
console.log("Missing serving grams:", out.filter((f) => !f.serving).map((f) => f.name).join(", ") || "none");
