# Restaurant nutrition sources

Rebuilt 2026-09-09 from the chain list in the original brief (the old `links.txt`
was lost). `pipeline/links.txt` is the machine-readable version.

## 2026-09-09 — national chains now pulled from Nutritionix

The 18 national chains in `restaurants.json` are no longer compiled from memory.
`pipeline/nx_extract.mjs` fetches each chain's official "Interactive Nutrition
Menu" grid on `nutritionix.com/<brand>/menu/premium`, parses the server-rendered
`#inmGrid` table, and writes the full menu to `pipeline/nutritionix-raw/<slug>.json`
(200 to 3600 items per chain, with the chain's own "Last Updated" date). Then
`pipeline/build_restaurants.mjs` curates each raw file down to ~30 to 60 common
items and writes `app/src/data/restaurants.json` at `confidence: "medium"`.

Gotchas found:
- **Column order is not stable between chains.** Some grids add a "Calories from
  Fat" column, so total carbohydrate is `inmGrid_c7` for about half the chains and
  `inmGrid_c8` for the other half. `nx_extract.mjs` reads the `<thead>` labels to
  find the right column; do not hard-code an index.
- **Nutritionix has no serving weight for most chains** (`valueServingWeightGrams: 0`,
  `valueServingSizeUnit: 'Serving'`). The item name carries the size instead
  ("World Famous Fries, Large"), so `restaurants.json` uses a keyword-derived
  serving label ("1 sandwich", "1 slice", "1 drink") and the carb value for the
  item as listed.
- **Pizza basis differs.** Domino's and Papa John's list carbs per slice already.
  Little Caesars lists the whole pizza (and the whole bread order), so
  `build_restaurants.mjs` divides those by 8.
- Ted's Hot Dogs has a Nutritionix page but it returns "No Results Found", so
  Ted's stays on hand estimates (`confidence: "low"`).

Re-run: `node pipeline/nx_extract.mjs && node pipeline/build_restaurants.mjs`.

## What changed since the old list

Most US fast-food chains have **dropped downloadable PDFs** in favour of
interactive nutrition calculators (McDonald's, Burger King, Wendy's US, Taco Bell,
Chipotle, Chick-fil-A, Dunkin', Del Taco, Carl's Jr / Hardee's). A PDF text
extractor will not work for those. They need either:

- a small per-site adapter that reads the calculator's JSON API, or
- manual entry of the common items (what `restaurants.json` does now).

PDFs still exist for the pizza chains, the sit-down chains, and a handful of
others. Those are where the extractor earns its keep.

## By access type

| Type | Meaning | Chains |
|---|---|---|
| **pdf** | Downloadable nutrition guide, table-formatted. Extractor-friendly. | Five Guys `[v]`, Sonic, Whataburger, White Castle, Shake Shack, Zaxby's, Bojangles, El Pollo Loco, Wingstop, Buffalo Wild Wings, Domino's `[v]`, Papa John's, Little Caesars, Subway `[v]`, Firehouse Subs, McAlister's, Panera `[v]`, Tim Hortons, Peet's, Einstein Bros, Jamba, Smoothie King, Olive Garden `[v]`, Outback, Denny's, Fazoli's |
| **calc** | Interactive calculator, no PDF. Needs a site adapter. | McDonald's, Burger King, Wendy's (US), Taco Bell, Chipotle `[v]`, Del Taco, Carl's Jr, Hardee's, Chick-fil-A, Jason's Deli, Noodles & Company |
| **page** | Static HTML nutrition tables or per-item pages. | Starbucks, Dunkin', Popeyes, Pollo Tropical, Jimmy John's, Marco's, Caribou, Tropical Smoothie, Perkins, Quiznos |
| **ltd** | Chain publishes only partial nutrition. | The Cheesecake Factory, Yard House, Golden Corral, Raising Cane's (small menu, easy to hand-enter), The Halal Guys |

`[v]` = URL confirmed by search on 2026-09-09. The rest are the known official
location; confirm when the extractor runs.

## Verified direct PDFs

- Five Guys: `fiveguys.com/wp-content/uploads/2026/08/Five-Guys-US-Nutrition-Allergen-Guide-English-June-2026.pdf` (June 2026)
- Panera: `panerabread.com/content/dam/panerabread/documents/c6-26-nutrition-guide.pdf` (edition rotates, e.g. `c4-26`, `c6-26`; check the allergen-and-nutrition page for the current link)
- Olive Garden: `media.olivegarden.com/en_us/pdf/olive_garden_nutrition.pdf`
- Domino's: `cache.dominos.com/olo/<build>/assets/build/market/US/_en/pdf/DominosNutritionGuide.pdf` (the `<build>` segment increments; `dominos.com` nutrition page links the current one)
- Subway: linked from `subway.com/en-us/menunutrition/nutrition` as `media.subway.com/dam/.../us-nutrition-en.pdf`
- Arby's: linked from `arbys.com/nutrition/`, hosted on Contentful (`assets.ctfassets.net/o19mhvm9a2cm/...Arbys_Nutritional_and_Allergen_<MONTH>_<YEAR>.pdf`)

## Priority order for building the real data

1. Highest traffic, calculator-only (need adapters or manual): McDonald's, Chick-fil-A, Taco Bell, Wendy's, Burger King, Chipotle, Dunkin', Starbucks. `restaurants.json` covers common items for these now.
2. Pizza (PDFs, table-formatted, high demand): Domino's, Papa John's, Little Caesars.
3. Everything else via the PDF extractor once it exists.

## Western New York checks (2026-09-09)

The user asked about local Amherst places. What I actually found:

- **Anderson's Frozen Custard** — official nutrition center on their own site
  (`andersonscustard.com/nutrition-center`), one page per category. Used in
  `restaurants.json`.
- **Mighty Taco** — full official nutrition calculator hosted on **Nutritionix**
  (`nutritionix.com/mighty-taco/nutrition-calculator`, updated June 2026), the
  standard FDA menu-labeling platform. Not on mightytaco.com itself. I pulled the
  standard build for ~30 items from it; those are now `confidence: medium`.
- **Ted's Hot Dogs** — allergen list PDF on their own site
  (`tedshotdogs.com/uploads/.../allergens-NY_110123.pdf`). Nutritionix has a
  `teds-hot-dogs` page but it returns "No Results Found" (checked again 2026-09-09
  via the grid endpoint, still empty). App uses component estimates, `low`.
- **Duff's Famous Wings** — per-location menu PDFs only, no nutrition table.
  Nutritionix has a few sauce entries. Wings are near-zero carb anyway. Estimates.

Takeaway: "on their own website" is often No for mid-size chains, but "published
somewhere official" (usually Nutritionix) is often Yes. Check Nutritionix before
assuming a chain has nothing.

## The Starbucks Ireland PDFs from the brief

`starbucks.ie` publishes gram carb values and can be useful, but treat items as
not-necessarily-on-the-US-menu and mark the restaurant note accordingly. The US
`starbucks.com/menu` per-item pages are the primary source.
