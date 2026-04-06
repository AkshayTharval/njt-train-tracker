# NJ Transit Train Tracker

A personal web app that shows real-time NJ Transit rail departures between any two stations — train number, line, scheduled departure, track, and live status. The board auto-refreshes so you always see current information without doing anything.

---

## What it does

- Pick an origin and destination station from dropdowns
- See all trains running between them with live status (on-time, delayed, departed)
- Delayed trains are visually highlighted
- Board auto-refreshes every 30 seconds
- Station selections persist across page refreshes (stored in the URL)

---

## Getting NJT API credentials

1. Go to [https://datasource.njtransit.com](https://datasource.njtransit.com)
2. Register for a free developer account
3. Once approved, you'll receive a username and password
4. Add them to `.env.local` (see below)

You don't need credentials to run the app locally — mock mode works without them.

---

## Running locally with mock data (no credentials needed)

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd njt_app

# 2. Install dependencies
npm install

# 3. Copy the example env file
cp .env.example .env.local
# .env.local already has USE_MOCK_API=true — no edits needed

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully on realistic mock data.

---

## Switching to real NJT data

1. Add your credentials to `.env.local`:
   ```
   NJT_USERNAME=your_username
   NJT_PASSWORD=your_password
   USE_MOCK_API=false
   ```
2. Restart the dev server (`npm run dev`)

The app will now call the live NJT API. Your credentials stay server-side only and are never sent to the browser.

---

## Running tests

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file changes)
npm run test:watch
```

Tests cover:
- API route logic (filtering, normalization, error handling)
- All mock data scenarios (multiple trains, single train, empty, FULLSCREENMSG, delayed)
- UI components (station dropdowns, train board, error states, refresh behavior)

---

## Deploying to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod
```

When prompted (or via the Vercel dashboard), set these environment variables:

| Variable | Value |
|---|---|
| `NJT_USERNAME` | Your NJT developer username |
| `NJT_PASSWORD` | Your NJT developer password |
| `USE_MOCK_API` | `false` (or omit entirely) |

**Do not set these in any committed file.** Use the Vercel dashboard or `vercel env add`.

---

## Project structure

```
app/
  api/
    stations/route.ts   # GET /api/stations — returns all NJT rail stations
    trains/route.ts     # GET /api/trains?from=XX&to=YY — filtered departures
  components/           # React UI components
  page.tsx              # Main page
lib/
  mock/                 # Mock API responses (mirrors real NJT API shapes)
  njt/                  # Real NJT API adapters
  types.ts              # Shared TypeScript types
```

---

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com)
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) for NJT XML responses
