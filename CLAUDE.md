# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Kisan Mitra** — a voice-first agricultural assistant for farmers in Karnataka, India. The user speaks (Kannada or English) into the mic, an animated SVG farmer answers out loud, and the mouth lip-syncs to the live audio amplitude. It's a single-page React app with no backend — all API calls go straight from the browser.

## Commands

```bash
npm run dev       # Vite dev server on http://localhost:5173 (does NOT auto-open browser)
npm run build     # tsc --noEmit (typecheck) + vite build → dist/
npm run preview    # serve the production build
npm run lint      # eslint . --ext ts,tsx
npm run format    # prettier --write src/**/*.{ts,tsx,css}
```

There is no test suite. `npm run build` is the typecheck gate (build fails on TS errors, since `tsc --noEmit` runs first).

## Required environment

Copy `.env.example` → `.env` and fill in keys. All are `VITE_`-prefixed, so they ship in the browser bundle (acceptable for this demo; use a backend proxy for production).

- `VITE_SARVAM_API_KEY` — Sarvam AI, used for **both** STT and TTS (https://dashboard.sarvam.ai)
- `VITE_GROQ_API_KEY` — Groq, the LLM chat backend (https://console.groq.com)

> **Stale doc warning:** `README.md` and `.env.example` still describe the old **Lyzr** agent (`VITE_LYZR_*` vars). The AI backend was migrated to **Groq** (`llama-3.3-70b-versatile`). The code is authoritative — trust `.env`/`src` over the README. The service file is still named `lyzrService.ts` despite calling Groq, and `constants/index.ts` still exports an unused `LYZR_CHAT_URL`.

## Architecture

### The pipeline (the core abstraction)

The whole app is one pipeline, orchestrated in [src/hooks/useConversation.ts](src/hooks/useConversation.ts):

```
mic → Sarvam STT → Groq LLM → Sarvam TTS → avatar speaks (lip-synced)
```

`useConversation.runPipeline(blob)` drives it stage by stage, updating `avatarState` and `statusText` in the store at each step so the UI reflects progress (`thinking` → `speaking` → `idle`). Each external call is isolated in one file under `src/services/`, each exposing a single async function:

- [src/services/sarvamSTT.ts](src/services/sarvamSTT.ts) — `speechToText(blob, language)`. **Gotcha:** the browser records `audio/webm;codecs=opus`, but Sarvam rejects the codec suffix — it strips to the bare MIME type before sending. Don't undo this.
- [src/services/lyzrService.ts](src/services/lyzrService.ts) — `askAgent(message)`. Calls Groq's OpenAI-compatible endpoint. The Karnataka farming domain knowledge (crops, soils, seasons, schemes, pests, markets) lives entirely in the `SYSTEM_PROMPT` here — there is no external knowledge base anymore. It's stateless: no conversation history is sent, each question is independent.
- [src/services/sarvamTTS.ts](src/services/sarvamTTS.ts) — `textToSpeech(text, language)`. Splits long answers into ≤480-char sentence chunks (Sarvam's per-request limit) and returns an ordered `Blob[]` played back-to-back. Voice is a male speaker (`abhilash`, `bulbul:v2`).

### Lip sync (the clever part)

There is **no 3D model** despite the project's "3D virtual farmer" framing — the avatar is a 2D SVG with a real-time-driven mouth.

- [src/utils/audioBus.ts](src/utils/audioBus.ts) is a module-level singleton audio engine. `play()` routes TTS audio through a Web Audio `AnalyserNode`; `getLevel()` returns a smoothed 0..1 RMS loudness of whatever is playing right now.
- [src/components/avatar/FarmerAvatar.tsx](src/components/avatar/FarmerAvatar.tsx) runs a `requestAnimationFrame` loop that reads `getLevel()` and writes the mouth-open height **directly to the DOM** (not React state) for smooth 60fps animation.
- `unlockAudio()` must be called from a user gesture to satisfy browser autoplay rules — it's called on mic-button click in [src/hooks/useRecorder.ts](src/hooks/useRecorder.ts).

### State & UI

- [src/store/useStore.ts](src/store/useStore.ts) — a single Zustand store: `messages`, `language` (defaults to `kn-IN`), `avatarState`, `statusText`, `error`. This is the only shared state.
- Components in `src/components/` are presentational and read from the store. `App.tsx` is the layout (header + avatar stage + chat panel).

### Conventions

- **Path alias:** import with `@/...` (maps to `src/`); configured in both `tsconfig.json` and `vite.config.ts`.
- **Tailwind v4** is configured CSS-first via the `@theme` block in [src/index.css](src/index.css) — there is no `tailwind.config.js`. Custom palette: `field-*` (greens), `soil-*`, `wheat-*`.
- TypeScript is `strict` with `noUnusedLocals`/`noUnusedParameters` on — unused vars break the build.
- `Language` is the union `'kn-IN' | 'en-IN'`, threaded through STT/TTS so recognition and speech match the selected language.

## Notable repo facts

- `20260617153731_c01804b3.fbx` (~43MB) is an unused 3D model artifact at the repo root — the shipped avatar is the SVG, not this file.
- `knowledge-base/` holds an HTML/PDF agricultural reference doc — historical, not loaded by the running app.
