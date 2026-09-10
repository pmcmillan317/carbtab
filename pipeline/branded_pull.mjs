/**
 * branded_pull.mjs — build app/public/branded.json: a curated set of common US
 * packaged/branded foods from USDA FoodData Central's Branded dataset.
 *
 *   node pipeline/branded_pull.mjs
 *
 * FDC Branded is ~1.3M products (too big and too noisy to ship whole), so this
 * runs a fixed list of everyday-grocery searches, keeps the products with a
 * usable carb value, de-dupes, and caps the total. The GTIN/UPC is kept on each
 * item so a barcode scanner can match against it later.
 *
 * Needs pipeline/.usda-key.local. Responses cached in pipeline/.usda-cache/.
 * Output is a Food[] (same shape as foods.json) with source.type
 * "manufacturer-label", fetched by the app as a static asset (not bundled into
 * the JS).
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

const TODAY = "2026-09-10";
const PER_QUERY = 30; // results to consider per search
const KEEP_PER_QUERY = 14; // survivors to keep per search after filtering
const TOTAL_CAP = 3200;

// [searchTerm, CarbTab category]
const QUERIES = [
  // breakfast
  ["cheerios", "Grain"], ["honey nut cheerios", "Grain"], ["frosted flakes", "Grain"],
  ["rice krispies", "Grain"], ["froot loops", "Grain"], ["lucky charms", "Grain"],
  ["cinnamon toast crunch", "Grain"], ["raisin bran", "Grain"], ["special k cereal", "Grain"],
  ["life cereal", "Grain"], ["chex cereal", "Grain"], ["granola", "Grain"],
  ["instant oatmeal", "Grain"], ["quaker oats", "Grain"], ["grits", "Grain"],
  ["pop tarts", "Grain"], ["toaster strudel", "Grain"], ["pancake mix", "Grain"],
  ["frozen waffles", "Grain"], ["eggo waffles", "Grain"], ["cereal bar", "Grain"],
  ["nutri grain bar", "Grain"], ["breakfast biscuit", "Grain"],
  // bars & snacks
  ["nature valley granola bar", "Snack"], ["kind bar", "Snack"], ["clif bar", "Snack"],
  ["rxbar", "Snack"], ["quest bar", "Snack"], ["protein bar", "Snack"],
  ["fiber one bar", "Snack"], ["rice krispies treats", "Snack"], ["fruit snacks", "Snack"],
  ["gushers", "Snack"], ["fruit roll ups", "Snack"], ["goldfish crackers", "Snack"],
  ["cheez it", "Snack"], ["ritz crackers", "Snack"], ["saltine crackers", "Snack"],
  ["triscuit", "Snack"], ["wheat thins", "Snack"], ["graham crackers", "Snack"],
  ["animal crackers", "Snack"], ["teddy grahams", "Snack"], ["pretzels", "Snack"],
  ["potato chips", "Snack"], ["tortilla chips", "Snack"], ["doritos", "Snack"],
  ["lays chips", "Snack"], ["cheetos", "Snack"], ["popcorn", "Snack"],
  ["pirates booty", "Snack"], ["veggie straws", "Snack"], ["trail mix", "Snack"],
  ["oreo cookies", "Snack"], ["chips ahoy", "Snack"], ["nutter butter", "Snack"],
  ["nilla wafers", "Snack"], ["fig newtons", "Snack"], ["belvita", "Snack"],
  // candy / sweets
  ["hershey chocolate bar", "Snack"], ["m&ms", "Snack"], ["snickers", "Snack"],
  ["kit kat", "Snack"], ["reeses", "Snack"], ["twix", "Snack"], ["skittles", "Snack"],
  ["starburst", "Snack"], ["sour patch kids", "Snack"], ["swedish fish", "Snack"],
  ["gummy bears", "Snack"], ["welchs fruit snacks", "Snack"], ["jello", "Snack"],
  ["pudding cup", "Snack"], ["ice cream", "Dairy"], ["ben jerrys", "Dairy"],
  ["halo top", "Dairy"], ["ice cream sandwich", "Dairy"], ["popsicle", "Snack"],
  ["outshine fruit bar", "Snack"],
  // dairy
  ["greek yogurt", "Dairy"], ["chobani yogurt", "Dairy"], ["yoplait yogurt", "Dairy"],
  ["dannon yogurt", "Dairy"], ["oikos yogurt", "Dairy"], ["activia yogurt", "Dairy"],
  ["go gurt", "Dairy"], ["yogurt tube", "Dairy"], ["cottage cheese", "Dairy"],
  ["string cheese", "Dairy"], ["babybel cheese", "Dairy"], ["cheese slices", "Dairy"],
  ["shredded cheese", "Dairy"], ["cream cheese", "Dairy"], ["sour cream", "Dairy"],
  ["chocolate milk", "Dairy"], ["whole milk", "Dairy"], ["almond milk", "Dairy"],
  ["oat milk", "Dairy"], ["soy milk", "Dairy"], ["coffee creamer", "Dairy"],
  ["fairlife milk", "Dairy"], ["lactaid milk", "Dairy"],
  // bread & bakery
  ["white bread", "Grain"], ["wheat bread", "Grain"], ["whole grain bread", "Grain"],
  ["sourdough bread", "Grain"], ["hamburger buns", "Grain"], ["hot dog buns", "Grain"],
  ["flour tortilla", "Grain"], ["corn tortilla", "Grain"], ["mission tortilla", "Grain"],
  ["pita bread", "Grain"], ["english muffin", "Grain"], ["bagel", "Grain"],
  ["dinner rolls", "Grain"], ["croissant", "Grain"], ["naan", "Grain"],
  ["hawaiian rolls", "Grain"], ["texas toast", "Grain"], ["biscuits", "Grain"],
  // pantry & meals
  ["pasta", "Grain"], ["spaghetti", "Grain"], ["macaroni", "Grain"],
  ["kraft mac and cheese", "Grain"], ["velveeta shells", "Grain"], ["rice a roni", "Grain"],
  ["white rice", "Grain"], ["brown rice", "Grain"], ["minute rice", "Grain"],
  ["ramen noodles", "Grain"], ["cup noodles", "Grain"], ["pasta sauce", "Other"],
  ["marinara sauce", "Other"], ["alfredo sauce", "Other"], ["canned soup", "Other"],
  ["chicken noodle soup", "Other"], ["tomato soup", "Other"], ["chili", "Other"],
  ["canned beans", "Beans"], ["baked beans", "Beans"], ["refried beans", "Beans"],
  ["black beans", "Beans"], ["peanut butter", "Nuts"], ["jif peanut butter", "Nuts"],
  ["almond butter", "Nuts"], ["nutella", "Snack"], ["jelly", "Other"],
  ["strawberry jam", "Other"], ["honey", "Other"], ["maple syrup", "Other"],
  ["pancake syrup", "Other"], ["ketchup", "Other"], ["bbq sauce", "Other"],
  ["ranch dressing", "Other"], ["italian dressing", "Other"], ["salsa", "Other"],
  ["hummus", "Beans"], ["guacamole", "Vegetable"], ["applesauce", "Fruit"],
  ["fruit cup", "Fruit"], ["mandarin oranges cup", "Fruit"], ["raisins", "Fruit"],
  ["dried cranberries", "Fruit"], ["craisins", "Fruit"], ["gogo squeez", "Fruit"],
  // frozen
  ["frozen pizza", "Grain"], ["digiorno pizza", "Grain"], ["hot pocket", "Grain"],
  ["frozen burrito", "Grain"], ["chicken nuggets", "Protein"], ["dino nuggets", "Protein"],
  ["fish sticks", "Protein"], ["frozen french fries", "Vegetable"], ["tater tots", "Vegetable"],
  ["frozen meal", "Other"], ["lean cuisine", "Other"], ["stouffers", "Other"],
  ["totino pizza rolls", "Grain"], ["frozen vegetables", "Vegetable"], ["frozen corn", "Vegetable"],
  ["eggo", "Grain"], ["bagel bites", "Grain"], ["uncrustables", "Grain"],
  ["lunchables", "Other"],
  // drinks
  ["orange juice", "Other"], ["apple juice", "Other"], ["juice box", "Other"],
  ["capri sun", "Other"], ["gatorade", "Other"], ["powerade", "Other"],
  ["coca cola", "Other"], ["sprite", "Other"], ["dr pepper", "Other"],
  ["pepsi", "Other"], ["mountain dew", "Other"], ["lemonade", "Other"],
  ["arizona tea", "Other"], ["snapple", "Other"], ["kool aid", "Other"],
  ["vitamin water", "Other"], ["body armor", "Other"], ["red bull", "Other"],
  ["monster energy", "Other"], ["hot chocolate mix", "Other"], ["ovaltine", "Other"],
  ["nesquik", "Other"], ["ensure", "Other"], ["carnation breakfast", "Other"],
  ["smoothie", "Other"], ["naked juice", "Other"], ["coconut water", "Other"],
  // baking / misc
  ["brownie mix", "Grain"], ["cake mix", "Grain"], ["chocolate chips", "Snack"],
  ["all purpose flour", "Grain"], ["granulated sugar", "Other"], ["breadcrumbs", "Grain"],
  ["croutons", "Grain"], ["stuffing mix", "Grain"], ["cornbread mix", "Grain"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cachedFetch(url) {
  const h = createHash("sha1").update(url).digest("hex").slice(0, 16);
  const file = join(CACHE, "br_" + h + ".json");
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  for (let a = 1; a <= 4; a++) {
    await sleep(160);
    const r = await fetch(url);
    if (r.ok) {
      const j = await r.json();
      writeFileSync(file, JSON.stringify(j));
      return j;
    }
    if (r.status >= 500 && a < 4) {
      await sleep(1500 * a);
      continue;
    }
    throw new Error(`FDC ${r.status} ${url}`);
  }
}

const nutr = (arr, num) => {
  const n = (arr || []).find((x) => x.nutrientNumber === num);
  return n && n.value != null ? n.value : null;
};

const SMALL = /^(a|an|and|the|of|in|on|with|for|to|or|&)$/i;
const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/\b([a-z])([a-z']*)/g, (_, a, b) => a.toUpperCase() + b)
    .replace(/\b(\w+)\b/g, (w) => (SMALL.test(w) ? w.toLowerCase() : w))
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/'S\b/g, "'s");

// regional grocery house brands — low value, drop them
const STORE_BRAND =
  /\b(big y|harris teeter|best choice|best yet|first street|darrenkamp|weis|hy-?vee|meijer|wegmans|food lion|giant eagle|shoprite|stop ?& ?shop|price chopper|market pantry|good ?& ?gather|southern grove|clancy'?s|millville|l'?oven fresh|happy farms|friendly farms|specially selected|tuscan garden|golden crumb|clover valley|clearly|great value|essential everyday|our family|schnucks|ingles|piggly wiggly|winn-?dixie|acme|jewel|vons|ralphs|fred meyer|king soopers|smiths|heb central market|central market)\b/i;

// tidy a SHOUTING brand ("GENERAL MILLS SALES INC.") into "General Mills"
function cleanBrand(b) {
  if (!b) return "";
  let s = b
    .replace(/\b(inc|llc|co|corp|corporation|company|sales|ltd|holdings|foods?|brands?|group|usa|north america|the)\.?\b/gi, "")
    .replace(/[,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (/[a-z]/.test(s) === false || s === s.toUpperCase()) s = titleCase(s);
  return s;
}

// clean a product description: de-SHOUT, drop trailing ", <repeated flavor>",
// strip package-size tails ("10 oz bag", "5.3oz", "12Z12PK", "1G/4")
function cleanDesc(d) {
  let s = d.replace(/\s+/g, " ").trim();
  if (/[a-z]/.test(s) === false || s === s.toUpperCase()) s = titleCase(s);
  s = s.replace(/\bLow-\s+Fat\b/gi, "Low-Fat").replace(/\bNon-\s+Fat\b/gi, "Non-Fat");
  // FDC often appends ", <flavor already in the name>"
  const m = s.match(/^(.*?),\s*([^,]+)$/);
  if (m && m[1].toLowerCase().includes(m[2].trim().toLowerCase().split(" ").slice(0, 2).join(" "))) s = m[1];
  // package-size / packaging tails
  s = s
    .replace(/\s*[-,]?\s*\d+(\.\d+)?\s?(fl\.?\s?oz|fluid ounces?|ounces?|oz|lb|lbs|g|gram|grams|ml|ct|count|pk|pack|liter|litre|gallon|l)\b.*$/i, "")
    .replace(/\s*\b\d+[a-z]?\d*\s?(pk|pack|ct)\b.*$/i, "")
    .replace(/\s*\b\d+\s?z\b.*$/i, "")
    .replace(/\s*\b\d+g\/\d+\b.*$/i, "")
    .replace(/\s*[,-]?\s*(aluminum can|resealable bag|bag in box|snack size|family size|value size|multipack|variety pack|gift set|can|bottle|jar|pouch|bag|box|carton|tub|cup)s?\s*$/i, "")
    .replace(/\s+\d+([\/.]\d+)?\s*$/, "") // trailing bare number ("... Yogurt 4")
    .replace(/[,\-–\s.]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return s;
}

function servingGrams(f) {
  const u = (f.servingSizeUnit || "").toLowerCase();
  const n = Number(f.servingSize);
  if (!n || !isFinite(n)) return null;
  if (u === "g" || u === "grm" || u === "gram" || u === "grams") return n;
  if (u === "ml" || u === "mlt") return n; // treat 1 ml ~ 1 g for drinks/sauces
  if (u === "oz") return n * 28.35;
  return null;
}

function servingLabel(f, grams) {
  let h = (f.householdServingFullText || "").trim();
  // strip every trailing "(...)" group
  while (/\([^()]*\)\s*$/.test(h)) h = h.replace(/\s*\([^()]*\)\s*$/, "").trim();
  const junk = /^(none|n\/?a|-|amount per serving|per serving|serving|about|1 serving|serving size)$/i;
  if (h && h.length <= 32 && !junk.test(h)) return h;
  return grams ? `${Math.round(grams)} g` : "1 serving";
}

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

async function run() {
  const seen = new Set();
  const out = [];
  let qi = 0;
  for (const [term, category] of QUERIES) {
    qi++;
    process.stdout.write(`\r  ${qi}/${QUERIES.length}  ${term.padEnd(28)}`);
    let j;
    try {
      j = await cachedFetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${KEY}&query=${encodeURIComponent(
          term
        )}&dataType=Branded&pageSize=${PER_QUERY}`
      );
    } catch (e) {
      console.log(`\n  ! ${term}: ${e}`);
      continue;
    }
    let kept = 0;
    for (const f of j.foods || []) {
      if (kept >= KEEP_PER_QUERY) break;
      const carb100 = nutr(f.foodNutrients, "205");
      if (carb100 == null || carb100 < 0 || carb100 > 105) continue;

      const rawBrandSrc = f.brandName || f.brandOwner || "";
      if (STORE_BRAND.test(rawBrandSrc) || STORE_BRAND.test(f.description || "")) continue;

      const brand = cleanBrand(f.brandName || f.brandOwner);
      const desc = cleanDesc(f.description || "");
      if (!desc || desc.length < 3 || desc.length > 58) continue;

      // "Brand Description", but not if the description already contains the brand
      let name = desc;
      const bWord = norm(brand).split(" ")[0];
      if (brand && bWord && bWord.length >= 3 && !norm(desc).includes(bWord)) name = `${brand} ${desc}`;
      name = name.replace(/\s+/g, " ").trim();
      if (name.length > 58) continue;

      // aggressive dedup: same brand + same carb density + same product gist is
      // the same thing for a carb counter, even if the label text differs
      // ("Goldfish Cheddar Crackers" vs "Goldfish Crackers Cheddar" vs ...)
      const grams = servingGrams(f);
      const gist = norm(name)
        .replace(
          /\b(crackers?|snacks?|cereal|original|cheese|flavou?red?|the|with|made|real|mini|bites|pieces?|count|family|size|value|multi|pack|natural|all|whole|grain|style|classic|new|now|now with|per serving)\b/g,
          " ",
        )
        .replace(/\s+/g, " ")
        .trim();
      const key = `${category}|${Math.round(carb100)}|${gist}`;
      if (seen.has(key) || seen.has(norm(name))) continue;
      seen.add(key);
      seen.add(norm(name));

      const fiber100 = nutr(f.foodNutrients, "291");
      const item = {
        id: `br-${f.fdcId}`,
        name,
        cat: category,
        c: Math.round((carb100 / 100) * 1000) / 1000,
      };
      if (fiber100 != null && fiber100 >= 0 && fiber100 <= carb100) {
        item.n = Math.round((Math.max(0, carb100 - fiber100) / 100) * 1000) / 1000;
        item.fi = Math.round((fiber100 / 100) * 1000) / 1000;
      }
      if (grams && grams >= 3 && grams <= 1200) {
        item.s = servingLabel(f, grams);
        item.sg = Math.round(grams);
      }
      if (f.gtinUpc) item.upc = String(f.gtinUpc).replace(/^0+(?=\d{8,})/, "");
      out.push(item);
      kept++;
    }
  }
  process.stdout.write("\r" + " ".repeat(50) + "\r");

  // cap near-identical variants: at most 4 rows per "brand + first product word"
  const STEM_CAP = 4;
  const stemCount = new Map();
  const deduped = [];
  for (const it of out) {
    const w = norm(it.name).split(" ").filter(Boolean).slice(0, 3).join(" ");
    const n = (stemCount.get(w) || 0) + 1;
    stemCount.set(w, n);
    if (n <= STEM_CAP) deduped.push(it);
  }

  deduped.sort((a, b) => a.name.localeCompare(b.name));
  const final = deduped.slice(0, TOTAL_CAP);
  writeFileSync(join(ROOT, "app/public/branded.json"), JSON.stringify(final));
  const size = (JSON.stringify(final).length / 1024).toFixed(0);
  console.log(`Wrote ${final.length} branded foods (${size} KB) -> app/public/branded.json`);
  const cats = final.reduce((m, x) => ((m[x.cat] = (m[x.cat] || 0) + 1), m), {});
  console.log(cats);
  console.log(`with serving: ${final.filter((x) => x.s).length}  ·  with net: ${final.filter((x) => x.n != null).length}  ·  with upc: ${final.filter((x) => x.upc).length}`);
}

run();
