# CarbTab - what to upload to host the PWA

## Short answer

Upload the **contents of `app/dist/`** (not the folder itself, its contents) to
any static host. That is the whole website. Nothing else in this repo gets
deployed.

`app/dist/` does not exist until you build it. Build it first:

```
cd app
npm install        # first time only
npm run build
```

That regenerates `app/dist/`. Then upload what is inside it:

```
app/dist/
  index.html
  favicon.svg
  manifest.webmanifest
  sw.js                      <- service worker (needed for offline / PWA install)
  workbox-*.js
  apple-touch-icon.png
  pwa-192.png
  pwa-512.png
  assets/
    index-*.js
    index-*.css
    workbox-window.*.js
```

About 0.9 MB total. The filenames with hashes (`index-BDc8cBq0.js`) change every
build - that is normal, it is how cache-busting works.

## Do NOT upload

- `app/` (the whole folder) - it contains `src/`, `node_modules/`, config. A
  static host cannot run `.tsx` files.
- `app/node_modules/` - never.
- `pipeline/`, `docs/`, `design/` - build tooling and notes, not the app.
- `../gramwise-carbpal-OLD/` - the previous "GramWise" app. Not this project.
  If you ever uploaded that by mistake, that is why the site said "GramWise".

## Host-specific

Any of these work (all free, all fine for a no-backend PWA):

**Netlify / Vercel / Cloudflare Pages (connect the repo)**
- Base directory / root: `app`
- Build command: `npm run build`
- Publish / output directory: `app/dist` (or `dist` if base is already `app`)
- They run the build for you; you never upload files by hand.

**Netlify drop / any "drag a folder" host**
- Run `npm run build` locally, then drag the `app/dist` folder onto the drop zone.

**GitHub Pages / a host that serves from a sub-path** (e.g. `you.github.io/carbtab/`)
- The build currently assumes the site is at the domain root (`/`). For a
  sub-path you must set `base: '/carbtab/'` in `app/vite.config.ts` and rebuild,
  or asset URLs will 404.

## If the installed app still shows the old version

A PWA caches itself on the device. After deploying a new version:

- On the phone: delete the installed CarbTab (or old GramWise) app, and in the
  browser clear site data for the URL, then reload and re-install.
- The service worker updates on its own within a visit or two, but a hard
  refresh / reinstall forces it immediately.

## Sanity check before you upload

Open `app/dist/index.html` in a text editor. The `<title>` must say `CarbTab`
and the manifest line must point to `manifest.webmanifest`. If it says anything
about GramWise, you built the wrong folder.
