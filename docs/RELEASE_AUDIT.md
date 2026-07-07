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

- [ ] Apply Concept B styling to the actual React app screens, not only the mockup board.
- [ ] Add automated tests for profile merge and screen rendering.
- [ ] Add import validation for profile JSON.
- [ ] Add visible offline/cache status in the production app.
- [ ] Configure Google OAuth and GitHub secret `VITE_GOOGLE_CLIENT_ID`.
- [ ] Enable GitHub Pages with Actions source.
- [ ] Verify deployed app on real iPhone Home Screen.

## Release Gate

Do not call the app release-ready until:

1. The production React UI matches the audited Concept B direction.
2. `npm run build` passes.
3. GitHub Pages deployment completes.
4. iPhone PWA install, offline launch, TTS, local progress, and backup/export are manually verified.
