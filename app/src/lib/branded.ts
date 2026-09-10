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
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

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
      void load();
      return () => listeners.delete(cb);
    },
    () => BRANDED,
    () => BRANDED,
  );
}

export function findBranded(id: string): Food | undefined {
  return BRANDED.find((f) => f.id === id);
}
