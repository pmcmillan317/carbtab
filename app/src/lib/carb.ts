import type { CarbBasis, CustomFood, Food, RestaurantItem } from "../types";

/** Whole grams. Carb counting rounds to the gram; sub-gram precision is false confidence. */
export function roundCarb(g: number): number {
  return Math.round(g);
}

export function factorFor(food: Food | CustomFood, basis: CarbBasis): number {
  if (basis === "net" && food.carbFactorNet != null) return food.carbFactorNet;
  return food.carbFactorTotal;
}

/** carbs = factor x grams */
export function carbsFromWeight(food: Food | CustomFood, grams: number, basis: CarbBasis): number {
  const f = factorFor(food, basis);
  return roundCarb(f * Math.max(0, grams));
}

/** inverse: how many grams of this food is a given carb budget */
export function weightFromCarbs(food: Food | CustomFood, carbs: number, basis: CarbBasis): number {
  const f = factorFor(food, basis);
  if (f <= 0) return 0;
  return Math.round(Math.max(0, carbs) / f);
}

export function restaurantCarbs(item: RestaurantItem, basis: CarbBasis): number {
  if (basis === "net" && item.carbsNet != null) return roundCarb(item.carbsNet);
  return roundCarb(item.carbsTotal);
}

/** "23 g per 100 g" style density label for a food row */
export function densityLabel(food: Food | CustomFood, basis: CarbBasis): string {
  const per100 = Math.round(factorFor(food, basis) * 100);
  return `${per100} g per 100 g`;
}

/** carbs for one listed serving of a food (for the row's right-hand figure) */
export function servingCarbs(food: Food, basis: CarbBasis): { carbs: number; label: string } | null {
  if (!food.serving?.grams) return null;
  return {
    carbs: carbsFromWeight(food, food.serving.grams, basis),
    label: food.serving.label,
  };
}

export function localDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function friendlyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = localDate();
  const yest = localDate(new Date(Date.now() - 86400000));
  if (iso === today) return "Today";
  if (iso === yest) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
