# WortPilot UX Spec

## Recommended Direction

Use **Concept B: Deep Focus** from `design-mockups/index.html` as the main product direction.

Reasoning:

- Strongest brand identity.
- Best fit for a focused iPhone PWA that should feel premium and serious.
- Works well for pronunciation, review, and client-writing sessions.
- The revised mockup reserves bottom-nav space and uses a consistent 12px content rhythm.

Concept A can inform calmer copy and hierarchy. Concept C can inform dense review and settings screens.

## Navigation Model

Use a persistent bottom navigation on mobile. The selected Concept B direction requires a reserved safe area above navigation so cards never collide with the nav.

- Home: dashboard and next action.
- Lesson: current module/step content.
- Quiz: active recall and review queue.
- Vocab: searchable vocabulary bank.
- Profile: Drive sync, backup, reminders, settings.

Talk-back and writing coach can be surfaced as primary task cards on Home and as tabs/sections inside Lesson or Review.

## Primary Flows

### Daily Study Flow

1. Open app.
2. Dashboard shows current lesson and due review count.
3. Tap Continue Lesson.
4. Tap German phrase to hear pronunciation.
5. Complete lesson recap.
6. Take quiz or choose review/break.

### Weak-Point Flow

1. Dashboard shows weak-point radar.
2. Tap a weak-point card.
3. App opens a small drill with the confusing pair or rule.
4. Result updates weak-point miss count and review interval.

### Writing Coach Flow

1. Choose writing prompt.
2. Draft a client email/chat snippet.
3. App checks known rules locally.
4. Learner sees checklist: salutation, comma, capitalization, sign-off, name placement.

### Talk-Back Flow

1. Choose a phrase.
2. Hear browser TTS.
3. Record voice.
4. Replay user recording.
5. Self-rate Good / Unsure / Retry.

### Sync Flow

1. Open Profile.
2. Enter or use configured Google OAuth client ID.
3. Tap Save & Sync to upload the latest local profile JSON.
4. Tap Restore from Drive only when replacing local data with the Drive copy.
5. App signs in with Google and uses Drive `appDataFolder`.
6. Sync status shows Unsynced, Syncing, Synced, or Sync issue.
7. Sync issues keep local data intact and allow retry.

## Screen Requirements

### Dashboard

- Must show next action above the fold.
- Must show at least one tappable German phrase.
- Must show Drive/local-first confidence.
- Must show weak-point radar if mistakes exist.

### Lesson

- Use short blocks, not long walls of text.
- Examples should be tappable cards.
- Tables are acceptable only if they stay readable on mobile.
- Recap and next action must be explicit.

### Quiz

- One question per card.
- Current result visible immediately after grading.
- Misses must explain why, not just mark wrong.
- Production inputs should be large enough for iPhone typing.

### Vocabulary

- Search at the top.
- Cards should show German, English, phonetic, ASCII where relevant, and tags.
- Weak words use a clear warning surface, not only color.

### Profile

- Split into Sync, Backup, Reminder, and Settings groups.
- Make it clear recordings do not sync.
- Make Google Drive scope transparent.
- Make Restore from Drive feel like an explicit replace-local action.

## Interaction Rules

- Every tap target should be at least 44px high.
- German audio controls use the green speakable style.
- Icon-only navigation buttons need `title`/accessible labels.
- Buttons should not change layout on hover or active state.
- Text must not overflow buttons or cards on iPhone width.
- Avoid onboarding/marketing screens; the first screen is the working dashboard.

## Visual System

### Palette

- Paper: `#FBFAF7`
- Ink: `#1C1B22`
- Muted: `#6B6A73`
- Line: `#E5E2D9`
- Speak green: `#0E7A63`, soft `#E2F1EC`
- Gold accent: `#B07B16`, soft `#F3EBD8`
- Formal blue: `#2C5AA0`, soft `#E4ECF7`
- Warning red: `#B23A2E`, soft `#F6E4E1`

### Type

- Headings: Fraunces.
- Body: Inter.
- Phonetics/code: JetBrains Mono.
- Do not scale font size directly with viewport width except for top-level hero headings.

### Component Rules

- Cards: 8px radius unless representing an iPhone mockup in design docs.
- No nested cards.
- Use lucide icons for commands.
- Use green speakable pills for German audio.
- Use segmented controls for self-rating and quiz options.
- Use badges/tags for status and vocabulary categories.

## Release Layout Rules

- Screens must reserve at least 72px of bottom space for persistent navigation.
- Concept B cards use a 12px vertical rhythm and avoid paragraphs longer than 2 lines inside phone cards.
- Each phone frame in design review must represent one complete flow, not a decorative sample.
- Dark surfaces need explicit contrast checks for text, tags, speakable controls, and progress bars.
- No phone mockup should rely on hidden scroll to understand the flow.
