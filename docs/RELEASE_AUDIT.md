# WortPilot Release Audit

## Current Audit Scope

This audit covers the selected **Concept B: Deep Focus** design direction and the current static PWA implementation.

Last audited locally:

- UI mockup board: `design-mockups/index.html`
- Production app build: `npm run build`
- Target repository: `Awmair/WortPilot`

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
- iPhone-width app: 375px client width, 375px scroll width, no horizontal overflow.
- iPhone-width app: bottom nav is fixed, 64px high, 14px above viewport bottom.
- iPhone-width app: dashboard study card clears bottom nav by 13px in first viewport.
- iPhone-width app: study-card duplicate metric grid is hidden; stats remain available below.
- Main screens render without horizontal overflow: Lesson, Quiz, Vocab, Speak, Sync.

## Design Audit

- [x] Concept B is the selected/recommended direction.
- [x] Bottom navigation safe area is reserved inside phone mockups.
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
- [x] Writing coach has a defined flow.
- [x] Talk-back has a defined flow.
- [x] Reminders have a defined flow through in-app status and calendar export.
- [x] Drive sync has a defined flow with appDataFolder.
- [x] Manual backup/restore has a defined flow.
- [x] Offline PWA behavior has a defined deployment target.
- [x] Settings have a defined place.

## Engineering Audit

- [x] `npm run build` passes.
- [x] App remains static-hostable.
- [x] `node_modules` and `dist` are ignored.
- [x] PWA icon assets are committed.
- [x] Service worker uses network-first fetch with cached fallback.
- [x] Google Drive sync scope is limited to `drive.appdata`.
- [x] Audio recordings remain local by policy.
- [x] Docs capture product, UX, technical, content, brand, deployment, roadmap, and tasks.

## Remaining Before Public Release

- [x] Apply Concept B styling to the actual React app screens, not only the mockup board.
- [ ] Add automated tests for profile merge and screen rendering.
- [ ] Add import validation for profile JSON.
- [ ] Add visible offline/cache status in the production app.
- [ ] Configure Google OAuth and GitHub secret `VITE_GOOGLE_CLIENT_ID`.
- [ ] Enable GitHub Pages with Actions source.
- [ ] Verify deployed app on real iPhone Home Screen.

## Release Gate

Do not call the app release-ready until:

1. GitHub Pages deployment completes.
2. iPhone PWA install, offline launch, TTS, local progress, and backup/export are manually verified.
3. Google OAuth client ID is configured if Drive sync is part of release acceptance.
