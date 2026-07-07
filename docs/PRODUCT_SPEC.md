# WortPilot Product Spec

## Product Summary

WortPilot is a zero-cost, iPhone-first PWA for learning practical German for client acquisition and business communication. It focuses on written email/chat German for an AI freelancer or small agency owner, while still supporting pronunciation through tap-to-hear audio and talk-back recording.

The app is local-first: it must work without accounts, subscriptions, paid APIs, or a backend. Optional Google Drive sync stores only the learner profile in Drive `appDataFolder`.

## Target User

- Fluent English speaker starting from zero German.
- Primary goal: read, write, and understand German enough to conduct email/chat conversations with German-market clients.
- Business context: AI services, automation, agency work, proposals, invoices, contracts, onboarding, and client follow-up.
- Device target: iPhone PWA installed from GitHub Pages.
- Learning style: direct examples, conversation, active recall, pronunciation by mimicry.

## Core Promise

Every German word or phrase shown in the app should be tappable and pronounceable. The learner should always know:

1. What to study next.
2. What weak points need review.
3. How the phrase sounds.
4. How it fits into real client writing.
5. Whether progress is safely stored locally and synced.

## Required Feature Set

### Dashboard

- Shows the next lesson or quiz action.
- Shows streak, due reviews, quiz progress, vocabulary count, and weak-point radar.
- Shows Drive sync status.
- Provides direct actions for lesson, quiz, vocabulary, talk-back, and profile sync.

### Lessons

- Module/step based; no calendar/day pacing.
- Includes why-this-matters framing, examples, tappable German, phonetics, recap, and next action.
- Uses formal German first when client context is involved.
- Keeps ASCII variants visible for umlauts and ß where relevant.

### Universal German Audio

- Every German word/phrase appears through a reusable speakable control or automatic wrapper.
- Browser TTS uses `de-DE`, slower rate, and a German voice when available.
- New audio cancels previous audio.

### Quiz And Review

- Mixed active-recall formats: translation, fill-in, multiple choice, spot-the-error, production, sound checks.
- Immediate grading with reason.
- Misses update weak-point records and spaced review queue.
- Repeated mistakes trigger mini-drill framing.

### Vocabulary Bank

- Searchable German/English list.
- Tags for email, business, tech, AI, sales, grammar, weak points.
- Every German item tappable.
- Weak points visually highlighted.

### Writing Coach

- Client-style email/chat prompts.
- Checks business-critical rules: salutation comma, `Sie/Ihre` capitalization, formal endings, sign-off punctuation.
- Should eventually support a draft/correction loop.

### Talk-Back

- TTS phrase playback.
- Local microphone recording.
- Replay learner recording.
- Self-rating: Good, Unsure, Retry.
- Recordings remain local and are excluded from Drive sync.

### Reminders

- In-app due review prompts.
- Exportable `.ics` calendar reminder for native iPhone notifications.
- True push notifications remain a later optional feature because static GitHub Pages cannot send push without a backend.

### Profile, Backup, And Sync

- IndexedDB local profile.
- Optional Google Drive `appDataFolder` hidden profile JSON.
- Manual JSON export/import.
- Conflict handling by latest per-record timestamps.
- Sync excludes recordings.

## Success Criteria

- App installs from GitHub Pages as a PWA on iPhone.
- App loads and navigates offline after first visit.
- Lesson, quiz, vocabulary, talk-back, and sync flows are reachable from dashboard.
- Tappable German works consistently across lesson and vocabulary surfaces.
- Local progress survives browser close/reopen.
- JSON export/import can restore a profile.
- Drive sync can create, update, and restore hidden profile data once OAuth is configured.

## Non-Goals For V1

- No paid APIs.
- No server database.
- No App Store app.
- No AI pronunciation scoring.
- No native push notifications from static hosting.
- No multi-user accounts.

