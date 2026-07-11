# WortPilot Release Audit

## Current Audit Scope

This audit covers the selected **Concept B: Deep Focus** design direction and the current static PWA implementation.

Last audited locally:

- UI mockup board: `design-mockups/index.html`
- Production app build: `npm run build`
- Target repository: `Awmair/WortPilot`
- Live URL: `https://awmair.github.io/WortPilot/`

Measured Concept B mockup checks:

- Desktop board: no horizontal overflow.
- Desktop Concept B phones: 4 screens, 390px wide, no internal vertical overflow.
- Desktop bottom-nav clearance: minimum 20px before nav.
- iPhone-width board: 375px client width, 375px scroll width, no horizontal overflow.
- iPhone-width Concept B phones: 4 screens, 355px wide, no internal vertical overflow.
- iPhone-width bottom-nav clearance: minimum 20px before nav.

Measured production React app checks:

- `npm run build` passes after Concept B conversion.
- Desktop app: no horizontal overflow, six bottom-nav items, minimum button height 44px.
- Desktop/narrow app: bottom nav no longer contains the brand/app icon; nav width measured 529px with six 44px-high tabs.
- Desktop/narrow app: dashboard app icon is present in the hero identity area.
- iPhone-width app: 375px client width, 375px scroll width, no horizontal overflow.
- iPhone-width app: bottom nav is fixed, 64px high, 357px wide, 14px above viewport bottom.
- iPhone-width app: six nav tabs are 52px wide and 44px high; labels are hidden to avoid crowding.
- iPhone-width app: dashboard study card clears bottom nav by 13px in first viewport.
- iPhone-width app: study-card duplicate metric grid is hidden; stats remain available below.
- Main screens render without horizontal overflow: Lesson, Quiz, Vocab, Speak, Sync.
- Vocabulary bank contains exactly 3,000 entries with All / Learned / Locked filters.
- Vocabulary list renders incrementally with Load more so iPhone does not paint all 3,000 cards at once.
- Vocabulary cards keep the German speak control active for learned and locked words.
- Vocabulary data audit: 3,000 unique IDs, 3,000 unique German entries, 0 missing required fields.
- Cleanup audit: stale `German Pro` user-facing text removed; storage now writes `wortpilot-*` keys while reading legacy `german-pro-*` keys for migration.
- Event-handling audit: no direct per-render DOM button bindings; React delegated event handlers are used for app controls.
- iPhone tap audit: viewport uses `viewport-fit=cover`; tappable controls use `touch-action: manipulation` to avoid double-tap delay/zoom on controls.
- iPhone nav audit: bottom nav uses real `#view/...` links, capture-phase route handling, immediate render on tap, and hashchange sync.
- Service worker cache bumped to `wortpilot-v3`; cache writes are limited to app-shell files and same-origin built assets.

## Design Audit

- [x] Concept B is the selected/recommended direction.
- [x] Bottom navigation safe area is reserved inside phone mockups.
- [x] Bottom navigation uses descriptive icons: `?` for quiz, A-Z for vocabulary, microphone for speak-back.
- [x] App icon/brand identity lives in the dashboard hero, not the bottom nav.
- [x] Phone screens avoid content overlapping the nav.
- [x] Dashboard flow includes next lesson, reviews, weak points, reminders, backup, and sync.
- [x] Lesson flow includes tappable German, phonetics, sections, recap/review/break actions.
- [x] Quiz/writing flow includes instant grading, writing checklist, and weak-point drill.
- [x] Talk-back/profile flow includes TTS, recording, replay/self-rating, Drive sync, and local-only recording policy.
- [x] Feature map includes all V1 required flows.
- [x] Mobile mockup board has no horizontal overflow at iPhone width.

## Product Feature Audit

- [x] Dashboard has a defined place.
- [x] Lessons have a defined place.
- [x] Universal German pronunciation has a defined component.
- [x] Quiz/review has a defined flow.
- [x] Vocabulary bank has a defined flow.
- [x] Vocabulary bank supports progressive All / Learned / Locked filtering.
- [x] Writing coach has a defined flow.
- [x] Talk-back has a defined flow.
- [x] Reminders have a defined flow through in-app status and calendar export.
- [x] Drive sync has a defined manual Save & Sync / Restore from Drive flow with appDataFolder.
- [x] Manual backup/restore has a defined flow.
- [x] Offline PWA behavior has a defined deployment target.
- [x] Settings have a defined place.

## Engineering Audit

- [x] `npm run build` passes.
- [x] App remains static-hostable.
- [x] GitHub Pages deployment succeeds with Actions source.
- [x] Live HTTPS URL returns the WortPilot app shell.
- [x] `node_modules` and `dist` are ignored.
- [x] PWA icon assets are committed.
- [x] Service worker uses network-first fetch with cached fallback.
- [x] Google Drive sync scope is limited to `drive.appdata`.
- [x] Drive sync uses a browser OAuth client ID only and no client secrets.
- [x] Failed Drive save/restore keeps local data intact by policy.
- [x] Audio recordings remain local by policy.
- [x] Docs capture product, UX, technical, content, brand, deployment, roadmap, and tasks.

## Remaining Before Public Release

- [x] Apply Concept B styling to the actual React app screens, not only the mockup board.
- [ ] Add automated tests for profile normalization, Drive save/restore failures, and screen rendering.
- [ ] Add visible offline/cache status in the production app.
- [ ] Configure Google OAuth and GitHub secret `VITE_GOOGLE_CLIENT_ID`.
- [x] Enable GitHub Pages with Actions source.
- [ ] Verify deployed app on real iPhone Home Screen.

## Release Gate

Do not call the app release-ready until:

1. iPhone PWA install, offline launch, TTS, local progress, and backup/export are manually verified.
2. Google OAuth client ID is configured if Drive sync is part of release acceptance.
