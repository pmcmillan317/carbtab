import { useSyncExternalStore } from "react";
import type { Food } from "../types";

/**
 * ~2,800 common US packaged foods from USDA FoodData Central's Branded dataset.
 * Shipped as a static asset (public/branded.json), not bundled into the JS, so
 * it loads once on first search and is then cached by the service worker for
 * offline use. The file uses short keys to stay small; we expand to Food here.
 */

type Row = {
  id: string;
  name: string;
  cat: Food["category"];
  c: number; // carb factor (per gram)
  n?: number; // net carb factor
  fi?: number; // fiber factor
  s?: string; // serving label
  sg?: number; // serving grams
  upc?: string;
};

let BRANDED: Food[] = [];
let status: "idle" | "loading" | "ready" | "error" = "idle";
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Force the one-time load and wait for it (used by the barcode lookup). */
export function ensureBranded(): Promise<void> {
  if (!loadPromise) loadPromise = load();
  return loadPromise;
}

async function load() {
  if (status === "loading" || status === "ready") return;
  status = "loading";
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}branded.json`, { cache: "force-cache" });
    if (!res.ok) throw new Error(String(res.status));
    const rows = (await res.json()) as Row[];
    BRANDED = rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.cat,
      carbFactorTotal: r.c,
      carbFactorNet: r.n,
      fiberFactor: r.fi,
      serving: r.sg ? { label: r.s || `${r.sg} g`, grams: r.sg } : undefined,
      source: {
        type: "manufacturer-label",
        gtinUpc: r.upc,
        note: "USDA FoodData Central branded-food data (from the product label). Recipes and pack sizes change — check the package you have.",
      },
      confidence: "medium",
      updatedAt: "2026-09-10",
    }));
    status = "ready";
  } catch {
    status = "error";
  }
  emit();
}

/** Subscribe to the branded list; kicks off the one-time load on first use. */
export function useBranded(): Food[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      void ensureBranded();
      return () => listeners.delete(cb);
    },
    () => BRANDED,
    () => BRANDED,
  );
}

export function findBranded(id: string): Food | undefined {
  return BRANDED.find((f) => f.id === id);
}

/** Match a scanned barcode against the bundled set. UPCs are stored with leading
 *  zeros stripped; a scanned EAN-13 / UPC-A is compared the same way, and as a
 *  suffix (GTIN-14 vs UPC-12 differ only by leading digits). */
export function findBrandedByUpc(scanned: string): Food | undefined {
  const n = scanned.replace(/\D/g, "").replace(/^0+/, "");
  if (!n) return undefined;
  return BRANDED.find((f) => {
    const u = (f.source.gtinUpc || "").replace(/\D/g, "").replace(/^0+/, "");
    if (!u) return false;
    return u === n || u.endsWith(n) || n.endsWith(u);
  });
}

/** true once the fetch has finished (whether it found data or not) */
export function brandedLoaded() {
  return status === "ready" || status === "error";
}
