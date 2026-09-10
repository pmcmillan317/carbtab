/**
 * usda_apply.mjs — fold the confident matches from usda_review.json back into
 * app/src/data/foods.json.
 *
 *   node pipeline/usda_verify.mjs   # first, produces usda_review.json
 *   node pipeline/usda_apply.mjs
 *
 * Applies a row when the FDC match is trustworthy:
 *   - verdict "ok"                         (our value already agreed within 10%)
 *   - verdict "minor" and matchScore >= 0.88
 *   - any verdict with matchScore >= 1.0   (head noun + form both line up)
 * minus SKIP (matches that are visibly the wrong food despite the score) and
 * plus MANUAL (hand-checked corrections the matcher could not make on its own).
 *
 * For an applied food: carbFactorTotal / fiberFactor / carbFactorNet are set from
 * USDA per-100 g values, source gets the fdcId + a "verified" note, and
 * confidence is raised to "medium". Everything else is left exactly as it was
 * (still confidence "low", still shown "Unverified" in the app).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TODAY = "2026-09-09";

const foods = JSON.parse(readFileSync(join(ROOT, "app/src/data/foods.json"), "utf8"));
const review = JSON.parse(readFileSync(join(HERE, "usda_review.json"), "utf8"));

// matches that scored well but are the wrong food — keep our value, no fdcId
const SKIP = new Set([
  "orange", // -> "Orange Pineapple Juice Blend"
  "carrot-cake-frosted", // -> a doughnut
  "muffins-pumpkin", // -> blueberry muffin
  "croissant", // -> "Croissants, apple"
  "pancakes", // -> "Pancakes, blueberry"
  "fudge", // -> "Syrups, chocolate, fudge-type"
  "chocolate-cake-frosted", // -> a doughnut
  "egg-custard", // -> egg custard PIE (has crust)
  "noodles-macaroni-cooked", // -> egg noodles
  "noodles-spaghetti-cooked", // -> egg noodles
  "corn", // -> "Corn grain, white" (dry field corn, not sweet corn)
  "spinach", // -> "Spinach souffle"
  "lentils-sprouts-raw", // -> "Lentils, raw" (not sprouts)
  "sour-cream", // -> "Sour cream, light"
  "potato-chips", // -> "reduced fat"
  "great-northern-beans", // -> dry raw seeds vs our cooked
  "navy-beans",
  "pink-beans",
  "pigeon-peas",
  "kidney-beans", // -> sprouted raw
  "table-white-sugar", // -> wine
  "whole-milk", // -> mozzarella cheese
  "oatmeal-cooked", // -> bulgur
  "spaghetti-boiled", // -> spaghetti squash
  "white-rice-cooked", // -> glutinous rice
  "plain-bagel", // -> bagel chips
  "tomato-ketchup", // -> "Tomato, roma"
  "soy-nuts", // -> soy sauce
  "roasted-turkey-breast", // -> "with added solution"
  "broccoli-cooked", // -> broccoli raab
  "raspberries", // -> raspberry juice concentrate
  "potatoes-obrien", // -> potato flour
  "mushrooms", // -> "Mushroom, beech" / shiitake
  "bread-stuffing", // -> "Bread, cheese"
  "pancakes-whole-wheat", // -> whole-wheat crackers
  "sunflower-seeds-oil-roasted", // -> breadfruit seeds
  "white-potato-boiled", // -> mushrooms
  "prunes", // -> canned in heavy syrup
  "pie-filling-cherry", // -> low calorie
  "noodles-chow-mein-cooked", // -> egg noodles
  "pineapple-canned-in-syrup", // our "in syrup" vs matched "heavy syrup drained" — different pack
  "pinto-beans-canned",
  "peaches-canned-in-juice", // -> heavy syrup
  "pears-canned-in-juice",
  "pears-canned-in-syrup",
  "lemons", // -> lemon juice concentrate
  "grapefruit", // -> grapefruit juice
  "pomegranate-seeds", // -> pomegranate juice
  "safflower-seeds", // -> "seed meal, partially defatted"
  "tortillas-flour", // -> "tortilla mix" (flour)
  "white-cake", // -> cake flour
  "pies-vanilla-cream", // -> "Ice creams, vanilla"
  "lasagna-meat", // fine to leave
  "potatoes-french-fries", // -> steak fries as purchased (frozen, uncooked)
  "yellow-cake-unfrosted", // -> with vanilla frosting
  "chicken-breast-cooked", // -> "breast tenders, breaded" (plain chicken is ~0 g)
  "black-beans-canned", // -> "Soup, black bean, condensed"
  "graham-cracker", // -> "graham crackers, chocolate-coated"
  "white-flour", // -> "Rice flour, white" (we mean wheat)
  "pretzels-hard", // -> "Pretzel, hard chocolate coated"
  "fudge-vanilla", // -> "fudge, vanilla with nuts"
  "shortbread-cookies", // -> "shortbread, pecan"
  "noodles-corn-cooked", // -> egg noodles
  "kale", // Foundation re-analysis (4.4 g) disagrees sharply with labels (~7-9 g); keep ours
  "kale-raw",
]);

// hand-checked corrections (SR Legacy / Foundation values, per 100 g)
const MANUAL = {
  "air-popcorn": { carb: 77.8, fiber: 14.5, fdcId: 167959, desc: "Snacks, popcorn, air-popped" },
  flaxseed: { carb: 28.9, fiber: 27.3, fdcId: 169414, desc: "Seeds, flaxseed" },
  "flax-seeds-ground": { carb: 28.9, fiber: 27.3, fdcId: 169414, desc: "Seeds, flaxseed" },
};

const r3 = (n) => Math.round(n * 10000) / 10000;

function applyValues(food, carb100, fiber100, fdcId, desc, how) {
  food.carbFactorTotal = r3(carb100 / 100);
  if (fiber100 != null && !Number.isNaN(fiber100)) {
    food.fiberFactor = r3(fiber100 / 100);
    food.carbFactorNet = r3(Math.max(0, carb100 - fiber100) / 100);
  }
  food.source = {
    type: "USDA",
    fdcId,
    note: `USDA FoodData Central ${fdcId} (${desc}), verified ${TODAY}${
      how === "manual" ? ", hand-checked" : ""
    }.`,
    retrievedAt: TODAY,
  };
  food.confidence = "medium";
  food.updatedAt = TODAY;
}

const byId = new Map(foods.map((f) => [f.id, f]));
const changed = [];
let verified = 0;

for (const [id, m] of Object.entries(MANUAL)) {
  const food = byId.get(id);
  if (!food) {
    console.warn(`MANUAL: no food with id "${id}"`);
    continue;
  }
  const before = food.carbFactorTotal * 100;
  applyValues(food, m.carb, m.fiber, m.fdcId, m.desc, "manual");
  changed.push({ id, name: food.name, before: Math.round(before * 10) / 10, after: m.carb, how: "manual" });
}

for (const row of review) {
  if (!row.fdcId || MANUAL[row.id] || SKIP.has(row.id)) continue;
  const ok =
    row.verdict === "ok" ||
    row.matchScore >= 1.0 ||
    (row.verdict === "minor" && row.matchScore >= 0.88);
  if (!ok) continue;
  const food = byId.get(row.id);
  if (!food || row.newCarb100 == null) continue;

  verified++;
  const before = food.carbFactorTotal * 100;
  const delta = Math.abs(row.newCarb100 - before);
  applyValues(food, row.newCarb100, row.newFiber100, row.fdcId, row.fdcDesc, "auto");
  if (delta / Math.max(before, 1) > 0.03) {
    changed.push({
      id: row.id,
      name: food.name,
      before: Math.round(before * 10) / 10,
      after: row.newCarb100,
      how: row.verdict,
      fdc: row.fdcDesc,
    });
  }
}

// normalise fiber / net so a partial update never leaves net > total
for (const f of foods) {
  if (f.fiberFactor != null) {
    if (f.fiberFactor > f.carbFactorTotal) f.fiberFactor = f.carbFactorTotal;
    f.carbFactorNet = r3(Math.max(0, f.carbFactorTotal - f.fiberFactor));
  } else if (f.carbFactorNet != null && f.carbFactorNet > f.carbFactorTotal) {
    f.carbFactorNet = f.carbFactorTotal;
  }
}

writeFileSync(join(ROOT, "app/src/data/foods.json"), JSON.stringify(foods, null, 2) + "\n");

const conf = foods.reduce((a, f) => ((a[f.confidence] = (a[f.confidence] || 0) + 1), a), {});
const withFdc = foods.filter((f) => f.source?.fdcId).length;
console.log(`Applied USDA values to ${verified + Object.keys(MANUAL).length} foods.`);
console.log(`foods.json confidence:`, conf);
console.log(`foods with an fdcId: ${withFdc} / ${foods.length}`);
console.log(`\nValue changes over 3% (${changed.length}):`);
changed
  .sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before))
  .forEach((c) =>
    console.log(
      `  ${c.name.padEnd(30)} ${String(c.before).padStart(6)} -> ${String(c.after).padStart(6)}  [${c.how}] ${c.fdc || ""}`
    )
  );
