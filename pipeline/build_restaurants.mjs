/**
 * Build app/src/data/restaurants.json
 *
 *   node pipeline/build_restaurants.mjs
 *
 * National chains: curated from a fresh pull of each chain's official nutrition on
 * Nutritionix (the FDA menu-labeling platform), in pipeline/nutritionix-raw/*.json,
 * produced by pipeline/nx_extract.mjs. Carb values are the chain's own published
 * total carbohydrate for the item as listed; every item is confidence "medium"
 * (real source, but not re-checked item by item and menus drift).
 *
 * Western New York chains: hand tables, since their nutrition is either on their
 * own site (Anderson's), on a Nutritionix calculator that needs the standard
 * build computed (Mighty Taco), or not published in usable form (Ted's, Duff's).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(root, "pipeline", "nutritionix-raw");
const TODAY = "2026-09-09";

// ----------------------------------------------------------------------------
// National chains, curated from the Nutritionix pull
// ----------------------------------------------------------------------------

// keepCats = the menu sections worth carrying. Everything else (alcohol, catering,
// build-your-own topping breakdowns, kids meals, add-ins) is dropped.
const NX = [
  {
    slug: "mcdonalds",
    name: "McDonald's",
    keepCats: ["Breakfast", "Burgers", "Chicken & Fish Sandwiches", "McNuggets & McCrispy Strips", "Fries & Sides", "Sweets & Treats", "McCafe Coffees", "Beverages"],
  },
  {
    slug: "burger-king",
    name: "Burger King",
    keepCats: ["Breakfast", "Flame Grilled Burgers", "Chicken & Fish", "Sides", "Sweets", "Drinks & Coffee"],
  },
  {
    slug: "wendys",
    name: "Wendy's",
    keepCats: ["Hamburgers", "Chicken, Nuggets & More", "Fresh-Made Salads", "Fries & Sides", "Frosty", "Bakery", "Beverages", "Croissants, English Muffins & Biscuits", "Breakfast Classics", "Breakfast Burrito"],
  },
  {
    slug: "taco-bell",
    name: "Taco Bell",
    keepCats: ["Tacos", "Burritos", "Nachos", "Quesadillas", "Specialties", "Sides & Sweets", "Breakfast (Regional)", "Cantina Chicken Menu", "Fountain Beverages (20 oz)"],
  },
  {
    slug: "chick-fil-a",
    name: "Chick-fil-A",
    keepCats: ["Breakfast", "Entrees", "Salads", "Sides", "Treats", "Drinks"],
  },
  {
    slug: "subway",
    name: "Subway",
    keepCats: ['6" Sandwiches', "Subway Series Sandwiches", "Subway Series Wraps", "Subway Series Salads", "Breakfast", "Bread", "Cookies & Desserts", "Soup", "Sidekicks", "Sliders"],
    note: 'Subway Series subs are the 6-inch on the default bread. A footlong is roughly double. "Bread" rows are the 6-inch loaf on its own.',
  },
  {
    slug: "starbucks",
    name: "Starbucks",
    keepCats: ["Espresso Beverages", "Frappuccino Blended Beverages", "Tea Beverages", "Iced Coffee", "Cold Brew Coffee", "Starbucks Refreshers Beverages", "Hot Breakfast", "Oatmeal", "Bakery", "Lunch"],
    note: "Starbucks' calculator lists every size and milk. This is a sample of common drinks across sizes with the default recipe; check the calculator for an exact build.",
    capPerCat: 5,
  },
  {
    slug: "dunkin",
    name: "Dunkin'",
    keepCats: ["Bagels", "Donuts", "Munchkins", "Muffins", "Sandwiches", "Hash Browns", "Avocado Toast", "Hot Coffee", "Iced Coffee", "Iced Latte", "Frozen Coffee", "Coolatta", "Dunkin' Refreshers"],
    note: "A sample of common items. Drinks are the default milk and flavor at the size named; the full calculator has every combination.",
    capPerCat: 4,
  },
  {
    slug: "chipotle",
    name: "Chipotle",
    keepCats: ["Tortilla", "Meat or Tofu", "Fillings", "Toppings", "Extras"],
    note: "Build your own by adding the parts. Portions are the standard serving Chipotle lists for each.",
  },
  {
    slug: "popeyes",
    name: "Popeyes",
    keepCats: ["Signature Chicken", "Tenders", "Wings", "Seafood", "Sandwiches", "Signature Sides", "Breakfast", "Beverages", "Desserts"],
  },
  {
    slug: "arbys",
    name: "Arby's",
    keepCats: ["Slow Roasted Beef", "Burgers", "Chicken", "Arby's Classics", "Desserts", "Sides & Snacks", "Breakfast", "Beverages"],
  },
  {
    slug: "five-guys",
    name: "Five Guys",
    keepCats: ["Meat", "Bun", "Fries", "Milkshakes"],
    note: "Five Guys lists the burger as parts: a hamburger is one Bun (about 39 g) plus one Hamburger Patty (near 0 g), a cheeseburger adds about 1 g, toppings add little. Fries are a very large portion; \"Regular\" and \"Little\" are the two sizes.",
  },
  {
    slug: "raising-canes",
    name: "Raising Cane's",
    keepCats: ["Individual Items", "Drinks"],
    note: "Cane's has one very small menu. Log a combo as its parts (chicken fingers, fries, Texas toast, slaw, drink).",
  },
  {
    slug: "sonic",
    name: "Sonic Drive-In",
    keepCats: ["Burgers", "Chicken", "Sandwiches", "Hot Dogs", "Breakfast Items", "Snacks & Sides", "Sonic Blast", "Hand-Mixed Classic Shakes", "Signature Limeades", "Soft Drinks"],
    capPerCat: 4,
  },
  {
    slug: "dominos",
    name: "Domino's",
    keepCats: ["Specialty Pizzas", "Breads", "Chicken", "Loaded Tots", "Oven-Baked Sandwiches", "Penne Pasta", "Hoagies", "Desserts"],
    note: "Pizza is one slice, as Domino's counts it. A large is cut into more, thinner slices than a medium, so a large slice can read lower.",
    capPerCat: 8,
    dropRe: /\bXLarge\b/i,
  },
  {
    slug: "papa-johns",
    name: "Papa Johns",
    keepCats: ["Specialty Pizzas", "Papa Bowls", "Papadias", "Wings", "Sides", "Desserts"],
    note: "Pizza is one slice. Original Crust, Large unless the name says otherwise.",
    capPerCat: 10,
    dropRe: /Pizza for One|Gluten Free|Extra Large|, Small$|, Medium$/i,
  },
  {
    slug: "little-caesars",
    name: "Little Caesars",
    keepCats: ["Large Classic Pizzas", "Large Specialty Pizzas", "Large ExtraMostBestest Pizzas", "Detroit-Style Deep Dish Pizzas", "Detroit-Style Deep Dish Specialty Pizzas", "Thin Crust Pizzas", "Sides", "Caesar Wings"],
    note: "Little Caesars publishes carbs for the whole pizza and the whole bread order, so pizzas and bread here are divided by 8 for one slice, one deep-dish piece, or one bread stick. Thin crust is cut into squares; treat that as an estimate per square.",
    divide: 8,
    divideRe: /pizza|crazy bread|cheese bread/i,
    dropRe: /brownie|pull ?apart/i,
  },
  {
    slug: "panera",
    name: "Panera Bread",
    keepCats: ["Bagels & Spreads", "Breads", "Breakfast", "Pastries & Sweets", "Salads", "Sandwiches", "Sides", "Soups & Mac"],
    note: "Whole sandwiches and salads; soups are the cup. A You Pick Two is half of each. A bread bowl adds about 87 g on its own.",
    capPerCat: 7,
  },
];

// Item names that are never useful in a carb counter (combos, catering, bulk,
// kid boxes).
const DROP_NAME =
  /\b(meal|combo|box meal)\b|meal deal|\$\s?\d|biggie deal|happy meal|wacky pack|kids['’]? meal|kid's meal|catering|party (pack|platter)|family (size|pack|meal|bundle|feast)|\bdozen\b|\bbulk\b|half gallon|\bgallon\b|\bbox\b|,?\s*\d{2,}\s*(ct|count)\b/i;

// Size / quantity / customization variants to drop outright (a saner one stays).
const DROP_VARIANT =
  /\b(kids?|jr\.?|junior|mini|tasters?|snack size|party size|sonic size|route\s?44|rt\.?\s?44|wacky|child|short|group)\b|,\s*(extra small|x-?small|xl|x-?large|extra large)\b|\b(20|24|30|40|50)\s*(pc|piece|wings)\b|\band (no )?whip\b|\blight\b/i;

// "... with 2% Milk", "with Almond Milk", "with Cold Foam", "with Black" etc — a
// customization clause Nutritionix appends. Strip it (for grouping and display)
// so the variants collapse to the default drink.
const MILK_CLAUSE =
  /\s+with\s+(2%\s?milk|nonfat\s?milk|skim\s?milk|whole\s?milk|oat\s?milk|oatmilk|almond\s?milk|almondmilk|coconut\s?milk|soy\s?milk|black|cream|dunkin'?\s?cold\s?foam|sweet\s?cold\s?foam|cold\s?foam)\b/i;

const SIZE_RE =
  /(?:,?\s*\(?\b(extra small|x-?small|small|medium|regular|large|extra large|x-?large|tall|grande|venti|trenta|mini|kids?|jr\.?|junior|sm|md|lg)\b\)?)/i;
const SIZE_RANK = { small: 1, sm: 1, regular: 2, medium: 2, md: 2, tall: 1, grande: 2, venti: 3, large: 3, lg: 3 };

const SANDWICHY = /burger|whopper|sandwich|mcmuffin|mcgriddle|croissan['’]?wich|\bmelt\b|\bsub\b|\bwrap\b|papadia|hoagie|slider|baconator|dave'?s|\bb\.?m\.?t\.?\b|panini|toaster|roast beef|beef ?n ?cheddar|beef 'n cheddar|\breuben\b|\bgyro\b|brisket|french dip|\bbig fish\b|filet-o-fish|crispy chicken|grilled chicken|buffalo chicken|chicken bacon|cordon bleu|chicken parm|chicken club|\bblt\b|on ciabatta|on baguette|on focaccia|on sourdough|on croissant/i;
const SANDWICH_BISCUIT = /\bbiscuit\b/i;
const BISCUIT_FILLED = /(sausage|egg|bacon|chicken|gravy|\bham\b|steak)/i;
const DRINKY = /shake|frappuccino|frappe|\blatte\b|coffee|\bcola\b|\bcoke\b|sprite|pepsi|\btea\b|lemonade|limeade|smoothie|juice|\bmilk\b|refresher|coolatta|slush|dr pepper|fanta|americano|cappuccino|macchiato|\bmocha\b|cold brew|\bbrew\b|\bdew\b|hi-c|loganberry|hot chocolate|ocean water|recharger|iced capp|dunkaccino|beverage|fountain|soft drink|\bfloat\b|frosted (soda|lemonade|coffee)/i;
const FROZEN_TREAT = /frosty|\bblast\b|concrete|mcflurry|flurry|frozen (coffee|chocolate)|\bswirl\b|\bfusion\b/i;
const TREATY = /cone|\bpie\b|cookie|sundae|donut|doughnut|munchkin|muffin|\broll\b|brownie|\bcake\b|parfait|churro|twist|empanada|turnover|dessert|scone|danish|\bbar\b|loaf|pastry|croissant/i;

// hint from the menu section, used only when the name alone is inconclusive
const CAT_SANDWICH = /sandwich|burger|entree|classic|\bbeef\b|chicken|\bmelt|\bsub|hoagie|papadia|toaster|croissant|biscuit/i;
const CAT_DRINK = /drink|beverage|coffee|espresso|latte|frappuccino|refresher|shake|limeade|soda|tea|coolatta|smoothie/i;

function servingLabel(name, cat = "") {
  const s = name.toLowerCase();
  if (/mexican pizza/.test(s)) return "1 item";
  if (/\bsalad\b/.test(s)) return "1 salad";
  if (/\bpizza\b|, \d+ slice|\bslice\b/.test(s) && !/\bsub\b|papadia/.test(s)) return "1 slice";
  if (/\btaco\b/.test(s)) return "1 taco";
  if (/burrito|chalupa|crunchwrap|gordita/.test(s)) return "1 item";
  if (/quesadilla/.test(s)) return "1 quesadilla";
  if (/\bchicken (leg|thigh|breast|wing)\b|bone-in/.test(s)) return "1 piece";
  if (/nugget|nuggs|\btenders?\b|\bwings?\b(?!\s?stop)|\bstrips?\b|\bfingers?\b|chicken bites|popcorn chicken/.test(s)) return "1 order";
  if (/milkshake|\bshake\b/.test(s)) return "1 drink";
  if (/\bbagel\b/.test(s)) return "1 bagel";
  if (/burrito bowl|papa bowl|protein bowl|\bbowl\b/.test(s)) return "1 bowl";
  if (/\bsoup\b|\bchili\b|mac & cheese|mac and cheese/.test(s)) return "1 serving";
  if (/fries|tots|hash (brown|round)|onion ring|tater|\brings\b|pretzel|breadstick|crazy bread|\bknots\b|\bdipper\b|french toast/.test(s)) return "1 serving";
  if (/\bmuffin\b|donut|doughnut|\bcookie\b|\bscone\b|\bdanish\b|croissant|\bloaf\b|brownie|\bcake\b|cinnamon roll|coffee roll|\bpastry\b|munchkin|timbit|\bpie\b|\bchurro|empanada|turnover|fritter|clair\b|bismark|\bcruller\b|apple stick/.test(s)) return "1 piece";
  if (/sonic blast|\bblast\b|\bmcflurry\b|\bflurry\b|\bconcrete\b|\bsundae\b/.test(s)) return "1 serving";
  if (SANDWICH_BISCUIT.test(s)) return BISCUIT_FILLED.test(s) ? "1 sandwich" : "1 piece";
  if (/^\d+["”]\s|\bsub\b|footlong/.test(s) || SANDWICHY.test(s)) return "1 sandwich";
  if (FROZEN_TREAT.test(s)) return "1 serving";
  if (DRINKY.test(s)) return "1 drink";
  if (TREATY.test(s)) return "1 piece";
  if (CAT_SANDWICH.test(cat)) return "1 sandwich";
  if (CAT_DRINK.test(cat)) return "1 drink";
  return "1 serving";
}

// name with the size word and milk clause removed, for grouping variants together
function baseName(name) {
  return name
    .replace(MILK_CLAUSE, "")
    .replace(SIZE_RE, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s*,\s*,/g, ",")
    .replace(/\s*,\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function sizeOf(name) {
  const m = name.match(SIZE_RE);
  return m ? m[1].toLowerCase().replace(/[.\s]/g, "").replace("x-", "x") : null;
}

function curateNx(cfg) {
  const raw = JSON.parse(readFileSync(join(RAW, `${cfg.slug}.json`), "utf8"));
  const capPerCat = cfg.capPerCat ?? 7;
  const byCat = new Map();

  for (const rawItem of raw.items) {
    // some Nutritionix items are literally "Sides, Small Fruit Cup" — drop the
    // leading category echo so they dedupe with the plain name. Only for generic
    // section labels, never descriptive categories like "Breakfast Burrito".
    const genericCat = /^(sides?|sweets?|desserts?|drinks?|beverages?|treats?|entr[eé]es?|breakfast|snacks?|salads?)$/i.test(
      rawItem.cat
    );
    const name = genericCat
      ? rawItem.name.replace(
          new RegExp("^" + rawItem.cat.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ",\\s*", "i"),
          ""
        )
      : rawItem.name;
    const it = { ...rawItem, name };

    if (!cfg.keepCats.includes(it.cat)) continue;
    if (DROP_NAME.test(it.name)) continue;
    if (DROP_VARIANT.test(it.name)) continue;
    if (/pull ?apart/i.test(it.name)) continue; // shareable, misleading at "1 serving"
    if (cfg.dropRe && cfg.dropRe.test(it.name)) continue;
    const pcs = it.name.match(/(\d+)\s*(pc|pcs|piece|pieces|wings|count|ct)\b/i);
    if (pcs && Number(pcs[1]) > 12) continue;

    let carb = it.carb;
    if (cfg.divide && (!cfg.divideRe || cfg.divideRe.test(it.name))) {
      carb = Math.round(carb / cfg.divide);
    }

    // condiment / sauce noise: keep only if it carries real carbs
    if (carb < 12 && /\bsauce\b|dressing|\bdip\b|\bdipper\b|dipping|\badds\b|mayo|mustard|ketchup|packet|spread|seasoning|\bbutter\b|syrup|jelly|jam|au jus|gravy|vinaigrette|vinegar|aioli|glaze|cream cheese|\brelish\b|whipped cream/i.test(it.name)) continue;
    // black coffee / water / plain tea spam: keep only the obvious "is this zero" entries
    if (carb === 0 && DRINKY.test(it.name) && !/diet|zero sugar|unsweet|\bblack\b/i.test(it.name)) continue;

    const arr = byCat.get(it.cat) || [];
    arr.push({ raw: it.name, base: baseName(it.name), size: sizeOf(it.name), cat: it.cat, carb, fiber: it.fiber });
    byCat.set(it.cat, arr);
  }

  const items = [];
  for (const cat of cfg.keepCats) {
    const arr = byCat.get(cat);
    if (!arr) continue;
    // drink sections multiply out to 3 size rows each, so cap them tighter
    const isDrinkCat = /drink|beverage|coffee|espresso|\blatte|frappuccino|refresher|shake|limeade|\bsoda|\btea\b|coolatta|smoothie|cappuccino|macchiato|cold brew|slush|chocolate beverage/i.test(cat);
    const cap = isDrinkCat ? Math.min(capPerCat, 5) : capPerCat;

    // group size variants of the same base item
    const groups = new Map();
    for (const it of arr) {
      const g = groups.get(it.base) || [];
      g.push(it);
      groups.set(it.base, g);
    }

    // one entry per base item, holding its 1-3 size rows
    const entries = [];
    for (const [base, g] of groups) {
      let rows;
      if (g.length === 1 || g.every((x) => !x.size)) {
        rows = [{ ...g[0], display: g[0].raw.replace(MILK_CLAUSE, "") }];
      } else {
        const sized = g.filter((x) => x.size && SIZE_RANK[x.size]);
        const pick = sized.length ? sized : g;
        if (new Set(pick.map((x) => x.carb)).size === 1) {
          const one = pick.find((x) => SIZE_RANK[x.size] === 2) || pick[0];
          rows = [{ ...one, display: base }];
        } else {
          const bySize = {};
          for (const x of pick) {
            const r = SIZE_RANK[x.size] || 2;
            if (!bySize[r]) bySize[r] = { ...x, display: x.raw.replace(MILK_CLAUSE, "") };
          }
          rows = Object.values(bySize).sort(
            (a, b) => (SIZE_RANK[a.size] || 2) - (SIZE_RANK[b.size] || 2)
          );
        }
      }
      entries.push({ base, rows });
    }

    // surface the plainest items first (short base name ~ core menu item); the
    // cap counts distinct items, not size rows
    entries.sort((a, b) => a.base.length - b.base.length);

    for (const entry of entries.slice(0, cap)) {
      for (const it of entry.rows) {
        const name = (it.display || it.raw).replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").trim();
        items.push({ name, cat, carb: it.carb, fiber: it.fiber, serving: servingLabel(name, cat) });
      }
    }
  }
  return { raw, items };
}

// ----------------------------------------------------------------------------
// Western New York chains, hand tables
// ----------------------------------------------------------------------------
// [category, name, serving, carbsTotal, itemConf?]
const HAND = [
  {
    slug: "tim-hortons",
    name: "Tim Hortons",
    url: "https://www.timhortons.com/us/en/menu/nutrition.php",
    cats: ["Coffee & Espresso", "Donuts & Timbits", "Bakery & Bagels", "Breakfast", "Soup & Lunch"],
    note: "Compiled from Tim Hortons' published US nutrition (approx. 2024 to 2025), not pulled live. Medium drinks unless noted. Confirm before dosing.",
    items: [
      ["Coffee & Espresso", "Original Blend Coffee, Medium (black)", "14 fl oz", 0],
      ["Coffee & Espresso", "Double Double, Medium", "14 fl oz", 16],
      ["Coffee & Espresso", "French Vanilla, Medium", "14 fl oz", 34],
      ["Coffee & Espresso", "Latte, Medium", "14 fl oz", 17],
      ["Coffee & Espresso", "Iced Capp, Medium", "16 fl oz", 55],
      ["Donuts & Timbits", "Honey Dip / Glazed Donut", "1 donut", 28],
      ["Donuts & Timbits", "Boston Cream Donut", "1 donut", 34],
      ["Donuts & Timbits", "Chocolate Dip Donut", "1 donut", 32],
      ["Donuts & Timbits", "Apple Fritter", "1 fritter", 49],
      ["Donuts & Timbits", "Old Fashioned Plain Timbits, 10 ct", "10 timbits", 40],
      ["Bakery & Bagels", "Plain Bagel", "1 bagel", 55],
      ["Bakery & Bagels", "Everything Bagel", "1 bagel", 56],
      ["Breakfast", "Bacon, Egg & Cheese Biscuit", "1 biscuit", 35],
      ["Breakfast", "Sausage, Egg & Cheese English Muffin", "1 sandwich", 30],
      ["Breakfast", "Farmer's Breakfast Wrap", "1 wrap", 35],
      ["Soup & Lunch", "Chicken Noodle Soup", "1 serving", 18],
      ["Soup & Lunch", "Chili, Small", "1 serving", 22],
      ["Soup & Lunch", "Grilled Cheese Panini", "1 panini", 40],
    ],
  },
  {
    slug: "andersons-custard",
    name: "Anderson's Frozen Custard",
    url: "https://www.andersonscustard.com/nutrition-center",
    defaultConfidence: "medium",
    cats: ["Frozen Custard", "Roast Beef & Sandwiches", "Drinks & Shakes"],
    note: "From Anderson's own nutrition center (andersonscustard.com/nutrition-center). Custard values are per single flavor scoop; a cone, sundae, or toppings add more. Roast beef on weck (kimmelweck) is the local classic.",
    items: [
      ["Frozen Custard", "Vanilla Frozen Custard", "1 single", 21],
      ["Frozen Custard", "Chocolate Frozen Custard", "1 single", 22],
      ["Frozen Custard", "Black Raspberry Frozen Custard", "1 single", 23],
      ["Roast Beef & Sandwiches", "Roast Beef on Kimmelweck with Au Jus", "3 oz beef", 36],
      ["Roast Beef & Sandwiches", "Roast Beef on Kaiser with Au Jus", "3 oz beef", 46],
      ["Roast Beef & Sandwiches", "Roast Beef & Cheddar on Kaiser Roll", "1 sandwich", 51],
      ["Roast Beef & Sandwiches", "Roast Beef Junior on Kaiser", "2 oz beef", 25],
      ["Roast Beef & Sandwiches", "Old Fashioned Roast Beef on Bread with Beef Gravy", "3 oz beef", 43],
      ["Roast Beef & Sandwiches", "Roast Beef with Au Jus, no bread", "3 oz beef", 0],
      ["Drinks & Shakes", "Chocolate Milkshake, Regular", "1 shake", 49],
      ["Drinks & Shakes", "Chocolate Milk", "1 serving", 46],
      ["Drinks & Shakes", "2% White Milk", "1 serving", 26],
      ["Drinks & Shakes", "Pepsi", "1 fountain", 69],
      ["Drinks & Shakes", "Diet Pepsi", "1 fountain", 0],
    ],
  },
  {
    slug: "teds-hot-dogs",
    name: "Ted's Hot Dogs",
    url: "https://www.tedshotdogs.com/",
    defaultConfidence: "low",
    cats: ["Hot Dogs", "Burgers", "Sides", "Drinks"],
    note: "Buffalo charcoal-grilled hot dog stand. Ted's publishes only an allergen list, not carb counts, and its Nutritionix page returned nothing. These are component estimates, mostly the bun. Confirm before dosing.",
    items: [
      ["Hot Dogs", "Regular Hot Dog", "1 hot dog on bun", 24],
      ["Hot Dogs", "Foot-Long Hot Dog", "1 hot dog on bun", 44],
      ["Hot Dogs", "Jumbo All-Beef Hot Dog", "1 hot dog on bun", 26],
      ["Hot Dogs", "Cheese Dog", "1 hot dog on bun", 25],
      ["Hot Dogs", "Chili Cheese Dog", "1 hot dog on bun", 29],
      ["Hot Dogs", "Polish Sausage", "1 on bun", 27],
      ["Burgers", "Hamburger", "1 burger", 26],
      ["Burgers", "Cheeseburger", "1 burger", 27],
      ["Burgers", "Double Cheeseburger", "1 burger", 28],
      ["Sides", "French Fries, Regular", "1 serving", 48],
      ["Sides", "Onion Rings, Regular", "1 serving", 55],
      ["Drinks", "Loganberry, Regular", "16 fl oz", 50],
      ["Drinks", "Milkshake, Regular", "1 shake", 75],
    ],
  },
  {
    slug: "mighty-taco",
    name: "Mighty Taco",
    url: "https://www.nutritionix.com/mighty-taco/nutrition-calculator",
    defaultConfidence: "medium",
    cats: ["Tacos", "Burritos", "Specialty Burritos", "Meatless", "Buffitos", "Fajitas", "Sides", "Desserts", "Drinks"],
    note: "Buffalo Mexican fast food. Values are the standard build from Mighty Taco's official nutrition calculator (hosted on Nutritionix, updated June 2026).",
    items: [
      ["Tacos", "Mighty Taco (beef)", "1 taco", 14],
      ["Tacos", "Meatless Mighty Taco", "1 taco", 24],
      ["Burritos", "Meat & Cheese Burrito", "1 burrito", 28],
      ["Burritos", "Meat, Bean & Cheese Burrito", "1 burrito", 31],
      ["Burritos", "Super Mighty Burrito", "1 burrito", 30],
      ["Burritos", "Meat & Cheese Burrito XL", "1 burrito", 45],
      ["Burritos", "Super Mighty Burrito XL", "1 burrito", 46],
      ["Specialty Burritos", "Burrito De-Lite", "1 burrito", 40],
      ["Specialty Burritos", "El Nino Burrito", "1 burrito", 46],
      ["Specialty Burritos", "3 Cheese Burrito", "1 burrito", 48],
      ["Specialty Burritos", "Banderito Burrito", "1 burrito", 33],
      ["Meatless", "3 Cheese Bean Burrito", "1 burrito", 43],
      ["Meatless", "Refried Bean & Cheese Burrito", "1 burrito", 48],
      ["Meatless", "Garden Burrito", "1 burrito", 73],
      ["Meatless", "Refried Beans & Cheese Taco", "1 taco", 23],
      ["Buffitos", "Original Buffito, Small", "1 buffito", 14],
      ["Buffitos", "Original Buffito, Large", "1 buffito", 29],
      ["Buffitos", "Nacho Buffito", "1 buffito", 36],
      ["Fajitas", "Fajita, Small", "1 fajita", 13],
      ["Fajitas", "Fajita, Large", "1 fajita", 27],
      ["Sides", "Seasoned Rice", "1 side", 5],
      ["Sides", "Refried Beans", "1 side", 43],
      ["Sides", "Nachos Deluxe", "1 serving", 50],
      ["Sides", "Tortilla Chips & Dippers", "1 serving", 10],
      ["Sides", "Mighty Cheddar-Jalapeno Cruncher", "1 serving", 41],
      ["Desserts", "Triple Chocolate Chip Cookie", "1 cookie", 40],
      ["Desserts", "Apple Empanada", "1 empanada", 42],
      ["Drinks", "Loganberry, Regular", "1 fountain", 60],
      ["Drinks", "Loganberry, Large", "1 fountain", 70],
      ["Drinks", "Pepsi, Regular", "1 fountain", 49],
    ],
  },
  {
    slug: "duffs-wings",
    name: "Duff's Famous Wings",
    url: "https://www.duffswings.com/menus/",
    defaultConfidence: "low",
    cats: ["Wings", "Sides"],
    note: "Amherst wing institution (the original is on Sheridan Drive). Wings themselves are near-zero carb; the carbohydrate is in the sides and the boneless breading. Estimates; Duff's does not publish full nutrition.",
    items: [
      ["Wings", "Wings, 10 (medium sauce)", "10 wings", 5],
      ["Wings", "Wings, 20 (medium sauce)", "20 wings", 9],
      ["Wings", "Boneless Wings, 10", "10 pieces", 22],
      ["Sides", "Blue Cheese Dressing", "1 side", 2],
      ["Sides", "Celery & Carrots", "1 side", 4],
      ["Sides", "French Fries", "1 serving", 50],
      ["Sides", "Beef on Weck", "1 sandwich", 40],
      ["Sides", "Onion Rings", "1 serving", 45],
    ],
  },
];

// ----------------------------------------------------------------------------

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// possessive that reads right for names already ending in s ("McDonald's" -> "McDonald's")
const poss = (n) => (/s$/i.test(n) ? `${n}'` : `${n}'s`);

const out = [];

// national chains
for (const cfg of NX) {
  const { raw, items } = curateNx(cfg);
  const note = (cfg.note ? cfg.note + " " : "") +
    `Pulled from ${poss(cfg.name)} official US nutrition on Nutritionix (last updated ${raw.updated}). Confirm anything you dose from against the current menu.`;
  const source = {
    type: "official-restaurant",
    url: raw.source,
    platform: "nutritionix",
    updated: raw.updated,
    note: `Chain's own published total carbohydrate via Nutritionix (${raw.updated}). Confidence medium: real source, not re-checked item by item.`,
    retrievedAt: raw.pulledAt || TODAY,
  };
  const menuCats = [...new Set(items.map((i) => i.cat))];
  out.push({
    slug: cfg.slug,
    name: cfg.name,
    menuCategories: menuCats,
    source,
    note,
    items: items.map((it) => ({
      id: `${cfg.slug}-${slugify(it.name)}`,
      restaurant: cfg.name,
      restaurantSlug: cfg.slug,
      category: it.cat,
      name: it.name,
      serving: it.serving,
      carbsTotal: it.carb,
      ...(it.fiber != null && it.fiber > 0
        ? { carbsNet: Math.max(0, it.carb - Math.round(it.fiber)) }
        : {}),
      confidence: "medium",
      updatedAt: raw.updated,
      source: { type: "official-restaurant", url: raw.source, platform: "nutritionix" },
    })),
  });
}

// WNY hand tables
for (const c of HAND) {
  const conf = c.defaultConfidence || "medium";
  out.push({
    slug: c.slug,
    name: c.name,
    menuCategories: c.cats,
    source: {
      type: "official-restaurant",
      url: c.url,
      note: c.note,
      retrievedAt: TODAY,
    },
    note: c.note,
    items: c.items.map(([category, name, serving, carbsTotal, itemConf]) => ({
      id: `${c.slug}-${slugify(name)}`,
      restaurant: c.name,
      restaurantSlug: c.slug,
      category,
      name,
      serving,
      carbsTotal,
      confidence: itemConf || conf,
      updatedAt: TODAY,
      source: { type: "official-restaurant", url: c.url },
    })),
  });
}

// de-dupe item ids within a chain
for (const r of out) {
  const seen = new Map();
  for (const it of r.items) {
    const n = (seen.get(it.id) || 0) + 1;
    seen.set(it.id, n);
    if (n > 1) it.id = `${it.id}-${n}`;
  }
}

// compact: this file is fully generated (source of truth is the pipeline + raw
// pulls) and it ships inlined in the bundle, so skip the pretty-print whitespace
writeFileSync(join(root, "app/src/data/restaurants.json"), JSON.stringify(out) + "\n");
const total = out.reduce((a, r) => a + r.items.length, 0);
console.log(`Wrote ${out.length} restaurants, ${total} items -> app/src/data/restaurants.json`);
for (const r of out) console.log(`  ${r.name.padEnd(26)} ${String(r.items.length).padStart(3)}`);
