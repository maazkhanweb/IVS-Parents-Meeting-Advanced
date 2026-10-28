# IVS Parents Meeting – Advanced Waiting Room & Token Management

React + Vite application for managing IVS parent-meeting waiting rooms, department desks, token queues, public display, parent token tracking, Zoom links, and JSON backup/restore.

## Requirements

- Node.js 22.12 or newer (Vite 8 requirement)
- npm

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The Vite production output is written to `dist/`. Vercel can import this repository with the Vite preset, build command `npm run build`, and output directory `dist`. The included `vercel.json` supplies these settings and an SPA rewrite.

## Important data and deployment notes

- This version stores its queue/settings in the browser's `localStorage`. Data persists in that browser on that device and may sync between tabs in the same browser, but it does **not** synchronize between different staff computers or phones.
- Before using it for a real meeting with multiple staff devices, connect a shared database and authentication/authorization, and implement realtime updates. Do not enter sensitive parent/student information into a public deployment until access controls and shared storage are implemented.
- Export a JSON backup before clearing browser data or changing devices. Keep backup files secure because they may contain parent/student details.
- No API key is needed for the current frontend unless you separately add a feature that actually calls an external API. Never commit real secrets to GitHub.

## GitHub hygiene

Do not commit `node_modules/` or generated `dist/`. They are recreated by `npm install` and `npm run build`.
