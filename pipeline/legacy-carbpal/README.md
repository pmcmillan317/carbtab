# legacy-carbpal

Two files copied out of the old **GramWise / carbpal** app (the previous iteration,
React + Express + Postgres), kept here only because the food-data pipeline reads
them:

- `server/data/foods.json` — 151 hand-curated foods with serving sizes.
  Consumed by `../convert_seed_foods.mjs`.
- `server/services.ts` — contains `FALLBACK_USDA_FOODS`, the 387-item carb-factor
  list from the original App Inventor app. Consumed by `../merge_legacy_foods.mjs`.

Nothing here runs. It is frozen reference data. The full old app is no longer in
this folder tree.
