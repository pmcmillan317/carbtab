# CarbTab — Build Spec

Status: draft, written 2026-09-09. Core decisions are locked (see [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) "Decided"); remaining **[Q]** markers are non-blocking scope questions.

**Locked:** name is CarbTab; local-first, no accounts, free; **mobile-first, desktop is secondary**; default carb basis is Total (Net is a toggle); USDA stays the source for generic foods; restaurant data is fresh-extracted from official company nutrition only, no FatSecret.

This document is the master brief for rebuilding the app from the ground up. It is written so a developer, or an AI app builder, could execute against it. The previous app (branded "GramWise", live at `carbpal-558991672813.us-west2.run.app`, source now at `../gramwise-carbpal-OLD/`) is reference only and not part of this project.

---

## 1. What CarbTab is

CarbTab is a progressive web app that answers one question fast: **how many grams of carbohydrate is this food?** A person searches for a food or a restaurant, picks the item, gives a weight or a serving, and gets a carb number large enough to read at a glance. Items can be added to a running daily total. The app is deliberately narrow: carbohydrates in grams, nothing else.

It is an information and logging tool, not a medical device. It does not calculate insulin doses.

### The core loop (must never take more than a few taps)

```
open app  ->  "what are you eating?"  ->  pick food  ->  enter grams  ->  read carbs  ->  add to today
```

Three sources feed the same search box:

| Source | Shape | Example |
|---|---|---|
| Whole / generic foods | carb factor (g carb per g food) x weight | `White rice, cooked` -> 0.282 -> 158 g -> 45 g |
| Restaurant / branded items | fixed carbs per named serving | `McDonald's Medium Fries` -> 44 g |
| Custom foods | user-entered factor or label | `Mom's granola` -> 0.55 |

---

## 2. Who it is for

People who count carbohydrate closely, primarily to inform insulin dosing:

- Adults with type 1 diabetes.
- Parents and carers counting for a child with type 1 (the current app's disclaimer references pediatric endocrinology; keep that audience in view).
- People on intensive insulin therapy for type 2, and anyone on a carb-controlled plan.

What that means for the design:

- **They check it under pressure.** Before a meal, often in a hurry, sometimes while treating or recovering from a low blood sugar, which impairs vision, concentration and fine motor control. The screen must work when the user is not at their best: big type, big targets, minimal reading, one clear primary action.
- **They weigh food.** Grams from a kitchen scale is the accurate path and the default. Portion estimates ("1 medium", "1 cup") are the fallback when out.
- **They need to trust the number.** Show where each value came from (official restaurant data vs USDA-derived vs their own estimate) and let them verify it.
- **They use it many times a day, for years.** Speed and consistency beat novelty. No feature should slow the core loop.

---

## 3. Design principles

The number one problem with the current app: the home screen is small and dense on mobile (10–12 px text everywhere, five equal-weight tabs, a two-column grid, a full-screen disclaimer gate). The rebuild fixes that.

1. **The carb number is the largest thing on any screen it appears on.** Result in the weigh sheet is ~60 px. Daily total is ~44 px. Never smaller than the surrounding chrome.
2. **Minimum 16 px body text.** Labels 12 px with letter-spacing, never smaller. No 10 px text.
3. **Tap targets:** search field 56–58 px tall, food rows ~66 px, primary buttons 56 px, bottom-nav items 56 px. Nothing important below 44 px.
4. **One primary action per screen.** Home = the search field ("What are you eating?"). Everything else is secondary and visually quieter.
5. **One-handed and reachable.** Primary actions sit in the lower two-thirds. The weigh interaction is a bottom sheet, thumb-reachable.
6. **High contrast, both themes.** Full light and dark palettes at the token level. Dark mode is not optional; people check phones at 3 a.m.
7. **Calm, not clinical.** Keep the established green identity (`#84C318` family). Reserve red for destructive actions only; use amber for "over goal". A low blood sugar is stressful enough.
8. **The disclaimer is shown once, clearly, then gets out of the way.** First launch: a real modal the user acknowledges. After that: a persistent one-line "Estimates for information only — not medical advice" in the footer, and re-surface the full text on major version changes. Do not gate every session.
9. **Provenance is visible, not buried.** Every food row and every result carries a small source tag: `USDA`, the restaurant name, or `Custom`.
10. **Works offline.** The curated database ships inside the app. Live APIs are enhancement, never a dependency — you might be in a restaurant basement with no signal.
11. **Honest copy.** "Add to today", then a toast that says what happened. No "carbon tracking", no "clinical macros", no "diagnostic verification". Say carbohydrate, weight, serving, source.

### Visual language (from the prototype)

- **Type:** Bricolage Grotesque for display and all numerals (confident, legible big, human not cold); IBM Plex Sans for UI text; IBM Plex Mono for the small provenance tags. Real fallback stacks on all three.
- **Colour:** green-biased off-white / near-black grounds (not pure white, not the AI-default cream); accessible green `#497F1B` for text and icons, bright `#7CB92C` for fills and progress; amber `#A86608` for over-goal; red only for delete.
- **Layout:** single column, max ~460 px, generous vertical rhythm. Card used sparingly — the "today" band and the result block are lifted; food rows are quiet.

Built and working in `../app/` (React 19 + Vite + TypeScript, plain-CSS tokens). The earlier standalone HTML mockup at `../design/carbtab-home-prototype.html` (from the "CarbWise" era) is superseded by it.

---

## 4. Screens

### 4.1 Home
- **Top bar:** wordmark + theme toggle. No "Suggest Feature" button in the header (move to Settings).
- **Today band:** eyebrow `TODAY` + date; big total `NN g carbs`; one line "NN g left before the NNN g goal" (or "NN g over the NNN g goal" in amber); thin progress bar.
- **The ask:** `What are you eating?` heading + one large search field ("Search a food, or a restaurant"). Live results as you type (debounced ~250 ms), grouped: Custom, then restaurant/branded matches, then whole foods. Each row: name, source tag, secondary metric (`23 g per 100 g` for foods, serving for restaurant items), and the carb figure for one serving on the right.
- **Three tiles under search, equal weight to each other but secondary to the field:** Scan label, Photo, Restaurants.
- **Quick add:** recent items (last used) plus a few staples, as full-width rows, one tap straight to the weigh sheet.

### 4.2 Weigh sheet (bottom sheet, the core interaction)
- Food name (display size) + source tag + category or serving.
- **Whole food:** large numeric weight field (68 px, numeric keypad), defaulting to one serving in grams; preset chips (`30 g`, `50 g`, `100 g`, `1 serving · NNg`); carbs recalculated live.
- **Restaurant item:** no weight field; the fixed serving is shown; carbs shown directly.
- **Result block:** `Carbs · total` label + huge number.
- Primary: **Add to today**. Secondary: Cancel.
- Carb basis (Total by default) is set in Settings, not per-item. The sheet shows which basis it is using.

### 4.3 Log (the running day)
- Day total vs goal, progress bar.
- List of today's entries: name, sub-line (`150 g · total carbs` or `McDonald's · 1 serving (117 g)`), carb figure, delete.
- Clear day.
- Each entry stores: food ref, display name, grams (if weighed), carbs, carb basis, source snapshot, timestamp, meal slot. **[Q]** keep meal slots (breakfast/lunch/dinner/snack) from the current app, or drop for simplicity?
- **[Q]** History beyond today — how far back, and does it need charts/export? The current app has a separate History page and CSV export.

### 4.4 Foods (browse + manage)
- Search across the whole bundled database.
- Category filter.
- Add a custom food: name + either "carbs per 100 g" or a carb factor, with a clear unit label (the current app's add-food box is mislabelled and stores values 100x off — do not repeat this).
- **[Q]** Recipes / meal builder (combine ingredients, save, divide by servings) — the current app has this in "My Foods". In or out for v1? The original briefs wanted a meal builder and restaurant combos/bundles.

### 4.5 Settings
- Count carbs as: **Total** / **Net (total − fiber)**. Default **[Q]**. Explain that a care team teaches one standard; the app stores both and always shows which is in use.
- Daily carb goal.
- Theme.
- Data: export / import (local backup). **[Q]** cloud accounts and sync — see §7.
- Send feedback.
- Full medical disclaimer text, always reachable here.

### 4.6 First run
- One modal: what CarbTab is, that it is not a medical device, that it does not calculate insulin, follow your care team's plan. Single "I understand" acknowledgement, stored.

---

## 5. Data model

```ts
// Whole / generic food — carbohydrate expressed as a factor
interface Food {
  id: string;
  name: string;               // simplified, recognisable: "White rice, cooked"
  aliases?: string[];         // search helpers: "white rice", "steamed rice"
  category: FoodCategory;      // Fruit | Vegetable | Grain | Beans | Nuts | Dairy | Protein | Snack | Other
  carbFactorTotal: number;    // g total carbohydrate per g of food
  carbFactorNet?: number;     // g net carb per g  (= total - fiber); present when fiber known
  fiberFactor?: number;       // g fiber per g
  prep?: "raw" | "cooked" | "prepared";
  serving?: { label: string; grams: number };  // "1 medium (118 g)"
  source: Source;
  confidence: "high" | "medium" | "low";
  updatedAt: string;          // ISO date
}

// Restaurant / branded item — fixed carbs per named serving
interface RestaurantItem {
  id: string;
  restaurant: string;
  restaurantSlug: string;
  category: string;           // from the chain's real menu structure where possible
  name: string;               // serving baked in: "Medium Fries", "6 pc Nuggets"
  menuNumber?: number;        // "#1", "#2" combos
  serving: string;            // "1 serving (117 g)", "16 fl oz"
  carbsTotal: number;         // g
  fiber?: number;
  carbsNet?: number;
  isBundle?: boolean;         // combo / meal / Happy Meal
  components?: { name: string; carbs: number }[];  // when a bundle is represented as parts
  source: Source;             // official 2025 nutrition doc
  updatedAt: string;
}

interface Restaurant {
  slug: string;
  name: string;
  menuCategories: string[];
  source: Source;
  notes?: string;             // e.g. "Starbucks IE PDF — some items differ from the US menu"
}

interface Source {
  type: "USDA" | "official-restaurant" | "manufacturer-label" | "user-estimate";
  url?: string;
  fdcId?: number;             // USDA FoodData Central id
  retrievedAt: string;        // ISO date
  note?: string;
}

interface CustomFood extends Pick<Food, "id" | "name" | "carbFactorTotal" | "carbFactorNet" | "serving"> {
  source: { type: "user-estimate"; note?: string; retrievedAt: string };
  createdAt: string;
}

interface MealEntry {
  id: string;
  timestamp: string;
  date: string;               // YYYY-MM-DD, local
  itemType: "food" | "restaurant" | "custom" | "photo" | "label";
  itemRef?: string;
  displayName: string;
  grams?: number;             // for weighed foods
  carbs: number;              // the number that matters, rounded to whole grams
  carbBasis: "total" | "net";
  sourceSnapshot: Source;     // frozen at log time so the value can be checked later
  mealSlot?: "breakfast" | "lunch" | "dinner" | "snack";   // [Q] keep?
}
```

### The net-carb standard (from the research briefs)

- **Net carb factor = (total carbohydrate − dietary fiber) ÷ grams of food.** Simple net carbs only. Do **not** back out sugar alcohols, allulose or resistant starch at the database level; handle those per-product only when a specific label warrants it, and flag such items.
- Every food carries **both** factors where fiber is known. The UI always shows which basis is in use.
- The seed curated dataset (`pipeline/legacy-carbpal/server/data/foods.json`, 151 items) and the App Inventor CSV both express **total-carb density**, not net. Treat existing values as total-carb starting points, not net, and expect several to read high against a net standard (white bread 0.49 total vs ~0.42 net).

### Sourcing hierarchy (applied when building the database, not at runtime)

1. **Manufacturer label** for a specific branded product.
2. **USDA FoodData Central** for generic whole and basic foods — the primary source for the generic database.
3. **Official restaurant nutrition** (2025 where available) for menu items.
4. **Cross-reference** multiple credible sources; assign confidence by agreement. Average only *comparable* generic sources — never average fundamentally different foods (Jif vs natural vs almond butter). When credible sources disagree substantially, flag rather than blend.

Do not label any value "insulin accurate". This is a research-based net-carb estimation database that feeds the user's own dosing math.

---

## 6. The restaurant data pipeline

Zero-dependency Node scripts in `/pipeline`, not part of the app runtime. Output is the bundled `restaurants.json`.

**Current pipeline (2026-09-09):** the plan below (per-chain PDF extraction) was
overtaken by the discovery that most US chains publish through **Nutritionix**,
the FDA menu-labeling platform, with a consistent server-rendered grid page.

```
nx_extract.mjs
  for each of the 18 national chains:
     - GET nutritionix.com/<brand>/menu/premium
     - parse #inmGrid: category rows (<tr class="subCategory">) + item rows
     - read <thead> to find the total-carb / fiber / calories columns
       (column order is NOT stable — some grids add "Calories from Fat")
     - write pipeline/nutritionix-raw/<slug>.json  (full menu, 200-3600 items,
       with the chain's own "Last Updated" date)

build_restaurants.mjs
  national chains: read each raw file, curate to ~30-60 common items
     - keepCats allowlist per chain; drop combos / catering / alcohol / kids sizes
     - collapse size + milk variants; divide Little Caesars pizzas & bread by 8
     - keyword-derived serving label ("1 sandwich", "1 slice", "1 drink")
     - confidence: "medium" (real source, not re-checked item by item)
  WNY chains: hand tables (Anderson's, Mighty Taco, Tim Hortons, Ted's, Duff's)
     |
  app/src/data/restaurants.json   (23 chains, ~880 items, bundled)
```

Re-run: `node pipeline/nx_extract.mjs && node pipeline/build_restaurants.mjs`.

**Still relevant from the original plan:** `pipeline/links.txt` +
`restaurant-sources.md` keep the annotated official-nutrition URL list (~55
chains, classified pdf/calc/page/ltd) for chains not yet in the app. A real PDF
extractor is still worth building for the pizza + sit-down chains that keep
downloadable guides. Starbucks IE PDFs: grams are usable but mark items that
differ from the US menu.

---

## 7. Technical architecture

### Built
- **React 19 + Vite 6 + TypeScript**, `wouter` for routing. Plain CSS with design tokens in `src/index.css` (no Tailwind; the design is tight and custom, tokens do the theming).
- **PWA**, installable, with an **actual service worker and offline-first caching** (the current app has a manifest but no service worker — offline is a hard requirement here). Use `vite-plugin-pwa`.
- **Bundled database**: ship curated `foods.json` + reviewed `restaurants.json` as static assets. The app is fully usable with zero network on first launch.
- Local storage for the day log, custom foods, settings — namespaced `carbtab:` and wrapped so a thrown storage accessor degrades gracefully.
- **Mobile-first layout.** One column, ~460 px max, thumb-reachable primary actions, bottom nav. Desktop just widens the column and can show the weigh panel beside the list instead of as a sheet; it is not a distinct design.

### Dropped (decided)
- **FatSecret integration** entirely. Replaced by the owned `restaurants.json`.
- **Accounts, login, password reset, sessions, PostgreSQL.** Local-first. Backup via export/import.
- **Stripe, premium tiers, access codes, "premium bypass".** CarbTab is free.
- **Email (Resend).** Feedback, if kept, is a single stateless endpoint or a mailto.
- The unused `Dashboard.tsx`, the barcode-scanner simulator, the "interactive tutorial highlight" engine.

### Result: no backend required for v1
A pure static PWA (Vite build) on any static host. The only things that would need a server are live USDA search (needs the API key hidden) and the optional photo estimate — both deferred or added later as a single serverless function.

### Repo shape (as built)

```
CarbTab/
  app/                 the PWA (React 19 + Vite 6 + TS)
    src/
      screens/         Home, LogScreen, Foods, SettingsScreen
      components/      TopBar, BottomNav, WeighSheet, FoodRow, TodayBand, Toast, Disclaimer, icons
      lib/             store (localStorage), carb math, search, storage guard, brand
      data/            foods.json (482), restaurants.json (seed)
      index.css        all styles + light/dark/system tokens
  pipeline/            convert_seed_foods.mjs, merge_legacy_foods.mjs, fiber_pass.mjs,
                       nx_extract.mjs, build_restaurants.mjs, gen_icons.mjs
    legacy-carbpal/    2 frozen data files from the old app that the food pipeline reads
    nutritionix-raw/   full menu pulls, one JSON per chain (pipeline artifact)
  design/              name-analysis.html, carbease-vs-carbtab.html, app-panel-review.html
  docs/                this spec, open questions, DEPLOY.md
```

The old "GramWise" / carbpal app is **no longer in this tree**; it was moved to
`../gramwise-carbpal-OLD/` so this folder holds only the current app.

Not built yet: any backend (no server needed for v1), the restaurant extraction pipeline, live USDA
search, the net-carb fiber pass, photo estimate.

---

## 8. Build order

1. **Shell + Home + Weigh sheet + Log**, bundled `foods.json` only, local storage, both themes, first-run disclaimer. This is the prototype made real. Ship and use it.
2. **Foods screen + custom foods** (correct units) + export/import.
3. **Restaurant data**: build the pipeline, run the first batch of official 2025 PDFs, review, bundle `restaurants.json`, wire the Restaurants tile and search group.
4. **Net-carb pass**: add fiber factors to the curated foods, populate `carbFactorNet`, wire the Total/Net setting end to end.
5. **Live USDA search** proxy as a search enhancement (offline results still show first).
6. **Photo estimate** (optional), **label scan** (optional).
7. Decide accounts / sync / monetisation only if there is a real need (§7, OPEN_QUESTIONS).

---

## 9. Non-negotiables checklist

- [ ] Core loop is at most: open -> type -> tap food -> type grams -> read -> add.
- [ ] Carb result is the biggest element on screen.
- [ ] No text below 12 px; body text >= 16 px.
- [ ] Tap targets >= 44 px; primary actions >= 56 px.
- [ ] Full light and dark palettes; both legible.
- [ ] Works with no network, first launch included.
- [ ] Every food and result shows its source.
- [ ] Disclaimer shown once, then a persistent one-liner; full text always in Settings.
- [ ] Never presents a value as an insulin dose or as "insulin accurate".
- [ ] Custom-food entry has an unambiguous unit and stores the correct magnitude.
- [ ] Carb basis (total / net) is shown wherever a carb number is shown.
