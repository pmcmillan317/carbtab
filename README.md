# CarbTab

Mobile-first PWA for counting carbohydrates in grams, for people who count carbs
to dose insulin. Local-first, no accounts, no backend, free.

This folder holds **only the current app**. The earlier iterations (GramWise /
CarbPal / CarbWise) are not in here - the old GramWise source was moved to
`../gramwise-carbpal-OLD/`.

## Folder layout

| Folder | What it is |
|---|---|
| `app/` | The actual PWA (React 19 + Vite 6 + TypeScript). `app/src/` is source; `app/dist/` is the built site. `app/public/branded.json` is the packaged-foods dataset, loaded on demand. |
| `pipeline/` | Zero-dependency Node scripts that build the bundled food and restaurant data. Not shipped. |
| `docs/` | `BUILD_SPEC.md`, `OPEN_QUESTIONS.md`. |
| `design/` | Naming study and design-review HTML artifacts. |
| `DEPLOY.md` | **Read this to publish the app.** What to build and what to upload. |

## Run it locally

```
cd app
npm install
npm run dev
```

## Publish it

One-time setup on Cloudflare Pages: **[docs/HOSTING.md](docs/HOSTING.md)**.
Manual upload to any static host instead: **[DEPLOY.md](DEPLOY.md)** (`cd app &&
npm run build`, upload the contents of `app/dist/`).

## Rebuild the bundled data

```
cd pipeline
# foods.json  (whole foods)
node convert_seed_foods.mjs && node merge_legacy_foods.mjs && node fiber_pass.mjs
node usda_verify.mjs && node usda_apply.mjs      # check values against USDA FoodData Central
# restaurants.json
node nx_extract.mjs && node build_restaurants.mjs
# branded.json  (~2,800 packaged foods, served as an asset from app/public/)
node branded_pull.mjs
```

`usda_verify.mjs` needs a free FoodData Central key in `pipeline/.usda-key.local`
(gitignored). `usda_review.md` is the human-readable diff it produces.
