# WortPilot

A zero-cost German learning PWA for iPhone, built for business/email/chat German for AI freelance work.

## Project Docs

- Product spec: `docs/PRODUCT_SPEC.md`
- UX spec: `docs/UX_SPEC.md`
- Technical spec: `docs/TECHNICAL_SPEC.md`
- Content spec: `docs/CONTENT_SPEC.md`
- Brand/assets: `docs/BRAND_AND_ASSETS.md`
- Deployment: `docs/DEPLOYMENT.md`
- Roadmap: `docs/ROADMAP.md`
- Tasks: `docs/TASKS.md`
- Agent handoff: `CODEX.md`
- UI mockup board: `design-mockups/index.html`

## Run Locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npx vite preview --host 127.0.0.1 --port 5180
```

## iPhone PWA

Deploy to GitHub Pages, open the Pages URL on iPhone, then use Share -> Add to Home Screen.

## Google Drive Sync

Drive sync is optional and zero-cost. It stores a hidden `german-learning-profile.json` file in Google Drive `appDataFolder`.

1. Create a Google Cloud project.
2. Enable Google Drive API.
3. Configure OAuth consent.
4. Create an OAuth web client.
5. Add your GitHub Pages origin to Authorized JavaScript origins.
6. Add the client ID in the app's Drive sync screen, or set a GitHub repository secret named `VITE_GOOGLE_CLIENT_ID`.

The app requests only:

```text
https://www.googleapis.com/auth/drive.appdata
```

Audio recordings stay local and are not synced.

## Current Course State

The app starts with the refresher quiz from the handoff, then continues to Module 2, Step 3: email sign-offs.

Every German word or phrase rendered by the app uses the shared tappable pronunciation control.

## App Icon

The current raster icon was generated with the built-in image generation workflow and saved into:

- `public/app-icon.png`
- `public/icon-512.png`
- `public/icon-192.png`
- `public/apple-touch-icon.png`

Prompt summary: premium iOS-style app icon for a German business-language learning app, combining a lesson card, audio wave, and professional learning cues, with no text or flag.
