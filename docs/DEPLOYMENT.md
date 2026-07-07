# WortPilot Deployment Guide

## GitHub Pages

The app is designed for GitHub Pages static hosting.

Workflow:

1. Push to `main`.
2. GitHub Actions runs `.github/workflows/deploy.yml`.
3. Build output in `dist` is uploaded to GitHub Pages.
4. Open the Pages URL on iPhone.
5. Use Share -> Add to Home Screen.

## Repository Settings

Enable Pages:

- Source: GitHub Actions.
- Branch deploy is handled by workflow, not by `/docs`.

Optional secret:

- `VITE_GOOGLE_CLIENT_ID`: Google OAuth web client ID for Drive sync.

## Google OAuth Setup

1. Create or open a Google Cloud project.
2. Enable Google Drive API.
3. Configure OAuth consent screen.
4. Create OAuth Client ID of type Web application.
5. Add authorized JavaScript origins:
   - local dev origin, for example `http://127.0.0.1:5173`
   - GitHub Pages origin, for example `https://awmair.github.io`
6. Add the client ID as GitHub secret `VITE_GOOGLE_CLIENT_ID`.

Scope used:

```text
https://www.googleapis.com/auth/drive.appdata
```

## Local Verification

```bash
npm install
npm run build
npx vite preview --host 127.0.0.1 --port 5180
```

Manual checks:

- Dashboard loads.
- App icon appears in browser/PWA metadata.
- Lesson screen opens.
- German speak buttons appear.
- Quiz accepts an answer and grades.
- Vocab search works.
- Talk-back asks for mic only when recording starts.
- Profile screen shows sync, backup, and reminder controls.

## iPhone Verification

1. Open deployed URL in Safari.
2. Add to Home Screen.
3. Launch from icon.
4. Confirm standalone display.
5. Tap German phrase and hear speech.
6. Close and reopen app; progress should persist.
7. Turn on airplane mode after first load; app shell should still open.

## Known Limits

- iOS voice quality depends on installed browser/system voices.
- Google Drive sync requires OAuth setup before production use.
- Native push notifications require a server-side push sender; not included in static V1.
- Microphone permission is user-controlled and may behave differently inside Safari vs Home Screen PWA.

