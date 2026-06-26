# Deploying the BoltOS Panel Platform

Two separate surfaces, one codebase:

- **Admin / Control Room** — `#/studio` and `#/control/:id`. Where you deploy a
  panel before a match and tweak it live during the match.
- **Fan panel** — `#/p/:id`. The chrome-free, fully-responsive screen fans open
  by scanning the QR. Each device runs its own copy and joins the panel's live
  channel, so your tweaks reach every connected phone.

The share link is **self-contained**: the panel config is encoded into the URL,
so a colleague on a brand-new device renders the exact panel with no backend
storage. The QR in the Control Room points at it.

## One-time setup (needs your accounts)

### 1. Ably (live cross-device control)
1. Create a free account at <https://ably.com>.
2. Copy an API key (Dashboard → your app → **API Keys**).
3. In GitHub: **Settings → Secrets and variables → Actions → New repository
   secret**, name it `VITE_ABLY_KEY`, paste the key.

Without this, control still works across tabs on one machine, but not across
devices. The Control Room shows the current state ("Live sync active" vs
"Local only").

### 2. Enable GitHub Pages
1. GitHub → **Settings → Pages**.
2. **Source: GitHub Actions**.

### 3. Deploy
Push to `main` (or run the **Deploy to GitHub Pages** workflow manually). The
site publishes to:

```
https://danielokpechi.github.io/immersive-panel/
```

Share `…/#/p/<panel-id>` (or just scan the QR in the Control Room) with fans.

## Local development
```bash
cp .env.example .env.local   # optional: paste VITE_ABLY_KEY for cross-device test
npm install
npm run dev                  # http://localhost:5173/immersive-panel/
```

## Notes
- `base` is `/immersive-panel/` (the repo name). If you rename the repo or use a
  custom domain, update `base` in `vite.config.ts` and `BASE_PATH` in the
  workflow.
- The Ably key ships in the client bundle (unavoidable on a static host). For a
  prototype/test that's fine; for production, switch to Ably **token auth** via
  a small token endpoint and restrict the key's capabilities.
- Football panels reuse the original prototype (auto-running). Live operator
  control currently drives the engine-based sports; football runs standalone.
