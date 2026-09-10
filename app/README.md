# CarbTab

Carb counting, made easy. Search a food or a restaurant, give a weight or a serving, read the carb
number, add it to the day. Local-first PWA, no accounts, no backend.

See [`../docs/BUILD_SPEC.md`](../docs/BUILD_SPEC.md) for the full brief and
[`../docs/OPEN_QUESTIONS.md`](../docs/OPEN_QUESTIONS.md) for outstanding decisions.

## Run

```
cd app
npm install
node node_modules/esbuild/install.js   # this machine blocks postinstall scripts
npm run dev        # http://localhost:5173
npm run build      # -> dist/  (static, deploy anywhere)
npm run preview
```

## Stack

- React 19 + TypeScript + Vite 6
- `wouter` for routing, `vite-plugin-pwa` for the offline service worker
- Plain CSS with design tokens (`src/index.css`), light / dark / system
- No backend. All data ships in the bundle (`src/data/`), state in `localStorage` (namespace `carbtab:`)

## Data

- `src/data/foods.json` - 482 whole foods. 151 hand-curated with serving sizes and
  a fiber / net-carb factor (`confidence: medium`); 331 from the prior app's 387-item
  carb-factor list (`confidence: low`, total-only, USDA accuracy + fiber pass pending).
  Rebuild:
  `node ../pipeline/convert_seed_foods.mjs && node ../pipeline/merge_legacy_foods.mjs && node ../pipeline/fiber_pass.mjs`
- `src/data/restaurants.json` - 18 chains, ~332 common items compiled from published
  US nutrition (~2024-2025), `confidence: medium`, tagged "Menu" in the UI. Rebuild:
  `node ../pipeline/build_restaurants.mjs`. The full menus come later from
  `../pipeline/links.txt` via the (unbuilt) extractor.
- Icons: `node ../pipeline/gen_icons.mjs`

## Structure

```
src/
  App.tsx            shell: theme, routing, nav, first-run disclaimer
  screens/           Home, LogScreen, Foods, SettingsScreen
  components/        TopBar, BottomNav, WeighSheet, FoodRow, TodayBand, Toast, Disclaimer, icons
  lib/               store (localStorage-backed), carb math, search, storage guard, brand
  data/              bundled foods + restaurants
  index.css          all styles + tokens
```
