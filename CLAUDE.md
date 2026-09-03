# One Lustre

A private jeweller-to-client diamond book, built for a fine jewellery
atelier (brand: Jeinelika, founder: Jane). Three roles share one app,
gated by passcode: **admin** (Jane, full trade view — costs, margins,
suppliers), **client** (a curated, price-controlled selection — e.g.
Vanessa Lim), and **supplier** (a submission desk — Ploy, M&B, Mr
Shing, Syed, Ravi, Jann Paul — each can add or correct their own
stones, and nothing else).

Read this file before making changes. This project has already been
through a long iterative build (originally as a Claude.ai artifact,
now migrating here), and several past mistakes are worth not
repeating — they're called out below.

## Stack

Vite + React 18 + Tailwind CSS + lucide-react. No backend, no API
routes, no server code.

## File layout

```
src/
  App.jsx          — the entire application. One large component file
                      by design (it grew from a single-file Claude
                      artifact). Contains all UI, all business logic,
                      and every embedded asset as base64 (fonts,
                      GIA certificate images, stone rotation frames).
  main.jsx          — entry point. Installs the storage shim, then
                      renders App.
  storageShim.js     — see "Storage — read this part" below.
  index.css          — Tailwind directives only.
```

`App.jsx` is large (~1.9 MB) almost entirely because of embedded
base64 images and fonts, not because of code complexity. Don't be
alarmed by the file size; it's expected.

## Storage — read this part before touching persistence

The app calls `window.storage.get/set/delete/list(key, shared)`. That
API exists natively inside Claude.ai's artifact sandbox (a real,
hosted, cross-device store). It does **not** exist in a normal
browser. `storageShim.js` polyfills it using `localStorage` so the
app runs standalone — but `localStorage` is private to one browser on
one device.

**This means the deployed site is currently single-device.** Jane's
edits on her phone do not reach Vanessa's laptop. This is a known,
already-communicated limitation, not an oversight to silently fix.

If asked to make this genuinely multi-device (real shared state
across admin/clients/suppliers): the whole book is already one JSON
document (`{ items, settings, enquiries, seedVersion }`), which maps
cleanly onto a single Supabase table with a `get`/`upsert` pair
replacing the shim's two methods. That's a deliberate, scoped task —
don't do it opportunistically as part of an unrelated change.

## Data model and migrations — the rule that matters most

`seed()` returns the reference stone data. `SEED_VERSION` gates a
one-time migration that runs on load if a saved book is older.

**The migration must be additive-only.** A stone already saved in
someone's book belongs to them — their cost, margin, discount,
status, notes, and client visibility must never be silently
overwritten by a newer `SEED_VERSION`. This was broken twice during
development (a version bump once reset every admin's custom margin
back to the house default, and once rewrote a supplier's "ships from"
country data). Both were real, painful bugs for the person using this
app. When adding a new migration step, it should only ever:
- add a stone that doesn't exist yet, or
- patch a specific, named field for a specific, named reason (e.g. a
  price correction the jeweller explicitly gave), never a blanket
  overwrite.

If touching the migration block, look at the pattern of prior
`if ((parsed.seedVersion || 1) < N) { ... }` blocks first and match
it — each one is a deliberate, narrow, one-time correction, not a
general merge.

## Access codes

The admin PIN, every client passcode, and every supplier passcode are
plain string constants inside `App.jsx` (e.g. `defaultSettings.pin`,
`defaultSettings.clients[].pin`, `defaultSettings.suppliers[].pin`).
This is a screen lock, not encryption — anyone with repo access or
browser dev tools can read them. Keep this repository **private**.
Don't add real authentication as a drive-by change; if asked to
improve this, treat it as its own scoped task.

## Build and deploy

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
```

Deployed on Netlify, connected to this repo, auto-deploying on every
push to `main` (`netlify.toml` sets the build command and publish
directory). Node is pinned to 20 via `.nvmrc` and
`netlify.toml`'s `NODE_VERSION` — don't remove that pin; earlier
deploys failed before it was added.

**`dist/` must never be committed.** It's in `.gitignore`, but GitHub's
web upload UI (as opposed to `git`) doesn't honour `.gitignore` — a
past deploy failure happened because a built `dist/index.html` (with
a hashed asset filename) ended up committed at the repo root, where
Vite's plain source `index.html` (pointing at `/src/main.jsx`) should
be. If the root `index.html` ever references something under
`/assets/`, that's the bug — replace it with the plain source
version and remove any committed `dist/` folder.

Before pushing any change, run `npm run build` locally and confirm it
completes without error — this bundle is unusually large, so a build
failure is worth catching before it reaches Netlify.

## Working with the person on this project

Jane is a jeweller, not a developer — she runs this project from an
iPad most of the time. Explanations should stay concrete and
practical (what to click, what will happen), not abstracted into
general engineering advice. She cares about specific stones, specific
suppliers, and specific numbers — when a change touches pricing or
grading data, get the numbers exactly right.
