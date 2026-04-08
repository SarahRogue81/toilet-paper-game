# 🚽 The Toilet Paper Game

A single-player mobile game where you track how many toilet paper squares you use per wipe and score points for efficiency. Built with **Expo / React Native** (SDK 54), targeting Android API 29+.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Clone & Install](#clone--install)
- [Running in Development](#running-in-development)
- [Building a Web App](#building-a-web-app)
- [Building an Android App](#building-an-android-app)
- [Background Music](#background-music)
- [Game Rules](#game-rules)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | LTS recommended |
| pnpm | 9+ | `npm install -g pnpm` |
| Expo CLI | bundled | via `pnpm exec expo` |
| EAS CLI | latest | for Android builds — `npm install -g eas-cli` |
| Expo Go app | latest | for live preview on your Android device |

---

## Clone & Install

```bash
git clone https://github.com/SarahRogue81/toilet-paper-game.git
cd toilet-paper-game
pnpm install
```

---

## Running in Development

Start the Metro bundler:

```bash
pnpm exec expo start
```

- Scan the QR code with the **Expo Go** app on your Android device to preview instantly.
- Press **`w`** in the terminal to open the web version in your browser.

> **Background music:** the MP3 file is excluded from this repo due to size. See [Background Music](#background-music) below.

---

## Building a Web App

Expo can export the app as a static web bundle that you can host anywhere.

### 1. Export the static build

```bash
pnpm exec expo export --platform web
```

This generates a `dist/` folder with all static assets.

### 2. Serve locally (optional preview)

```bash
npx serve dist
```

### 3. Deploy

Upload the contents of `dist/` to any static host:

- **Netlify** — drag and drop the `dist/` folder at [app.netlify.com](https://app.netlify.com)
- **Vercel** — `npx vercel dist`
- **GitHub Pages** — push `dist/` to a `gh-pages` branch
- **Firebase Hosting** — `firebase deploy --only hosting`

> The web build uses browser `localStorage` in place of AsyncStorage. All game data stays local in the browser.

---

## Building an Android App

Android builds use **EAS Build** (Expo Application Services), which compiles a native `.apk` or `.aab` in the cloud — no local Android SDK required.

### 1. Log in to Expo

```bash
eas login
```

Create a free account at [expo.dev](https://expo.dev) if you don't have one.

### 2. Configure EAS (first time only)

```bash
eas build:configure
```

This creates an `eas.json` file. The default `preview` profile produces an installable `.apk`.

### 3. Build an APK (sideloadable)

```bash
eas build --platform android --profile preview
```

When the build finishes, EAS prints a download URL for the `.apk`. Install it on any Android device (API 29+) directly — no Play Store required.

### 4. Build a production AAB (Play Store)

```bash
eas build --platform android --profile production
```

This produces a `.aab` bundle for Google Play submission.

### 5. Install the APK on your device

Enable **Install unknown apps** in Android Settings, then open the downloaded `.apk` on your device.

---

## Background Music

The background music file (`assets/audio/background_music.mp3`) is not included in this repository.

The game uses Bach's **Toccata and Fugue in D minor, BWV 565** (public domain).

**Download a free MP3:**

1. Visit [musopen.org](https://musopen.org/music/2563-toccata-and-fugue-in-d-minor-bwv-565/) or search "BWV 565 public domain MP3"
2. Download any public-domain recording
3. Convert to MP3 if needed (e.g. with [Convertio](https://convertio.co))
4. Save as: `assets/audio/background_music.mp3`

The app plays silently if the file is missing — no errors will occur.

---

## Game Rules

| Concept | Details |
|---------|---------|
| **Square Constant (K)** | Set in Settings (default 8). The "perfect" number of squares per wipe. |
| **Score per wipe** | `score += K − squares used` |
| **Bonus** | Starts at K. Absorbs negative score when positive. |
| **Bonus drain** | If score goes negative and bonus > 0: `bonus += score; score = 0` |
| **Bonus overflow** | If absorbing drives bonus negative: `score += bonus; bonus = 0` |
| **Bonus growth** | Bonus grows by K each time score crosses a new multiple of `K × 2` |
| **Final score** | `score + bonus` at session end |

Use as few squares as possible per wipe to score high. Good luck! 🧻
