# WortPilot Agent Handoff

## Project

WortPilot is a zero-cost German learning PWA for iPhone, hosted on GitHub Pages.

Final local repo:

```text
/Users/umair/Documents/WortPilot
```

Authoritative docs:

- `docs/PRODUCT_SPEC.md`
- `docs/UX_SPEC.md`
- `docs/TECHNICAL_SPEC.md`
- `docs/CONTENT_SPEC.md`
- `docs/BRAND_AND_ASSETS.md`
- `docs/RELEASE_AUDIT.md`
- `docs/DEPLOYMENT.md`
- `docs/ROADMAP.md`
- `docs/TASKS.md`

UI mockup board:

- `design-mockups/index.html`

## Current Direction

Use `Concept B: Deep Focus` from the mockup board as the production UI direction.

The current app already includes:

- Vite + React + TypeScript.
- PWA manifest and service worker.
- Raster app icon assets.
- Dashboard, lesson, quiz, vocab, talk-back, Drive sync, backup/reminder controls.
- Local IndexedDB profile storage.
- Optional Google Drive `appDataFolder` sync module.

## Non-Negotiables

- Keep app static-hostable on GitHub Pages.
- Keep required cost at zero.
- Do not add a backend unless explicitly requested.
- Every German word/phrase must be tappable or wrapped by the German audio system.
- Recordings stay local unless the user explicitly changes that policy.
- Drive sync uses only `https://www.googleapis.com/auth/drive.appdata`.
- Prioritize business/client German over tourist phrases.

## Useful Commands

```bash
npm install
npm run build
npm run dev
npx vite preview --host 127.0.0.1 --port 5180
```

## Before Pushing

- Run `npm run build`.
- Check `git status --short`.
- Do not commit `node_modules` or `dist`.
- Keep docs in sync when changing feature scope, storage shape, or deployment behavior.
