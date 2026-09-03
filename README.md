# One Lustre

A private jeweller-to-client stone book, built by Jeinelika.

## If your last deploy failed

The build has been re-verified locally (`npm ci && npm run build` both
run clean against this exact package) and two likely causes of a
Netlify build failure have been fixed pre-emptively:

- **Node version.** Nothing pinned it before, so Netlify used whatever
  its account default was — if that default is older than Node 18,
  Vite 5 fails immediately. `.nvmrc` and `NODE_VERSION` in
  `netlify.toml` now both force Node 20.
- **Build memory.** This bundle is unusually large because every
  certificate and rotation film is embedded as base64 rather than
  linked as a separate file. `NODE_OPTIONS` in `netlify.toml` now
  raises the memory ceiling during the build as a safety margin.

If it still fails after redeploying: open the failed deploy in
Netlify, click into the deploy log, and copy the **exact error text**
near the bottom (not just the one-line summary on the overview page).
That's the only way to diagnose a build failure precisely — the
overview page alone doesn't show enough to work from.

---

## Read this first — the one thing that matters

Inside Claude.ai, this app saves your book to a real, hosted database
(`window.storage`) that every device reading the same artifact shares.
That's why you can edit a margin on your phone and see it show up
when you open the trade view on a laptop.

**A plain deploy — Netlify, GitHub Pages, anywhere — does not have that
database.** This package includes a stand-in (`src/storageShim.js`)
that saves the book to the browser's own `localStorage` instead, so the
app runs and nothing crashes. But `localStorage` is private to one
browser on one device. If you deploy this and open the link on your
phone, then open the *same link* on your laptop, you will see two
different, disconnected copies of the book — nothing you add on one
will appear on the other, and a client opening the link on her own
phone will see only the empty seed data, never your edits.

In short: **this deployed version is good for trying the app out, or
for your own single-device use. It is not yet a shared, multi-device
book the way it is inside Claude.ai.**

To get real shared behaviour — you edit it once, anywhere, and every
client and supplier sees the same live book — the storage layer needs
to be swapped for an actual backend (a few dozen lines against a
database instead of `localStorage`). Supabase is a natural fit for
this, since the whole book is already just one JSON document; ask
Claude to make that change if and when you're ready to deploy it for
real multi-device use.

---

## What's in this folder

```
one-lustre/
├── src/
│   ├── App.jsx          the whole application (unchanged from the artifact)
│   ├── main.jsx          entry point — installs the storage shim, then renders App
│   ├── storageShim.js    localStorage stand-in for window.storage (see above)
│   └── index.css         Tailwind entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── netlify.toml          Netlify build settings (auto-detected, no setup needed)
└── .gitignore
```

This is a standard Vite + React + Tailwind project. Nothing about it
is Claude-specific except the storage shim.

## Run it locally

You'll need [Node.js](https://nodejs.org) 18 or later installed.

```bash
npm install
npm run dev
```

Then open the address it prints (usually `http://localhost:5173`).

## Build it

```bash
npm run build
```

This produces a `dist/` folder — a set of plain HTML/CSS/JS files that
any static host can serve. This has already been built and tested once
during preparation; running it yourself will produce the same result.

---

## Put it on GitHub

If you don't already have a repository:

1. Create a new, **private** repository on GitHub (keep it private —
   this project contains your supplier codes and admin password as
   plain text, since they're just JavaScript string constants; see the
   security note below).
2. From inside this folder:
   ```bash
   git init
   git add .
   git commit -m "One Lustre"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

## Deploy to Netlify

**Easiest — no Git required:**
Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the
`dist/` folder (after running `npm run build`) straight onto the page.
You'll get a live URL in seconds. Every time you make a change, rebuild
and drag the new `dist/` folder over again.

**Recommended — connects to GitHub, rebuilds automatically:**
1. Push this project to GitHub (above).
2. In Netlify: **Add new site → Import an existing project → GitHub**,
   pick the repository.
3. Netlify reads `netlify.toml` automatically — build command and
   publish folder are already set. Click **Deploy**.
4. From then on, every `git push` redeploys the site automatically.

---

## Security note, since this matters more than usual

Your admin password, every client passcode, and every supplier
passcode currently live as **plain, readable text inside the JavaScript
source** (`src/App.jsx`). Anyone who opens their browser's developer
tools on the live site, or downloads the built JS file, can read them
directly — the "lock screen" only stops casual access, it isn't
encryption. This is true inside Claude.ai as well; deploying doesn't
make it worse, but it doesn't make it better either.

- Keep the GitHub repository **private**.
- Don't rely on the passcodes alone to protect anything you couldn't
  afford to have seen. For real security, real authentication (proper
  logins, not shared text codes) would need to replace the current
  gate — a bigger change than this deploy step.

## Fonts

Montserrat and Pinyon Script are embedded directly in `App.jsx` as
base64 — no separate font files to install, no Google Fonts request at
runtime, and no flash of unstyled text on a slow connection.

## Images and film

Every GIA certificate and every stone's rotation frames are also
embedded as base64 inside `App.jsx`. That's why the file is large
(around 1.5 MB uncompressed) — it's a trade-off deliberately made in
Claude's sandboxed environment, where linking out to external image
hosting isn't available. Once deployed for real, hosting these as
separate files (e.g. in Netlify's own asset storage, or an image CDN)
would cut initial load time noticeably. Worth doing once you're happy
with everything else and ready to make this the long-term version.
