import type { CustomFood, Food } from "../types";
import { ensureBranded, findBrandedByUpc } from "./branded";
import { getCustomFoods } from "./store";

const digits = (s: string) => (s || "").replace(/\D/g, "");
const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return typeof n === "number" && isFinite(n) ? n : null;
};

/** Same normalization findBrandedByUpc uses: strip everything but digits,
 *  strip leading zeros, then compare (equal or as a suffix, since a GTIN-14
 *  and a UPC-12 differ only by leading digits). */
function upcMatches(stored: string | undefined, scanned: string): boolean {
  const u = (stored || "").replace(/\D/g, "").replace(/^0+/, "");
  if (!u) return false;
  return u === scanned || u.endsWith(scanned) || scanned.endsWith(u);
}

export type BarcodeResult =
  | { kind: "food"; food: Food; via: "bundled" | "openfoodfacts" }
  | { kind: "custom"; food: CustomFood; via: "custom" };

/**
 * Resolve a scanned barcode.
 *  1. foods the user has already saved from a previous scan (offline, instant)
 *  2. the bundled USDA branded set (offline, instant)
 *  3. Open Food Facts (community database; needs a connection)
 * Returns null if the code is in none of them - the caller's job is then to
 * offer adding it, and to save the code on the result so this list grows.
 */
export async function lookupBarcode(code: string): Promise<BarcodeResult | null> {
  const c = digits(code);
  if (c.length < 6) return null;

  const custom = getCustomFoods().find((f) => upcMatches(f.gtinUpc, c));
  if (custom) return { kind: "custom", food: custom, via: "custom" };

  await ensureBranded();
  const bundled = findBrandedByUpc(c);
  if (bundled) return { kind: "food", food: bundled, via: "bundled" };

  try {
    const url =
      `https://world.openfoodfacts.org/api/v2/product/${c}.json` +
      `?fields=product_name,brands,nutriments,serving_size,serving_quantity`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (r.ok) {
      const j = await r.json();
      if (j.status === 1 && j.product) {
        const f = offToFood(c, j.product);
        if (f) return { kind: "food", food: f, via: "openfoodfacts" };
      }
    }
  } catch {
    /* offline or blocked: fall through to "not found" */
  }
  return null;
}

function offToFood(code: string, p: any): Food | null {
  const carb100 = num(p.nutriments?.carbohydrates_100g);
  if (carb100 == null || carb100 < 0 || carb100 > 105) return null;
  const fiber100 = num(p.nutriments?.fiber_100g);

  const brand = String(p.brands || "").split(",")[0]?.trim();
  const desc = String(p.product_name || "").trim();
  const dn = desc.toLowerCase();
  const bw = brand?.toLowerCase().split(/\s+/)[0] || "";
  let name = brand && bw && !dn.includes(bw) ? `${brand} ${desc}` : desc || brand;
  name = (name || "Scanned product").replace(/\s+/g, " ").trim();
  if (name.length > 70) name = name.slice(0, 68) + "…";

  const sg = num(p.serving_quantity);
  const sLabel = String(p.serving_size || "").trim();

  const food: Food = {
    id: `off-${code}`,
    name,
    category: "Other",
    carbFactorTotal: Math.round((carb100 / 100) * 1000) / 1000,
    source: {
      type: "manufacturer-label",
      gtinUpc: code,
      note: "From Open Food Facts, a community-maintained database. The value can be wrong or out of date, so check it against the package before you dose.",
    },
    confidence: "low",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  if (fiber100 != null && fiber100 >= 0 && fiber100 <= carb100) {
    food.fiberFactor = Math.round((fiber100 / 100) * 1000) / 1000;
    food.carbFactorNet = Math.round((Math.max(0, carb100 - fiber100) / 100) * 1000) / 1000;
  }
  if (sg && sg >= 3 && sg <= 1500) {
    food.serving = {
      label: sLabel && sLabel.length <= 24 ? sLabel.replace(/\s*\([^)]*\)\s*$/, "").trim() || `${Math.round(sg)} g` : `${Math.round(sg)} g`,
      grams: Math.round(sg),
    };
  }
  return food;
}
