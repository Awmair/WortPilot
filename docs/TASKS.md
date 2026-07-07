# WortPilot Tasks

## Immediate

- [x] Connect GitHub remote and push local commits.
- [x] Enable GitHub Pages with Actions source.
- Add `VITE_GOOGLE_CLIENT_ID` secret after Google OAuth setup.
- [x] Use the audited Concept B direction from `design-mockups/index.html` as the production UI direction.

## Production UI

- Convert dashboard to Concept B layout.
- Add bottom navigation labels for mobile clarity.
- Add writing coach view.
- Add review queue view.
- Add profile/settings grouping.
- Add offline/cache status chip.

## Learning Content

- Expand Module 2 Step 3 into a complete quiz.
- Add lesson content authoring convention.
- Add more vocabulary metadata: difficulty, review priority, example sentence.
- Add ASCII fallback display wherever umlauts/ß appear.

## Storage And Sync

- Rename IndexedDB/localStorage keys to WortPilot.
- Add migration from old keys.
- Add a migration test for normalized older profile JSON.
- Add Drive sync status states: Unsynced, Syncing, Synced, Sync issue.

## Testing

- Add smoke tests for rendering all main screens.
- Add unit tests for profile normalization and Drive save/restore failure behavior.
- Add checks for all German vocab items having phonetics.
- Add a small script to verify service worker asset references exist.

## Documentation

- Add screenshots after final UI direction is implemented.
- [x] Add GitHub Pages URL to README.
- Add Google OAuth setup screenshots if needed.
- Add iPhone install walkthrough.
