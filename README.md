# 🌾 Kisan Mitra — AI Farmer Assistant (Demo)

A voice-first farming assistant. Speak in **Kannada or English**, and an animated
SVG farmer answers you out loud with **real-time lip sync**.

> Demo note: the avatar is a 2D SVG (not a 3D model). The mouth is driven by the
> live amplitude of the spoken answer via the Web Audio API, giving genuine lip
> sync without needing a rigged 3D model.

## Pipeline

```
🎤 mic  →  Sarvam STT  →  Lyzr agent (GPT-4o-mini)  →  Sarvam TTS  →  🧑‍🌾 avatar speaks
```

## Stack

React · TypeScript · Vite · Tailwind CSS v4 · Zustand · Axios · Web Audio API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your API keys:
   ```bash
   cp .env.example .env
   # then edit .env
   ```
   | Variable | Where to get it |
   | --- | --- |
   | `VITE_SARVAM_API_KEY` | https://dashboard.sarvam.ai (covers STT **and** TTS) |
   | `VITE_LYZR_API_KEY` | https://studio.lyzr.ai |
   | `VITE_LYZR_AGENT_ID` | your agent in Lyzr Studio |
   | `VITE_LYZR_USER_ID` | any stable id / email (optional) |
3. Run:
   ```bash
   npm run dev
   ```

## Structure

```
src/
├── components/        UI (AvatarStage, ChatPanel, MicButton, LanguageToggle)
│   └── avatar/        FarmerAvatar.tsx (SVG + lip sync rAF loop)
├── hooks/             useRecorder, useConversation
├── services/          sarvamSTT, lyzrService, sarvamTTS
├── store/             Zustand store
├── utils/             audioBus (Web Audio analyser + playback)
├── types/  constants/
```

## Notes

- `VITE_` keys ship in the browser bundle — fine for a demo. For production, put
  the keys behind a small backend proxy.
- Mic requires HTTPS or `localhost`.
