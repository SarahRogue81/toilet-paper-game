# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### The Toilet Paper Game (`artifacts/toilet-paper-game`)
- **Type**: Expo mobile app (Android-first, API 29+)
- **Preview path**: `/`
- **Stack**: React Native + Expo Router + AsyncStorage
- **No backend** — 100% offline, all data local
- **Key files**:
  - `context/GameContext.tsx` — game state, score/bonus logic, in-progress save/resume
  - `context/SettingsContext.tsx` — player settings and all-time stats
  - `app/index.tsx` — main game screen
  - `app/settings.tsx` — settings (locked during active game)
  - `app/stats.tsx` — [Username]'s stats (high score, tissue average)
  - `components/TpBackground.tsx` — decorative TP roll SVG background
  - `components/ConfettiEffect.tsx` — end-of-game celebration animation
  - `hooks/useMusic.ts` — background music using expo-av (bundled MP3)
  - `assets/audio/background_music.mp3` — bundled public domain background music
- **Game constant (K)**: Default 4, configurable 1–6 in settings
- **Score formula**: `score += K - squares_used`; negative → BONUS absorbs, score resets to 0
- **BONUS**: Starts at K (if enabled), grows by K each time score passes multiples of 2K
- **Final score**: `score + bonus` (bonus=0 if disabled)
