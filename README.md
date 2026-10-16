# Biophilic Wellbeing — Soundscape Studio

A **Next.js web application** supporting biophilic wellbeing: reducing
stress, regulating circadian rhythms, and improving focus through
nature-inspired audio.

## What it does

- **Stress relief** — guided breathing, calming narration, and
  biophilic soundscapes
- **Circadian lighting** — simulate sunrise/sunset and check the effect on
  your daily routine
- **Acoustic ecology** — explore fauna and rituals, build custom
  soundbanks, and test playback
- **AI advisor** — an AI-powered view that explains recommendations
- **Hardware satellites** — monitor room sensors and microphones

## Tech stack

- Next.js (App Router), TypeScript
- React components with Tailwind CSS
- Gemini AI for the advisor features
- Bun / Node.js

## Running locally

```bash
bun install
bun run dev
```

The app talks to Gemini only when the AI advisor is enabled in the
settings.
