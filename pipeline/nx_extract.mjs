// nx_extract.mjs — pull official carb data from Nutritionix "Interactive Nutrition
// Menu" grid pages for the national chains and write one raw JSON file per chain
// to pipeline/nutritionix-raw/. Zero dependencies. Run: node pipeline/nx_extract.mjs
//
// Nutritionix is the FDA menu-labeling platform many chains publish through. The
// grid page (id="inmGrid") is fully server-rendered. Category rows are
// <tr class="subCategory"> with an <h3>; item rows carry one <td> per nutrient
// tagged headers="inmGrid_cN". The column order is NOT stable between chains
// (some add a "Calories from Fat" column, shifting everything right), so we read
// the <thead> to find which cN holds Total Carbohydrate / Dietary Fiber / Calories.

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "nutritionix-raw");
mkdirSync(OUT, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// slug = our id; nx = the Nutritionix path segment
const CHAINS = [
  { slug: "mcdonalds", name: "McDonald's", nx: "mcdonalds" },
  { slug: "burger-king", name: "Burger King", nx: "burger-king" },
  { slug: "wendys", name: "Wendy's", nx: "wendys" },
  { slug: "taco-bell", name: "Taco Bell", nx: "taco-bell" },
  { slug: "chick-fil-a", name: "Chick-fil-A", nx: "chick-fil-a" },
  { slug: "subway", name: "Subway", nx: "subway" },
  { slug: "starbucks", name: "Starbucks", nx: "starbucks" },
  { slug: "dunkin", name: "Dunkin'", nx: "dunkin" },
  { slug: "chipotle", name: "Chipotle", nx: "chipotle" },
  { slug: "popeyes", name: "Popeyes", nx: "popeyes" },
  { slug: "arbys", name: "Arby's", nx: "arbys" },
  { slug: "five-guys", name: "Five Guys", nx: "five-guys" },
  { slug: "raising-canes", name: "Raising Cane's", nx: "raising-canes" },
  { slug: "sonic", name: "Sonic Drive-In", nx: "sonic" },
  { slug: "dominos", name: "Domino's", nx: "dominos" },
  { slug: "papa-johns", name: "Papa Johns", nx: "papa-johns" },
  { slug: "little-caesars", name: "Little Caesars", nx: "little-caesars-pizza" },
  { slug: "panera", name: "Panera Bread", nx: "panera-bread" },
];

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "’")
    .replace(/&nbsp;/g, " ")
    .replace(/&(reg|trade|copy);/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/[®™©]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.)])/g, "$1")
    .trim();

function num(raw) {
  const txt = String(raw).replace(/<[^>]+>/g, "").replace(/[^\d.]/g, "");
  return txt === "" ? null : Number(txt);
}

function cellVal(rowHtml, colIdx) {
  if (colIdx == null) return null;
  const re = new RegExp(
    `<td[^>]*headers="inmGrid_c${colIdx}"[^>]*>([\\s\\S]*?)</td>`,
    "i"
  );
  const m = rowHtml.match(re);
  return m ? num(m[1]) : null;
}

// Read <thead> and map nutrient -> column index by the header label text.
function columnMap(html) {
  const ths = html.match(/<th[^>]*id="inmGrid_c(\d+)"[\s\S]*?<\/th>/gi) || [];
  const map = {};
  for (const th of ths) {
    const idx = Number(th.match(/inmGrid_c(\d+)/)[1]);
    const label = th.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
    if (/total carb/.test(label)) map.carb = idx;
    else if (/dietary fiber/.test(label)) map.fiber = idx;
    else if (/^\s*calories\b/.test(label) && !/from fat/.test(label)) map.cal ??= idx;
  }
  return map;
}

function parseGrid(html) {
  const cols = columnMap(html);
  if (cols.carb == null) return { items: null, cols };
  const bodyStart = html.indexOf("<tbody>");
  const bodyEnd = html.indexOf("</tbody>", bodyStart);
  if (bodyStart < 0 || bodyEnd < 0) return { items: null, cols };
  const body = html.slice(bodyStart, bodyEnd);
  const rows = body.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const items = [];
  let cat = "";
  for (const row of rows) {
    if (/class="[^"]*subCategory/.test(row)) {
      const h = row.match(/<h3>([\s\S]*?)<\/h3>/i);
      cat = h ? decode(h[1].replace(/<[^>]+>/g, "")) : "";
      continue;
    }
    const nameM = row.match(/<a[^>]*class="nmItem"[^>]*>([\s\S]*?)<\/a>/i);
    if (!nameM) continue;
    const name = decode(nameM[1].replace(/<[^>]+>/g, ""));
    const carb = cellVal(row, cols.carb);
    if (carb == null) continue;
    items.push({
      cat,
      name,
      carb: Math.round(carb),
      fiber: cellVal(row, cols.fiber),
      cal: cellVal(row, cols.cal),
    });
  }
  return { items, cols };
}

async function run() {
  const summary = [];
  for (const c of CHAINS) {
    const url = `https://www.nutritionix.com/${c.nx}/menu/premium`;
    process.stdout.write(`${c.name.padEnd(16)} `);
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      const html = await r.text();
      const { items, cols } = parseGrid(html);
      const dateM = html.match(/Last Updated:<\/strong>\s*([\d/]+)/);
      if (!items || !items.length) {
        console.log(`no items (status ${r.status}, carb col ${cols.carb})`);
        summary.push([c.slug, 0]);
        continue;
      }
      const out = {
        chain: c.name,
        slug: c.slug,
        source: url,
        platform: "nutritionix",
        updated: dateM ? dateM[1] : null,
        pulledAt: new Date().toISOString().slice(0, 10),
        type: "grid",
        columns: cols,
        count: items.length,
        items,
      };
      writeFileSync(join(OUT, `${c.slug}.json`), JSON.stringify(out, null, 1));
      console.log(
        `${String(items.length).padStart(4)} items  carbCol=c${cols.carb}  (updated ${out.updated || "?"})`
      );
      summary.push([c.slug, items.length]);
    } catch (e) {
      console.log(`ERROR ${e}`);
      summary.push([c.slug, -1]);
    }
    await new Promise((res) => setTimeout(res, 400));
  }
  console.log("\nDone. Files in", OUT);
  console.log(summary.map(([s, n]) => `  ${s}: ${n}`).join("\n"));
}

run();
