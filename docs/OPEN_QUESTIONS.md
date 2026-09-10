# CarbTab — Decisions & open questions

## Decided (2026-09-09)

- **Name:** CarbTab (chosen 2026-09-09 after a naming study; "CarbWise", "CarbPal" and "GramWise" are all taken). Tagline: "Carb counting, made easy."
- **Product shape:** local-first, **no accounts, no login, free**. Backup via export/import. No PostgreSQL, no sessions, no Stripe, no email. No cross-device sync in v1.
- **Platform:** PWA. **Mobile is the priority over desktop.** Build mobile-first; desktop is a wider version of the same layout, not a separate experience.
- **Carb basis:** default **Total carbs**. Store both total and net; one-tap switch to Net in Settings with a short explainer.
- **Generic/whole food data:** **keep USDA FoodData Central** as the source. Bundled set is now 482 foods (151 curated with servings + 331 from the prior app's carb-factor list), all pending a USDA accuracy check and a fiber/net-carb pass.
- **Restaurant data:** fresh extraction from official company nutrition documents only. **No FatSecret**, no third-party nutrition databases.

## Still open

### Data & pipeline
1. **Restaurant sources** — DONE for the national chains (2026-09-09). `pipeline/nx_extract.mjs` pulls each of the 18 national chains' full official menu from its Nutritionix "Interactive Nutrition Menu" grid into `pipeline/nutritionix-raw/`, and `pipeline/build_restaurants.mjs` curates that to `app/src/data/restaurants.json` (23 chains, ~880 items, national ones now `confidence: medium` from a real pull, not memory). 5 WNY chains stay hand-maintained (Anderson's from its own site, Mighty Taco Nutritionix-computed, Tim Hortons compiled, Ted's + Duff's estimated). **Still open:** Nutritionix gives no serving weights for most chains (we use keyword serving labels); a periodic re-pull to catch menu drift; whether to fetch `restaurants.json` as an asset instead of inlining it (bundle is now ~119 KB gzip).
2. **USDA API key** — DONE (2026-09-09). Key stored in `pipeline/.usda-key.local` (gitignored). Used for the accuracy pass below. A *live* in-app search would still need a small proxy to hide the key (Cloudflare Pages Function) — deferred; the bundled ~480-food offline search is enough for v1.
3. **USDA accuracy + fiber pass — DONE for the matchable foods (2026-09-09).** `pipeline/usda_verify.mjs` checked all 482 foods against FoodData Central (SR Legacy + Foundation) and `usda_apply.mjs` folded in the confident matches: **321 foods now carry a real `fdcId`, USDA carb + fiber values, and `confidence: "medium"`.** The other 101 stay `confidence: "low"` — the FDC match was ambiguous (terse legacy names collide with dry-mix / juice / soup / coated namesakes) so their old values are kept and the app now shows them as **"Unverified"** (amber) with a caveat in the weigh sheet, instead of a plain "USDA" tag. `usda_review.md` lists every food and its verdict; a future manual pass could clear the remaining 101.

### Decided since
- **Daily carb goal → removed as a default (2026-09-09).** The purpose is counting carbs to match insulin, not hitting a carb budget, so the "you have X g left before your goal" framing was off-purpose (and the panel flagged it as judgmental). Home and Log now show a plain running tally ("21 g carbs · 1 item logged"). A **daily carb target is now an optional Setting, off by default**, worded for the care-team-target case (gestational diabetes).

### Feature scope for v1
4. **Meal slots** (breakfast/lunch/dinner/snack on log entries) — keep, or flat daily list? *Recommend flat for v1.*
5. **History depth** — how far back beyond today, and CSV export? *Recommend last 30 days visible, all exportable, no charts.*
6. **Recipe / meal builder** (combine ingredients, save, divide by servings) — the lightweight version shipped (2026-09-09): Home shows a "This meal" running subtotal that groups items added close together, so you can dose for a whole plate. A *saved, reusable* recipe (name it, divide by servings) is still later.
7. **Photo estimate** — keep the AI photo carb estimate? It's the only feature needing a server + API key. *Recommend keep but optional, degrade cleanly with no key.*
7b. **Barcode scanner** — DONE (2026-09-10). "Scan" on Home → camera (ZXing, dynamic-imported) → looks the code up in the bundled branded set (offline), then Open Food Facts, then falls back to Add-a-food. Manual barcode entry when the camera is unavailable.
8. **Reverse calc** (enter a carb budget, get grams) — keep from the original app? *Recommend yes, as a mode in the weigh sheet.*

### Tech
9. **Hosting** — Cloud Run, Replit, or static host (Netlify/Vercel/Cloudflare Pages)? A local-first PWA with no backend can go on any static host. *Recommend a static host; simplest and free.*
