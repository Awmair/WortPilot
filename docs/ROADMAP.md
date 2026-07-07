# WortPilot Roadmap

## V1: Static PWA Foundation

Status: in progress.

- React/Vite PWA.
- iPhone install support.
- Raster icon.
- Dashboard.
- Refresher quiz.
- Email sign-off lesson.
- Vocabulary bank.
- Talk-back recording.
- Local profile storage.
- Google Drive sync module.
- JSON backup/import.
- Calendar reminder export.
- UI mockup review board.

## V1 Polish

- Apply Concept A UI direction fully to production app.
- Move route/view logic into smaller screen components.
- Improve mobile bottom navigation labels and accessibility.
- Add writing coach screen.
- Add review queue screen instead of mixing review into quiz.
- Add settings controls for TTS rate and reminder hour.
- Add offline status indicator.
- Add visible Drive sync conflict/merge result.

## Curriculum Expansion

- Complete Module 2 Step 3 email sign-offs.
- Add numbers.
- Add intro sentences.
- Add first complete client email.
- Add noun gender intro.
- Add present tense `sein`, `haben`, and common business verbs.
- Add more AI/agency vocabulary: `Modell`, `Training`, `Daten`, `Schnittstelle`, `Automatisierung`, `Angebot`, `Rechnung`, `Vertrag`.

## Data And Sync

- Rename storage keys from `german-pro-*` to `wortpilot-*` with migration.
- Add profile schema migration utility.
- Add Drive sync tests with mocked API.
- Add import validation and error recovery.
- Add optional visible Drive export file.

## Later Features

- Dark focus mode inspired by Concept B.
- Dense review mode inspired by Concept C.
- Anki export.
- Client email simulator.
- Generated graded reading passages about AI/agency work.
- Optional Web Push if a free backend is accepted.
- Best-effort speech recognition only where browser support is reliable.

## Quality Bar

- Build must pass before push.
- App must remain static-hostable.
- No paid dependency or required paid API.
- All German content must remain tappable/speakable.
- iPhone viewport must avoid horizontal overflow.

