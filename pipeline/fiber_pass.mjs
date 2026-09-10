/**
 * Add fiber and net-carb factors to the curated foods.
 *
 *   node pipeline/fiber_pass.mjs      (run after convert + merge)
 *
 * Fiber values are grams per 100 g from USDA FoodData Central standard reference,
 * applied by food id. Only the 151 curated foods are covered here; the 331 legacy
 * foods keep total-only until the full USDA verification pass.
 *
 *   fiberFactor  = fiber_per_100g / 100
 *   carbFactorNet = max(0, carbFactorTotal - fiberFactor)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const foodsPath = join(root, "app/src/data/foods.json");
const foods = JSON.parse(readFileSync(foodsPath, "utf8"));

// grams of dietary fiber per 100 g of food (USDA FDC standard reference)
const FIBER_100 = {
  // fruit
  "apple-with-skin": 2.4, banana: 2.6, orange: 2.4, strawberries: 2.0, blueberries: 2.4,
  "grapes-red-or-green": 0.9, peach: 1.5, pear: 3.1, pineapple: 1.4, mango: 1.6,
  raspberries: 6.5, blackberries: 5.3, "kiwi-fruit": 3.0, plum: 1.4, "sweet-cherries": 2.1,
  apricot: 2.0, watermelon: 0.4, "cantaloupe-melon": 0.9, "honeydew-melon": 0.8, grapefruit: 1.6,
  papaya: 1.7, "dried-fig": 9.8, "deglet-noor-date": 8.0, "seedless-raisins": 3.7,
  "pomegranate-seeds": 4.0, cranberries: 4.6, avocado: 6.7, nectarine: 1.7,
  "lemon-peeled": 2.8, "lime-peeled": 2.8,
  // vegetables
  "broccoli-cooked": 3.3, "carrot-raw": 2.8, "baby-spinach": 2.2, "white-potato-boiled": 1.8,
  "sweet-potato-baked": 3.3, "red-tomato": 1.2, "yellow-onion-raw": 1.7, "garlic-clove": 2.1,
  "cucumber-with-peel": 0.5, "iceberg-lettuce": 1.2, "celery-raw": 1.6, "red-bell-pepper": 2.1,
  "green-cabbage-raw": 2.5, "cauliflower-raw": 2.0, "zucchini-raw": 1.0, "white-mushroom": 1.0,
  "asparagus-boiled": 2.0, "eggplant-cooked": 2.5, "pumpkin-raw": 0.5, "red-radish": 1.6,
  "beetroot-boiled": 2.0, "sweet-corn-kernels": 2.4, "green-peas-cooked": 5.5,
  "green-beans-cooked": 3.2, "kale-raw": 3.6, "brussels-sprouts-cooked": 2.6,
  "butternut-squash-baked": 3.0, "okra-cooked": 3.2, "artichoke-boiled": 5.4, "leek-raw": 1.8,
  // nuts / seeds
  almonds: 12.5, "english-walnuts": 6.7, "cashews-dry-roasted": 3.0, "peanuts-dry-roasted": 8.0,
  "pecan-halves": 9.6, "pistachios-shelled": 10.3, "macadamia-nuts": 8.6, "hazelnuts-filberts": 9.7,
  "pumpkin-seeds-kernels": 6.0, "sunflower-seed-kernels": 8.6, "chia-seeds": 34.4,
  "flax-seeds-ground": 27.3, "sesame-seeds": 11.8, "hemp-seeds-shelled": 4.0, "pine-nuts": 3.7,
  "brazil-nuts": 7.5, "chestnuts-roasted": 5.1, "peanut-butter-creamy": 5.5, "almond-butter": 10.3,
  "tahini-sesame-paste": 9.3, "poppy-seeds": 19.5, "coconut-meat-shredded": 4.5, "peanut-flour": 16.0,
  "cashew-butter": 2.0, "soy-nuts": 17.0, "sunflower-butter": 6.0, "mixed-nuts-salted": 7.0,
  // grains / snacks
  "oatmeal-cooked": 1.7, "white-rice-cooked": 0.4, "brown-rice-cooked": 1.8, "quinoa-cooked": 2.8,
  "white-bread-slice": 2.7, "whole-wheat-bread-slice": 6.8, "spaghetti-boiled": 1.8,
  "soda-saltine-cracker": 2.8, "dark-chocolate-70": 10.0, "potato-chips": 4.4, "corn-tortilla": 5.5,
  "pretzel-sticks": 3.0, "chocolate-chip-cookie": 2.5, "air-popcorn": 14.5, "granola-bars-oats": 4.5,
  "english-muffin": 3.5, "plain-bagel": 2.5, croissant: 2.3, "pancake-prepared": 1.4,
  "french-fries-baked": 3.8, "tortilla-chips": 4.4, "oat-bran-raw": 15.4, "couscous-cooked": 1.4,
  "barley-cooked": 3.8, "graham-cracker": 3.0, "rice-krispies-cereal": 1.0, "corn-flakes-cereal": 3.3,
  "animal-crackers": 1.5, "granola-plain": 6.5, "corn-rice-cakes": 3.0,
  // other
  "whole-milk": 0, "greek-yogurt-plain": 0, "cheddar-cheese": 0, "whole-chicken-egg": 0,
  "chicken-breast-cooked": 0, "ground-beef-lean": 0, "grilled-salmon-filet": 0, "tofu-firm": 0.9,
  "natural-pure-honey": 0.2, "table-white-sugar": 0, "olive-oil-extra-virgin": 0,
  "salted-butter-cream": 0, "maple-syrup": 0, "premium-soy-sauce": 0.8, "prepared-mustard": 3.3,
  "tomato-ketchup": 0.3, "hummus-dip": 5.0, "soy-milk-plain": 0.4, "almond-milk-unsweetened": 0.4,
  "mozzarella-cheese": 0, "cottage-cheese-2": 0, "cream-cheese": 0, "sour-cream": 0,
  "canned-tuna-in-water": 0, "cooked-pork-chop": 0, "roasted-turkey-breast": 0, "brown-gravy-mix": 0.5,
  "black-beans-canned": 8.7, "lentils-cooked": 7.9, "plain-lowfat-yogurt": 0, "quail-eggs": 0,
};

const r3 = (n) => Math.round(n * 1000) / 1000;
const r4 = (n) => Math.round(n * 10000) / 10000;

let done = 0;
for (const f of foods) {
  const fib100 = FIBER_100[f.id];
  if (fib100 == null) continue;
  const fiberFactor = r4(fib100 / 100);
  f.fiberFactor = fiberFactor;
  f.carbFactorNet = r3(Math.max(0, f.carbFactorTotal - fiberFactor));
  done++;
}

writeFileSync(foodsPath, JSON.stringify(foods, null, 2) + "\n");
console.log(`Fiber + net-carb added to ${done} foods (of ${foods.length}).`);
console.log(`Still total-only: ${foods.length - done} (legacy list, awaiting USDA pass).`);
// a couple of sanity lines
for (const id of ["white-bread-slice", "black-beans-canned", "avocado", "banana"]) {
  const f = foods.find((x) => x.id === id);
  if (f) console.log(`  ${f.name}: total ${f.carbFactorTotal}  fiber ${f.fiberFactor}  net ${f.carbFactorNet}`);
}
