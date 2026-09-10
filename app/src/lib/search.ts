import type { CustomFood, Food, RestaurantItem, SearchHit } from "../types";
import foodsData from "../data/foods.json";
import restaurantsData from "../data/restaurants.json";
import type { Restaurant } from "../types";

export const FOODS = foodsData as Food[];
export const RESTAURANTS = restaurantsData as Restaurant[];

const ALL_RESTAURANT_ITEMS: RestaurantItem[] = RESTAURANTS.flatMap((r) => r.items);

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function scoreName(haystack: string, needle: string): number {
  const h = norm(haystack);
  if (h === needle) return 100;
  if (h.startsWith(needle)) return 80;
  // all words present
  const words = needle.split(" ");
  if (words.every((w) => h.includes(w))) return h.includes(needle) ? 60 : 40;
  return 0;
}

export interface GroupedResults {
  custom: SearchHit[];
  restaurant: SearchHit[];
  food: SearchHit[];
}

export function searchAll(query: string, customFoods: CustomFood[]): GroupedResults {
  const q = norm(query);
  if (q.length < 1) return { custom: [], restaurant: [], food: [] };

  const custom: { hit: SearchHit; s: number }[] = [];
  for (const c of customFoods) {
    const s = scoreName(c.name, q);
    if (s > 0) custom.push({ hit: { kind: "custom", food: c }, s });
  }

  const restaurant: { hit: SearchHit; s: number }[] = [];
  for (const r of RESTAURANTS) {
    const brandMatch = scoreName(r.name, q);
    for (const item of r.items) {
      const nameMatch = scoreName(item.name, q);
      const s = Math.max(nameMatch, brandMatch ? brandMatch - 5 : 0);
      if (s > 0) restaurant.push({ hit: { kind: "restaurant", item }, s });
    }
  }

  const food: { hit: SearchHit; s: number }[] = [];
  for (const f of FOODS) {
    let s = scoreName(f.name, q);
    if (!s && f.aliases) for (const a of f.aliases) s = Math.max(s, scoreName(a, q));
    if (!s && scoreName(f.category, q) >= 60) s = 20;
    if (s > 0) food.push({ hit: { kind: "food", food: f }, s });
  }

  const sort = (arr: { hit: SearchHit; s: number }[]) =>
    arr.sort((a, b) => b.s - a.s || 0).map((x) => x.hit);

  return {
    custom: sort(custom).slice(0, 8),
    restaurant: sort(restaurant).slice(0, 20),
    food: sort(food).slice(0, 30),
  };
}

export function findFood(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id);
}
export function findRestaurantItem(id: string): RestaurantItem | undefined {
  return ALL_RESTAURANT_ITEMS.find((i) => i.id === id);
}
export function restaurantBySlug(slug: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.slug === slug);
}

export const CATEGORIES = ["Fruit", "Vegetable", "Grain", "Beans", "Nuts", "Dairy", "Protein", "Snack", "Other"] as const;

export function foodsByCategory(cat: string | "All"): Food[] {
  const list = cat === "All" ? FOODS : FOODS.filter((f) => f.category === cat);
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
}
