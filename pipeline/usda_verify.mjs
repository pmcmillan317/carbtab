/**
 * usda_verify.mjs — check every food in app/src/data/foods.json against USDA
 * FoodData Central and write a review file. Does NOT modify foods.json.
 *
 *   node pipeline/usda_verify.mjs
 *
 * Needs a FoodData Central API key in pipeline/.usda-key.local (one line, no
 * quotes). Get one free at https://fdc.nal.usda.gov/api-key-signup.
 *
 * Output:
 *   pipeline/usda_review.json   full machine-readable result, worst delta first
 *   pipeline/usda_review.md     the same as a skim table
 *
 * Then eyeball the REVIEW rows and run usda_apply.mjs to fold in the accepted
 * corrections (adds fdcId, fixes carb/fiber, bumps confidence).
 *
 * Responses are cached under pipeline/.usda-cache/ so re-runs cost no API calls.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CACHE = join(HERE, ".usda-cache");
mkdirSync(CACHE, { recursive: true });

const KEY = readFileSync(join(HERE, ".usda-key.local"), "utf8").trim();
if (!KEY) throw new Error("pipeline/.usda-key.local is empty");

const foods = JSON.parse(readFileSync(join(ROOT, "app/src/data/foods.json"), "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cachedFetch(url) {
  const h = createHash("sha1").update(url).digest("hex").slice(0, 16);
  const file = join(CACHE, h + ".json");
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  for (let attempt = 1; attempt <= 4; attempt++) {
    await sleep(140); // stay well under 1000 req/hour
    const r = await fetch(url);
    if (r.ok) {
      const j = await r.json();
      writeFileSync(file, JSON.stringify(j));
      return j;
    }
    if (r.status >= 500 && attempt < 4) {
      await sleep(1500 * attempt);
      continue;
    }
    const body = await r.text();
    throw new Error(`FDC ${r.status} for ${url}\n${body.slice(0, 200)}`);
  }
}

const NUM = { carb: "205", fiber: "291" };
const nutrient = (arr, key) => {
  const n = (arr || []).find(
    (x) => x.nutrientNumber === NUM[key] || x.nutrient?.number === NUM[key]
  );
  return n ? (n.value ?? n.amount ?? null) : null;
};

// form words that should agree between our name and the FDC description
const FORMS = ["raw", "cooked", "boiled", "roasted", "fried", "baked", "grilled", "canned", "dried", "frozen", "steamed", "sauteed", "toasted", "stewed", "candied", "pickled"];
const STOP = new Set(["and", "with", "the", "of", "in", "or", "a", "no", "ns", "as", "to", "from", "prep", "prepared", "type", "all", "not", "further", "specified", "added", "salt", "drained", "solids", "commercially", "commercial", "regular"]);

// description forms that make it a different food from a plain whole-food entry
const JUNK = /\b(dry mix|dry\b|unprepared|incomplete|dehydrated|low-moisture|powder|substitute|imitation|non-?dairy|analog|babyfood|baby food|infant|formulated|fortified with|0% moisture|toddler)\b|^(oil|juice|beverage|drink|sauce|vinegar|wine|flour|meal|extract|syrup)[, ]|,\s*(oil|juice|beverage|sauce|puree|concentrate|flour|meal|dry mix|dry)\b/i;
// tribal/regional survey entries — precise but not what a generic lookup wants
const REGIONAL = /\((Alaska Native|Navajo|Hopi|Shoshone Bannock|Northern Plains Indians|Ojibwe)\)/i;
// restaurant-branded rows
const BRANDED = /\b(APPLEBEE'S|DENNY'S|OLIVE GARDEN|T\.G\.I\. FRIDAY'S|CRACKER BARREL|CARRABBA'S|ON THE BORDER|P\.F\. CHANG'S|BOB EVANS)\b/;

const tokens = (s) =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));

const sing = (w) => w.replace(/ies$/, "y").replace(/es$/, "").replace(/s$/, "");
const eq = (a, b) => a === b || sing(a) === sing(b);

function score(foodName, aliases, desc, wantJunk) {
  const nameToks = tokens(foodName);
  const want = new Set([...nameToks, ...(aliases || []).flatMap(tokens)]);
  const have = tokens(desc);
  const haveSet = new Set(have);

  // hard rejects
  if (!wantJunk && JUNK.test(desc)) return -1;
  if (REGIONAL.test(desc)) return -1;
  if (BRANDED.test(desc)) return -1;

  // the head noun must line up: our first token appears among the FDC
  // description's first two tokens (FDC descriptions lead with the food)
  const head = nameToks[0];
  if (head && !(eq(have[0] || "", head) || eq(have[1] || "", head) || haveSet.has(head))) {
    // allow when a later token of ours is clearly the head (e.g. "Air Popcorn" -> "popcorn")
    const anyHead = nameToks.some((t) => eq(have[0] || "", t) || eq(have[1] || "", t));
    if (!anyHead) return -1;
  }

  let hit = 0;
  for (const w of want) if ([...haveSet].some((h) => eq(h, w))) hit++;
  let s = want.size ? hit / want.size : 0;

  // penalise extra descriptive tokens in the FDC entry we didn't ask for
  const extra = have.filter((h) => ![...want].some((w) => eq(w, h))).length;
  s -= extra * 0.04;

  // form agreement
  const wantForm = FORMS.filter((f) => want.has(f));
  const haveForm = FORMS.filter((f) => haveSet.has(f));
  for (const f of wantForm) if (haveForm.includes(f)) s += 0.2;
  for (const f of wantForm) if (!haveForm.includes(f)) s -= 0.25; // we asked for a form the entry lacks
  for (const f of haveForm) if (!wantForm.includes(f)) s -= 0.2;
  if (!wantForm.length && haveForm.includes("raw")) s += 0.1;

  if (/,\s*NFS$/i.test(desc)) s -= 0.05;
  if (eq(have[0] || "", head)) s += 0.15;
  return s;
}

async function lookupNutrients(food) {
  const name = food.name;
  const wantJunk = JUNK.test(name); // e.g. "Brown Gravy Mix" legitimately wants a dry mix
  const q = encodeURIComponent(name.replace(/\([^)]*\)/g, "").replace(/[\/,]+/g, " ").replace(/\s+/g, " ").trim());
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${KEY}&query=${q}&dataType=${encodeURIComponent(
    "SR Legacy,Foundation"
  )}&pageSize=40`;
  const j = await cachedFetch(url);
  const cands = (j.foods || [])
    .map((f) => ({ f, s: score(name, food.aliases, f.description, wantJunk) }))
    .filter((c) => c.s > -1);
  cands.sort((a, b) => b.s - a.s);
  if (!cands[0] || cands[0].s < 0.5) {
    return { match: null, bestDesc: cands[0]?.f.description, bestScore: cands[0]?.s ?? 0, hits: j.totalHits };
  }
  // walk the top candidates until one yields a carb value
  for (const c of cands.slice(0, 4)) {
    if (c.s < 0.5) break;
    let carb = nutrient(c.f.foodNutrients, "carb");
    let fiber = nutrient(c.f.foodNutrients, "fiber");
    if (carb == null) {
      const dj = await cachedFetch(
        `https://api.nal.usda.gov/fdc/v1/food/${c.f.fdcId}?api_key=${KEY}&nutrients=205,291`
      );
      carb = nutrient(dj.foodNutrients, "carb");
      fiber = nutrient(dj.foodNutrients, "fiber");
    }
    if (carb != null) {
      return {
        match: {
          fdcId: c.f.fdcId,
          desc: c.f.description,
          dataType: c.f.dataType,
          score: Math.round(c.s * 100) / 100,
          carb100: carb,
          fiber100: fiber,
        },
        runnerUp:
          cands[1] && cands[1].s > 0.4
            ? { desc: cands[1].f.description, score: Math.round(cands[1].s * 100) / 100 }
            : null,
      };
    }
  }
  return { match: null, bestDesc: cands[0].f.description, bestScore: cands[0].s, noCarb: true };
}

function verdictFor(oldC, newC) {
  if (newC == null) return "no-carb";
  if (oldC === 0) return newC <= 1 ? "ok" : "REVIEW";
  const d = Math.abs(newC - oldC) / oldC;
  if (d <= 0.1) return "ok";
  if (d <= 0.25) return "minor";
  return "REVIEW";
}

const rows = [];
let i = 0;
for (const food of foods) {
  i++;
  if (i % 25 === 0) process.stdout.write(`\r  ${i}/${foods.length}   `);
  const oldC = Math.round(food.carbFactorTotal * 1000) / 10; // per 100 g
  const oldF = food.fiberFactor != null ? Math.round(food.fiberFactor * 1000) / 10 : null;
  let res;
  try {
    res = await lookupNutrients(food);
  } catch (e) {
    rows.push({ id: food.id, name: food.name, conf: food.confidence, verdict: "error", error: String(e).slice(0, 160) });
    continue;
  }
  if (!res.match) {
    rows.push({
      id: food.id,
      name: food.name,
      conf: food.confidence,
      oldCarb100: oldC,
      match: null,
      bestDesc: res.bestDesc,
      bestScore: res.bestScore,
      verdict: res.noCarb ? "no-carb" : "no-match",
    });
    continue;
  }
  const m = res.match;
  const deltaPct =
    oldC === 0 ? null : Math.round(((m.carb100 - oldC) / oldC) * 100);
  rows.push({
    id: food.id,
    name: food.name,
    conf: food.confidence,
    category: food.category,
    oldCarb100: oldC,
    newCarb100: m.carb100,
    deltaPct,
    oldFiber100: oldF,
    newFiber100: m.fiber100,
    fdcId: m.fdcId,
    fdcDesc: m.desc,
    fdcType: m.dataType,
    matchScore: m.score,
    runnerUp: res.runnerUp,
    verdict: verdictFor(oldC, m.carb100),
  });
}
process.stdout.write("\r" + " ".repeat(30) + "\r");

const order = { REVIEW: 0, "no-match": 1, "no-carb": 2, minor: 3, ok: 4 };
rows.sort((a, b) => {
  const va = order[a.verdict] ?? 9;
  const vb = order[b.verdict] ?? 9;
  if (va !== vb) return va - vb;
  return Math.abs(b.deltaPct || 0) - Math.abs(a.deltaPct || 0);
});

writeFileSync(join(HERE, "usda_review.json"), JSON.stringify(rows, null, 1));

const tally = rows.reduce((a, r) => ((a[r.verdict] = (a[r.verdict] || 0) + 1), a), {});
const md = [
  "# USDA FoodData Central verification",
  "",
  `${rows.length} foods checked against SR Legacy / Foundation. ` +
    Object.entries(tally)
      .map(([k, v]) => `**${k}**: ${v}`)
      .join(" · "),
  "",
  "`ok` = within 10% of USDA. `minor` = 10-25%. `REVIEW` = >25% off. `no-match` = no confident FDC hit.",
  "",
  "| verdict | food | conf | ours /100g | USDA /100g | Δ | USDA match | score |",
  "|---|---|---|--:|--:|--:|---|--:|",
  ...rows.map(
    (r) =>
      `| ${r.verdict} | ${r.name} | ${r.conf ?? ""} | ${r.oldCarb100 ?? ""} | ${
        r.newCarb100 ?? ""
      } | ${r.deltaPct == null ? "" : (r.deltaPct > 0 ? "+" : "") + r.deltaPct + "%"} | ${
        r.fdcDesc ? r.fdcDesc + (r.fdcId ? ` (${r.fdcId})` : "") : r.bestDesc ? "~ " + r.bestDesc : "—"
      } | ${r.matchScore ?? r.bestScore ?? ""} |`
  ),
  "",
].join("\n");
writeFileSync(join(HERE, "usda_review.md"), md);

console.log(`\nChecked ${rows.length} foods.`);
for (const [k, v] of Object.entries(tally)) console.log(`  ${k}: ${v}`);
console.log("\n-> pipeline/usda_review.json  and  pipeline/usda_review.md");
