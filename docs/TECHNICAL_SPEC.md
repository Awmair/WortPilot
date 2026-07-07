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
  components/SpeakableGerman.tsx  Universal German TTS control
  components/TextWithGermanAudio.tsx Known-term auto wrapper
  components/AudioRecorder.tsx    Talk-back recording flow
  lib/speech.ts                   Web Speech API helper
  lib/storage.ts                  IndexedDB profile persistence and merge logic
  lib/driveSync.ts                Google Drive appDataFolder sync
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

- IndexedDB database: `german-pro-db`
- Store: `kv`
- Key: `profile`
- Device ID stored in localStorage as `german-pro-device-id`

Future cleanup should rename storage keys to `wortpilot-*` with a migration path.

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

## Google Drive Sync

Drive sync uses:

- Google Identity Services token client.
- OAuth scope: `https://www.googleapis.com/auth/drive.appdata`
- Hidden file name: `german-learning-profile.json`
- Drive space: `appDataFolder`

Sync sequence:

1. Request OAuth token.
2. Search `appDataFolder` for profile file.
3. Download remote profile if present.
4. Merge local and remote by latest timestamps.
5. Upload merged profile.
6. Save merged profile locally.

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

