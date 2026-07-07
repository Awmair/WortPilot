# WortPilot Technical Spec

## Stack

- Vite
- React
- TypeScript
- CSS
- lucide-react
- Browser APIs: Web Speech API, MediaRecorder, IndexedDB, Service Worker
- Hosting: GitHub Pages
- Optional sync: Google Identity Services + Google Drive API

## Architecture

```text
src/
  App.tsx                         App shell and screen routing
  data/course.ts                  Lesson, quiz, and vocabulary seed content
  data/supplementalVocabulary.ts  Generated 3,000-word bank expansion source
  components/SpeakableGerman.tsx  Universal German TTS control
  components/TextWithGermanAudio.tsx Known-term auto wrapper
  components/AudioRecorder.tsx    Talk-back recording flow
  lib/speech.ts                   Web Speech API helper
  lib/storage.ts                  IndexedDB profile persistence, localStorage fallback, and normalization
  lib/driveSync.ts                Google Drive appDataFolder backup/restore
  types.ts                        Shared data contracts
public/
  manifest.webmanifest            PWA manifest
  sw.js                           Service worker
  app/icon assets                 PWA and Apple icons
design-mockups/
  index.html                      UI review board
docs/
  *.md                            Durable product and implementation specs
```

## Data Model

The local profile is stored in IndexedDB as a single profile object:

```ts
type UserProfile = {
  profileVersion: 1;
  deviceId: string;
  updatedAt: string;
  courseProgress: {
    currentLessonId: string;
    completedLessonIds: string[];
    streak: number;
    lastStudiedAt?: string;
  };
  quizHistory: QuizRecord[];
  weakPoints: WeakPointRecord[];
  reviewQueue: ReviewRecord[];
  settings: {
    googleClientId?: string;
    lastSyncedAt?: string;
    signedInHint?: string;
    reminderHour: number;
    ttsRate: number;
  };
};
```

## Local Storage

- IndexedDB database: `wortpilot-db`
- Store: `kv`
- Key: `profile`
- localStorage fallback key: `wortpilot-profile`
- Device ID stored in localStorage as `wortpilot-device-id`
- Legacy `german-pro-*` keys are read once as a migration source and written forward to the WortPilot keys.
- Every saved, imported, and restored profile is normalized before use so older JSON files do not crash the app.
- All edits save locally first. If IndexedDB is unavailable, the app falls back to localStorage.

## German Audio

Component: `SpeakableGerman`

Behavior:

- Uses `speechSynthesis`.
- Sets `lang = "de-DE"`.
- Uses configurable rate, default `0.82`.
- Prefers Google German voice where present, then any German voice.
- Cancels prior utterance before speaking.
- Adds visual speaking state.

The auto-wrapper `TextWithGermanAudio` matches known vocabulary terms and wraps them with `SpeakableGerman`. New content should still prefer explicit `SpeakableGerman` in structured examples.

## Talk-Back Recording

Component: `AudioRecorder`

Behavior:

- Requests microphone through `navigator.mediaDevices.getUserMedia`.
- Records with `MediaRecorder`.
- Creates local object URL for playback.
- Does not persist or sync audio in V1.
- UI states: Record, Stop, Play mine, Delete, self-rating.

## Google Drive Backup And Restore

Drive backup/restore uses:

- Google Identity Services token client.
- OAuth scope: `https://www.googleapis.com/auth/drive.appdata`
- Hidden file name: `german-learning-profile.json`
- Drive space: `appDataFolder`
- Google browser OAuth client ID only. No client secrets, refresh tokens, private keys, `.env` files, or real user data belong in git.

Save & Sync sequence:

1. Request OAuth token.
2. Search `appDataFolder` for profile file.
3. Upload the latest local profile JSON to Drive.
4. Save `lastSyncedAt` locally only after upload succeeds.

Restore from Drive sequence:

1. Request OAuth token.
2. Search `appDataFolder` for profile file.
3. Download the Drive profile JSON.
4. Normalize it.
5. Replace local data with the Drive copy only after download and normalization succeed.

If Drive returns an expired-token style response, the app asks for sign-in again and retries once. If upload or restore fails, local data stays intact and the user can retry later.

The app intentionally does not provide real-time multi-device merge/conflict handling in V1. The user must tap Save & Sync while online to back up local changes, and Restore from Drive is an explicit replace-local action.

Recording files are intentionally excluded.

## PWA

Required files:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/apple-touch-icon.png`

Service worker is network-first with cached fallback so GitHub Pages updates are not trapped behind stale assets.

## Build And Deploy

Commands:

```bash
npm install
npm run build
npm run dev
```

GitHub Actions workflow:

- `.github/workflows/deploy.yml`
- Node 22
- `npm ci`
- `npm run build`
- Upload `dist` to GitHub Pages

Set repository secret `VITE_GOOGLE_CLIENT_ID` if Drive sync should work without entering the client ID manually in the app.

## Verification Checklist

- `npm run build`
- Dashboard loads.
- Lesson has tappable German.
- Quiz has 13 refresher questions.
- Vocab has 43 speakable entries.
- Profile screen shows Drive sync and backup controls.
- PWA manifest references raster icons.
- Service worker includes icon and app shell assets.
