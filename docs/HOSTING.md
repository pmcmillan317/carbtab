# Hosting CarbTab on Cloudflare Pages

One-time setup. After this, every `git push` redeploys the site automatically.

The local Git repo already exists (first commit is done, secrets are excluded).
You need to (1) put it on GitHub and (2) connect Cloudflare Pages to it.

## 1. Create the GitHub repo

1. Go to https://github.com/new
2. Repository name: `carbtab` (or anything)
3. **Private** is fine. Leave "Add a README" etc. unchecked - the repo already has files.
4. Create repository. GitHub shows you a URL like
   `https://github.com/YOURNAME/carbtab.git`.

## 2. Push

In a terminal, from `C:\Users\pmcmi\Documents\Coding Projects\CarbTab`:

```
git remote add origin https://github.com/YOURNAME/carbtab.git
git push -u origin main
```

(GitHub will ask you to sign in the first time - a browser popup or a
personal-access-token. If it's fussy, install GitHub Desktop, "Add existing
repository", and push from there.)

## 3. Connect Cloudflare Pages

1. https://dash.cloudflare.com/ - sign up if needed (free, no card).
2. **Workers & Pages** -> **Create** -> **Pages** tab -> **Connect to Git**.
3. Authorize GitHub, pick the `carbtab` repo.
4. Build settings:

   | Field | Value |
   |---|---|
   | Framework preset | None (or "Vite") |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory (advanced) | `app` |

5. **Save and Deploy.** First build takes ~1-2 minutes. You get a URL like
   `carbtab.pages.dev`.

That's it. From now on: make changes, `git push`, and the site rebuilds.

## Updating the data later

The bundled food/restaurant JSON is committed, so a data refresh is just:

```
cd pipeline
node nx_extract.mjs && node build_restaurants.mjs        # restaurants
node usda_verify.mjs && node usda_apply.mjs              # foods (needs .usda-key.local)
cd ..
git add -A && git commit -m "refresh data" && git push
```

## Custom domain (optional, later)

In the Pages project: **Custom domains** -> add e.g. `carbtab.app`. If you buy the
domain through **Cloudflare Registrar** it's sold at cost (~$10/yr for most TLDs,
no renewal markup) and the DNS is wired up automatically.

## If the site 404s on assets

The build assumes it's served from the domain root. If you ever host it under a
sub-path, set `base: '/subpath/'` in `app/vite.config.ts` and rebuild.
