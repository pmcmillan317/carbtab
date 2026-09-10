// ============================================================
// CarbTab data model
// Carbohydrate is always in grams. A "factor" is grams of carb per gram of food.
// ============================================================

export type FoodCategory =
  | "Fruit"
  | "Vegetable"
  | "Grain"
  | "Beans"
  | "Nuts"
  | "Dairy"
  | "Protein"
  | "Snack"
  | "Other";

export type SourceType = "USDA" | "official-restaurant" | "manufacturer-label" | "user-estimate";

export interface Source {
  type: SourceType;
  url?: string;
  fdcId?: number;
  gtinUpc?: string; // barcode, on branded/label items
  note?: string;
  retrievedAt?: string; // ISO date
}

export type Confidence = "high" | "medium" | "low";

/** Whole / generic food. Carbs = factor x weight in grams. */
export interface Food {
  id: string;
  name: string;
  aliases?: string[];
  category: FoodCategory;
  carbFactorTotal: number; // g total carbohydrate per g of food
  carbFactorNet?: number; // g net carb per g (= total - fiber); present when fiber known
  fiberFactor?: number; // g fiber per g
  serving?: { label: string; grams: number };
  source: Source;
  confidence: Confidence;
  updatedAt: string;
}

/** Restaurant / branded item. Fixed carbs per named serving. */
export interface RestaurantItem {
  id: string;
  restaurant: string;
  restaurantSlug: string;
  category?: string;
  name: string; // serving folded in: "Medium Fries", "6 pc Nuggets"
  menuNumber?: number;
  serving: string; // "1 serving (117 g)", "16 fl oz"
  carbsTotal: number; // grams
  fiber?: number;
  carbsNet?: number;
  isBundle?: boolean;
  components?: { name: string; carbs: number }[];
  source: Source;
  confidence: Confidence;
  updatedAt: string;
}

export interface Restaurant {
  slug: string;
  name: string;
  menuCategories?: string[];
  source: Source;
  note?: string;
  items: RestaurantItem[];
}

export interface CustomFood {
  id: string;
  name: string;
  carbFactorTotal: number;
  carbFactorNet?: number;
  serving?: { label: string; grams: number };
  createdAt: string;
}

export type CarbBasis = "total" | "net";

export interface LogEntry {
  id: string;
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD (local)
  kind: "food" | "restaurant" | "custom" | "quick";
  refId?: string;
  name: string;
  detail: string; // "150 g", "McDonald's · 1 serving (117 g)"
  grams?: number;
  carbs: number; // the number that matters, whole grams
  basis: CarbBasis;
  source: Source;
}

export interface Settings {
  basis: CarbBasis;
  /** Optional daily carbohydrate target, e.g. one given by a care team for gestational diabetes. Off by default. */
  dailyTarget?: number;
  theme: "system" | "light" | "dark";
  /** Which entry mode the weigh sheet opens on for foods that have a serving. Remembered per device. */
  portionEntry: "grams" | "serving";
  disclaimerAcceptedAt?: string;
}

/** A unified search hit, either kind. */
export type SearchHit =
  | { kind: "food"; food: Food }
  | { kind: "custom"; food: CustomFood }
  | { kind: "restaurant"; item: RestaurantItem };
